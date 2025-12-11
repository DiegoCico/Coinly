import type { Context } from '../routers/trpc';

export const COOKIE_ACCESS = 'access_token';
export const COOKIE_REFRESH = 'refresh_token';

export function parseCookiesFromCtx(ctx: Context): Record<string, string> {
  const cookies: Record<string, string> = {};
  
  // For Express context
  if (ctx.req?.headers.cookie) {
    ctx.req.headers.cookie.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      if (name && value) {
        cookies[name] = decodeURIComponent(value);
      }
    });
  }
  
  // For Lambda context
  if (ctx.event?.headers?.cookie) {
    ctx.event.headers.cookie.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      if (name && value) {
        cookies[name] = decodeURIComponent(value);
      }
    });
  }
  
  return cookies;
}