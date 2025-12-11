"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.COOKIE_REFRESH = exports.COOKIE_ACCESS = void 0;
exports.parseCookiesFromCtx = parseCookiesFromCtx;
exports.COOKIE_ACCESS = 'access_token';
exports.COOKIE_REFRESH = 'refresh_token';
function parseCookiesFromCtx(ctx) {
    const cookies = {};
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
