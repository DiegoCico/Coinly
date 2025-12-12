# Demo Mode Authentication

The application includes a local demo mode that bypasses AWS Cognito for development and testing purposes.

## 🚀 **Quick Start**

### **Demo Credentials:**
- **Email**: `demo@example.com`
- **Password**: `DemoPassword123`

### **Authorized Real User:**
- **Email**: `cicotosted@gmail.com`
- **Password**: (Uses real Cognito authentication in production)

## 🔧 **How It Works**

### **Automatic Demo Mode:**
When running in development, the application automatically enables demo mode:
```bash
npm run dev          # Starts both frontend and API in demo mode
npm run dev:api      # API only with DEMO_MODE=true
npm run dev:frontend # Frontend only
```

### **Demo Features:**
- ✅ **No AWS Required**: Works completely offline without Cognito
- ✅ **Instant Login**: No email verification needed
- ✅ **Sample Data**: Pre-loaded with 3 demo financial plans
- ✅ **Full Functionality**: All features work including plan creation and progress tracking
- ✅ **Realistic Data**: Includes Japan trip, house down payment, and emergency fund plans

## 📊 **Demo Data Included**

### **Demo User Profile:**
- **Name**: Demo User
- **Email**: demo@example.com
- **Plan Count**: 3 plans
- **Total Saved**: $35,900
- **Total Target**: $73,000

### **Demo Sample Plans:**
1. **Japan Trip 2025** - $8,000 target, $2,400 saved (30% complete)
2. **House Down Payment** - $50,000 target, $18,500 saved (37% complete)  
3. **Emergency Fund** - $15,000 target, $15,000 saved (100% complete)

### **Real User Access:**
- **cicotosted@gmail.com** can authenticate with real Cognito credentials
- Uses production DynamoDB for data storage
- Full feature access with persistent data

## 🎯 **Using Demo Mode**

### **Sign In Process:**
1. Navigate to http://localhost:5174 (or whatever port Vite assigns)
2. Click "Fill demo credentials" button on sign-in page
3. Click "Sign In" - instant authentication!
4. Explore all features with realistic sample data

### **Features Available:**
- ✅ View dashboard with sample plans
- ✅ Create new plans (saved in memory)
- ✅ Update progress on existing plans
- ✅ View analytics and insights
- ✅ All charts and visualizations work
- ✅ User profile management

## 🔐 **Technical Details**

### **Demo Token System:**
- Uses Base64-encoded JSON tokens instead of JWT
- Tokens include user ID, email, and expiration
- Automatically handled by authentication middleware
- No external dependencies or network calls

### **Data Storage:**
- **Demo Mode**: All data stored in memory (resets on server restart)
- **Production Mode**: Uses DynamoDB for persistent storage
- **Seamless Switch**: Same API endpoints work for both modes

### **Environment Detection:**
```typescript
const IS_DEMO_MODE = process.env.NODE_ENV === 'development' || process.env.DEMO_MODE === 'true';
```

## 🚨 **Important Notes**

### **Demo Limitations:**
- ⚠️ **Data Not Persistent**: Demo user changes reset when server restarts
- ⚠️ **Memory Only**: No database writes for demo user
- ⚠️ **Development Only**: Demo mode automatically disabled in production
- ✅ **Real Users**: cicotosted@gmail.com uses persistent DynamoDB storage

### **User Types:**
| Feature | Demo User (demo@example.com) | Real User (cicotosted@gmail.com) |
|---------|------------------------------|-----------------------------------|
| Authentication | Local demo tokens | AWS Cognito |
| Data Storage | Memory (demo data) | DynamoDB |
| Persistence | No (resets on restart) | Yes |
| Email Verification | No | Yes |
| Password Reset | No | Yes |
| Registration | Not required | Required through Cognito |

## 🔄 **Switching Modes**

### **Force Production Mode:**
```bash
DEMO_MODE=false npm run dev:api
```

### **Force Demo Mode:**
```bash
DEMO_MODE=true npm run dev:api
```

### **Environment Variables:**
- `DEMO_MODE=true` - Forces demo mode
- `NODE_ENV=development` - Enables demo mode by default
- `COGNITO_CLIENT_ID` - If empty, falls back to demo mode

## 🧪 **Testing Scenarios**

### **Authentication Flow:**
1. **Valid Demo Login**: Use demo@example.com / DemoPassword123
2. **Invalid Credentials**: Try wrong password - gets proper error
3. **Token Expiry**: Tokens expire after 1 hour
4. **Sign Out**: Clears tokens and redirects to sign-in

### **Plan Management:**
1. **View Plans**: See 3 pre-loaded demo plans
2. **Create Plan**: Add new plan (stored in memory)
3. **Update Progress**: Add money to existing plans
4. **View Analytics**: See charts and insights with demo data

### **Error Handling:**
1. **Network Errors**: Graceful fallback to demo data
2. **Invalid Tokens**: Automatic redirect to sign-in
3. **Missing Data**: Sensible defaults and error messages

## 📱 **User Experience**

### **Demo Account Button:**
The sign-in page includes a "Fill demo credentials" button that:
- Automatically fills email and password fields
- Shows demo account information
- Explains that no registration is required
- Provides instant access to the application

### **Seamless Experience:**
- No difference in UI between demo and production modes
- All features work identically
- Realistic data makes testing meaningful
- Instant feedback for development

This demo mode enables rapid development and testing without requiring AWS infrastructure setup, while maintaining full feature parity with the production authentication system.