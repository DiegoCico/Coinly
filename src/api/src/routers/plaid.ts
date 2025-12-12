import { z } from 'zod';
import { router, protectedProcedure } from './trpc';
import { PlaidService } from '../services/plaidService';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { TRPCError } from '@trpc/server';

const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || 'coinly-dev';
const IS_DEMO_MODE = process.env.NODE_ENV === 'development' || process.env.DEMO_MODE === 'true';

// Demo bank accounts for development
const DEMO_BANK_ACCOUNTS = [
  {
    id: 'demo_account_1',
    userId: 'demo_user_123',
    institutionName: 'Chase Bank',
    accountName: 'Chase Checking',
    accountType: 'depository',
    accountSubtype: 'checking',
    mask: '0000',
    balance: {
      available: 5420.50,
      current: 5420.50,
      currency: 'USD',
    },
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'demo_account_2',
    userId: 'demo_user_123',
    institutionName: 'Chase Bank',
    accountName: 'Chase Savings',
    accountType: 'depository',
    accountSubtype: 'savings',
    mask: '1111',
    balance: {
      available: 12850.75,
      current: 12850.75,
      currency: 'USD',
    },
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: new Date().toISOString(),
  }
];

// Input schemas
const CreateLinkTokenSchema = z.object({
  clientName: z.string().optional(),
});

const ExchangeTokenSchema = z.object({
  publicToken: z.string(),
});

const GetTransactionsSchema = z.object({
  accountId: z.string(),
  startDate: z.string(),
  endDate: z.string(),
});

const UpdateAccountSchema = z.object({
  accountId: z.string(),
  isActive: z.boolean().optional(),
  nickname: z.string().optional(),
});

export const plaidRouter = router({
  // Create Plaid Link token for connecting bank accounts
  createLinkToken: protectedProcedure
    .input(CreateLinkTokenSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const userId = ctx.user?.userId;
        if (!userId) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'User ID required',
          });
        }

        // Demo mode - return mock link token
        if (IS_DEMO_MODE && userId.startsWith('demo_user')) {
          return {
            linkToken: 'link-sandbox-demo-token',
            expiration: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
          };
        }

        // Production mode - create real Plaid link token
        return await PlaidService.createLinkToken({
          userId,
          clientName: input.clientName,
        });
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        console.error('Create link token error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create link token',
        });
      }
    }),

  // Exchange public token for access token and save account info
  exchangeToken: protectedProcedure
    .input(ExchangeTokenSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const userId = ctx.user?.userId;
        if (!userId) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'User ID required',
          });
        }

        // Demo mode - simulate token exchange and return demo accounts
        if (IS_DEMO_MODE && userId.startsWith('demo_user')) {
          console.log('Demo mode: Token exchange simulated');
          return {
            success: true,
            accountsAdded: DEMO_BANK_ACCOUNTS.length,
            message: 'Demo bank accounts connected successfully',
          };
        }

        // Production mode - exchange token and save accounts
        const { accessToken, itemId } = await PlaidService.exchangePublicToken({
          publicToken: input.publicToken,
          userId,
        });

        // Get account information
        const { accounts } = await PlaidService.getAccounts({ accessToken });

        // Save accounts to DynamoDB
        const savedAccounts = [];
        for (const account of accounts) {
          const accountData = {
            pk: `USER#${userId}`,
            sk: `ACCOUNT#${account.accountId}`,
            userId,
            accountId: account.accountId,
            itemId,
            accessToken, // In production, encrypt this!
            institutionName: account.name,
            accountName: account.name,
            accountType: account.type,
            accountSubtype: account.subtype,
            mask: account.mask,
            balance: account.balances,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          await docClient.send(new PutCommand({
            TableName: TABLE_NAME,
            Item: accountData,
          }));

          savedAccounts.push(accountData);
        }

        return {
          success: true,
          accountsAdded: savedAccounts.length,
          message: `Successfully connected ${savedAccounts.length} bank account(s)`,
        };
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        console.error('Exchange token error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to connect bank account',
        });
      }
    }),

  // Get user's connected bank accounts
  getAccounts: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const userId = ctx.user?.userId;
        if (!userId) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'User ID required',
          });
        }

        // Demo mode - return demo accounts
        if (IS_DEMO_MODE && userId.startsWith('demo_user')) {
          return DEMO_BANK_ACCOUNTS;
        }

        // Production mode - get from DynamoDB
        const result = await docClient.send(new QueryCommand({
          TableName: TABLE_NAME,
          KeyConditionExpression: 'pk = :pk AND begins_with(sk, :sk)',
          ExpressionAttributeValues: {
            ':pk': `USER#${userId}`,
            ':sk': 'ACCOUNT#',
          },
        }));

        return result.Items?.map(item => ({
          id: item.accountId,
          userId: item.userId,
          institutionName: item.institutionName,
          accountName: item.accountName,
          accountType: item.accountType,
          accountSubtype: item.accountSubtype,
          mask: item.mask,
          balance: item.balance,
          isActive: item.isActive,
          nickname: item.nickname,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        })) || [];
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        console.error('Get accounts error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch bank accounts',
        });
      }
    }),

  // Get transactions for an account
  getTransactions: protectedProcedure
    .input(GetTransactionsSchema)
    .query(async ({ input, ctx }) => {
      try {
        const userId = ctx.user?.userId;
        if (!userId) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'User ID required',
          });
        }

        // Demo mode - return demo transactions
        if (IS_DEMO_MODE && userId.startsWith('demo_user')) {
          const demoTransactions = [
            {
              transactionId: 'demo_txn_1',
              accountId: input.accountId,
              amount: -45.67,
              currency: 'USD',
              date: '2024-12-10',
              name: 'Starbucks Coffee',
              category: ['Food and Drink', 'Restaurants', 'Coffee Shop'],
              pending: false,
            },
            {
              transactionId: 'demo_txn_2',
              accountId: input.accountId,
              amount: -1250.00,
              currency: 'USD',
              date: '2024-12-09',
              name: 'Monthly Rent Payment',
              category: ['Payment', 'Rent'],
              pending: false,
            },
            {
              transactionId: 'demo_txn_3',
              accountId: input.accountId,
              amount: 2500.00,
              currency: 'USD',
              date: '2024-12-08',
              name: 'Salary Deposit',
              category: ['Deposit', 'Payroll'],
              pending: false,
            },
          ];

          return {
            transactions: demoTransactions,
            totalTransactions: demoTransactions.length,
          };
        }

        // Production mode - get account access token and fetch transactions
        const accountResult = await docClient.send(new GetCommand({
          TableName: TABLE_NAME,
          Key: {
            pk: `USER#${userId}`,
            sk: `ACCOUNT#${input.accountId}`,
          },
        }));

        if (!accountResult.Item) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Bank account not found',
          });
        }

        const accessToken = accountResult.Item.accessToken;
        return await PlaidService.getTransactions({
          accessToken,
          startDate: input.startDate,
          endDate: input.endDate,
        });
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        console.error('Get transactions error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch transactions',
        });
      }
    }),

  // Update account settings (nickname, active status)
  updateAccount: protectedProcedure
    .input(UpdateAccountSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const userId = ctx.user?.userId;
        if (!userId) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'User ID required',
          });
        }

        // Demo mode - just log and return success
        if (IS_DEMO_MODE && userId.startsWith('demo_user')) {
          console.log('Demo mode: Account update simulated', input);
          return { success: true };
        }

        // Production mode - update in DynamoDB
        const updateExpression = [];
        const expressionAttributeNames: Record<string, string> = {};
        const expressionAttributeValues: Record<string, any> = {};

        if (input.isActive !== undefined) {
          updateExpression.push('#isActive = :isActive');
          expressionAttributeNames['#isActive'] = 'isActive';
          expressionAttributeValues[':isActive'] = input.isActive;
        }

        if (input.nickname !== undefined) {
          updateExpression.push('#nickname = :nickname');
          expressionAttributeNames['#nickname'] = 'nickname';
          expressionAttributeValues[':nickname'] = input.nickname;
        }

        updateExpression.push('#updatedAt = :updatedAt');
        expressionAttributeNames['#updatedAt'] = 'updatedAt';
        expressionAttributeValues[':updatedAt'] = new Date().toISOString();

        await docClient.send(new UpdateCommand({
          TableName: TABLE_NAME,
          Key: {
            pk: `USER#${userId}`,
            sk: `ACCOUNT#${input.accountId}`,
          },
          UpdateExpression: `SET ${updateExpression.join(', ')}`,
          ExpressionAttributeNames: expressionAttributeNames,
          ExpressionAttributeValues: expressionAttributeValues,
        }));

        return { success: true };
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        console.error('Update account error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update account',
        });
      }
    }),

  // Remove/disconnect a bank account
  removeAccount: protectedProcedure
    .input(z.object({ accountId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const userId = ctx.user?.userId;
        if (!userId) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'User ID required',
          });
        }

        // Demo mode - just log and return success
        if (IS_DEMO_MODE && userId.startsWith('demo_user')) {
          console.log('Demo mode: Account removal simulated', input);
          return { success: true };
        }

        // Production mode - remove from DynamoDB
        await docClient.send(new DeleteCommand({
          TableName: TABLE_NAME,
          Key: {
            pk: `USER#${userId}`,
            sk: `ACCOUNT#${input.accountId}`,
          },
        }));

        return { success: true };
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        console.error('Remove account error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to remove account',
        });
      }
    }),

  // Refresh account balances
  refreshBalances: protectedProcedure
    .mutation(async ({ ctx }) => {
      try {
        const userId = ctx.user?.userId;
        if (!userId) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'User ID required',
          });
        }

        // Demo mode - simulate refresh
        if (IS_DEMO_MODE && userId.startsWith('demo_user')) {
          console.log('Demo mode: Balance refresh simulated');
          return { 
            success: true, 
            message: 'Demo account balances refreshed',
            accountsUpdated: DEMO_BANK_ACCOUNTS.length,
          };
        }

        // Production mode - refresh all user accounts
        const accountsResult = await docClient.send(new QueryCommand({
          TableName: TABLE_NAME,
          KeyConditionExpression: 'pk = :pk AND begins_with(sk, :sk)',
          ExpressionAttributeValues: {
            ':pk': `USER#${userId}`,
            ':sk': 'ACCOUNT#',
          },
        }));

        let updatedCount = 0;
        for (const account of accountsResult.Items || []) {
          try {
            const { accounts } = await PlaidService.getAccounts({ 
              accessToken: account.accessToken 
            });
            
            const updatedAccount = accounts.find(acc => acc.accountId === account.accountId);
            if (updatedAccount) {
              await docClient.send(new UpdateCommand({
                TableName: TABLE_NAME,
                Key: {
                  pk: account.pk,
                  sk: account.sk,
                },
                UpdateExpression: 'SET balance = :balance, updatedAt = :updatedAt',
                ExpressionAttributeValues: {
                  ':balance': updatedAccount.balances,
                  ':updatedAt': new Date().toISOString(),
                },
              }));
              updatedCount++;
            }
          } catch (error) {
            console.error(`Failed to refresh account ${account.accountId}:`, error);
          }
        }

        return { 
          success: true, 
          message: `Successfully refreshed ${updatedCount} account(s)`,
          accountsUpdated: updatedCount,
        };
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        console.error('Refresh balances error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to refresh account balances',
        });
      }
    }),
});