"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.permissionedProcedure = exports.protectedProcedure = exports.mergeRouters = exports.publicProcedure = exports.router = exports.createLambdaContext = exports.createExpressContext = void 0;
exports.requirePermission = requirePermission;
const server_1 = require("@trpc/server");
const cookies_1 = require("../helpers/cookies");
const aws_jwt_verify_1 = require("aws-jwt-verify");
const teamspaceHelpers_1 = require("../helpers/teamspaceHelpers");
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
    const accessToken = cookies[cookies_1.COOKIE_ACCESS];
    if (!accessToken) {
        throw new server_2.TRPCError({
            code: 'UNAUTHORIZED',
            message: 'No access token',
        });
    }
    try {
        const decoded = await verifier.verify(accessToken);
        // Normalize email to a string at runtime to keep things predictable
        const emailValue = decoded.email !== undefined && decoded.email !== null ? String(decoded.email) : undefined;
        // Attach user info
        const { roleName, permissions } = await (0, teamspaceHelpers_1.getUserPermissions)(decoded.sub);
        return next({
            ctx: {
                ...ctx,
                user: {
                    teamId: decoded.sub,
                    userId: decoded.sub,
                    email: emailValue,
                    username: decoded['cognito:username'] !== null ? String(decoded['cognito:username']) : undefined,
                    roleName,
                    permissions,
                    decode: decoded,
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
// Permission middleware factory 
function requirePermission(requiredPermission) {
    return async ({ ctx, next }) => {
        const user = ctx.user;
        if (!user)
            throw new server_2.TRPCError({ code: 'UNAUTHORIZED', message: 'Missing user in context' });
        if (!user.permissions || !Array.isArray(user.permissions)) {
            throw new server_2.TRPCError({ code: 'FORBIDDEN', message: 'User has no permissions assigned' });
        }
        if (!user.permissions.includes(requiredPermission)) {
            throw new server_2.TRPCError({ code: 'FORBIDDEN', message: 'Insufficient permissions' });
        }
        return next();
    };
}
const permissionedProcedure = (perm) => exports.protectedProcedure.use(requirePermission(perm));
exports.permissionedProcedure = permissionedProcedure;
