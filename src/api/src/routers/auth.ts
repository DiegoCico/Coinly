import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from './trpc';
import { 
  CognitoIdentityProviderClient, 
  InitiateAuthCommand,
  SignUpCommand,
  ConfirmSignUpCommand,
  ResendConfirmationCodeCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
  ChangePasswordCommand,
  GetUserCommand,
  UpdateUserAttributesCommand,
  GlobalSignOutCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { TRPCError } from '@trpc/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION || 'us-east-1',
});

const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

const CLIENT_ID = process.env.COGNITO_CLIENT_ID || '';
const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || 'coinly-dev';

// Input schemas
const SignUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  givenName: z.string().min(1),
  familyName: z.string().min(1),
});

const SignInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const ConfirmSignUpSchema = z.object({
  email: z.string().email(),
  confirmationCode: z.string().min(6).max(6),
});

const ForgotPasswordSchema = z.object({
  email: z.string().email(),
});

const ConfirmForgotPasswordSchema = z.object({
  email: z.string().email(),
  confirmationCode: z.string().min(6).max(6),
  newPassword: z.string().min(8),
});

const ChangePasswordSchema = z.object({
  previousPassword: z.string().min(1),
  proposedPassword: z.string().min(8),
});

const UpdateProfileSchema = z.object({
  givenName: z.string().min(1).optional(),
  familyName: z.string().min(1).optional(),
  preferences: z.object({
    theme: z.enum(['light', 'dark']).optional(),
    currency: z.string().optional(),
    notifications: z.object({
      email: z.boolean().optional(),
      milestones: z.boolean().optional(),
      reminders: z.boolean().optional(),
    }).optional(),
  }).optional(),
});

export const authRouter = router({
  // Sign up new user
  signUp: publicProcedure
    .input(SignUpSchema)
    .mutation(async ({ input }) => {
      try {
        const command = new SignUpCommand({
          ClientId: CLIENT_ID,
          Username: input.email,
          Password: input.password,
          UserAttributes: [
            { Name: 'email', Value: input.email },
            { Name: 'given_name', Value: input.givenName },
            { Name: 'family_name', Value: input.familyName },
          ],
        });

        const response = await cognitoClient.send(command);

        return {
          success: true,
          userSub: response.UserSub,
          codeDeliveryDetails: response.CodeDeliveryDetails,
        };
      } catch (error: any) {
        console.error('Sign up error:', error);
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error.message || 'Failed to sign up',
        });
      }
    }),

  // Confirm sign up with verification code
  confirmSignUp: publicProcedure
    .input(ConfirmSignUpSchema)
    .mutation(async ({ input }) => {
      try {
        const command = new ConfirmSignUpCommand({
          ClientId: CLIENT_ID,
          Username: input.email,
          ConfirmationCode: input.confirmationCode,
        });

        await cognitoClient.send(command);

        return { success: true };
      } catch (error: any) {
        console.error('Confirm sign up error:', error);
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error.message || 'Failed to confirm sign up',
        });
      }
    }),

  // Resend confirmation code
  resendConfirmationCode: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      try {
        const command = new ResendConfirmationCodeCommand({
          ClientId: CLIENT_ID,
          Username: input.email,
        });

        const response = await cognitoClient.send(command);

        return {
          success: true,
          codeDeliveryDetails: response.CodeDeliveryDetails,
        };
      } catch (error: any) {
        console.error('Resend confirmation code error:', error);
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error.message || 'Failed to resend confirmation code',
        });
      }
    }),

  // Sign in user
  signIn: publicProcedure
    .input(SignInSchema)
    .mutation(async ({ input }) => {
      try {
        const command = new InitiateAuthCommand({
          ClientId: CLIENT_ID,
          AuthFlow: 'USER_SRP_AUTH',
          AuthParameters: {
            USERNAME: input.email,
            PASSWORD: input.password,
          },
        });

        const response = await cognitoClient.send(command);

        if (response.AuthenticationResult) {
          return {
            success: true,
            accessToken: response.AuthenticationResult.AccessToken,
            idToken: response.AuthenticationResult.IdToken,
            refreshToken: response.AuthenticationResult.RefreshToken,
            expiresIn: response.AuthenticationResult.ExpiresIn,
          };
        } else {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Authentication failed',
          });
        }
      } catch (error: any) {
        console.error('Sign in error:', error);
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: error.message || 'Failed to sign in',
        });
      }
    }),

  // Forgot password
  forgotPassword: publicProcedure
    .input(ForgotPasswordSchema)
    .mutation(async ({ input }) => {
      try {
        const command = new ForgotPasswordCommand({
          ClientId: CLIENT_ID,
          Username: input.email,
        });

        const response = await cognitoClient.send(command);

        return {
          success: true,
          codeDeliveryDetails: response.CodeDeliveryDetails,
        };
      } catch (error: any) {
        console.error('Forgot password error:', error);
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error.message || 'Failed to initiate password reset',
        });
      }
    }),

  // Confirm forgot password
  confirmForgotPassword: publicProcedure
    .input(ConfirmForgotPasswordSchema)
    .mutation(async ({ input }) => {
      try {
        const command = new ConfirmForgotPasswordCommand({
          ClientId: CLIENT_ID,
          Username: input.email,
          ConfirmationCode: input.confirmationCode,
          Password: input.newPassword,
        });

        await cognitoClient.send(command);

        return { success: true };
      } catch (error: any) {
        console.error('Confirm forgot password error:', error);
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error.message || 'Failed to reset password',
        });
      }
    }),

  // Change password (requires authentication)
  changePassword: protectedProcedure
    .input(ChangePasswordSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const accessToken = ctx.user?.decode?.access_token;
        if (!accessToken || typeof accessToken !== 'string') {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Access token required',
          });
        }

        const command = new ChangePasswordCommand({
          AccessToken: accessToken,
          PreviousPassword: input.previousPassword,
          ProposedPassword: input.proposedPassword,
        });

        await cognitoClient.send(command);

        return { success: true };
      } catch (error: any) {
        console.error('Change password error:', error);
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error.message || 'Failed to change password',
        });
      }
    }),

  // Get current user profile
  getProfile: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const userId = ctx.user?.userId;
        if (!userId) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'User ID required',
          });
        }

        const result = await docClient.send(new GetCommand({
          TableName: TABLE_NAME,
          Key: {
            pk: `USER#${userId}`,
            sk: `PROFILE#${userId}`,
          },
        }));

        if (!result.Item) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User profile not found',
          });
        }

        return {
          userId: result.Item.userId,
          email: result.Item.email,
          givenName: result.Item.givenName,
          familyName: result.Item.familyName,
          planCount: result.Item.planCount || 0,
          subscriptionTier: result.Item.subscriptionTier || 'free',
          preferences: result.Item.preferences || {
            theme: 'dark',
            currency: 'USD',
            notifications: {
              email: true,
              milestones: true,
              reminders: true,
            },
          },
          stats: result.Item.stats || {
            totalPlans: 0,
            completedPlans: 0,
            totalSaved: 0,
            totalTarget: 0,
          },
          createdAt: result.Item.createdAt,
          updatedAt: result.Item.updatedAt,
        };
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        console.error('Get profile error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get user profile',
        });
      }
    }),

  // Update user profile
  updateProfile: protectedProcedure
    .input(UpdateProfileSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const userId = ctx.user?.userId;
        if (!userId) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'User ID required',
          });
        }

        // Update Cognito attributes if name changed
        if (input.givenName || input.familyName) {
          const accessToken = ctx.user?.decode?.access_token;
          if (accessToken && typeof accessToken === 'string') {
            const attributes = [];
            if (input.givenName) {
              attributes.push({ Name: 'given_name', Value: input.givenName });
            }
            if (input.familyName) {
              attributes.push({ Name: 'family_name', Value: input.familyName });
            }

            const command = new UpdateUserAttributesCommand({
              AccessToken: accessToken,
              UserAttributes: attributes,
            });

            await cognitoClient.send(command);
          }
        }

        // Update DynamoDB profile
        const updateExpression = [];
        const expressionAttributeNames: Record<string, string> = {};
        const expressionAttributeValues: Record<string, any> = {};

        if (input.givenName) {
          updateExpression.push('#givenName = :givenName');
          expressionAttributeNames['#givenName'] = 'givenName';
          expressionAttributeValues[':givenName'] = input.givenName;
        }

        if (input.familyName) {
          updateExpression.push('#familyName = :familyName');
          expressionAttributeNames['#familyName'] = 'familyName';
          expressionAttributeValues[':familyName'] = input.familyName;
        }

        if (input.preferences) {
          updateExpression.push('#preferences = :preferences');
          expressionAttributeNames['#preferences'] = 'preferences';
          expressionAttributeValues[':preferences'] = input.preferences;
        }

        updateExpression.push('#updatedAt = :updatedAt');
        expressionAttributeNames['#updatedAt'] = 'updatedAt';
        expressionAttributeValues[':updatedAt'] = new Date().toISOString();

        if (updateExpression.length > 1) { // More than just updatedAt
          await docClient.send(new UpdateCommand({
            TableName: TABLE_NAME,
            Key: {
              pk: `USER#${userId}`,
              sk: `PROFILE#${userId}`,
            },
            UpdateExpression: `SET ${updateExpression.join(', ')}`,
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues,
          }));
        }

        return { success: true };
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        console.error('Update profile error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update profile',
        });
      }
    }),

  // Sign out user
  signOut: protectedProcedure
    .mutation(async ({ ctx }) => {
      try {
        const accessToken = ctx.user?.decode?.access_token;
        if (accessToken && typeof accessToken === 'string') {
          const command = new GlobalSignOutCommand({
            AccessToken: accessToken,
          });

          await cognitoClient.send(command);
        }

        return { success: true };
      } catch (error: any) {
        console.error('Sign out error:', error);
        // Don't throw error for sign out - always return success
        return { success: true };
      }
    }),

  // Get current user info from Cognito
  getCurrentUser: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const accessToken = ctx.user?.decode?.access_token;
        if (!accessToken || typeof accessToken !== 'string') {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Access token required',
          });
        }

        const command = new GetUserCommand({
          AccessToken: accessToken,
        });

        const response = await cognitoClient.send(command);

        const attributes: Record<string, string> = {};
        response.UserAttributes?.forEach(attr => {
          if (attr.Name && attr.Value) {
            attributes[attr.Name] = attr.Value;
          }
        });

        return {
          username: response.Username,
          mfaOptions: response.MFAOptions,
          preferredMfaSetting: response.PreferredMfaSetting,
          userMFASettingList: response.UserMFASettingList,
          attributes,
        };
      } catch (error: any) {
        console.error('Get current user error:', error);
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: error.message || 'Failed to get current user',
        });
      }
    }),
});