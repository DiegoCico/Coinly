

interface AssetClassChartProps {
  darkMode: boolean;
  timeRange: string;
  privacyMode: boolean;
}

export default function AssetClassChart({ darkMode, privacyMode }: AssetClassChartProps) {
  // Mock asset class data
  const assetClasses = [
    { 
      name: "US Stocks", 
      value: privacyMode ? 0 : 75420, 
      percentage: 59.9, 
      color: "#3b82f6",
      change: "+12.4%",
      positive: true,
      description: "Large & Mid Cap"
    },
    { 
      name: "International", 
      value: privacyMode ? 0 : 18650, 
      percentage: 14.8, 
      color: "#10b981",
      change: "+8.7%",
      positive: true,
      description: "Developed Markets"
    },
    { 
      name: "Bonds", 
      value: privacyMode ? 0 : 15230, 
      percentage: 12.1, 
      color: "#f59e0b",
      change: "+2.1%",
      positive: true,
      description: "Government & Corporate"
    },
    { 
      name: "Cash", 
      value: privacyMode ? 0 : 8450, 
      percentage: 6.7, 
      color: "#6b7280",
      change: "+0.1%",
      positive: true,
      description: "Money Market"
    },
    { 
      name: "REITs", 
      value: privacyMode ? 0 : 5097, 
      percentage: 4.1, 
      color: "#8b5cf6",
      change: "+15.2%",
      positive: true,
      description: "Real Estate"
    },
    { 
      name: "Commodities", 
      value: privacyMode ? 0 : 3000, 
      percentage: 2.4, 
      color: "#ef4444",
      change: "-3.8%",
      positive: false,
      description: "Gold & Energy"
    }
  ];



  return (
    <div className="h-full flex flex-col p-4">
      {/* Header */}
      <div className="mb-4">
        <h3 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
          Asset Allocation
        </h3>
        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
          Diversification across asset classes
        </p>
      </div>

      {/* Asset Class Bars */}
      <div className="flex-1 space-y-4">
        {assetClasses.map((assetClass, index) => (
          <div key={index} className="space-y-2">
            {/* Asset class info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: assetClass.color }}
                />
                <div>
                  <div className={`font-medium ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
                    {assetClass.name}
                  </div>
                  <div className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                    {assetClass.description}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`font-semibold ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
                  {assetClass.percentage}%
                </div>
                <div className={`text-xs ${assetClass.positive ? "text-green-400" : "text-red-400"}`}>
                  {assetClass.change}
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="relative">
              <div className={`w-full h-3 rounded-full ${darkMode ? "bg-gray-700" : "bg-gray-200"}`}>
                <div
                  className="h-3 rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${assetClass.percentage}%`,
                    backgroundColor: assetClass.color
                  }}
                />
              </div>
              
              {/* Value label */}
              <div className="flex justify-between items-center mt-1">
                <span className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                  {privacyMode ? "••••••" : `$${assetClass.value.toLocaleString()}`}
                </span>
                <span className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                  {assetClass.percentage}% of portfolio
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className={`mt-4 p-3 rounded-lg ${darkMode ? "bg-gray-800/50" : "bg-gray-100"}`}>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className={`font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
              Equity Allocation
            </div>
            <div className={`text-lg font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
              74.7%
            </div>
          </div>
          <div>
            <div className={`font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
              Fixed Income
            </div>
            <div className={`text-lg font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
              18.8%
            </div>
          </div>
        </div>
        
        <div className={`mt-2 text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
          Recommended allocation for moderate risk profile: 70% equity, 25% bonds, 5% alternatives
        </div>
      </div>
    </div>
  );
}