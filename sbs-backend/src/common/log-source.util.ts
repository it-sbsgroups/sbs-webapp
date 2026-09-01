// Shared by AllExceptionsFilter and ActivityLoggingInterceptor so both agree
// on how a request path maps to a system-log "source" tag (e.g.
// '/api/site/about' -> 'site', '/api/rfq/submit' -> 'rfq').
export function getLogSource(path: string | undefined | null): string {
  const stripped = (path || '').replace(/^\/api\/?/, '');
  const [first] = stripped.split('/');
  return first || 'app';
}
