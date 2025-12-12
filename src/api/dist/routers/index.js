"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appRouter = void 0;
const trpc_1 = require("./trpc");
const hello_1 = require("./hello");
const auth_1 = require("./auth");
const planner_1 = require("./planner");
const coreRouter = (0, trpc_1.router)({
    health: trpc_1.publicProcedure.query(() => ({ ok: true })),
});
exports.appRouter = (0, trpc_1.router)({
    health: trpc_1.publicProcedure.query(() => ({ ok: true })),
    hello: hello_1.helloRouter,
    auth: auth_1.authRouter,
    planner: planner_1.plannerRouter,
});
