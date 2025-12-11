import { useState, useEffect } from "react";
import { 
  Plus, 
  Target, 
  TrendingUp, 
  Calendar, 
  PiggyBank,
  MapPin,
  Home,
  Car,
  GraduationCap,
  Shield,
  CheckCircle
} from "lucide-react";

import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";
import PlanCard from "../components/planner/PlanCard";
import CreatePlanModal from "../components/planner/CreatePlanModal";
import PlanDetailsModal from "../components/planner/PlanDetailsModal";
import ProgressChart from "../components/planner/ProgressChart";
import SavingsInsights from "../components/planner/SavingsInsights";
import { apiService, type Plan } from "../services/api";

// Mock data for development
const mockPlans: Plan[] = [
  {
    id: "1",
    userId: "demo_user",
    title: "Japan Trip 2025",
    description: "Two-week vacation to Tokyo and Kyoto",
    planType: "trip" as const,
    targetAmount: 8000,
    currentAmount: 2400,
    targetDate: "2025-06-15",
    monthlyIncome: 5000,
    monthlySavingsGoal: 800,
    partnerContribution: 200,
    isActive: true,
    createdAt: "2024-01-15T00:00:00Z",
    updatedAt: "2024-12-10T00:00:00Z",
    milestones: [
      { id: "m1", title: "Flight Booking", targetAmount: 2000, targetDate: "2025-03-01", completed: true, completedAt: "2024-11-15T00:00:00Z" },
      { id: "m2", title: "Accommodation", targetAmount: 4000, targetDate: "2025-04-01", completed: false },
      { id: "m3", title: "Activities & Food", targetAmount: 8000, targetDate: "2025-06-01", completed: false },
    ],
    expenses: []
  },
  {
    id: "2",
    userId: "demo_user",
    title: "House Down Payment",
    description: "Saving for our first home",
    planType: "house" as const,
    targetAmount: 50000,
    currentAmount: 18500,
    targetDate: "2026-12-31",
    monthlyIncome: 5000,
    monthlySavingsGoal: 1500,
    partnerContribution: 1000,
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-12-10T00:00:00Z",
    milestones: [
      { id: "m4", title: "Emergency Fund", targetAmount: 10000, targetDate: "2025-06-01", completed: true, completedAt: "2024-10-01T00:00:00Z" },
      { id: "m5", title: "Half Way Point", targetAmount: 25000, targetDate: "2025-12-01", completed: false },
      { id: "m6", title: "Full Down Payment", targetAmount: 50000, targetDate: "2026-12-31", completed: false },
    ],
    expenses: []
  },
  {
    id: "3",
    userId: "demo_user",
    title: "Emergency Fund",
    description: "6 months of expenses",
    planType: "emergency" as const,
    targetAmount: 15000,
    currentAmount: 15000,
    targetDate: "2024-12-31",
    monthlyIncome: 5000,
    monthlySavingsGoal: 500,
    partnerContribution: 0,
    isActive: false,
    createdAt: "2023-06-01T00:00:00Z",
    updatedAt: "2024-11-01T00:00:00Z",
    milestones: [],
    expenses: []
  }
];

export default function Planner() {
  // Theme and UI state
  const [darkMode, setDarkMode] = useState(true);
  const [accentColor, setAccentColor] = useState("#FF9900");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Planner state
  const [plans, setPlans] = useState<Plan[]>(mockPlans);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleTheme = () => setDarkMode((prev) => !prev);

  // Load plans on component mount
  useEffect(() => {
    loadPlans();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedPlans = await apiService.getPlans();
      setPlans(fetchedPlans);
    } catch (err) {
      console.error('Failed to load plans:', err);
      setError('Failed to load plans. Using demo data.');
      // Keep using mock data on error
    } finally {
      setLoading(false);
    }
  };

  const getPlanIcon = (type: string) => {
    switch (type) {
      case 'trip': return MapPin;
      case 'house': return Home;
      case 'car': return Car;
      case 'education': return GraduationCap;
      case 'emergency': return Shield;
      default: return Target;
    }
  };

  const filteredPlans = plans.filter(plan => {
    if (filter === 'active') return plan.isActive;
    if (filter === 'completed') return plan.currentAmount >= plan.targetAmount;
    return true;
  });

  const totalTargetAmount = plans.reduce((sum, plan) => sum + plan.targetAmount, 0);
  const totalCurrentAmount = plans.reduce((sum, plan) => sum + plan.currentAmount, 0);
  const totalMonthlySavings = plans.reduce((sum, plan) => sum + plan.monthlySavingsGoal, 0);
  const activePlans = plans.filter(plan => plan.isActive).length;
  const completedPlans = plans.filter(plan => plan.currentAmount >= plan.targetAmount).length;

  const handleCreatePlan = async (newPlan: any) => {
    try {
      setLoading(true);
      const createdPlan = await apiService.createPlan(newPlan);
      setPlans(prev => [...prev, createdPlan]);
      setShowCreateModal(false);
    } catch (err) {
      console.error('Failed to create plan:', err);
      setError('Failed to create plan. Please try again.');
      // Fallback to local creation for demo
      const plan = {
        ...newPlan,
        id: `plan_${Date.now()}`,
        userId: 'demo_user',
        currentAmount: 0,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        milestones: [],
        expenses: []
      };
      setPlans(prev => [...prev, plan]);
      setShowCreateModal(false);
    } finally {
      setLoading(false);
    }
  };

  const handlePlanClick = (plan: Plan) => {
    setSelectedPlan(plan);
    setShowDetailsModal(true);
  };

  const handleSeedDemoData = async () => {
    try {
      setLoading(true);
      setError(null);
      await apiService.seedDemoData();
      await loadPlans(); // Reload plans after seeding
    } catch (err) {
      console.error('Failed to seed demo data:', err);
      setError('Failed to load demo data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen font-sans transition-colors duration-300 ${
        darkMode ? "bg-[#0f1b2a] text-gray-100" : "bg-[#f8f9fa] text-slate-800"
      }`}
    >
      <Header
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        darkMode={darkMode}
        toggleTheme={toggleTheme}
        accentColor={accentColor}
        setAccentColor={setAccentColor}
      />

      <Sidebar isOpen={sidebarOpen} darkMode={darkMode} accentColor={accentColor} />

      <main className="lg:ml-64 pt-14 min-h-screen transition-all duration-300">
        <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
            <div>
              <h1
                className={`text-3xl font-bold tracking-tight ${
                  darkMode ? "text-white" : "text-[#232f3e]"
                }`}
              >
                Financial Planner
              </h1>
              <p className={`text-sm mt-1.5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                Plan and track your savings goals for trips, houses, and major purchases
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    filter === 'all'
                      ? darkMode ? 'bg-[#232f3e] text-white' : 'bg-gray-200 text-gray-800'
                      : darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('active')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    filter === 'active'
                      ? darkMode ? 'bg-[#232f3e] text-white' : 'bg-gray-200 text-gray-800'
                      : darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => setFilter('completed')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    filter === 'completed'
                      ? darkMode ? 'bg-[#232f3e] text-white' : 'bg-gray-200 text-gray-800'
                      : darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Completed
                </button>
              </div>

              <button
                onClick={() => setShowCreateModal(true)}
                disabled={loading}
                className="text-[#232f3e] px-5 py-2.5 rounded-md text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: accentColor }}
              >
                <Plus size={16} />
                {loading ? 'Loading...' : 'New Plan'}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className={`p-4 rounded-lg border-l-4 border-red-500 ${
              darkMode ? "bg-red-900/20 border-r border-t border-b border-red-700" : "bg-red-50 border-r border-t border-b border-red-200"
            }`}>
              <p className={`text-sm ${darkMode ? "text-red-300" : "text-red-700"}`}>
                {error}
              </p>
            </div>
          )}

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {[
              { 
                label: "Total Target", 
                val: `$${totalTargetAmount.toLocaleString()}`, 
                icon: Target,
                color: "#3B82F6"
              },
              { 
                label: "Total Saved", 
                val: `$${totalCurrentAmount.toLocaleString()}`, 
                icon: PiggyBank,
                color: "#10B981"
              },
              { 
                label: "Monthly Savings", 
                val: `$${totalMonthlySavings.toLocaleString()}`, 
                icon: TrendingUp,
                color: "#8B5CF6"
              },
              { 
                label: "Active Plans", 
                val: activePlans.toString(), 
                icon: Calendar,
                color: "#F59E0B"
              },
              { 
                label: "Completed", 
                val: completedPlans.toString(), 
                icon: CheckCircle,
                color: "#059669"
              }
            ].map((metric, i) => (
              <div
                key={i}
                className={`p-5 rounded-lg shadow-lg border-l-4 transition-all duration-200 cursor-pointer ${
                  darkMode
                    ? "bg-gradient-to-br from-[#232f3e] to-[#1a2332] border-r border-t border-b border-gray-700 hover:shadow-xl hover:scale-[1.02]"
                    : "bg-gradient-to-br from-white to-gray-50 border-r border-t border-b border-gray-200 hover:shadow-xl hover:scale-[1.02]"
                }`}
                style={{ borderLeftColor: metric.color }}
              >
                <div className="flex items-center justify-between mb-3">
                  <p
                    className={`text-xs font-bold uppercase tracking-wider ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {metric.label}
                  </p>
                  <metric.icon size={18} style={{ color: metric.color }} />
                </div>

                <span className={`text-2xl font-bold ${darkMode ? "text-white" : "text-[#232f3e]"}`}>
                  {metric.val}
                </span>
              </div>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Plans List */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className={`text-xl font-semibold ${darkMode ? "text-white" : "text-[#232f3e]"}`}>
                Your Plans ({filteredPlans.length})
              </h2>
              
              {filteredPlans.length === 0 ? (
                <div
                  className={`p-8 rounded-lg border-2 border-dashed text-center ${
                    darkMode 
                      ? "border-gray-600 bg-[#1a2332]" 
                      : "border-gray-300 bg-gray-50"
                  }`}
                >
                  <Target size={48} className={`mx-auto mb-4 ${darkMode ? "text-gray-500" : "text-gray-400"}`} />
                  <h3 className={`text-lg font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                    No plans found
                  </h3>
                  <p className={`text-sm mb-4 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                    {filter === 'all' 
                      ? "Create your first savings plan to get started"
                      : `No ${filter} plans found. Try a different filter.`
                    }
                  </p>
                  {filter === 'all' && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowCreateModal(true)}
                        className="text-[#232f3e] px-4 py-2 rounded-md text-sm font-medium shadow-md hover:shadow-lg transition-all"
                        style={{ backgroundColor: accentColor }}
                      >
                        Create Your First Plan
                      </button>
                      <button
                        onClick={handleSeedDemoData}
                        disabled={loading}
                        className={`px-4 py-2 rounded-md text-sm font-medium shadow-md hover:shadow-lg transition-all ${
                          darkMode 
                            ? "bg-gray-700 text-gray-300 hover:bg-gray-600" 
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        } disabled:opacity-50`}
                      >
                        {loading ? 'Loading...' : 'Load Demo Data'}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredPlans.map((plan) => (
                    <PlanCard
                      key={plan.id}
                      plan={plan}
                      darkMode={darkMode}
                      accentColor={accentColor}
                      onClick={() => handlePlanClick(plan)}
                      getPlanIcon={getPlanIcon}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar Widgets */}
            <div className="space-y-6">
              <ProgressChart 
                plans={plans}
                darkMode={darkMode}
                accentColor={accentColor}
              />
              
              <SavingsInsights 
                plans={plans}
                darkMode={darkMode}
                accentColor={accentColor}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      {showCreateModal && (
        <CreatePlanModal
          darkMode={darkMode}
          accentColor={accentColor}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreatePlan}
        />
      )}

      {showDetailsModal && selectedPlan && (
        <PlanDetailsModal
          plan={selectedPlan}
          darkMode={darkMode}
          accentColor={accentColor}
          onClose={() => setShowDetailsModal(false)}
          onUpdate={(updatedPlan) => {
            setPlans(prev => prev.map(p => p.id === updatedPlan.id ? updatedPlan : p));
            setSelectedPlan(updatedPlan);
          }}
        />
      )}

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}