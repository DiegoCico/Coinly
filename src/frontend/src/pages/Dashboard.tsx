import React, { useState, useEffect } from "react";
import { Activity, Calendar, ChevronDown } from "lucide-react";

import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";
import Widget from "../components/widgets/Widget";

import MonthlyBarChart from "../components/charts/MonthlyBarChart";
import ServicePieChart from "../components/charts/ServicePieChart";
import DrilldownBarChart from "../components/charts/DrilldownBarChart";
import SavingsPotentialCard from "../components/cards/SavingsPotentialCard";
import TransactionsTable from "../components/tables/TransactionsTable";

export default function Dashboard() {
  // theme
  const [darkMode, setDarkMode] = useState(true);
  const toggleTheme = () => setDarkMode((prev) => !prev);

  // accent color
  const [accentColor, setAccentColor] = useState("#FF9900");

  // sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // time range
  const [selectedTimeRange, setSelectedTimeRange] = useState("30d");
  const [showTimeRangePicker, setShowTimeRangePicker] = useState(false);
  const [isLoadingTimeRange, setIsLoadingTimeRange] = useState(false);
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  
  const timeRanges = [
    { value: "1d", label: "Last 24 Hours", description: "Today" },
    { value: "7d", label: "Last 7 Days", description: "This Week" },
    { value: "30d", label: "Last 30 Days", description: "This Month" },
    { value: "90d", label: "Last 90 Days", description: "Last 3 Months" },
    { value: "1y", label: "Last Year", description: "12 Months" },
    { value: "custom", label: "Custom Range", description: "Pick dates" }
  ];

  const getTimeRangeLabel = (value: string) => {
    if (value === "custom" && customStartDate && customEndDate) {
      const start = new Date(customStartDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const end = new Date(customEndDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return `${start} - ${end}`;
    }
    const range = timeRanges.find(r => r.value === value);
    return range ? range.label : "Last 30 Days";
  };

  // Generate dynamic metrics based on time range
  const getMetricsForTimeRange = (timeRange: string) => {
    const baseMetrics = {
      "1d": [
        { label: "Total Spend (Today)", val: "$1,245.00", trend: "+8%", pos: false },
        { label: "Hourly Rate", val: "$52.00", trend: "-3%", pos: true },
        { label: "Active Services", val: "18", trend: "Stable", neutral: true },
        { label: "Alerts", val: "1", trend: "Normal", neutral: true }
      ],
      "7d": [
        { label: "Total Spend (7D)", val: "$8,750.00", trend: "+15%", pos: false },
        { label: "Daily Average", val: "$1,250.00", trend: "+5%", pos: false },
        { label: "Active Services", val: "22", trend: "+2", pos: true },
        { label: "Alerts", val: "3", trend: "Attention", warn: true }
      ],
      "30d": [
        { label: "Total Spend (MTD)", val: "$12,450.00", trend: "+12%", pos: false },
        { label: "Forecasted Spend", val: "$14,200.00", trend: "-2%", pos: true },
        { label: "Active Services", val: "24", trend: "Stable", neutral: true },
        { label: "Alerts", val: "2", trend: "Attention", warn: true }
      ],
      "90d": [
        { label: "Total Spend (90D)", val: "$38,920.00", trend: "+18%", pos: false },
        { label: "Monthly Average", val: "$12,973.00", trend: "+7%", pos: false },
        { label: "Peak Services", val: "28", trend: "+4", pos: true },
        { label: "Total Alerts", val: "12", trend: "Resolved", neutral: true }
      ],
      "1y": [
        { label: "Total Spend (YTD)", val: "$156,780.00", trend: "+22%", pos: false },
        { label: "Monthly Average", val: "$13,065.00", trend: "+9%", pos: false },
        { label: "Service Growth", val: "+15%", trend: "Growing", pos: true },
        { label: "Cost Savings", val: "$8,450", trend: "Optimized", pos: true }
      ],
      "custom": [
        { label: "Custom Range", val: "$25,680.00", trend: "Custom", neutral: true },
        { label: "Period Average", val: "$1,284.00", trend: "Variable", neutral: true },
        { label: "Services Used", val: "26", trend: "Variable", neutral: true },
        { label: "Insights", val: "Available", trend: "Ready", neutral: true }
      ]
    };

    return baseMetrics[timeRange as keyof typeof baseMetrics] || baseMetrics["30d"];
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
    { id: "monthly", type: "bar", title: "Monthly Spend Trend", colSpan: 2 },
    { id: "service", type: "pie", title: "Cost by Service", colSpan: 1 },
    { id: "drilldown", type: "drilldown", title: "Compute Services Breakdown", colSpan: 2 },
    { id: "savings", type: "savings", title: "Savings Optimization Potential", colSpan: 1 },
    { id: "transactions", type: "table", title: "Recent Transactions", colSpan: 3 }
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
      case "bar":
        return <MonthlyBarChart darkMode={darkMode} timeRange={selectedTimeRange} />;
      case "pie":
        return <ServicePieChart darkMode={darkMode} timeRange={selectedTimeRange} />;
      case "drilldown":
        return <DrilldownBarChart darkMode={darkMode} timeRange={selectedTimeRange} />;
      case "savings":
        return <SavingsPotentialCard darkMode={darkMode} timeRange={selectedTimeRange} />;
      case "table":
        return <TransactionsTable darkMode={darkMode} timeRange={selectedTimeRange} />;
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
                Cost Management Dashboard
              </h1>
              <p className={`text-sm mt-1.5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                Monitor your spending, optimize costs, and track budget performance in real-time
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                Last updated:{" "}
                <span className={`font-semibold ${darkMode ? "text-gray-200" : "text-gray-700"}`}>
                  Just now
                </span>
              </span>

              <button
                className="text-[#232f3e] px-5 py-2.5 rounded-md text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 hover:opacity-90"
                style={{ backgroundColor: accentColor }}
              >
                <Activity size={16} />
                Sync
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
                  <Calendar size={16} />
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
                              if (range.value === "custom") {
                                setShowTimeRangePicker(false);
                                setShowCustomDatePicker(true);
                              } else {
                                setIsLoadingTimeRange(true);
                                setSelectedTimeRange(range.value);
                                setShowTimeRangePicker(false);
                                // Simulate loading time for data refresh
                                setTimeout(() => setIsLoadingTimeRange(false), 500);
                              }
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
                Showing data for <span className="font-medium" style={{ color: accentColor }}>
                  {getTimeRangeLabel(selectedTimeRange).toLowerCase()}
                </span>
              </div>
            </div>

            {/* Custom Date Picker Modal */}
            {showCustomDatePicker && (
              <>
                <div
                  className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                  onClick={() => setShowCustomDatePicker(false)}
                >
                  <div
                    className={`w-full max-w-md rounded-lg shadow-2xl border p-6 ${
                      darkMode ? 'bg-[#1b2635] border-gray-700' : 'bg-white border-gray-200'
                    }`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h3 className={`text-lg font-semibold mb-4 ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      Select Custom Date Range
                    </h3>

                    {/* Quick Presets */}
                    <div className="mb-4">
                      <p className={`text-sm font-medium mb-2 ${
                        darkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Quick Presets
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { label: "Last Week", days: 7 },
                          { label: "Last Month", days: 30 },
                          { label: "Last Quarter", days: 90 },
                          { label: "Last 6 Months", days: 180 }
                        ].map((preset) => (
                          <button
                            key={preset.label}
                            onClick={() => {
                              const endDate = new Date();
                              const startDate = new Date();
                              startDate.setDate(endDate.getDate() - preset.days);
                              
                              setCustomEndDate(endDate.toISOString().split('T')[0]);
                              setCustomStartDate(startDate.toISOString().split('T')[0]);
                            }}
                            className={`px-3 py-2 text-xs rounded-md border transition-colors hover:opacity-80 ${
                              darkMode 
                                ? 'border-gray-600 text-gray-300 hover:bg-[#232f3e]' 
                                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${
                          darkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Start Date
                        </label>
                        <input
                          type="date"
                          value={customStartDate}
                          onChange={(e) => setCustomStartDate(e.target.value)}
                          className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                            darkMode 
                              ? 'bg-[#232f3e] border-gray-600 text-white' 
                              : 'bg-white border-gray-300 text-gray-900'
                          } focus:ring-1`}
                          style={{ '--tw-ring-color': accentColor } as any}
                          onFocus={(e) => e.target.style.borderColor = accentColor}
                          onBlur={(e) => e.target.style.borderColor = darkMode ? '#4b5563' : '#d1d5db'}
                        />
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 ${
                          darkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          End Date
                        </label>
                        <input
                          type="date"
                          value={customEndDate}
                          onChange={(e) => setCustomEndDate(e.target.value)}
                          min={customStartDate}
                          className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                            darkMode 
                              ? 'bg-[#232f3e] border-gray-600 text-white' 
                              : 'bg-white border-gray-300 text-gray-900'
                          } focus:ring-1`}
                          style={{ '--tw-ring-color': accentColor } as any}
                          onFocus={(e) => e.target.style.borderColor = accentColor}
                          onBlur={(e) => e.target.style.borderColor = darkMode ? '#4b5563' : '#d1d5db'}
                        />
                      </div>

                      {/* Validation Message */}
                      {customStartDate && customEndDate && new Date(customStartDate) > new Date(customEndDate) && (
                        <div className="text-xs text-red-400 mt-2">
                          End date must be after start date
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={() => setShowCustomDatePicker(false)}
                        className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${
                          darkMode 
                            ? 'border-gray-600 text-gray-300 hover:bg-[#232f3e]' 
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          if (customStartDate && customEndDate) {
                            const start = new Date(customStartDate);
                            const end = new Date(customEndDate);
                            
                            if (start <= end) {
                              setIsLoadingTimeRange(true);
                              setSelectedTimeRange("custom");
                              setShowCustomDatePicker(false);
                              setTimeout(() => setIsLoadingTimeRange(false), 500);
                            }
                          }
                        }}
                        disabled={!customStartDate || !customEndDate || new Date(customStartDate) > new Date(customEndDate)}
                        className="flex-1 px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ 
                          backgroundColor: (!customStartDate || !customEndDate || new Date(customStartDate) > new Date(customEndDate)) ? '#6b7280' : accentColor,
                          color: darkMode ? '#232f3e' : 'white'
                        }}
                      >
                        Apply Range
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="flex items-center gap-2">
              <div className={`text-xs px-2 py-1 rounded-full ${
                darkMode ? 'bg-green-900/40 text-green-400' : 'bg-green-100 text-green-700'
              }`}>
                Live Data
              </div>
              <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                Auto-refresh: 30s
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
                      metric.warn
                        ? "bg-red-900/40 text-red-400 border border-red-700/50"
                        : metric.neutral
                        ? "bg-blue-900/40 text-blue-400 border border-blue-700/50"
                        : metric.pos
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
    </div>
  );
}
