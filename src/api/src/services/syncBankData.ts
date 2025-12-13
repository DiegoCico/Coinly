#!/usr/bin/env tsx

/**
 * Bank Data Sync Script
 * 
 * This script fetches the latest bank account balances and transactions
 * from Plaid and updates the DynamoDB database.
 * 
 * Usage:
 *   npm run sync-bank-data
 *   npm run sync-bank-data -- --user-id=specific_user_id
 *   npm run sync-bank-data -- --days=30
 */

import 'dotenv/config';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, QueryCommand, UpdateCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { PlaidService } from '../services/plaidService';

const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || 'coinly-dev';

interface SyncOptions {
  userId?: string;
  days?: number;
  dryRun?: boolean;
}

class BankDataSyncer {
  private options: SyncOptions;

  constructor(options: SyncOptions = {}) {
    this.options = {
      days: 30,
      dryRun: false,
      ...options,
    };
  }

  async syncAllUsers() {
    console.log('🔄 Starting bank data sync for all users...');
    
    try {
      // Get all users with bank accounts
      const result = await docClient.send(new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: 'begins_with(sk, :sk)',
        ExpressionAttributeValues: {
          ':sk': 'ACCOUNT#',
        },
      }));

      const userIds = new Set<string>();
      result.Items?.forEach(item => {
        if (item.userId) {
          userIds.add(item.userId);
        }
      });

      console.log(`📊 Found ${userIds.size} users with bank accounts`);

      for (const userId of userIds) {
        await this.syncUserData(userId);
      }

      console.log('✅ Bank data sync completed successfully');
    } catch (error) {
      console.error('❌ Bank data sync failed:', error);
      process.exit(1);
    }
  }

  async syncUserData(userId: string) {
    console.log(`\n👤 Syncing data for user: ${userId}`);

    try {
      // Get user's bank accounts
      const accountsResult = await docClient.send(new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: 'pk = :pk AND begins_with(sk, :sk)',
        ExpressionAttributeValues: {
          ':pk': `USER#${userId}`,
          ':sk': 'ACCOUNT#',
        },
      }));

      const accounts = accountsResult.Items || [];
      console.log(`💳 Found ${accounts.length} bank accounts`);

      for (const account of accounts) {
        await this.syncAccountData(account);
      }
    } catch (error) {
      console.error(`❌ Failed to sync user ${userId}:`, error);
    }
  }

  async syncAccountData(account: any) {
    const accountId = account.accountId;
    const accessToken = account.accessToken;

    console.log(`  💰 Syncing account: ${account.accountName} (${account.mask})`);

    try {
      // 1. Update account balances
      await this.updateAccountBalances(account, accessToken);

      // 2. Sync recent transactions
      await this.syncTransactions(account, accessToken);

    } catch (error) {
      console.error(`    ❌ Failed to sync account ${accountId}:`, error);
    }
  }

  async updateAccountBalances(account: any, accessToken: string) {
    try {
      const { accounts } = await PlaidService.getAccounts({ accessToken });
      const updatedAccount = accounts.find(acc => acc.accountId === account.accountId);

      if (updatedAccount) {
        if (!this.options.dryRun) {
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
        }

        console.log(`    ✅ Updated balance: $${updatedAccount.balances.current}`);
      }
    } catch (error) {
      console.error(`    ❌ Failed to update balances:`, error);
    }
  }

  async syncTransactions(account: any, accessToken: string) {
    try {
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - (this.options.days! * 24 * 60 * 60 * 1000))
        .toISOString().split('T')[0];

      const { transactions } = await PlaidService.getTransactions({
        accessToken,
        startDate,
        endDate,
      });

      console.log(`    📊 Found ${transactions.length} transactions`);

      if (!this.options.dryRun) {
        // Save transactions to DynamoDB
        for (const transaction of transactions) {
          const transactionData = {
            pk: `USER#${account.userId}`,
            sk: `TRANSACTION#${transaction.transactionId}`,
            userId: account.userId,
            accountId: account.accountId,
            transactionId: transaction.transactionId,
            amount: transaction.amount,
            currency: transaction.isoCurrencyCode,
            date: transaction.date,
            name: transaction.name,
            merchantName: transaction.merchantName,
            category: transaction.category,
            subcategory: transaction.subcategory,
            type: transaction.type,
            pending: transaction.pending,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          await docClient.send(new PutCommand({
            TableName: TABLE_NAME,
            Item: transactionData,
            ConditionExpression: 'attribute_not_exists(pk)', // Don't overwrite existing
          }));
        }
      }

      console.log(`    ✅ Synced ${transactions.length} transactions`);
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'ConditionalCheckFailedException') {
        // Transaction already exists, skip
        return;
      }
      console.error(`    ❌ Failed to sync transactions:`, error);
    }
  }
}

// Parse command line arguments
function parseArgs(): SyncOptions {
  const args = process.argv.slice(2);
  const options: SyncOptions = {};

  for (const arg of args) {
    if (arg.startsWith('--user-id=')) {
      options.userId = arg.split('=')[1];
    } else if (arg.startsWith('--days=')) {
      options.days = parseInt(arg.split('=')[1]);
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    }
  }

  return options;
}

// Main execution
async function main() {
  const options = parseArgs();
  const syncer = new BankDataSyncer(options);

  console.log('🏦 Coinly Bank Data Sync');
  console.log('========================');
  console.log(`📅 Syncing last ${options.days} days`);
  if (options.dryRun) {
    console.log('🔍 DRY RUN MODE - No data will be modified');
  }
  console.log('');

  if (options.userId) {
    console.log(`👤 Syncing specific user: ${options.userId}`);
    await syncer.syncUserData(options.userId);
  } else {
    await syncer.syncAllUsers();
  }
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
}

export { BankDataSyncer };