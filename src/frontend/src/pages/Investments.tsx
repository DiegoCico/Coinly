import React, { useState, useEffect } from "react";
import { BarChart3, Activity, ChevronDown, Eye, EyeOff } from "lucide-react";

import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";
import Widget from "../components/widgets/Widget";
import SettingsModal from "../components/modals/SettingsModal";

import PortfolioAllocationChart from "../components/charts/PortfolioAllocationChart";
import PerformanceChart from "../components/charts/PerformanceChart";
import AssetClassChart from "../components/charts/AssetClassChart";
import HoldingsTable from "../components/tables/HoldingsTable";
import DiversificationChart from "../components/charts/DiversificationChart";

export default function Investments() {
  // theme
  const [darkMode, setDarkMode] = useState(true);
  const toggleTheme = () => setDarkMode((prev) => !prev);

  // accent color
  const [accentColor, setAccentColor] = useState("#FF9900");

  // sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // settings modal
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // privacy mode
  const [privacyMode, setPrivacyMode] = useState(false);

  // time range
  const [selectedTimeRange, setSelectedTimeRange] = useState("1y");
  const [showTimeRangePicker, setShowTimeRangePicker] = useState(false);
  const [isLoadingTimeRange, setIsLoadingTimeRange] = useState(false);
  
  const timeRanges = [
    { value: "1d", label: "1 Day", description: "Today" },
    { value: "1w", label: "1 Week", description: "7 Days" },
    { value: "1m", label: "1 Month", description: "30 Days" },
    { value: "3m", label: "3 Months", description: "Quarter" },
    { value: "6m", label: "6 Months", description: "Half Year" },
    { value: "1y", label: "1 Year", description: "12 Months" },
    { value: "5y", label: "5 Years", description: "Long Term" },
    { value: "all", label: "All Time", description: "Since Start" }
  ];

  const getTimeRangeLabel = (value: string) => {
    const range = timeRanges.find(r => r.value === value);
    return range ? range.label : "1 Year";
  };



  // Generate dynamic metrics based on time range
  const getMetricsForTimeRange = (timeRange: string) => {
    const baseMetrics = {
      "1d": [
        { label: "Portfolio Value", val: privacyMode ? "••••••" : "$125,847", trend: "+1.0%", pos: true },
        { label: "Day's Gain/Loss", val: privacyMode ? "••••••" : "+$1,248", trend: "+1.0%", pos: true },
        { label: "Active Positions", val: "24", trend: "Stable", neutral: true },
        { label: "Cash Available", val: privacyMode ? "••••••" : "$8,450", trend: "Ready", neutral: true }
      ],
      "1w": [
        { label: "Portfolio Value", val: privacyMode ? "••••••" : "$125,847", trend: "+2.3%", pos: true },
        { label: "Week's Gain/Loss", val: privacyMode ? "••••••" : "+$2,847", trend: "+2.3%", pos: true },
        { label: "Best Performer", val: "NVDA", trend: "+8.2%", pos: true },
        { label: "Worst Performer", val: "META", trend: "-1.4%", pos: false }
      ],
      "1m": [
        { label: "Portfolio Value", val: privacyMode ? "••••••" : "$125,847", trend: "+4.7%", pos: true },
        { label: "Month's Gain/Loss", val: privacyMode ? "••••••" : "+$5,647", trend: "+4.7%", pos: true },
        { label: "Dividend Income", val: privacyMode ? "••••••" : "$342", trend: "Received", pos: true },
        { label: "Rebalanced", val: "2 times", trend: "Optimized", neutral: true }
      ],
      "3m": [
        { label: "Portfolio Value", val: privacyMode ? "••••••" : "$125,847", trend: "+8.9%", pos: true },
        { label: "Quarter Gain/Loss", val: privacyMode ? "••••••" : "+$10,234", trend: "+8.9%", pos: true },
        { label: "Sharpe Ratio", val: "1.34", trend: "Excellent", pos: true },
        { label: "Volatility", val: "12.4%", trend: "Moderate", neutral: true }
      ],
      "6m": [
        { label: "Portfolio Value", val: privacyMode ? "••••••" : "$125,847", trend: "+12.1%", pos: true },
        { label: "6M Gain/Loss", val: privacyMode ? "••••••" : "+$13,567", trend: "+12.1%", pos: true },
        { label: "Alpha", val: "+2.8%", trend: "Outperform", pos: true },
        { label: "Beta", val: "0.92", trend: "Defensive", neutral: true }
      ],
      "1y": [
        { label: "Portfolio Value", val: privacyMode ? "••••••" : "$125,847", trend: "+16.9%", pos: true },
        { label: "Annual Gain/Loss", val: privacyMode ? "••••••" : "+$18,235", trend: "+16.9%", pos: true },
        { label: "Dividend Yield", val: "2.4%", trend: "Growing", pos: true },
        { label: "Max Drawdown", val: "-8.2%", trend: "Recovered", neutral: true }
      ],
      "5y": [
        { label: "Portfolio Value", val: privacyMode ? "••••••" : "$125,847", trend: "+89.3%", pos: true },
        { label: "5Y Total Return", val: privacyMode ? "••••••" : "+$59,234", trend: "+89.3%", pos: true },
        { label: "CAGR", val: "13.7%", trend: "Strong", pos: true },
        { label: "Total Dividends", val: privacyMode ? "••••••" : "$4,567", trend: "Compounding", pos: true }
      ],
      "all": [
        { label: "Portfolio Value", val: privacyMode ? "••••••" : "$125,847", trend: "+147.2%", pos: true },
        { label: "Total Gain/Loss", val: privacyMode ? "••••••" : "+$74,847", trend: "+147.2%", pos: true },
        { label: "Best Year", val: "2023", trend: "+28.4%", pos: true },
        { label: "Years Invested", val: "7.2", trend: "Experience", neutral: true }
      ]
    };

    return baseMetrics[timeRange as keyof typeof baseMetrics] || baseMetrics["1y"];
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // dragging
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  // dashboard widgets
  const [widgets, setWidgets] = useState([
    { id: "allocation", type: "allocation", title: "Portfolio Allocation", colSpan: 2 },
    { id: "performance", type: "performance", title: "Performance Chart", colSpan: 1 },
    { id: "assetclass", type: "assetclass", title: "Asset Class Breakdown", colSpan: 2 },
    { id: "diversification", type: "diversification", title: "Diversification Analysis", colSpan: 1 },
    { id: "holdings", type: "holdings", title: "Top Holdings", colSpan: 3 }
  ]);

  // resize widget
  const handleResizeWidget = (id: string) => {
    setWidgets((prev) =>
      prev.map((w) =>
        w.id === id ? { ...w, colSpan: w.colSpan >= 3 ? 1 : w.colSpan + 1 } : w
      )
    );
  };

  // drag logic
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
    setDraggedItem(id);
  };

  const handleDragEnter = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedItem || draggedItem === targetId) return;

    const sourceIndex = widgets.findIndex((w) => w.id === draggedItem);
    const targetIndex = widgets.findIndex((w) => w.id === targetId);
    if (sourceIndex === targetIndex) return;

    const newWidgets = [...widgets];
    const [removed] = newWidgets.splice(sourceIndex, 1);
    newWidgets.splice(targetIndex, 0, removed);
    setWidgets(newWidgets);

    setDraggedItem(removed.id);
  };

  const handleDrop = () => setDraggedItem(null);

  // render widget body
  const renderWidgetContent = (type: string) => {
    switch (type) {
      case "allocation":
        return <PortfolioAllocationChart darkMode={darkMode} timeRange={selectedTimeRange} privacyMode={privacyMode} />;
      case "performance":
        return <PerformanceChart darkMode={darkMode} timeRange={selectedTimeRange} privacyMode={privacyMode} />;
      case "assetclass":
        return <AssetClassChart darkMode={darkMode} timeRange={selectedTimeRange} privacyMode={privacyMode} />;
      case "diversification":
        return <DiversificationChart darkMode={darkMode} timeRange={selectedTimeRange} privacyMode={privacyMode} />;
      case "holdings":
        return <HoldingsTable darkMode={darkMode} timeRange={selectedTimeRange} privacyMode={privacyMode} />;
      default:
        return null;
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

      <Sidebar 
        isOpen={sidebarOpen} 
        darkMode={darkMode} 
        accentColor={accentColor}
        onOpenSettings={() => setShowSettingsModal(true)}
      />

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
                Investment Portfolio
              </h1>
              <p className={`text-sm mt-1.5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                Track your investments, analyze performance, and optimize your portfolio allocation
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setPrivacyMode(!privacyMode)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all hover:shadow-md ${
                  darkMode 
                    ? 'bg-[#232f3e] border-gray-600 text-white hover:bg-[#364150]' 
                    : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
                }`}
              >
                {privacyMode ? <EyeOff size={16} /> : <Eye size={16} />}
                <span className="text-sm font-medium">
                  {privacyMode ? "Show Values" : "Hide Values"}
                </span>
              </button>

              <span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                Last updated:{" "}
                <span className={`font-semibold ${darkMode ? "text-gray-200" : "text-gray-700"}`}>
                  2 min ago
                </span>
              </span>

              <button
                className="text-[#232f3e] px-5 py-2.5 rounded-md text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 hover:opacity-90"
                style={{ backgroundColor: accentColor }}
              >
                <Activity size={16} />
                Refresh
              </button>
            </div>
          </div>

          {/* Time Range Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-b border-opacity-20" style={{ borderColor: darkMode ? '#4b5563' : '#d1d5db' }}>
            <div className="flex items-center gap-4">
              <div className="relative">
                <button
                  onClick={() => setShowTimeRangePicker(!showTimeRangePicker)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all hover:shadow-md ${
                    darkMode 
                      ? 'bg-[#232f3e] border-gray-600 text-white hover:bg-[#364150]' 
                      : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <BarChart3 size={16} />
                  <span className="font-medium">{getTimeRangeLabel(selectedTimeRange)}</span>
                  <ChevronDown size={16} className={`transition-transform ${showTimeRangePicker ? 'rotate-180' : ''}`} />
                </button>

                {showTimeRangePicker && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowTimeRangePicker(false)}
                    />
                    <div className={`absolute top-12 left-0 z-50 min-w-[280px] rounded-lg shadow-2xl border ${
                      darkMode ? 'bg-[#1b2635] border-gray-700' : 'bg-white border-gray-200'
                    }`}>
                      <div className="p-2">
                        {timeRanges.map((range) => (
                          <button
                            key={range.value}
                            onClick={() => {
                              setIsLoadingTimeRange(true);
                              setSelectedTimeRange(range.value);
                              setShowTimeRangePicker(false);
                              setTimeout(() => setIsLoadingTimeRange(false), 500);
                            }}
                            className={`w-full text-left px-3 py-2.5 rounded-md transition-colors hover:opacity-80 ${
                              selectedTimeRange === range.value
                                ? `text-white`
                                : darkMode 
                                ? 'text-gray-300 hover:bg-[#232f3e]' 
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                            style={selectedTimeRange === range.value ? { backgroundColor: accentColor } : {}}
                          >
                            <div className="font-medium">{range.label}</div>
                            <div className={`text-xs ${
                              selectedTimeRange === range.value 
                                ? 'text-white/80' 
                                : darkMode ? 'text-gray-500' : 'text-gray-500'
                            }`}>
                              {range.description}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Showing performance for <span className="font-medium" style={{ color: accentColor }}>
                  {getTimeRangeLabel(selectedTimeRange).toLowerCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-5 relative">
            {isLoadingTimeRange && (
              <div className="absolute inset-0 bg-black/20 backdrop-blur-sm rounded-lg z-10 flex items-center justify-center">
                <div className="flex items-center gap-2 text-white bg-black/50 px-4 py-2 rounded-lg">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span className="text-sm font-medium">Updating data...</span>
                </div>
              </div>
            )}
            {getMetricsForTimeRange(selectedTimeRange).map((metric, i) => (
              <div
                key={`${selectedTimeRange}-${i}`}
                className={`p-4 lg:p-5 rounded-lg shadow-lg border-l-4 transition-all duration-300 cursor-pointer min-w-0 animate-fadeIn ${
                  darkMode
                    ? "bg-gradient-to-br from-[#232f3e] to-[#1a2332] border-r border-t border-b border-gray-700 hover:shadow-xl hover:scale-[1.02]"
                    : "bg-gradient-to-br from-white to-gray-50 border-r border-t border-b border-gray-200 hover:shadow-xl hover:scale-[1.02]"
                }`}
                style={{ borderLeftColor: accentColor }}
              >
                <p
                  className={`text-xs font-bold uppercase tracking-wider truncate ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                  title={metric.label}
                >
                  {metric.label}
                </p>

                <div className="flex items-end justify-between mt-3 gap-2">
                  <span className={`text-2xl lg:text-3xl font-bold truncate ${darkMode ? "text-white" : "text-[#232f3e]"}`}>
                    {metric.val}
                  </span>

                  <span
                    className={`text-xs font-bold px-2 lg:px-2.5 py-1 rounded-full whitespace-nowrap flex-shrink-0 ${
                      (metric as any).neutral
                        ? "bg-blue-900/40 text-blue-400 border border-blue-700/50"
                        : (metric as any).pos
                        ? "bg-green-900/40 text-green-400 border border-green-700/50"
                        : "bg-red-900/40 text-red-400 border border-red-700/50"
                    }`}
                  >
                    {metric.trend}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Widget Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 auto-rows-min">
            {widgets.map((w) => (
              <Widget
                key={w.id}
                id={w.id}
                title={w.title}
                colSpan={w.colSpan}
                darkMode={darkMode}
                accentColor={accentColor}
                onResize={handleResizeWidget}
                onDragStart={handleDragStart}
                onDragEnter={handleDragEnter}
                onDrop={handleDrop}
                isDragging={draggedItem}
              >
                {renderWidgetContent(w.type)}
              </Widget>
            ))}
          </div>
        </div>
      </main>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        darkMode={darkMode}
        toggleTheme={toggleTheme}
        accentColor={accentColor}
        setAccentColor={setAccentColor}
      />
    </div>
  );
}