"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appRouter = void 0;
const trpc_1 = require("./trpc");
const hello_1 = require("./hello");
const s3_1 = require("./s3");
const auth_1 = require("./auth");
const teamspace_1 = require("./teamspace");
const roles_1 = require("./roles");
const users_1 = require("./users");
const items_1 = require("./items");
const home_1 = require("./home");
const profile_1 = require("./profile");
const export_1 = require("./export");
const planner_1 = require("./planner");
const coreRouter = (0, trpc_1.router)({
    health: trpc_1.publicProcedure.query(() => ({ ok: true })),
});
exports.appRouter = (0, trpc_1.mergeRouters)(coreRouter, hello_1.helloRouter, s3_1.s3Router, auth_1.authRouter, teamspace_1.teamspaceRouter, roles_1.rolesRouter, users_1.usersRouter, items_1.itemsRouter, home_1.homeRouter, profile_1.profileRouter, export_1.exportRouter, planner_1.plannerRouter);
