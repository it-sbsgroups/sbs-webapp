import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { SystemLogsService } from '../system-logs/system-logs.service';
import { getLogSource } from './log-source.util';

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

// Paths that should never generate their own activity log entries: reviewing
// or deleting a log would otherwise recursively create a new one, and OTP
// request/verify endpoints are high-frequency and low audit value.
const EXCLUDED_PREFIXES = ['/api/system-logs', '/api/admin-otp'];

/**
 * Global interceptor, registered once via APP_INTERCEPTOR in app.module.ts.
 * Companion to AllExceptionsFilter: the filter logs failures, this logs
 * successful state-changing requests (saves, uploads, deletes) as INFO-level
 * activity, so Admin -> System Logs shows a real audit trail instead of
 * only errors.
 */
@Injectable()
export class ActivityLoggingInterceptor implements NestInterceptor {
  constructor(private readonly systemLogs: SystemLogsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const method: string = req?.method;
    const path: string = (req?.originalUrl || req?.url || '').split('?')[0];

    const shouldLog =
      MUTATING_METHODS.has(method) && !EXCLUDED_PREFIXES.some((p) => path.startsWith(p));

    if (!shouldLog) return next.handle();

    return next.handle().pipe(
      tap(() => {
        const res = context.switchToHttp().getResponse();
        const user = req?.user;
        void this.systemLogs.log('INFO', getLogSource(path), `${method} ${path} succeeded`, {
          statusCode: res?.statusCode,
          userId: user?.sub,
          designation: user?.designation,
        });
      }),
    );
  }
}
