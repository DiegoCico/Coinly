

interface DiversificationChartProps {
  darkMode: boolean;
  timeRange: string;
  privacyMode: boolean;
}

export default function DiversificationChart({ darkMode }: DiversificationChartProps) {
  // Mock diversification metrics
  const diversificationMetrics = [
    {
      category: "Geographic",
      score: 85,
      description: "Well diversified across regions",
      breakdown: [
        { name: "US", percentage: 65, color: "#3b82f6" },
        { name: "Europe", percentage: 20, color: "#10b981" },
        { name: "Asia", percentage: 12, color: "#f59e0b" },
        { name: "Emerging", percentage: 3, color: "#ef4444" }
      ]
    },
    {
      category: "Sector",
      score: 78,
      description: "Good sector distribution",
      breakdown: [
        { name: "Technology", percentage: 35, color: "#3b82f6" },
        { name: "Healthcare", percentage: 15, color: "#10b981" },
        { name: "Financial", percentage: 12, color: "#f59e0b" },
        { name: "Consumer", percentage: 18, color: "#8b5cf6" },
        { name: "Other", percentage: 20, color: "#6b7280" }
      ]
    },
    {
      category: "Market Cap",
      score: 72,
      description: "Moderate concentration in large cap",
      breakdown: [
        { name: "Large Cap", percentage: 70, color: "#3b82f6" },
        { name: "Mid Cap", percentage: 20, color: "#10b981" },
        { name: "Small Cap", percentage: 10, color: "#f59e0b" }
      ]
    }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return "#10b981"; // green
    if (score >= 60) return "#f59e0b"; // yellow
    return "#ef4444"; // red
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    return "Needs Improvement";
  };

  return (
    <div className="h-full flex flex-col p-4">
      {/* Header */}
      <div className="mb-4">
        <h3 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
          Diversification Analysis
        </h3>
        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
          Portfolio risk distribution
        </p>
      </div>

      {/* Diversification Metrics */}
      <div className="flex-1 space-y-6">
        {diversificationMetrics.map((metric, index) => (
          <div key={index} className="space-y-3">
            {/* Category header */}
            <div className="flex items-center justify-between">
              <div>
                <div className={`font-medium ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
                  {metric.category} Diversification
                </div>
                <div className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  {metric.description}
                </div>
              </div>
              <div className="text-right">
                <div 
                  className="text-lg font-bold"
                  style={{ color: getScoreColor(metric.score) }}
                >
                  {metric.score}/100
                </div>
                <div 
                  className="text-xs font-medium"
                  style={{ color: getScoreColor(metric.score) }}
                >
                  {getScoreLabel(metric.score)}
                </div>
              </div>
            </div>

            {/* Score bar */}
            <div className="relative">
              <div className={`w-full h-2 rounded-full ${darkMode ? "bg-gray-700" : "bg-gray-200"}`}>
                <div
                  className="h-2 rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${metric.score}%`,
                    backgroundColor: getScoreColor(metric.score)
                  }}
                />
              </div>
            </div>

            {/* Breakdown */}
            <div className="grid grid-cols-2 gap-2">
              {metric.breakdown.map((item, itemIndex) => (
                <div key={itemIndex} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className={`text-xs ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                    {item.name}
                  </span>
                  <span className={`text-xs font-medium ml-auto ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
                    {item.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Overall Score */}
      <div className={`mt-4 p-4 rounded-lg ${darkMode ? "bg-gray-800/50" : "bg-gray-100"}`}>
        <div className="flex items-center justify-between mb-2">
          <span className={`font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
            Overall Diversification Score
          </span>
          <span 
            className="text-xl font-bold"
            style={{ color: getScoreColor(78) }}
          >
            78/100
          </span>
        </div>
        
        <div className={`w-full h-3 rounded-full ${darkMode ? "bg-gray-700" : "bg-gray-200"} mb-2`}>
          <div
            className="h-3 rounded-full transition-all duration-500 ease-out"
            style={{
              width: "78%",
              backgroundColor: getScoreColor(78)
            }}
          />
        </div>
        
        <div className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
          <span style={{ color: getScoreColor(78) }} className="font-medium">Good diversification.</span>
          {" "}Consider reducing technology concentration and adding more international exposure.
        </div>
      </div>
    </div>
  );
}