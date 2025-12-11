"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const aws_lambda_1 = require("@trpc/server/adapters/aws-lambda");
const routers_1 = require("./routers");
const trpc_1 = require("./routers/trpc");
// CORS helpers 
function resolveAllowedOrigin(originHeader) {
    const allow = (process.env.ALLOWED_ORIGINS ?? '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    if (!originHeader)
        return allow[0] ?? '';
    if (allow.length === 0)
        return originHeader;
    if (allow.includes(originHeader))
        return originHeader;
    return allow[0] ?? originHeader;
}
function buildCorsHeaders(originHeader, includeCreds = true, includeMethodsHeaders = true) {
    const allowOrigin = resolveAllowedOrigin(originHeader);
    const h = {
        'Access-Control-Allow-Origin': allowOrigin,
        Vary: 'Origin',
    };
    if (includeCreds)
        h['Access-Control-Allow-Credentials'] = 'true';
    if (includeMethodsHeaders) {
        h['Access-Control-Allow-Methods'] = 'GET,POST,PUT,PATCH,DELETE,OPTIONS';
        h['Access-Control-Allow-Headers'] = 'content-type,authorization,x-requested-with';
    }
    return h;
}
function handleOptions(event) {
    const origin = (event.headers?.origin ?? event.headers?.Origin);
    return { statusCode: 204, headers: buildCorsHeaders(origin, true, true) };
}
//  Main Lambda Handler
const handler = async (event, ctx) => {
    if ((event.requestContext?.http?.method ?? '').toUpperCase() === 'OPTIONS') {
        return handleOptions(event);
    }
    if (event?.body && typeof event.body === 'string') {
        try {
            const parsed = JSON.parse(event.body);
            // if still a string (double encoded), parse again
            event.body = typeof parsed === 'string' ? JSON.parse(parsed) : parsed;
        }
        catch {
            // ignore if it's not valid JSON
        }
    }
    return (0, aws_lambda_1.awsLambdaRequestHandler)({
        router: routers_1.appRouter,
        createContext: trpc_1.createLambdaContext,
        responseMeta({ ctx: trpcCtx, errors }) {
            const origin = (event.headers?.origin ?? event.headers?.Origin);
            const baseHeaders = buildCorsHeaders(origin, true, false);
            const cookieList = trpcCtx?.responseCookies ?? [];
            const headersWithCookies = {
                ...baseHeaders,
            };
            if (cookieList.length > 0)
                headersWithCookies['Set-Cookie'] = cookieList;
            if (errors?.length) {
                const status = errors[0]?.data?.httpStatus ?? 500;
                return { status, headers: headersWithCookies };
            }
            return { headers: headersWithCookies };
        },
    })(event, ctx);
};
exports.handler = handler;
