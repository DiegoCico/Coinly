import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import type { Plan } from "../../services/api";

interface ProgressChartProps {
  plans: Plan[];
  darkMode: boolean;
  accentColor: string;
}

export default function ProgressChart({ plans, darkMode, accentColor }: ProgressChartProps) {
  // Generate mock progress data for the last 6 months
  const generateProgressData = () => {
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      
      // Calculate cumulative savings for active plans
      const totalMonthlySavings = plans
        .filter(plan => plan.isActive)
        .reduce((sum, plan) => sum + plan.monthlySavingsGoal + plan.partnerContribution, 0);
      
      months.push({
        month: monthName,
        saved: totalMonthlySavings * (6 - i), // Cumulative savings
        target: totalMonthlySavings * 6, // Target for 6 months
      });
    }
    
    return months;
  };

  // Generate plan type distribution data
  const generatePlanTypeData = () => {
    const typeColors = {
      trip: "#3B82F6",
      house: "#10B981", 
      car: "#F59E0B",
      education: "#8B5CF6",
      emergency: "#EF4444",
      other: "#6B7280"
    };

    const typeCounts = plans.reduce((acc, plan) => {
      acc[plan.planType] = (acc[plan.planType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(typeCounts).map(([type, count]) => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      value: count,
      color: typeColors[type as keyof typeof typeColors] || typeColors.other
    }));
  };

  const progressData = generateProgressData();
  const planTypeData = generatePlanTypeData();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-3 rounded-lg shadow-lg border ${
          darkMode ? "bg-[#232f3e] border-gray-600" : "bg-white border-gray-200"
        }`}>
          <p className={`font-medium ${darkMode ? "text-white" : "text-[#232f3e]"}`}>
            {label}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
              <span style={{ color: entry.color }}>●</span>
              {` ${entry.dataKey === 'saved' ? 'Saved' : 'Target'}: $${entry.value.toLocaleString()}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`p-6 rounded-lg shadow-lg border ${
      darkMode 
        ? "bg-gradient-to-br from-[#232f3e] to-[#1a2332] border-gray-700" 
        : "bg-gradient-to-br from-white to-gray-50 border-gray-200"
    }`}>
      <h3 className={`text-lg font-semibold mb-4 ${darkMode ? "text-white" : "text-[#232f3e]"}`}>
        Savings Progress
      </h3>

      {plans.length === 0 ? (
        <div className={`text-center py-8 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
          <p className="text-sm">No plans to display</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Progress Line Chart */}
          <div>
            <h4 className={`text-sm font-medium mb-3 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
              6-Month Trend
            </h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={progressData}>
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke={darkMode ? "#374151" : "#E5E7EB"} 
                  />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ 
                      fill: darkMode ? "#9CA3AF" : "#6B7280", 
                      fontSize: 12 
                    }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ 
                      fill: darkMode ? "#9CA3AF" : "#6B7280", 
                      fontSize: 12 
                    }}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="saved" 
                    stroke={accentColor}
                    strokeWidth={3}
                    dot={{ fill: accentColor, strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: accentColor, strokeWidth: 2 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="target" 
                    stroke={darkMode ? "#6B7280" : "#9CA3AF"}
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Plan Types Pie Chart */}
          {planTypeData.length > 0 && (
            <div>
              <h4 className={`text-sm font-medium mb-3 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                Plans by Type
              </h4>
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={planTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={25}
                      outerRadius={50}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {planTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any) => [`${value} plan${value !== 1 ? 's' : ''}`, 'Count']}
                      contentStyle={{
                        backgroundColor: darkMode ? "#232f3e" : "white",
                        border: `1px solid ${darkMode ? "#374151" : "#E5E7EB"}`,
                        borderRadius: "8px",
                        color: darkMode ? "white" : "#232f3e"
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              {/* Legend */}
              <div className="flex flex-wrap gap-2 mt-3">
                {planTypeData.map((entry, index) => (
                  <div key={index} className="flex items-center gap-1">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                      {entry.name} ({entry.value})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}