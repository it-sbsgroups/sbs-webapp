import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { SystemLogsService } from '../system-logs/system-logs.service';
import { getLogSource } from './log-source.util';

/**
 * Global safety net, registered once via APP_FILTER in app.module.ts.
 *
 * Before this filter existed, `SystemLogsService.log()` had no callers
 * anywhere in the backend — the log viewer, review flow, and auto-purge
 * cron were all fully built, but nothing ever wrote a row, so
 * Admin -> System Logs stayed permanently empty. This filter is the
 * "generation" half that was missing: every error thrown anywhere in the
 * app (HttpException or not) now gets persisted as a system log AND still
 * gets returned to the client in the same shape Nest's default handler
 * would have used, so no existing frontend error handling changes.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly systemLogs: SystemLogsService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const isHttpException = exception instanceof HttpException;
    const status = isHttpException
      ? (exception as HttpException).getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    let body: Record<string, any>;
    let logMessage: string;

    if (isHttpException) {
      const exceptionResponse = (exception as HttpException).getResponse();
      body =
        typeof exceptionResponse === 'string'
          ? { statusCode: status, message: exceptionResponse }
          : { statusCode: status, ...(exceptionResponse as Record<string, any>) };
      logMessage = Array.isArray(body.message)
        ? body.message.join('; ')
        : String(body.message ?? exception);
    } else {
      // Unknown/unexpected error (Prisma, TypeError, etc.) — never leak
      // internals to the client, but capture the real detail in the log.
      body = {
        statusCode: status,
        message: 'Internal server error',
        error: 'Internal Server Error',
      };
      logMessage = exception instanceof Error ? exception.message : String(exception);
    }

    const path: string = (request?.originalUrl || request?.url || '').split('?')[0];
    const source = getLogSource(path);
    const level = status >= 500 || !isHttpException ? 'ERROR' : 'WARN';

    // Fire-and-forget: SystemLogsService.log() already catches its own
    // errors internally and must never delay or break the response below.
    void this.systemLogs.log(level, source, logMessage, {
      method: request?.method,
      path,
      statusCode: status,
      userId: request?.user?.sub,
      designation: request?.user?.designation,
      stack:
        exception instanceof Error
          ? exception.stack?.split('\n').slice(0, 5).join('\n')
          : undefined,
    });

    if (!isHttpException) {
      this.logger.error(logMessage, exception instanceof Error ? exception.stack : undefined);
    }

    response.status(status).json(body);
  }
}
