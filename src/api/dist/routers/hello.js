"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.helloRouter = void 0;
const zod_1 = require("zod");
const trpc_1 = require("./trpc");
exports.helloRouter = (0, trpc_1.router)({
    hello: trpc_1.publicProcedure
        .input(zod_1.z.object({ name: zod_1.z.string().optional() }).nullish())
        .query(({ input }) => {
        const name = input?.name ?? 'world';
        return { message: `Hello ${name}` };
    }),
});
