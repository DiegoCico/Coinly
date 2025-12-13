

interface PortfolioAllocationChartProps {
  darkMode: boolean;
  timeRange: string;
  privacyMode: boolean;
}

export default function PortfolioAllocationChart({ darkMode, privacyMode }: PortfolioAllocationChartProps) {
  // Mock portfolio allocation data
  const allocations = [
    { name: "AAPL", value: privacyMode ? 0 : 18500, percentage: 14.7, color: "#1f77b4", sector: "Technology" },
    { name: "MSFT", value: privacyMode ? 0 : 15200, percentage: 12.1, color: "#ff7f0e", sector: "Technology" },
    { name: "GOOGL", value: privacyMode ? 0 : 12800, percentage: 10.2, color: "#2ca02c", sector: "Technology" },
    { name: "NVDA", value: privacyMode ? 0 : 11400, percentage: 9.1, color: "#d62728", sector: "Technology" },
    { name: "TSLA", value: privacyMode ? 0 : 9600, percentage: 7.6, color: "#9467bd", sector: "Consumer Cyclical" },
    { name: "AMZN", value: privacyMode ? 0 : 8900, percentage: 7.1, color: "#8c564b", sector: "Consumer Cyclical" },
    { name: "META", value: privacyMode ? 0 : 7800, percentage: 6.2, color: "#e377c2", sector: "Technology" },
    { name: "SPY ETF", value: privacyMode ? 0 : 15600, percentage: 12.4, color: "#7f7f7f", sector: "ETF" },
    { name: "VTI ETF", value: privacyMode ? 0 : 12200, percentage: 9.7, color: "#bcbd22", sector: "ETF" },
    { name: "Cash", value: privacyMode ? 0 : 8450, percentage: 6.7, color: "#17becf", sector: "Cash" },
    { name: "Others", value: privacyMode ? 0 : 5397, percentage: 4.3, color: "#aec7e8", sector: "Mixed" }
  ];


  const centerX = 150;
  const centerY = 150;
  const radius = 100;

  let currentAngle = -90; // Start from top

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <svg viewBox="0 0 300 300" className="w-full h-auto">
            {/* Pie chart slices */}
            {allocations.map((item, index) => {
              const sliceAngle = (item.percentage / 100) * 360;
              const startAngle = currentAngle;
              const endAngle = currentAngle + sliceAngle;
              
              const x1 = centerX + radius * Math.cos((startAngle * Math.PI) / 180);
              const y1 = centerY + radius * Math.sin((startAngle * Math.PI) / 180);
              const x2 = centerX + radius * Math.cos((endAngle * Math.PI) / 180);
              const y2 = centerY + radius * Math.sin((endAngle * Math.PI) / 180);
              
              const largeArcFlag = sliceAngle > 180 ? 1 : 0;
              
              const pathData = [
                `M ${centerX} ${centerY}`,
                `L ${x1} ${y1}`,
                `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                'Z'
              ].join(' ');
              
              currentAngle += sliceAngle;
              
              return (
                <g key={index}>
                  <path
                    d={pathData}
                    fill={item.color}
                    stroke={darkMode ? "#1b2635" : "#ffffff"}
                    strokeWidth="2"
                    className="hover:opacity-80 transition-opacity cursor-pointer"
                  />
                </g>
              );
            })}
            
            {/* Center circle */}
            <circle
              cx={centerX}
              cy={centerY}
              r="45"
              fill={darkMode ? "#232f3e" : "#f8f9fa"}
              stroke={darkMode ? "#4b5563" : "#e5e7eb"}
              strokeWidth="2"
            />
            
            {/* Center text */}
            <text
              x={centerX}
              y={centerY - 8}
              textAnchor="middle"
              className={`text-xs font-semibold ${darkMode ? "fill-gray-300" : "fill-gray-600"}`}
            >
              Total Value
            </text>
            <text
              x={centerX}
              y={centerY + 8}
              textAnchor="middle"
              className={`text-sm font-bold ${darkMode ? "fill-white" : "fill-gray-900"}`}
            >
              {privacyMode ? "••••••" : "$125.8K"}
            </text>
          </svg>
        </div>
      </div>
      
      {/* Legend */}
      <div className="mt-4 max-h-48 overflow-y-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {allocations.slice(0, 8).map((item, index) => (
            <div key={index} className="flex items-center gap-2 p-2 rounded hover:bg-opacity-50 hover:bg-gray-500 transition-colors">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className={`font-medium truncate ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
                    {item.name}
                  </span>
                  <span className={`font-semibold ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                    {item.percentage}%
                  </span>
                </div>
                <div className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  {privacyMode ? "••••••" : `$${item.value.toLocaleString()}`}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {allocations.length > 8 && (
          <div className={`text-xs text-center mt-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            +{allocations.length - 8} more holdings
          </div>
        )}
      </div>
    </div>
  );
}