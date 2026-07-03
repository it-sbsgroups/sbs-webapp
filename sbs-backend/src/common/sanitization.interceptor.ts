import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { sanitizeRich, stripToText } from './sanitize.util';

/**
 * Global XSS defense: recursively sanitizes every string in the request body
 * before it reaches validation/handlers. Runs ahead of pipes, so DTOs receive
 * already-clean data.
 *
 * - Most fields → plain text (tags stripped).
 * - RICH_TEXT_FIELDS → safe HTML subset (only if a field is genuinely rendered
 *   as HTML somewhere; none in the current app — add names here if that changes).
 * - SKIP_FIELDS → left untouched (passwords must not be altered).
 */
@Injectable()
export class SanitizationInterceptor implements NestInterceptor {
  private readonly RICH_TEXT_FIELDS = new Set<string>([
    // e.g. 'answerHtml', 'content' — add when a field is rendered as raw HTML
  ]);
  private readonly SKIP_FIELDS = new Set<string>([
    'password',
    'newPassword',
    'oldPassword',
    'currentPassword',
  ]);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    if (req?.body && typeof req.body === 'object') {
      req.body = this.clean(req.body);
    }
    return next.handle();
  }

  private clean(value: any, key?: string): any {
    if (typeof value === 'string') {
      if (key && this.SKIP_FIELDS.has(key)) return value;
      if (key && this.RICH_TEXT_FIELDS.has(key)) return sanitizeRich(value);
      return stripToText(value);
    }
    if (Array.isArray(value)) return value.map((v) => this.clean(v));
    if (value && typeof value === 'object') {
      const out: Record<string, any> = {};
      for (const k of Object.keys(value)) out[k] = this.clean(value[k], k);
      return out;
    }
    return value;
  }
}
