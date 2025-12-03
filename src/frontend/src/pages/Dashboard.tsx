import React, { useState, useEffect } from "react";
import { Activity } from "lucide-react";

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
        return <MonthlyBarChart darkMode={darkMode} />;
      case "pie":
        return <ServicePieChart darkMode={darkMode} />;
      case "drilldown":
        return <DrilldownBarChart darkMode={darkMode} />;
      case "savings":
        return <SavingsPotentialCard darkMode={darkMode} />;
      case "table":
        return <TransactionsTable darkMode={darkMode} />;
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
                Run Analysis
              </button>
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { label: "Total Spend (MTD)", val: "$12,450.00", trend: "+12%", pos: false },
              { label: "Forecasted Spend", val: "$14,200.00", trend: "-2%", pos: true },
              { label: "Active Services", val: "24", trend: "Stable", neutral: true },
              { label: "Alerts", val: "2", trend: "Attention", warn: true }
            ].map((metric, i) => (
              <div
                key={i}
                className={`p-5 rounded-lg shadow-lg border-l-4 transition-all duration-200 cursor-pointer ${
                  darkMode
                    ? "bg-gradient-to-br from-[#232f3e] to-[#1a2332] border-r border-t border-b border-gray-700 hover:shadow-xl hover:scale-[1.02]"
                    : "bg-gradient-to-br from-white to-gray-50 border-r border-t border-b border-gray-200 hover:shadow-xl hover:scale-[1.02]"
                }`}
                style={{ borderLeftColor: accentColor }}
              >
                <p
                  className={`text-xs font-bold uppercase tracking-wider ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {metric.label}
                </p>

                <div className="flex items-end justify-between mt-3">
                  <span className={`text-3xl font-bold ${darkMode ? "text-white" : "text-[#232f3e]"}`}>
                    {metric.val}
                  </span>

                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full ${
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
