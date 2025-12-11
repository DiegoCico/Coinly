import type { PostConfirmationTriggerEvent, PostConfirmationTriggerHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

const TABLE_NAME = process.env.TABLE_NAME || 'coinly-dev';

/**
 * Post-confirmation trigger for Cognito User Pool
 * This function runs after a user confirms their account
 */
export const handler: PostConfirmationTriggerHandler = async (event: PostConfirmationTriggerEvent) => {
  console.log('Post-confirmation trigger event:', JSON.stringify(event, null, 2));

  try {
    const userId = event.request.userAttributes.sub;
    const email = event.request.userAttributes.email;
    const givenName = event.request.userAttributes.given_name;
    const familyName = event.request.userAttributes.family_name;

    // Create user profile in DynamoDB
    const userProfile = {
      pk: `USER#${userId}`,
      sk: `PROFILE#${userId}`,
      userId,
      email,
      givenName,
      familyName,
      planCount: 0,
      subscriptionTier: 'free',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      entityType: 'user_profile',
      isActive: true,
      preferences: {
        theme: 'dark',
        currency: 'USD',
        notifications: {
          email: true,
          milestones: true,
          reminders: true,
        },
      },
      stats: {
        totalPlans: 0,
        completedPlans: 0,
        totalSaved: 0,
        totalTarget: 0,
      },
    };

    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: userProfile,
    }));

    // Create welcome plan (optional demo plan)
    const welcomePlan = {
      pk: `USER#${userId}`,
      sk: `PLAN#welcome_${Date.now()}`,
      id: `welcome_${Date.now()}`,
      userId,
      title: 'Welcome to Financial Planner!',
      description: 'This is a sample plan to get you started. Feel free to edit or delete it.',
      planType: 'other',
      targetAmount: 1000,
      currentAmount: 0,
      targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 90 days from now
      monthlyIncome: 5000,
      monthlySavingsGoal: 100,
      partnerContribution: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      milestones: [
        {
          id: 'm1',
          title: 'First $250',
          targetAmount: 250,
          targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          completed: false,
        },
        {
          id: 'm2',
          title: 'Halfway Point',
          targetAmount: 500,
          targetDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          completed: false,
        },
      ],
      expenses: [],
      entityType: 'plan',
    };

    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: welcomePlan,
    }));

    // Update user profile with plan count
    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        ...userProfile,
        planCount: 1,
        stats: {
          ...userProfile.stats,
          totalPlans: 1,
          totalTarget: 1000,
        },
      },
    }));

    console.log(`Successfully created user profile and welcome plan for user: ${userId}`);

    return event;
  } catch (error) {
    console.error('Post-confirmation trigger error:', error);
    // Don't throw error here as it would prevent user confirmation
    // Just log the error and continue
    return event;
  }
};