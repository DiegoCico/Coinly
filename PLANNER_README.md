# Financial Planner Feature

A comprehensive trip and savings planner that helps users plan and track their financial goals for trips, houses, cars, education, and other major purchases.

## Features

### 🎯 Goal Planning
- **Multiple Plan Types**: Trip/Vacation, House/Property, Vehicle, Education, Emergency Fund, and Custom Goals
- **Smart Calculations**: Automatic time-to-goal calculations based on income and savings rate
- **Partner Support**: Include partner contributions in your savings plan
- **Milestone Tracking**: Break down large goals into smaller, manageable milestones

### 📊 Visual Analytics
- **Progress Charts**: 6-month savings trend visualization with line charts
- **Plan Distribution**: Pie chart showing breakdown of plans by type
- **Real-time Progress**: Visual progress bars for each plan
- **Savings Insights**: AI-powered recommendations and insights

### 💡 Smart Insights
- **Savings Rate Analysis**: Automatic calculation and feedback on your savings rate
- **Timeline Warnings**: Alerts for overdue plans or unrealistic timelines
- **Completion Celebrations**: Recognition when you're close to achieving goals
- **Financial Health**: Overall portfolio analysis and recommendations

### 🎨 User Experience
- **Dark/Light Mode**: Full theme support with customizable accent colors
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Drag & Drop**: Reorder dashboard widgets (inherited from main dashboard)
- **Real-time Updates**: Live progress tracking and updates

## Technical Implementation

### Backend (API)
- **tRPC Router**: Type-safe API endpoints for all planner operations
- **DynamoDB Storage**: Scalable NoSQL database for plan data
- **Data Validation**: Zod schemas for input validation
- **Progress Tracking**: Historical progress logging with timestamps

### Frontend (React)
- **TypeScript**: Full type safety throughout the application
- **Recharts**: Beautiful, responsive charts and visualizations
- **Lucide Icons**: Consistent iconography throughout the interface
- **Tailwind CSS**: Utility-first styling with custom theming

### Key Components
1. **PlanCard**: Individual plan display with progress and status
2. **CreatePlanModal**: Comprehensive plan creation with validation
3. **PlanDetailsModal**: Detailed view with progress tracking and milestones
4. **ProgressChart**: Visual analytics with trend analysis
5. **SavingsInsights**: AI-powered recommendations and insights

## API Endpoints

### Plans Management
- `planner.getPlans` - Retrieve all user plans
- `planner.getPlan` - Get specific plan details
- `planner.createPlan` - Create new savings plan
- `planner.updatePlan` - Update existing plan
- `planner.deletePlan` - Remove plan

### Progress Tracking
- `planner.updateProgress` - Add progress to a plan
- `planner.getProgressHistory` - Retrieve progress history
- `planner.getAnalytics` - Get comprehensive analytics

### Demo Data
- `planner.seedDemoData` - Populate with sample plans for testing

## Data Structure

### Plan Schema
```typescript
interface Plan {
  id: string;
  userId: string;
  title: string;
  description?: string;
  planType: 'trip' | 'house' | 'car' | 'education' | 'emergency' | 'other';
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  monthlyIncome: number;
  monthlySavingsGoal: number;
  partnerContribution: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  milestones: Milestone[];
  expenses: Expense[];
}
```

### Milestone Schema
```typescript
interface Milestone {
  id: string;
  title: string;
  targetAmount: number;
  targetDate: string;
  completed: boolean;
  completedAt?: string;
}
```

## Usage

### Creating a Plan
1. Click "New Plan" in the Planner page
2. Select plan type (Trip, House, Car, etc.)
3. Enter plan details:
   - Title and description
   - Target amount and date
   - Monthly income and savings goal
   - Optional partner contribution
4. Review time-to-goal calculation
5. Submit to create the plan

### Tracking Progress
1. Click on any plan card to open details
2. Use "Add Progress" to log savings
3. View progress history and milestones
4. Monitor insights and recommendations

### Analytics & Insights
- View overall progress in the sidebar widgets
- Check savings rate recommendations
- Monitor plan distribution and trends
- Get personalized financial advice

## Demo Data

The system includes comprehensive demo data featuring:
- **Japan Trip 2025**: $8,000 goal with $2,400 saved (30% complete)
- **House Down Payment**: $50,000 goal with $18,500 saved (37% complete)
- **Emergency Fund**: $15,000 goal - fully completed

Use "Load Demo Data" button to populate the system with sample plans for testing.

## Future Enhancements

### Planned Features
- **Expense Tracking**: Detailed expense categorization and analysis
- **Investment Integration**: Connect with investment accounts
- **Goal Sharing**: Share plans with family members or partners
- **Automated Savings**: Integration with banking APIs for automatic transfers
- **Notifications**: Email/SMS reminders and milestone celebrations
- **Export/Import**: Data portability and backup features

### Advanced Analytics
- **Predictive Modeling**: AI-powered savings predictions
- **Market Integration**: Real-time cost updates for travel/housing
- **Comparative Analysis**: Benchmark against similar goals
- **Risk Assessment**: Financial health scoring

## Getting Started

1. **Start the servers**:
   ```bash
   npm run dev:api    # Backend on http://localhost:3001
   npm run dev:frontend # Frontend on http://localhost:5173
   ```

2. **Navigate to Planner**:
   - Open http://localhost:5173
   - Click "Planner" in the left sidebar

3. **Load Demo Data**:
   - Click "Load Demo Data" to see sample plans
   - Or create your own plan with "New Plan"

4. **Explore Features**:
   - Click on plan cards to view details
   - Add progress to see real-time updates
   - Check insights for personalized recommendations

The planner is fully integrated with the existing dashboard theme system and provides a comprehensive solution for financial goal planning and tracking.