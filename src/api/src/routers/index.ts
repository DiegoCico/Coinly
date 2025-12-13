import { router, publicProcedure, mergeRouters } from './trpc';

import { helloRouter } from './hello';
import { authRouter } from './auth';
import { plannerRouter } from './planner';
import { plaidRouter } from './plaid';

const coreRouter = router({
  health: publicProcedure.query(() => ({ ok: true })),
});

export const appRouter = router({
  health: publicProcedure.query(() => ({ ok: true })),
  hello: helloRouter,
  auth: authRouter,
  planner: plannerRouter,
  plaid: plaidRouter,
});

export type AppRouter = typeof appRouter;
