"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plannerRouter = void 0;
const zod_1 = require("zod");
const trpc_1 = require("./trpc");
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const server_1 = require("@trpc/server");
const dynamoClient = new client_dynamodb_1.DynamoDBClient({
    region: process.env.AWS_REGION || 'us-east-1',
});
const docClient = lib_dynamodb_1.DynamoDBDocumentClient.from(dynamoClient);
const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || 'coinly-dev';
// Schemas
const PlanTypeSchema = zod_1.z.enum(['trip', 'house', 'car', 'education', 'emergency', 'other']);
const PlanSchema = zod_1.z.object({
    id: zod_1.z.string(),
    userId: zod_1.z.string(),
    title: zod_1.z.string().min(1).max(100),
    description: zod_1.z.string().optional(),
    planType: PlanTypeSchema,
    targetAmount: zod_1.z.number().positive(),
    currentAmount: zod_1.z.number().min(0).default(0),
    targetDate: zod_1.z.string(), // ISO date string
    monthlyIncome: zod_1.z.number().positive(),
    monthlySavingsGoal: zod_1.z.number().positive(),
    partnerContribution: zod_1.z.number().min(0).default(0),
    isActive: zod_1.z.boolean().default(true),
    createdAt: zod_1.z.string(),
    updatedAt: zod_1.z.string(),
    milestones: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        title: zod_1.z.string(),
        targetAmount: zod_1.z.number(),
        targetDate: zod_1.z.string(),
        completed: zod_1.z.boolean().default(false),
        completedAt: zod_1.z.string().optional(),
    })).default([]),
    expenses: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        title: zod_1.z.string(),
        amount: zod_1.z.number(),
        category: zod_1.z.string(),
        date: zod_1.z.string(),
        isRecurring: zod_1.z.boolean().default(false),
        recurringFrequency: zod_1.z.enum(['weekly', 'monthly', 'yearly']).optional(),
    })).default([]),
});
const CreatePlanSchema = PlanSchema.omit({
    id: true,
    userId: true,
    createdAt: true,
    updatedAt: true
});
const UpdatePlanSchema = CreatePlanSchema.partial().extend({
    id: zod_1.z.string(),
});
const ProgressUpdateSchema = zod_1.z.object({
    planId: zod_1.z.string(),
    amount: zod_1.z.number(),
    note: zod_1.z.string().optional(),
});
exports.plannerRouter = (0, trpc_1.router)({
    // Create a new plan
    createPlan: trpc_1.protectedProcedure
        .input(CreatePlanSchema)
        .mutation(async ({ input, ctx }) => {
        const planId = `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const userId = ctx.user.userId;
        const now = new Date().toISOString();
        const plan = {
            ...input,
            id: planId,
            userId,
            createdAt: now,
            updatedAt: now,
        };
        try {
            await docClient.send(new lib_dynamodb_1.PutCommand({
                TableName: TABLE_NAME,
                Item: {
                    pk: `USER#${userId}`,
                    sk: `PLAN#${planId}`,
                    ...plan,
                    entityType: 'plan',
                },
            }));
            return plan;
        }
        catch (error) {
            throw new server_1.TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to create plan',
                cause: error,
            });
        }
    }),
    // Get all plans for a user
    getPlans: trpc_1.protectedProcedure
        .query(async ({ ctx }) => {
        const userId = ctx.user.userId;
        try {
            const result = await docClient.send(new lib_dynamodb_1.QueryCommand({
                TableName: TABLE_NAME,
                KeyConditionExpression: 'pk = :pk AND begins_with(sk, :sk)',
                ExpressionAttributeValues: {
                    ':pk': `USER#${userId}`,
                    ':sk': 'PLAN#',
                },
            }));
            return result.Items?.map(item => ({
                id: item.id,
                userId: item.userId,
                title: item.title,
                description: item.description,
                planType: item.planType,
                targetAmount: item.targetAmount,
                currentAmount: item.currentAmount,
                targetDate: item.targetDate,
                monthlyIncome: item.monthlyIncome,
                monthlySavingsGoal: item.monthlySavingsGoal,
                partnerContribution: item.partnerContribution,
                isActive: item.isActive,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
                milestones: item.milestones || [],
                expenses: item.expenses || [],
            })) || [];
        }
        catch (error) {
            throw new server_1.TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to fetch plans',
                cause: error,
            });
        }
    }),
    // Get a specific plan
    getPlan: trpc_1.protectedProcedure
        .input(zod_1.z.object({ planId: zod_1.z.string() }))
        .query(async ({ input, ctx }) => {
        const userId = ctx.user.userId;
        try {
            const result = await docClient.send(new lib_dynamodb_1.GetCommand({
                TableName: TABLE_NAME,
                Key: {
                    pk: `USER#${userId}`,
                    sk: `PLAN#${input.planId}`,
                },
            }));
            if (!result.Item) {
                throw new server_1.TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Plan not found',
                });
            }
            return {
                id: result.Item.id,
                userId: result.Item.userId,
                title: result.Item.title,
                description: result.Item.description,
                planType: result.Item.planType,
                targetAmount: result.Item.targetAmount,
                currentAmount: result.Item.currentAmount,
                targetDate: result.Item.targetDate,
                monthlyIncome: result.Item.monthlyIncome,
                monthlySavingsGoal: result.Item.monthlySavingsGoal,
                partnerContribution: result.Item.partnerContribution,
                isActive: result.Item.isActive,
                createdAt: result.Item.createdAt,
                updatedAt: result.Item.updatedAt,
                milestones: result.Item.milestones || [],
                expenses: result.Item.expenses || [],
            };
        }
        catch (error) {
            if (error instanceof server_1.TRPCError)
                throw error;
            throw new server_1.TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to fetch plan',
                cause: error,
            });
        }
    }),
    // Update a plan
    updatePlan: trpc_1.protectedProcedure
        .input(UpdatePlanSchema)
        .mutation(async ({ input, ctx }) => {
        const userId = ctx.user.userId;
        const { id: planId, ...updateData } = input;
        try {
            const updateExpression = [];
            const expressionAttributeNames = {};
            const expressionAttributeValues = {};
            Object.entries(updateData).forEach(([key, value]) => {
                if (value !== undefined) {
                    updateExpression.push(`#${key} = :${key}`);
                    expressionAttributeNames[`#${key}`] = key;
                    expressionAttributeValues[`:${key}`] = value;
                }
            });
            updateExpression.push('#updatedAt = :updatedAt');
            expressionAttributeNames['#updatedAt'] = 'updatedAt';
            expressionAttributeValues[':updatedAt'] = new Date().toISOString();
            await docClient.send(new lib_dynamodb_1.UpdateCommand({
                TableName: TABLE_NAME,
                Key: {
                    pk: `USER#${userId}`,
                    sk: `PLAN#${planId}`,
                },
                UpdateExpression: `SET ${updateExpression.join(', ')}`,
                ExpressionAttributeNames: expressionAttributeNames,
                ExpressionAttributeValues: expressionAttributeValues,
            }));
            return { success: true };
        }
        catch (error) {
            throw new server_1.TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to update plan',
                cause: error,
            });
        }
    }),
    // Update progress (add money to current amount)
    updateProgress: trpc_1.protectedProcedure
        .input(ProgressUpdateSchema)
        .mutation(async ({ input, ctx }) => {
        const userId = ctx.user.userId;
        try {
            await docClient.send(new lib_dynamodb_1.UpdateCommand({
                TableName: TABLE_NAME,
                Key: {
                    pk: `USER#${userId}`,
                    sk: `PLAN#${input.planId}`,
                },
                UpdateExpression: 'ADD currentAmount :amount SET updatedAt = :updatedAt',
                ExpressionAttributeValues: {
                    ':amount': input.amount,
                    ':updatedAt': new Date().toISOString(),
                },
            }));
            // Log the progress update
            const progressId = `progress_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            await docClient.send(new lib_dynamodb_1.PutCommand({
                TableName: TABLE_NAME,
                Item: {
                    pk: `USER#${userId}`,
                    sk: `PROGRESS#${input.planId}#${progressId}`,
                    planId: input.planId,
                    amount: input.amount,
                    note: input.note,
                    createdAt: new Date().toISOString(),
                    entityType: 'progress',
                },
            }));
            return { success: true };
        }
        catch (error) {
            throw new server_1.TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to update progress',
                cause: error,
            });
        }
    }),
    // Get progress history for a plan
    getProgressHistory: trpc_1.protectedProcedure
        .input(zod_1.z.object({ planId: zod_1.z.string() }))
        .query(async ({ input, ctx }) => {
        const userId = ctx.user.userId;
        try {
            const result = await docClient.send(new lib_dynamodb_1.QueryCommand({
                TableName: TABLE_NAME,
                KeyConditionExpression: 'pk = :pk AND begins_with(sk, :sk)',
                ExpressionAttributeValues: {
                    ':pk': `USER#${userId}`,
                    ':sk': `PROGRESS#${input.planId}#`,
                },
                ScanIndexForward: false, // Most recent first
            }));
            return result.Items?.map(item => ({
                planId: item.planId,
                amount: item.amount,
                note: item.note,
                createdAt: item.createdAt,
            })) || [];
        }
        catch (error) {
            throw new server_1.TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to fetch progress history',
                cause: error,
            });
        }
    }),
    // Delete a plan
    deletePlan: trpc_1.protectedProcedure
        .input(zod_1.z.object({ planId: zod_1.z.string() }))
        .mutation(async ({ input, ctx }) => {
        const userId = ctx.user.userId;
        try {
            await docClient.send(new lib_dynamodb_1.DeleteCommand({
                TableName: TABLE_NAME,
                Key: {
                    pk: `USER#${userId}`,
                    sk: `PLAN#${input.planId}`,
                },
            }));
            return { success: true };
        }
        catch (error) {
            throw new server_1.TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to delete plan',
                cause: error,
            });
        }
    }),
    // Seed demo data
    seedDemoData: trpc_1.publicProcedure
        .mutation(async () => {
        const userId = 'demo_user';
        const now = new Date().toISOString();
        const demoPlans = [
            {
                id: 'demo_plan_1',
                userId,
                title: 'Japan Trip 2025',
                description: 'Two-week vacation to Tokyo and Kyoto',
                planType: 'trip',
                targetAmount: 8000,
                currentAmount: 2400,
                targetDate: '2025-06-15',
                monthlyIncome: 5000,
                monthlySavingsGoal: 800,
                partnerContribution: 200,
                isActive: true,
                createdAt: '2024-01-15T00:00:00Z',
                updatedAt: now,
                milestones: [
                    { id: 'm1', title: 'Flight Booking', targetAmount: 2000, targetDate: '2025-03-01', completed: true, completedAt: '2024-11-15T00:00:00Z' },
                    { id: 'm2', title: 'Accommodation', targetAmount: 4000, targetDate: '2025-04-01', completed: false },
                    { id: 'm3', title: 'Activities & Food', targetAmount: 8000, targetDate: '2025-06-01', completed: false },
                ],
                expenses: [],
                entityType: 'plan',
            },
            {
                id: 'demo_plan_2',
                userId,
                title: 'House Down Payment',
                description: 'Saving for our first home',
                planType: 'house',
                targetAmount: 50000,
                currentAmount: 18500,
                targetDate: '2026-12-31',
                monthlyIncome: 5000,
                monthlySavingsGoal: 1500,
                partnerContribution: 1000,
                isActive: true,
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: now,
                milestones: [
                    { id: 'm4', title: 'Emergency Fund', targetAmount: 10000, targetDate: '2025-06-01', completed: true, completedAt: '2024-10-01T00:00:00Z' },
                    { id: 'm5', title: 'Half Way Point', targetAmount: 25000, targetDate: '2025-12-01', completed: false },
                    { id: 'm6', title: 'Full Down Payment', targetAmount: 50000, targetDate: '2026-12-31', completed: false },
                ],
                expenses: [],
                entityType: 'plan',
            },
            {
                id: 'demo_plan_3',
                userId,
                title: 'Emergency Fund',
                description: '6 months of expenses',
                planType: 'emergency',
                targetAmount: 15000,
                currentAmount: 15000,
                targetDate: '2024-12-31',
                monthlyIncome: 5000,
                monthlySavingsGoal: 500,
                partnerContribution: 0,
                isActive: false,
                createdAt: '2023-06-01T00:00:00Z',
                updatedAt: now,
                milestones: [],
                expenses: [],
                entityType: 'plan',
            }
        ];
        try {
            // Insert demo plans
            for (const plan of demoPlans) {
                await docClient.send(new lib_dynamodb_1.PutCommand({
                    TableName: TABLE_NAME,
                    Item: {
                        pk: `USER#${userId}`,
                        sk: `PLAN#${plan.id}`,
                        ...plan,
                    },
                }));
            }
            return { success: true, message: 'Demo data seeded successfully', count: demoPlans.length };
        }
        catch (error) {
            throw new server_1.TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to seed demo data',
                cause: error,
            });
        }
    }),
    // Get analytics/insights for all plans
    getAnalytics: trpc_1.protectedProcedure
        .query(async ({ ctx }) => {
        const userId = ctx.user.userId;
        try {
            const result = await docClient.send(new lib_dynamodb_1.QueryCommand({
                TableName: TABLE_NAME,
                KeyConditionExpression: 'pk = :pk AND begins_with(sk, :sk)',
                ExpressionAttributeValues: {
                    ':pk': `USER#${userId}`,
                    ':sk': 'PLAN#',
                },
            }));
            const plans = result.Items || [];
            const totalTargetAmount = plans.reduce((sum, plan) => sum + (plan.targetAmount || 0), 0);
            const totalCurrentAmount = plans.reduce((sum, plan) => sum + (plan.currentAmount || 0), 0);
            const totalMonthlySavings = plans.reduce((sum, plan) => sum + (plan.monthlySavingsGoal || 0), 0);
            const totalPartnerContribution = plans.reduce((sum, plan) => sum + (plan.partnerContribution || 0), 0);
            const activePlans = plans.filter(plan => plan.isActive);
            const completedPlans = plans.filter(plan => (plan.currentAmount || 0) >= (plan.targetAmount || 0));
            const plansByType = plans.reduce((acc, plan) => {
                const type = plan.planType || 'other';
                if (!acc[type])
                    acc[type] = { count: 0, totalTarget: 0, totalCurrent: 0 };
                acc[type].count++;
                acc[type].totalTarget += plan.targetAmount || 0;
                acc[type].totalCurrent += plan.currentAmount || 0;
                return acc;
            }, {});
            return {
                totalPlans: plans.length,
                activePlans: activePlans.length,
                completedPlans: completedPlans.length,
                totalTargetAmount,
                totalCurrentAmount,
                totalMonthlySavings,
                totalPartnerContribution,
                overallProgress: totalTargetAmount > 0 ? (totalCurrentAmount / totalTargetAmount) * 100 : 0,
                plansByType,
            };
        }
        catch (error) {
            throw new server_1.TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to fetch analytics',
                cause: error,
            });
        }
    }),
});
