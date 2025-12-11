import { useState } from "react";
import { 
  X, 
  Plus, 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  Target,
  CheckCircle,
  Clock,
  Edit,
  Trash2
} from "lucide-react";
import type { Plan } from "../../services/api";

interface PlanDetailsModalProps {
  plan: Plan;
  darkMode: boolean;
  accentColor: string;
  onClose: () => void;
  onUpdate: (plan: Plan) => void;
}

export default function PlanDetailsModal({ plan, darkMode, accentColor, onClose, onUpdate }: PlanDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'milestones' | 'progress'>('overview');
  const [showAddProgress, setShowAddProgress] = useState(false);
  const [progressAmount, setProgressAmount] = useState('');
  const [progressNote, setProgressNote] = useState('');

  const progress = (plan.currentAmount / plan.targetAmount) * 100;
  const isCompleted = plan.currentAmount >= plan.targetAmount;
  const daysLeft = Math.ceil((new Date(plan.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const monthsLeft = Math.ceil(daysLeft / 30);

  const totalMonthlyContribution = plan.monthlySavingsGoal + plan.partnerContribution;
  const remainingAmount = plan.targetAmount - plan.currentAmount;
  const monthsToComplete = remainingAmount > 0 ? Math.ceil(remainingAmount / totalMonthlyContribution) : 0;

  const handleAddProgress = () => {
    const amount = parseFloat(progressAmount);
    if (amount > 0) {
      const updatedPlan = {
        ...plan,
        currentAmount: plan.currentAmount + amount,
        updatedAt: new Date().toISOString(),
      };
      onUpdate(updatedPlan);
      setProgressAmount('');
      setProgressNote('');
      setShowAddProgress(false);
    }
  };

  const getStatusColor = () => {
    if (isCompleted) return "#10B981";
    if (daysLeft < 0) return "#EF4444";
    if (daysLeft < 90) return "#F59E0B";
    return "#3B82F6";
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Target },
    { id: 'milestones', label: 'Milestones', icon: CheckCircle },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div
        className={`w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-lg shadow-2xl ${
          darkMode ? "bg-[#1a2332] border border-gray-700" : "bg-white border border-gray-200"
        }`}
      >
        {/* Header */}
        <div className={`p-6 border-b ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
          <div className="flex items-start justify-between">
            <div>
              <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-[#232f3e]"}`}>
                {plan.title}
              </h2>
              {plan.description && (
                <p className={`text-sm mt-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                  {plan.description}
                </p>
              )}
              <div className="flex items-center gap-4 mt-3">
                <span
                  className="text-xs font-medium px-3 py-1 rounded-full"
                  style={{ 
                    backgroundColor: `${getStatusColor()}20`, 
                    color: getStatusColor() 
                  }}
                >
                  {isCompleted ? 'Completed' : daysLeft < 0 ? 'Overdue' : `${monthsLeft} months left`}
                </span>
                <span className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  Created {new Date(plan.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                darkMode ? "hover:bg-gray-700 text-gray-400" : "hover:bg-gray-100 text-gray-600"
              }`}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="p-6 border-b border-gray-700/20">
          <div className="flex justify-between items-center mb-3">
            <span className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
              Overall Progress
            </span>
            <span className={`text-lg font-bold ${darkMode ? "text-white" : "text-[#232f3e]"}`}>
              {progress.toFixed(1)}%
            </span>
          </div>
          <div className={`w-full h-3 rounded-full ${darkMode ? "bg-gray-700" : "bg-gray-200"}`}>
            <div
              className="h-3 rounded-full transition-all duration-300"
              style={{ 
                width: `${Math.min(progress, 100)}%`,
                backgroundColor: isCompleted ? "#10B981" : accentColor
              }}
            />
          </div>
          <div className="flex justify-between items-center mt-3 text-sm">
            <span className={darkMode ? "text-gray-400" : "text-gray-600"}>
              ${plan.currentAmount.toLocaleString()} saved
            </span>
            <span className={darkMode ? "text-gray-400" : "text-gray-600"}>
              ${plan.targetAmount.toLocaleString()} goal
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className={`border-b ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? darkMode
                      ? "text-white border-b-2"
                      : "text-[#232f3e] border-b-2"
                    : darkMode
                      ? "text-gray-400 hover:text-white"
                      : "text-gray-600 hover:text-[#232f3e]"
                }`}
                style={activeTab === tab.id ? { borderBottomColor: accentColor } : {}}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className={`p-4 rounded-lg ${darkMode ? "bg-[#232f3e]" : "bg-gray-50"}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign size={16} style={{ color: accentColor }} />
                    <span className={`text-xs font-medium ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                      Remaining
                    </span>
                  </div>
                  <p className={`text-lg font-bold ${darkMode ? "text-white" : "text-[#232f3e]"}`}>
                    ${remainingAmount.toLocaleString()}
                  </p>
                </div>

                <div className={`p-4 rounded-lg ${darkMode ? "bg-[#232f3e]" : "bg-gray-50"}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar size={16} style={{ color: accentColor }} />
                    <span className={`text-xs font-medium ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                      Months Left
                    </span>
                  </div>
                  <p className={`text-lg font-bold ${darkMode ? "text-white" : "text-[#232f3e]"}`}>
                    {monthsToComplete}
                  </p>
                </div>

                <div className={`p-4 rounded-lg ${darkMode ? "bg-[#232f3e]" : "bg-gray-50"}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp size={16} style={{ color: accentColor }} />
                    <span className={`text-xs font-medium ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                      Monthly Goal
                    </span>
                  </div>
                  <p className={`text-lg font-bold ${darkMode ? "text-white" : "text-[#232f3e]"}`}>
                    ${plan.monthlySavingsGoal.toLocaleString()}
                  </p>
                </div>

                <div className={`p-4 rounded-lg ${darkMode ? "bg-[#232f3e]" : "bg-gray-50"}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Plus size={16} style={{ color: accentColor }} />
                    <span className={`text-xs font-medium ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                      Partner Help
                    </span>
                  </div>
                  <p className={`text-lg font-bold ${darkMode ? "text-white" : "text-[#232f3e]"}`}>
                    ${plan.partnerContribution.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Financial Breakdown */}
              <div className={`p-4 rounded-lg border ${darkMode ? "bg-[#232f3e]/50 border-gray-600" : "bg-blue-50 border-blue-200"}`}>
                <h3 className={`font-semibold mb-3 ${darkMode ? "text-white" : "text-[#232f3e]"}`}>
                  Financial Breakdown
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className={darkMode ? "text-gray-300" : "text-gray-700"}>Monthly Income:</span>
                    <span className={`font-medium ${darkMode ? "text-white" : "text-[#232f3e]"}`}>
                      ${plan.monthlyIncome.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={darkMode ? "text-gray-300" : "text-gray-700"}>Your Savings:</span>
                    <span className={`font-medium ${darkMode ? "text-white" : "text-[#232f3e]"}`}>
                      ${plan.monthlySavingsGoal.toLocaleString()} ({((plan.monthlySavingsGoal / plan.monthlyIncome) * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={darkMode ? "text-gray-300" : "text-gray-700"}>Partner Contribution:</span>
                    <span className={`font-medium ${darkMode ? "text-white" : "text-[#232f3e]"}`}>
                      ${plan.partnerContribution.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2 border-gray-600/20">
                    <span className={`font-medium ${darkMode ? "text-gray-200" : "text-gray-800"}`}>Total Monthly:</span>
                    <span className={`font-bold ${darkMode ? "text-white" : "text-[#232f3e]"}`}>
                      ${totalMonthlyContribution.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Add Progress Button */}
              {!showAddProgress ? (
                <button
                  onClick={() => setShowAddProgress(true)}
                  className="w-full py-3 px-4 rounded-lg font-medium text-[#232f3e] transition-all hover:opacity-90 flex items-center justify-center gap-2"
                  style={{ backgroundColor: accentColor }}
                >
                  <Plus size={16} />
                  Add Progress
                </button>
              ) : (
                <div className={`p-4 rounded-lg border ${darkMode ? "bg-[#232f3e] border-gray-600" : "bg-gray-50 border-gray-200"}`}>
                  <h4 className={`font-medium mb-3 ${darkMode ? "text-white" : "text-[#232f3e]"}`}>
                    Add Progress
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                        Amount
                      </label>
                      <div className="relative">
                        <span className={`absolute left-3 top-3 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>$</span>
                        <input
                          type="number"
                          value={progressAmount}
                          onChange={(e) => setProgressAmount(e.target.value)}
                          placeholder="0"
                          min="0"
                          step="0.01"
                          className={`w-full p-3 pl-8 rounded-lg border transition-colors ${
                            darkMode
                              ? "bg-[#1a2332] border-gray-600 text-white placeholder-gray-400 focus:border-gray-500"
                              : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-gray-400"
                          }`}
                        />
                      </div>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                        Note (Optional)
                      </label>
                      <input
                        type="text"
                        value={progressNote}
                        onChange={(e) => setProgressNote(e.target.value)}
                        placeholder="e.g., Monthly savings deposit"
                        className={`w-full p-3 rounded-lg border transition-colors ${
                          darkMode
                            ? "bg-[#1a2332] border-gray-600 text-white placeholder-gray-400 focus:border-gray-500"
                            : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-gray-400"
                        }`}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowAddProgress(false)}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                          darkMode
                            ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddProgress}
                        disabled={!progressAmount || parseFloat(progressAmount) <= 0}
                        className="flex-1 py-2 px-3 rounded-lg text-sm font-medium text-[#232f3e] transition-all hover:opacity-90 disabled:opacity-50"
                        style={{ backgroundColor: accentColor }}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'milestones' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className={`font-semibold ${darkMode ? "text-white" : "text-[#232f3e]"}`}>
                  Milestones ({plan.milestones.length})
                </h3>
                <button
                  className="text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
                  style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
                >
                  Add Milestone
                </button>
              </div>

              {plan.milestones.length === 0 ? (
                <div className={`text-center py-8 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  <Target size={48} className="mx-auto mb-3 opacity-50" />
                  <p>No milestones set yet</p>
                  <p className="text-sm">Break down your goal into smaller targets</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {plan.milestones.map((milestone) => (
                    <div
                      key={milestone.id}
                      className={`p-4 rounded-lg border transition-colors ${
                        milestone.completed
                          ? darkMode
                            ? "bg-green-900/20 border-green-700"
                            : "bg-green-50 border-green-200"
                          : darkMode
                            ? "bg-[#232f3e] border-gray-600"
                            : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          {milestone.completed ? (
                            <CheckCircle size={20} className="text-green-500 mt-0.5" />
                          ) : (
                            <Clock size={20} className={`${darkMode ? "text-gray-400" : "text-gray-500"} mt-0.5`} />
                          )}
                          <div>
                            <h4 className={`font-medium ${darkMode ? "text-white" : "text-[#232f3e]"}`}>
                              {milestone.title}
                            </h4>
                            <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                              Target: ${milestone.targetAmount.toLocaleString()} by {new Date(milestone.targetDate).toLocaleDateString()}
                            </p>
                            {milestone.completed && milestone.completedAt && (
                              <p className="text-sm text-green-600">
                                Completed on {new Date(milestone.completedAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className={`p-1.5 rounded transition-colors ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-200"}`}>
                            <Edit size={14} />
                          </button>
                          <button className={`p-1.5 rounded transition-colors ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-200"}`}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'progress' && (
            <div className="space-y-4">
              <h3 className={`font-semibold ${darkMode ? "text-white" : "text-[#232f3e]"}`}>
                Progress History
              </h3>
              
              <div className={`text-center py-8 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                <TrendingUp size={48} className="mx-auto mb-3 opacity-50" />
                <p>Progress tracking coming soon</p>
                <p className="text-sm">View your savings history and trends</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}