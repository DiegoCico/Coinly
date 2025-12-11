"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const trpcExpress = __importStar(require("@trpc/server/adapters/express"));
const routers_1 = require("./routers");
const trpc_1 = require("./routers/trpc");
const CANONICAL_ALLOWED_ORIGINS = [
    process.env.LOCAL_WEB_ORIGIN ?? 'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://d2cktegyq4qcfk.cloudfront.net',
];
function isAllowedOrigin(origin) {
    if (!origin)
        return true; // same-origin / curl cases
    return CANONICAL_ALLOWED_ORIGINS.includes(origin);
}
const corsMiddleware = (0, cors_1.default)({
    origin(origin, callback) {
        if (!origin || isAllowedOrigin(origin)) {
            // reflect requesting origin
            return callback(null, origin || CANONICAL_ALLOWED_ORIGINS[0]);
        }
        return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
    allowedHeaders: ['content-type', 'authorization', 'x-requested-with'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    maxAge: 60 * 60 * 12, // 12h like API Gateway
});
const app = (0, express_1.default)();
/**
 * We mount CORS first so preflight OPTIONS is handled.
 * Then JSON parser, then routes.
 */
app.use(corsMiddleware);
app.use(express_1.default.json());
/**
 * Health check
 */
app.get('/health', (_req, res) => {
    res.status(200).send('ok');
});
/**
 * tRPC router
 */
app.use('/trpc', trpcExpress.createExpressMiddleware({
    router: routers_1.appRouter,
    createContext: trpc_1.createExpressContext,
    onError({ error, path, type }) {
        // Helpful detail in dev
        console.error(`[tRPC] ${type} ${path} failed`, {
            code: error.code,
            message: error.message,
            cause: error.cause?.message ?? error.cause,
        });
    },
}));
/**
 * Global error handler
 */
app.use((err, _req, res, _next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        detail: String(err?.message ?? err),
    });
});
/**
 * Start server unless we're under tests.
 */
const PORT = Number(process.env.PORT) || 3001;
if (process.env.NODE_ENV !== 'test') {
    const server = app.listen(PORT, () => {
        console.log(`API running on http://localhost:${PORT}`);
        console.log('Allowed CORS origins:', CANONICAL_ALLOWED_ORIGINS);
    });
    server.on('error', (err) => {
        if (err?.code === 'EADDRINUSE') {
            console.error(`⚠️  Port ${PORT} is already in use. Did you start another server?`);
            process.exit(1);
        }
        else {
            throw err;
        }
    });
}
exports.default = app;
