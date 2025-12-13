"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.COOKIE_REFRESH = exports.COOKIE_ACCESS = void 0;
exports.parseCookiesFromCtx = parseCookiesFromCtx;
exports.setCookie = setCookie;
exports.clearCookie = clearCookie;
exports.COOKIE_ACCESS = 'coinly_access_token';
exports.COOKIE_REFRESH = 'coinly_refresh_token';
/**
 * Parse cookies from different context types (Express or Lambda)
 */
function parseCookiesFromCtx(ctx) {
    const cookies = {};
    // Express context (local development)
    if (ctx.req?.headers.cookie) {
        const cookieHeader = ctx.req.headers.cookie;
        cookieHeader.split(';').forEach(cookie => {
            const [name, ...rest] = cookie.trim().split('=');
            if (name && rest.length > 0) {
                cookies[name] = decodeURIComponent(rest.join('='));
            }
        });
    }
    // Lambda context (production)
    if (ctx.event?.cookies) {
        ctx.event.cookies.forEach(cookie => {
            const [name, ...rest] = cookie.split('=');
            if (name && rest.length > 0) {
                cookies[name] = decodeURIComponent(rest.join('='));
            }
        });
    }
    return cookies;
}
/**
 * Set a cookie in the response
 */
function setCookie(ctx, name, value, options = {}) {
    const { httpOnly = true, secure = process.env.NODE_ENV === 'production', sameSite = 'lax', maxAge = 60 * 60 * 24 * 7, // 7 days
    path = '/', } = options;
    const cookieValue = `${name}=${encodeURIComponent(value)}; Path=${path}; Max-Age=${maxAge}; SameSite=${sameSite}${httpOnly ? '; HttpOnly' : ''}${secure ? '; Secure' : ''}`;
    // Express context
    if (ctx.res) {
        ctx.res.setHeader('Set-Cookie', cookieValue);
    }
    // Lambda context
    if (ctx.responseCookies) {
        ctx.responseCookies.push(cookieValue);
    }
}
/**
 * Clear a cookie
 */
function clearCookie(ctx, name) {
    setCookie(ctx, name, '', { maxAge: 0 });
}
