import React, { useState } from "react";
import { X, MapPin, Home, Car, GraduationCap, Shield, Target } from "lucide-react";

interface CreatePlanModalProps {
  darkMode: boolean;
  accentColor: string;
  onClose: () => void;
  onSubmit: (plan: any) => void;
}

const planTypes = [
  { value: 'trip', label: 'Trip/Vacation', icon: MapPin, description: 'Plan your dream vacation' },
  { value: 'house', label: 'House/Property', icon: Home, description: 'Save for a down payment' },
  { value: 'car', label: 'Vehicle', icon: Car, description: 'Buy your next car' },
  { value: 'education', label: 'Education', icon: GraduationCap, description: 'Invest in learning' },
  { value: 'emergency', label: 'Emergency Fund', icon: Shield, description: 'Build financial security' },
  { value: 'other', label: 'Other Goal', icon: Target, description: 'Custom savings goal' },
];

export default function CreatePlanModal({ darkMode, accentColor, onClose, onSubmit }: CreatePlanModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    planType: 'trip',
    targetAmount: '',
    targetDate: '',
    monthlyIncome: '',
    monthlySavingsGoal: '',
    partnerContribution: '0',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.targetAmount || parseFloat(formData.targetAmount) <= 0) {
      newErrors.targetAmount = 'Target amount must be greater than 0';
    }
    if (!formData.targetDate) newErrors.targetDate = 'Target date is required';
    if (!formData.monthlyIncome || parseFloat(formData.monthlyIncome) <= 0) {
      newErrors.monthlyIncome = 'Monthly income must be greater than 0';
    }
    if (!formData.monthlySavingsGoal || parseFloat(formData.monthlySavingsGoal) <= 0) {
      newErrors.monthlySavingsGoal = 'Monthly savings goal must be greater than 0';
    }

    // Check if target date is in the future
    if (formData.targetDate && new Date(formData.targetDate) <= new Date()) {
      newErrors.targetDate = 'Target date must be in the future';
    }

    // Check if monthly savings goal is reasonable compared to income
    const income = parseFloat(formData.monthlyIncome) || 0;
    const savings = parseFloat(formData.monthlySavingsGoal) || 0;
    const partner = parseFloat(formData.partnerContribution) || 0;
    
    if (savings + partner > income * 0.8) {
      newErrors.monthlySavingsGoal = 'Savings goal seems too high compared to income';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const plan = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      planType: formData.planType,
      targetAmount: parseFloat(formData.targetAmount),
      targetDate: formData.targetDate,
      monthlyIncome: parseFloat(formData.monthlyIncome),
      monthlySavingsGoal: parseFloat(formData.monthlySavingsGoal),
      partnerContribution: parseFloat(formData.partnerContribution) || 0,
    };

    onSubmit(plan);
  };

  const calculateTimeToGoal = () => {
    const target = parseFloat(formData.targetAmount) || 0;
    const monthly = parseFloat(formData.monthlySavingsGoal) || 0;
    const partner = parseFloat(formData.partnerContribution) || 0;
    const totalMonthly = monthly + partner;
    
    if (target > 0 && totalMonthly > 0) {
      const months = Math.ceil(target / totalMonthly);
      const years = Math.floor(months / 12);
      const remainingMonths = months % 12;
      
      if (years > 0) {
        return `${years} year${years > 1 ? 's' : ''} ${remainingMonths > 0 ? `${remainingMonths} month${remainingMonths > 1 ? 's' : ''}` : ''}`;
      }
      return `${months} month${months > 1 ? 's' : ''}`;
    }
    return null;
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div
        className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg shadow-2xl ${
          darkMode ? "bg-[#1a2332] border border-gray-700" : "bg-white border border-gray-200"
        }`}
      >
        {/* Header */}
        <div className={`p-6 border-b ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
          <div className="flex items-center justify-between">
            <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-[#232f3e]"}`}>
              Create New Plan
            </h2>
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

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Plan Type Selection */}
          <div>
            <label className={`block text-sm font-medium mb-3 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
              Plan Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              {planTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => handleInputChange('planType', type.value)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    formData.planType === type.value
                      ? darkMode
                        ? "border-gray-500 bg-[#232f3e]"
                        : "border-gray-400 bg-gray-50"
                      : darkMode
                        ? "border-gray-700 hover:border-gray-600 bg-[#232f3e]/50"
                        : "border-gray-200 hover:border-gray-300 bg-gray-50/50"
                  }`}
                  style={formData.planType === type.value ? { borderColor: accentColor } : {}}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <type.icon size={20} style={{ color: formData.planType === type.value ? accentColor : undefined }} />
                    <span className={`font-medium ${darkMode ? "text-white" : "text-[#232f3e]"}`}>
                      {type.label}
                    </span>
                  </div>
                  <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                    {type.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                Plan Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., Japan Trip 2025"
                className={`w-full p-3 rounded-lg border transition-colors ${
                  darkMode
                    ? "bg-[#232f3e] border-gray-600 text-white placeholder-gray-400 focus:border-gray-500"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-gray-400"
                } ${errors.title ? 'border-red-500' : ''}`}
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                Target Date *
              </label>
              <input
                type="date"
                value={formData.targetDate}
                onChange={(e) => handleInputChange('targetDate', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full p-3 rounded-lg border transition-colors ${
                  darkMode
                    ? "bg-[#232f3e] border-gray-600 text-white focus:border-gray-500"
                    : "bg-white border-gray-300 text-gray-900 focus:border-gray-400"
                } ${errors.targetDate ? 'border-red-500' : ''}`}
              />
              {errors.targetDate && <p className="text-red-500 text-xs mt-1">{errors.targetDate}</p>}
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Add details about your plan..."
              rows={3}
              className={`w-full p-3 rounded-lg border transition-colors resize-none ${
                darkMode
                  ? "bg-[#232f3e] border-gray-600 text-white placeholder-gray-400 focus:border-gray-500"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-gray-400"
              }`}
            />
          </div>

          {/* Financial Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                Target Amount *
              </label>
              <div className="relative">
                <span className={`absolute left-3 top-3 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>$</span>
                <input
                  type="number"
                  value={formData.targetAmount}
                  onChange={(e) => handleInputChange('targetAmount', e.target.value)}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  className={`w-full p-3 pl-8 rounded-lg border transition-colors ${
                    darkMode
                      ? "bg-[#232f3e] border-gray-600 text-white placeholder-gray-400 focus:border-gray-500"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-gray-400"
                  } ${errors.targetAmount ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.targetAmount && <p className="text-red-500 text-xs mt-1">{errors.targetAmount}</p>}
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                Monthly Income *
              </label>
              <div className="relative">
                <span className={`absolute left-3 top-3 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>$</span>
                <input
                  type="number"
                  value={formData.monthlyIncome}
                  onChange={(e) => handleInputChange('monthlyIncome', e.target.value)}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  className={`w-full p-3 pl-8 rounded-lg border transition-colors ${
                    darkMode
                      ? "bg-[#232f3e] border-gray-600 text-white placeholder-gray-400 focus:border-gray-500"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-gray-400"
                  } ${errors.monthlyIncome ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.monthlyIncome && <p className="text-red-500 text-xs mt-1">{errors.monthlyIncome}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                Monthly Savings Goal *
              </label>
              <div className="relative">
                <span className={`absolute left-3 top-3 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>$</span>
                <input
                  type="number"
                  value={formData.monthlySavingsGoal}
                  onChange={(e) => handleInputChange('monthlySavingsGoal', e.target.value)}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  className={`w-full p-3 pl-8 rounded-lg border transition-colors ${
                    darkMode
                      ? "bg-[#232f3e] border-gray-600 text-white placeholder-gray-400 focus:border-gray-500"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-gray-400"
                  } ${errors.monthlySavingsGoal ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.monthlySavingsGoal && <p className="text-red-500 text-xs mt-1">{errors.monthlySavingsGoal}</p>}
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                Partner Contribution (Optional)
              </label>
              <div className="relative">
                <span className={`absolute left-3 top-3 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>$</span>
                <input
                  type="number"
                  value={formData.partnerContribution}
                  onChange={(e) => handleInputChange('partnerContribution', e.target.value)}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  className={`w-full p-3 pl-8 rounded-lg border transition-colors ${
                    darkMode
                      ? "bg-[#232f3e] border-gray-600 text-white placeholder-gray-400 focus:border-gray-500"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-gray-400"
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Time Calculation */}
          {calculateTimeToGoal() && (
            <div
              className={`p-4 rounded-lg border ${
                darkMode ? "bg-[#232f3e]/50 border-gray-600" : "bg-blue-50 border-blue-200"
              }`}
            >
              <p className={`text-sm ${darkMode ? "text-gray-300" : "text-blue-800"}`}>
                <strong>Estimated time to reach goal:</strong> {calculateTimeToGoal()}
              </p>
              <p className={`text-xs mt-1 ${darkMode ? "text-gray-400" : "text-blue-600"}`}>
                Based on your monthly savings goal and partner contribution
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                darkMode
                  ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 rounded-lg font-medium text-[#232f3e] transition-all hover:opacity-90"
              style={{ backgroundColor: accentColor }}
            >
              Create Plan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}