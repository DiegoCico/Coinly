"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.protectedProcedure = exports.mergeRouters = exports.publicProcedure = exports.router = exports.createLambdaContext = exports.createExpressContext = void 0;
const server_1 = require("@trpc/server");
const cookies_1 = require("../cognito/cookies");
const aws_jwt_verify_1 = require("aws-jwt-verify");
const server_2 = require("@trpc/server");
/**
 *  Express Context
 * Used for local dev / testing.
 */
const createExpressContext = ({ req, res, }) => ({
    req,
    res,
    responseHeaders: {},
    responseCookies: [],
});
exports.createExpressContext = createExpressContext;
const createLambdaContext = async ({ event, context, }) => {
    return {
        event,
        lambdaContext: context,
        responseHeaders: {},
        responseCookies: [],
    };
};
exports.createLambdaContext = createLambdaContext;
/**
 *  TRPC Initialization
 */
const t = server_1.initTRPC.context().create();
exports.router = t.router;
exports.publicProcedure = t.procedure;
exports.mergeRouters = t.mergeRouters;
/**
 *  Cognito Token Verification
 * Used by protectedProcedure to validate user access tokens from cookies.
 */
const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID || 'us-east-1_sP3HAecAw';
const USER_POOL_CLIENT_ID = process.env.COGNITO_CLIENT_ID || '6vk8qbvjv6hvb99a0jjcpbth9k';
const verifier = aws_jwt_verify_1.CognitoJwtVerifier.create({
    userPoolId: USER_POOL_ID,
    clientId: USER_POOL_CLIENT_ID,
    tokenUse: 'access',
});
/**
 *  Auth Middleware
 * Extracts cookies, validates JWT, attaches user info to context.
 */
const isAuthed = t.middleware(async ({ ctx, next }) => {
    const cookies = (0, cookies_1.parseCookiesFromCtx)(ctx);
    let accessToken = cookies[cookies_1.COOKIE_ACCESS];
    // Also check Authorization header for Bearer token
    if (!accessToken) {
        const authHeader = ctx.req?.headers.authorization || ctx.event?.headers?.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            accessToken = authHeader.substring(7);
        }
    }
    if (!accessToken) {
        throw new server_2.TRPCError({
            code: 'UNAUTHORIZED',
            message: 'No access token',
        });
    }
    try {
        // Check if this is a demo token (base64 encoded JSON)
        const isDemoMode = process.env.NODE_ENV === 'development' || process.env.DEMO_MODE === 'true';
        if (isDemoMode && !accessToken.includes('.')) {
            // This looks like a demo token (base64 encoded, not JWT)
            try {
                const decoded = JSON.parse(Buffer.from(accessToken, 'base64').toString());
                // Check if token is expired
                if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
                    throw new server_2.TRPCError({
                        code: 'UNAUTHORIZED',
                        message: 'Token expired',
                    });
                }
                return next({
                    ctx: {
                        ...ctx,
                        user: {
                            teamId: decoded.sub,
                            userId: decoded.sub,
                            email: decoded.email,
                            username: decoded.email,
                            decode: { ...decoded, access_token: accessToken },
                        },
                    },
                });
            }
            catch (demoErr) {
                throw new server_2.TRPCError({
                    code: 'UNAUTHORIZED',
                    message: 'Invalid demo token',
                });
            }
        }
        // Production Cognito JWT verification
        const decoded = await verifier.verify(accessToken);
        // Normalize email to a string at runtime to keep things predictable
        const emailValue = decoded.email !== undefined && decoded.email !== null ? String(decoded.email) : undefined;
        return next({
            ctx: {
                ...ctx,
                user: {
                    teamId: decoded.sub,
                    userId: decoded.sub,
                    email: emailValue,
                    username: decoded['cognito:username'] !== null ? String(decoded['cognito:username']) : undefined,
                    decode: { ...decoded, access_token: accessToken },
                },
            },
        });
    }
    catch (err) {
        throw new server_2.TRPCError({
            code: 'UNAUTHORIZED',
            message: `Invalid or expired token: ${err?.message ?? String(err)}`,
        });
    }
});
exports.protectedProcedure = t.procedure.use(isAuthed);
