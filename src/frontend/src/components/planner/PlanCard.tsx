import React from "react";
import { Calendar, DollarSign, TrendingUp, CheckCircle, Clock } from "lucide-react";

import type { Plan } from "../../services/api";

interface PlanCardProps {
  plan: Plan;
  darkMode: boolean;
  accentColor: string;
  onClick: () => void;
  getPlanIcon: (type: string) => React.ComponentType<{ size?: number; className?: string }>;
}

export default function PlanCard({ plan, darkMode, accentColor, onClick, getPlanIcon }: PlanCardProps) {
  const progress = (plan.currentAmount / plan.targetAmount) * 100;
  const isCompleted = plan.currentAmount >= plan.targetAmount;
  const daysLeft = Math.ceil((new Date(plan.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const monthsLeft = Math.ceil(daysLeft / 30);
  
  const Icon = getPlanIcon(plan.planType);
  
  const getStatusColor = () => {
    if (isCompleted) return "#10B981";
    if (daysLeft < 0) return "#EF4444";
    if (daysLeft < 90) return "#F59E0B";
    return "#3B82F6";
  };

  const getStatusText = () => {
    if (isCompleted) return "Completed";
    if (daysLeft < 0) return "Overdue";
    if (daysLeft < 30) return `${daysLeft} days left`;
    return `${monthsLeft} months left`;
  };

  return (
    <div
      onClick={onClick}
      className={`p-6 rounded-lg shadow-lg border transition-all duration-200 cursor-pointer hover:shadow-xl hover:scale-[1.01] ${
        darkMode
          ? "bg-gradient-to-br from-[#232f3e] to-[#1a2332] border-gray-700 hover:border-gray-600"
          : "bg-gradient-to-br from-white to-gray-50 border-gray-200 hover:border-gray-300"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="p-2 rounded-lg"
            style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
          >
            <Icon size={20} />
          </div>
          <div>
            <h3 className={`font-semibold text-lg ${darkMode ? "text-white" : "text-[#232f3e]"}`}>
              {plan.title}
            </h3>
            {plan.description && (
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                {plan.description}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isCompleted ? (
            <CheckCircle size={20} className="text-green-500" />
          ) : (
            <Clock size={20} style={{ color: getStatusColor() }} />
          )}
          <span
            className="text-xs font-medium px-2 py-1 rounded-full"
            style={{ 
              backgroundColor: `${getStatusColor()}20`, 
              color: getStatusColor() 
            }}
          >
            {getStatusText()}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
            Progress
          </span>
          <span className={`text-sm font-bold ${darkMode ? "text-white" : "text-[#232f3e]"}`}>
            {progress.toFixed(1)}%
          </span>
        </div>
        <div className={`w-full h-2 rounded-full ${darkMode ? "bg-gray-700" : "bg-gray-200"}`}>
          <div
            className="h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${Math.min(progress, 100)}%`,
              backgroundColor: isCompleted ? "#10B981" : accentColor
            }}
          />
        </div>
      </div>

      {/* Amount Info */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className={`text-xs font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            Current Amount
          </p>
          <p className={`text-lg font-bold ${darkMode ? "text-white" : "text-[#232f3e]"}`}>
            ${plan.currentAmount.toLocaleString()}
          </p>
        </div>
        <div>
          <p className={`text-xs font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            Target Amount
          </p>
          <p className={`text-lg font-bold ${darkMode ? "text-white" : "text-[#232f3e]"}`}>
            ${plan.targetAmount.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Bottom Stats */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-600/20">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <TrendingUp size={14} className={darkMode ? "text-gray-400" : "text-gray-500"} />
            <span className={darkMode ? "text-gray-400" : "text-gray-500"}>
              ${plan.monthlySavingsGoal}/month
            </span>
          </div>
          {plan.partnerContribution > 0 && (
            <div className="flex items-center gap-1">
              <DollarSign size={14} className={darkMode ? "text-gray-400" : "text-gray-500"} />
              <span className={darkMode ? "text-gray-400" : "text-gray-500"}>
                +${plan.partnerContribution} partner
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-1 text-xs">
          <Calendar size={14} className={darkMode ? "text-gray-400" : "text-gray-500"} />
          <span className={darkMode ? "text-gray-400" : "text-gray-500"}>
            {new Date(plan.targetDate).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
}