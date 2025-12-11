# Cognito Authentication System

A complete authentication system using AWS Cognito with CDK infrastructure, backend API, and React frontend components.

## 🏗️ **Infrastructure (CDK)**

### **Cognito Stack Features:**
- **User Pool** with email-based authentication
- **Advanced Security** with risk-based authentication
- **MFA Support** (SMS and TOTP)
- **Custom Attributes** for plan tracking
- **Lambda Triggers** for user lifecycle management
- **Identity Pool** for AWS resource access
- **Hosted UI Domain** for OAuth flows

### **Lambda Triggers:**
1. **Pre-signup Trigger**: Validates user data and email domains
2. **Post-confirmation Trigger**: Creates user profile and welcome plan in DynamoDB

### **Security Features:**
- Password policy enforcement (8+ chars, mixed case, numbers)
- Account lockout protection
- Device tracking and remembering
- Email verification required
- Advanced security monitoring

## 🔧 **Backend API (tRPC)**

### **Authentication Endpoints:**
- `auth.signUp` - Register new user
- `auth.confirmSignUp` - Verify email with code
- `auth.signIn` - Authenticate user
- `auth.signOut` - Sign out user globally
- `auth.forgotPassword` - Initiate password reset
- `auth.confirmForgotPassword` - Complete password reset
- `auth.changePassword` - Change password (authenticated)
- `auth.resendConfirmationCode` - Resend verification code

### **Profile Management:**
- `auth.getProfile` - Get user profile from DynamoDB
- `auth.updateProfile` - Update user profile and Cognito attributes
- `auth.getCurrentUser` - Get current Cognito user info

### **Protected Routes:**
All planner endpoints now require authentication:
- `planner.createPlan` - Create new savings plan
- `planner.getPlans` - Get user's plans
- `planner.updatePlan` - Update existing plan
- `planner.deletePlan` - Delete plan
- `planner.updateProgress` - Add progress to plan
- `planner.getAnalytics` - Get user analytics

## 🎨 **Frontend (React)**

### **Authentication Context:**
- **AuthProvider**: Manages authentication state globally
- **useAuth Hook**: Access authentication functions and user data
- **Token Management**: Automatic token storage and refresh
- **Route Protection**: Redirect unauthenticated users

### **Authentication Pages:**
1. **Sign In** (`/signin`):
   - Email/password authentication
   - Password visibility toggle
   - Forgot password link
   - Demo account helper

2. **Sign Up** (`/signup`):
   - User registration form
   - Password strength validation
   - Real-time form validation
   - Terms and privacy links

3. **Email Confirmation** (`/confirm-signup`):
   - 6-digit code verification
   - Resend code functionality
   - Auto-redirect after confirmation
   - Help and troubleshooting

### **Protected Components:**
- **ProtectedRoute**: Wraps protected pages
- **Loading States**: Shows loading spinner during auth checks
- **Auto-redirect**: Sends users to sign-in when unauthenticated

### **User Interface:**
- **Sidebar User Info**: Shows authenticated user details
- **Sign Out Button**: Global sign out functionality
- **Theme Integration**: Matches existing dark/light theme system

## 📊 **User Profile System**

### **DynamoDB Schema:**
```typescript
UserProfile {
  pk: "USER#{userId}"
  sk: "PROFILE#{userId}"
  userId: string
  email: string
  givenName: string
  familyName: string
  planCount: number
  subscriptionTier: "free" | "premium"
  preferences: {
    theme: "light" | "dark"
    currency: string
    notifications: {
      email: boolean
      milestones: boolean
      reminders: boolean
    }
  }
  stats: {
    totalPlans: number
    completedPlans: number
    totalSaved: number
    totalTarget: number
  }
  createdAt: string
  updatedAt: string
}
```

### **Welcome Plan:**
New users automatically get a sample plan:
- **Title**: "Welcome to Financial Planner!"
- **Type**: Other
- **Target**: $1,000
- **Timeline**: 90 days
- **Milestones**: Two sample milestones

## 🚀 **Deployment**

### **CDK Deployment:**
```bash
# Deploy all stacks
npm run deploy:dev

# Deploy specific stack
npx cdk deploy CoinlyCognito-dev
```

### **Environment Variables:**
The system automatically configures:
- `COGNITO_USER_POOL_ID`
- `COGNITO_CLIENT_ID`
- `DYNAMODB_TABLE_NAME`
- `AWS_REGION`

### **CORS Configuration:**
Updated to include authentication headers:
- `authorization`
- `x-requested-with`
- `content-type`

## 🔐 **Security Best Practices**

### **Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- Symbols optional but recommended

### **Token Management:**
- **Access Token**: 1 hour expiry
- **ID Token**: 1 hour expiry
- **Refresh Token**: 30 days expiry
- **Automatic Refresh**: Handled by frontend
- **Secure Storage**: localStorage with expiry checks

### **API Security:**
- **JWT Verification**: All protected endpoints verify tokens
- **User Context**: Automatic user ID extraction from tokens
- **Error Handling**: Secure error messages without sensitive data
- **CORS Protection**: Restricted origins and headers

## 🧪 **Testing & Development**

### **Demo Account:**
For development and testing:
- **Email**: demo@example.com
- **Password**: DemoPassword123
- **Auto-fill**: Available on sign-in page

### **Local Development:**
```bash
# Start API server
npm run dev:api

# Start frontend
npm run dev:frontend

# Both servers
npm run dev
```

### **Environment Setup:**
1. Deploy CDK stacks to get Cognito resources
2. Update environment variables in Lambda
3. Configure CORS origins for local development
4. Test authentication flow end-to-end

## 📱 **User Experience Flow**

### **New User Journey:**
1. **Sign Up** → Enter details and create account
2. **Email Verification** → Check email and enter code
3. **Welcome** → Automatic profile creation and sample plan
4. **Dashboard** → Access to full application features

### **Returning User:**
1. **Sign In** → Email and password authentication
2. **Auto-redirect** → Return to intended page
3. **Session Management** → Automatic token refresh
4. **Sign Out** → Clean session termination

### **Password Recovery:**
1. **Forgot Password** → Enter email address
2. **Check Email** → Receive reset code
3. **Reset Password** → Enter code and new password
4. **Sign In** → Use new password to access account

## 🔄 **Integration Points**

### **Planner Integration:**
- **User-specific Data**: All plans tied to authenticated user
- **Profile Stats**: Plan counts and totals tracked in user profile
- **Welcome Plan**: Automatic sample plan for new users
- **Progress Tracking**: User-specific progress history

### **Theme Integration:**
- **User Preferences**: Theme choice stored in user profile
- **Consistent Styling**: Authentication pages match app theme
- **Accent Colors**: Customizable accent colors preserved

### **API Integration:**
- **Automatic Headers**: Authentication tokens added to all requests
- **Error Handling**: 401 errors trigger automatic sign-out
- **Loading States**: Consistent loading indicators across app

## 🚨 **Error Handling**

### **Common Scenarios:**
- **Invalid Credentials**: Clear error messages
- **Expired Tokens**: Automatic redirect to sign-in
- **Network Errors**: Retry mechanisms and fallbacks
- **Validation Errors**: Real-time form validation

### **User-Friendly Messages:**
- **Sign Up Errors**: "Email already exists", "Password too weak"
- **Sign In Errors**: "Invalid email or password"
- **Verification Errors**: "Invalid code", "Code expired"
- **Network Errors**: "Connection failed, please try again"

## 🔮 **Future Enhancements**

### **Planned Features:**
- **Social Login**: Google, Facebook, Apple sign-in
- **Biometric Auth**: Fingerprint and Face ID support
- **Advanced MFA**: Hardware keys and authenticator apps
- **Session Management**: Multiple device tracking
- **Admin Panel**: User management and analytics

### **Security Improvements:**
- **Rate Limiting**: Prevent brute force attacks
- **Audit Logging**: Track authentication events
- **Suspicious Activity**: Automated threat detection
- **Compliance**: GDPR and SOC2 compliance features

The authentication system provides enterprise-grade security with a seamless user experience, fully integrated with the existing Financial Planner application.