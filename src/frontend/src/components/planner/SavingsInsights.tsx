import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  DollarSign,
  Target,
  Calendar
} from "lucide-react";
import type { Plan } from "../../services/api";

interface SavingsInsightsProps {
  plans: Plan[];
  darkMode: boolean;
  accentColor: string;
}

export default function SavingsInsights({ plans, darkMode, accentColor }: SavingsInsightsProps) {
  const generateInsights = () => {
    const insights = [];
    const activePlans = plans.filter(plan => plan.isActive);
    
    if (activePlans.length === 0) {
      return [{
        type: 'info',
        icon: Target,
        title: 'Get Started',
        message: 'Create your first savings plan to see personalized insights.',
        color: '#3B82F6'
      }];
    }

    // Calculate total monthly commitment
    const totalMonthlySavings = activePlans.reduce((sum, plan) => 
      sum + plan.monthlySavingsGoal + plan.partnerContribution, 0
    );
    
    const averageIncome = activePlans.reduce((sum, plan) => sum + plan.monthlyIncome, 0) / activePlans.length;
    const savingsRate = (totalMonthlySavings / averageIncome) * 100;

    // Savings rate insight
    if (savingsRate > 50) {
      insights.push({
        type: 'warning',
        icon: AlertTriangle,
        title: 'High Savings Rate',
        message: `You're saving ${savingsRate.toFixed(1)}% of your income. Consider if this is sustainable.`,
        color: '#F59E0B'
      });
    } else if (savingsRate > 20) {
      insights.push({
        type: 'success',
        icon: TrendingUp,
        title: 'Great Savings Rate',
        message: `You're saving ${savingsRate.toFixed(1)}% of your income. You're on track!`,
        color: '#10B981'
      });
    } else if (savingsRate > 10) {
      insights.push({
        type: 'info',
        icon: TrendingUp,
        title: 'Good Progress',
        message: `You're saving ${savingsRate.toFixed(1)}% of your income. Consider increasing if possible.`,
        color: '#3B82F6'
      });
    } else {
      insights.push({
        type: 'warning',
        icon: TrendingDown,
        title: 'Low Savings Rate',
        message: `You're saving ${savingsRate.toFixed(1)}% of your income. Try to increase your savings rate.`,
        color: '#EF4444'
      });
    }

    // Check for overdue plans
    const overduePlans = activePlans.filter(plan => 
      new Date(plan.targetDate) < new Date() && plan.currentAmount < plan.targetAmount
    );
    
    if (overduePlans.length > 0) {
      insights.push({
        type: 'warning',
        icon: Clock,
        title: 'Overdue Plans',
        message: `${overduePlans.length} plan${overduePlans.length > 1 ? 's are' : ' is'} past the target date. Consider adjusting your timeline.`,
        color: '#EF4444'
      });
    }

    // Check for plans close to completion
    const nearCompletionPlans = activePlans.filter(plan => {
      const progress = (plan.currentAmount / plan.targetAmount) * 100;
      return progress >= 80 && progress < 100;
    });

    if (nearCompletionPlans.length > 0) {
      insights.push({
        type: 'success',
        icon: CheckCircle,
        title: 'Almost There!',
        message: `${nearCompletionPlans.length} plan${nearCompletionPlans.length > 1 ? 's are' : ' is'} over 80% complete. Keep it up!`,
        color: '#10B981'
      });
    }

    // Partner contribution insight
    const totalPartnerContribution = activePlans.reduce((sum, plan) => sum + plan.partnerContribution, 0);
    if (totalPartnerContribution > 0) {
      const partnerPercentage = (totalPartnerContribution / totalMonthlySavings) * 100;
      insights.push({
        type: 'info',
        icon: DollarSign,
        title: 'Partner Support',
        message: `Partner contributions make up ${partnerPercentage.toFixed(1)}% of your monthly savings.`,
        color: '#8B5CF6'
      });
    }

    // Efficiency insight
    const mostEfficientPlan = activePlans.reduce((best, plan) => {
      const monthlyTotal = plan.monthlySavingsGoal + plan.partnerContribution;
      const monthsToComplete = (plan.targetAmount - plan.currentAmount) / monthlyTotal;
      const bestMonthsToComplete = (best.targetAmount - best.currentAmount) / (best.monthlySavingsGoal + best.partnerContribution);
      
      return monthsToComplete < bestMonthsToComplete ? plan : best;
    }, activePlans[0]);

    if (mostEfficientPlan) {
      const monthsToComplete = Math.ceil((mostEfficientPlan.targetAmount - mostEfficientPlan.currentAmount) / 
        (mostEfficientPlan.monthlySavingsGoal + mostEfficientPlan.partnerContribution));
      
      insights.push({
        type: 'info',
        icon: Target,
        title: 'Fastest Goal',
        message: `"${mostEfficientPlan.title}" will be completed in ${monthsToComplete} month${monthsToComplete > 1 ? 's' : ''}.`,
        color: '#3B82F6'
      });
    }

    return insights.slice(0, 4); // Limit to 4 insights
  };

  const insights = generateInsights();

  const getRecommendations = () => {
    const recommendations = [];
    const activePlans = plans.filter(plan => plan.isActive);
    
    if (activePlans.length === 0) return [];

    // Emergency fund recommendation
    const hasEmergencyFund = plans.some(plan => 
      plan.planType === 'emergency' && plan.currentAmount >= plan.targetAmount
    );
    
    if (!hasEmergencyFund) {
      recommendations.push({
        title: 'Build Emergency Fund',
        description: 'Consider creating an emergency fund covering 3-6 months of expenses before other goals.',
        priority: 'high'
      });
    }

    // Diversification recommendation
    const planTypes = new Set(activePlans.map(plan => plan.planType));
    if (planTypes.size === 1 && activePlans.length > 1) {
      recommendations.push({
        title: 'Diversify Your Goals',
        description: 'Consider balancing short-term and long-term financial goals.',
        priority: 'medium'
      });
    }

    // Automation recommendation
    recommendations.push({
      title: 'Automate Savings',
      description: 'Set up automatic transfers to make saving effortless and consistent.',
      priority: 'medium'
    });

    return recommendations.slice(0, 3);
  };

  const recommendations = getRecommendations();

  return (
    <div className="space-y-6">
      {/* Insights */}
      <div className={`p-6 rounded-lg shadow-lg border ${
        darkMode 
          ? "bg-gradient-to-br from-[#232f3e] to-[#1a2332] border-gray-700" 
          : "bg-gradient-to-br from-white to-gray-50 border-gray-200"
      }`}>
        <h3 className={`text-lg font-semibold mb-4 ${darkMode ? "text-white" : "text-[#232f3e]"}`}>
          Insights
        </h3>

        <div className="space-y-3">
          {insights.map((insight, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-l-4 ${
                darkMode ? "bg-[#1a2332] border-r border-t border-b border-gray-700" : "bg-gray-50 border-r border-t border-b border-gray-200"
              }`}
              style={{ borderLeftColor: insight.color }}
            >
              <div className="flex items-start gap-3">
                <insight.icon size={18} style={{ color: insight.color }} className="mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className={`font-medium text-sm ${darkMode ? "text-white" : "text-[#232f3e]"}`}>
                    {insight.title}
                  </h4>
                  <p className={`text-xs mt-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                    {insight.message}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className={`p-6 rounded-lg shadow-lg border ${
          darkMode 
            ? "bg-gradient-to-br from-[#232f3e] to-[#1a2332] border-gray-700" 
            : "bg-gradient-to-br from-white to-gray-50 border-gray-200"
        }`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? "text-white" : "text-[#232f3e]"}`}>
            Recommendations
          </h3>

          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  darkMode ? "bg-[#1a2332] border-gray-600" : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={`font-medium text-sm ${darkMode ? "text-white" : "text-[#232f3e]"}`}>
                        {rec.title}
                      </h4>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          rec.priority === 'high'
                            ? 'bg-red-100 text-red-700'
                            : rec.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {rec.priority}
                      </span>
                    </div>
                    <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                      {rec.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className={`p-6 rounded-lg shadow-lg border ${
        darkMode 
          ? "bg-gradient-to-br from-[#232f3e] to-[#1a2332] border-gray-700" 
          : "bg-gradient-to-br from-white to-gray-50 border-gray-200"
      }`}>
        <h3 className={`text-lg font-semibold mb-4 ${darkMode ? "text-white" : "text-[#232f3e]"}`}>
          Quick Stats
        </h3>

        <div className="space-y-3">
          {[
            {
              label: 'Average Progress',
              value: plans.length > 0 
                ? `${(plans.reduce((sum, plan) => sum + (plan.currentAmount / plan.targetAmount * 100), 0) / plans.length).toFixed(1)}%`
                : '0%',
              icon: TrendingUp,
              color: accentColor
            },
            {
              label: 'Total Target',
              value: `$${plans.reduce((sum, plan) => sum + plan.targetAmount, 0).toLocaleString()}`,
              icon: Target,
              color: '#3B82F6'
            },
            {
              label: 'Monthly Commitment',
              value: `$${plans.filter(p => p.isActive).reduce((sum, plan) => sum + plan.monthlySavingsGoal + plan.partnerContribution, 0).toLocaleString()}`,
              icon: Calendar,
              color: '#10B981'
            }
          ].map((stat, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <stat.icon size={16} style={{ color: stat.color }} />
                <span className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                  {stat.label}
                </span>
              </div>
              <span className={`text-sm font-semibold ${darkMode ? "text-white" : "text-[#232f3e]"}`}>
                {stat.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}