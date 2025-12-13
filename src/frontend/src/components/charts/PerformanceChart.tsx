import { useMemo } from "react";

interface PerformanceChartProps {
  darkMode: boolean;
  timeRange: string;
  privacyMode: boolean;
}

export default function PerformanceChart({ darkMode, timeRange, privacyMode }: PerformanceChartProps) {
  // Realistic dummy data with clear gain/loss patterns
  const data = useMemo(() => {
    const dummyData = {
      "1d": [
        { value: 125000, date: new Date('2024-12-13T09:00:00') }, // baseline
        { value: 125500, date: new Date('2024-12-13T11:00:00') }, // +0.4%
        { value: 124200, date: new Date('2024-12-13T13:00:00') }, // -0.64%
        { value: 126800, date: new Date('2024-12-13T15:00:00') }, // +1.44%
        { value: 127500, date: new Date('2024-12-13T17:00:00') }, // +2.0%
        { value: 126000, date: new Date('2024-12-13T19:00:00') }, // +0.8%
        { value: 128200, date: new Date('2024-12-13T21:00:00') }, // +2.56%
        { value: 127800, date: new Date('2024-12-14T07:00:00') }  // +2.24%
      ],
      "1w": [
        { value: 120000, date: new Date('2024-12-07') }, // baseline
        { value: 122400, date: new Date('2024-12-08') }, // +2.0%
        { value: 118800, date: new Date('2024-12-09') }, // -1.0%
        { value: 125600, date: new Date('2024-12-10') }, // +4.67%
        { value: 127200, date: new Date('2024-12-11') }, // +6.0%
        { value: 124800, date: new Date('2024-12-12') }, // +4.0%
        { value: 129600, date: new Date('2024-12-13') }  // +8.0%
      ],
      "1m": [
        { value: 110000, date: new Date('2024-11-15') }, // baseline
        { value: 113300, date: new Date('2024-11-17') }, // +3.0%
        { value: 107800, date: new Date('2024-11-21') }, // -2.0%
        { value: 118800, date: new Date('2024-11-23') }, // +8.0%
        { value: 123200, date: new Date('2024-11-27') }, // +12.0%
        { value: 117700, date: new Date('2024-11-29') }, // +7.0%
        { value: 126500, date: new Date('2024-12-05') }, // +15.0%
        { value: 132000, date: new Date('2024-12-07') }, // +20.0%
        { value: 129800, date: new Date('2024-12-13') }  // +18.0%
      ],
      "1y": [
        { value: 80000, date: new Date('2024-01-01') },  // baseline
        { value: 84000, date: new Date('2024-02-01') },  // +5.0%
        { value: 76000, date: new Date('2024-03-01') },  // -5.0%
        { value: 88000, date: new Date('2024-04-01') },  // +10.0%
        { value: 96000, date: new Date('2024-05-01') },  // +20.0%
        { value: 104000, date: new Date('2024-08-01') }, // +30.0%
        { value: 112000, date: new Date('2024-10-01') }, // +40.0%
        { value: 120000, date: new Date('2024-11-01') }, // +50.0%
        { value: 128000, date: new Date('2024-12-01') }  // +60.0%
      ]
    };

    const selectedData = dummyData[timeRange as keyof typeof dummyData] || dummyData["1y"];
    
    return selectedData.map((point) => {
      const initialValue = selectedData[0].value;
      const gain = point.value - initialValue;
      const gainPercent = ((point.value - initialValue) / initialValue) * 100;
      
      return {
        ...point,
        gain,
        gainPercent
      };
    });
  }, [timeRange]);

  const metrics = useMemo(() => {
    const currentValue = data[data.length - 1]?.value || 0;
    const initialValue = data[0]?.value || 0;
    const totalGain = currentValue - initialValue;
    const totalGainPercent = ((totalGain / initialValue) * 100);
    
    return {
      currentValue,
      initialValue,
      totalGain,
      totalGainPercent,
      isPositive: totalGain >= 0
    };
  }, [data]);

  const formatDate = (date: Date) => {
    if (timeRange === "1d") {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (timeRange === "1w" || timeRange === "1m") {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } else {
      return date.toLocaleDateString([], { month: 'short', year: '2-digit' });
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Performance Summary */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between">
          <div>
            <div className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
              {privacyMode ? "••••••" : `$${metrics.currentValue.toLocaleString()}`}
            </div>
            <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              Portfolio Value
            </div>
          </div>
          <div className="text-right">
            <div className={`text-lg font-semibold ${metrics.isPositive ? "text-green-500" : "text-red-500"}`}>
              {metrics.isPositive ? "+" : ""}{privacyMode ? "••••••" : `$${Math.abs(metrics.totalGain).toLocaleString()}`}
            </div>
            <div className={`text-sm ${metrics.isPositive ? "text-green-500" : "text-red-500"}`}>
              {metrics.isPositive ? "+" : ""}{metrics.totalGainPercent.toFixed(2)}%
            </div>
          </div>
        </div>
      </div>

      {/* Chart Area */}
      <div className="flex-1 p-4 overflow-hidden">
        {/* Chart Grid */}
        <div className="h-full flex flex-col justify-center">
          {/* Squares Container */}
          <div className="grid gap-2 sm:gap-3 justify-items-center items-end mx-auto" 
               style={{ 
                 gridTemplateColumns: `repeat(${data.length}, 1fr)`,
                 height: '160px',
                 maxWidth: '100%',
                 width: '100%'
               }}>
            {data.map((point, index) => {
              // Calculate available width per square (responsive)
              const containerWidth = Math.min(600, window.innerWidth - 64); // Max 600px, minus padding
              const availableWidth = (containerWidth / data.length) - 12; // Subtract gap space
              const maxSquareSize = Math.min(availableWidth, 80); // Cap at 80px or available width
              
              // Calculate square size based on absolute gain/loss percentage
              const absGainPercent = Math.abs(point.gainPercent);
              let squareSize;
              
              if (absGainPercent === 0) {
                squareSize = Math.max(maxSquareSize * 0.4, 20); // 40% of max, min 20px
              } else if (absGainPercent <= 1) {
                squareSize = Math.max(maxSquareSize * 0.4, 20) + (absGainPercent * (maxSquareSize * 0.1));
              } else if (absGainPercent <= 5) {
                squareSize = Math.max(maxSquareSize * 0.5, 24) + ((absGainPercent - 1) * (maxSquareSize * 0.075));
              } else if (absGainPercent <= 10) {
                squareSize = Math.max(maxSquareSize * 0.65, 32) + ((absGainPercent - 5) * (maxSquareSize * 0.05));
              } else if (absGainPercent <= 20) {
                squareSize = Math.max(maxSquareSize * 0.8, 40) + ((absGainPercent - 10) * (maxSquareSize * 0.02));
              } else {
                squareSize = maxSquareSize; // Use full available size for huge changes
              }
              
              // Ensure minimum size and don't exceed container
              squareSize = Math.max(Math.min(squareSize, maxSquareSize), 20);
              
              const isGain = point.gainPercent >= 0;
              const isCurrentPeriod = index === data.length - 1;
              
              return (
                <div key={index} className="flex flex-col items-center group">
                  {/* Square */}
                  <div 
                    className={`
                      transition-all duration-300 ease-out cursor-pointer 
                      flex items-center justify-center text-white font-bold
                      hover:scale-110 hover:shadow-lg
                      ${isCurrentPeriod ? 'ring-2 ring-offset-2' : ''}
                    `}
                    style={{ 
                      width: `${squareSize}px`,
                      height: `${squareSize}px`,
                      backgroundColor: isGain ? "#10b981" : "#ef4444",
                      borderRadius: '6px',
                      ...(isCurrentPeriod && { '--tw-ring-color': isGain ? "#10b981" : "#ef4444" } as any),
                      boxShadow: isCurrentPeriod 
                        ? `0 4px 12px ${isGain ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                        : `0 2px 6px ${isGain ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                    }}
                  >
                    {/* Content inside square */}
                    <div className="text-center px-1">
                      <div className={squareSize > 40 ? 'text-xs' : 'text-xs'} style={{ fontSize: `${Math.max(squareSize * 0.2, 10)}px` }}>
                        {point.gainPercent >= 0 ? '+' : ''}{Math.abs(point.gainPercent) >= 10 ? point.gainPercent.toFixed(0) : point.gainPercent.toFixed(1)}%
                      </div>
                      {squareSize > 50 && (
                        <div className="text-xs opacity-90 mt-0.5" style={{ fontSize: `${Math.max(squareSize * 0.15, 8)}px` }}>
                          {privacyMode ? "•••" : `$${Math.abs(point.gain / 1000).toFixed(0)}K`}
                        </div>
                      )}
                    </div>

                    {/* Hover Tooltip */}
                    <div className={`
                      absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2
                      opacity-0 group-hover:opacity-100 transition-opacity duration-200
                      pointer-events-none z-50 px-3 py-2 rounded-lg text-sm font-medium
                      shadow-xl border whitespace-nowrap
                      ${darkMode ? "bg-gray-900 text-white border-gray-600" : "bg-white text-gray-900 border-gray-200"}
                    `}>
                      <div className="font-bold">
                        {privacyMode ? "••••••" : `$${point.value.toLocaleString()}`}
                      </div>
                      <div className={`text-xs mt-1 ${isGain ? "text-green-400" : "text-red-400"}`}>
                        {formatDate(point.date)}
                      </div>
                      <div className={`text-xs ${isGain ? "text-green-400" : "text-red-400"}`}>
                        {point.gainPercent >= 0 ? '+' : ''}{point.gainPercent.toFixed(2)}% • 
                        {privacyMode ? " ••••" : ` $${Math.abs(point.gain).toLocaleString()}`}
                      </div>
                    </div>
                  </div>

                  {/* Date Label */}
                  <div className={`text-xs mt-2 text-center ${darkMode ? "text-gray-400" : "text-gray-600"}`} 
                       style={{ fontSize: '10px', lineHeight: '1.2' }}>
                    {formatDate(point.date)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700 pt-4">
        <div className="flex items-center justify-center gap-6 text-sm mb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center text-white text-xs font-bold">
              +
            </div>
            <span className={darkMode ? "text-gray-400" : "text-gray-600"}>Gains</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-red-500 rounded flex items-center justify-center text-white text-xs font-bold">
              −
            </div>
            <span className={darkMode ? "text-gray-400" : "text-gray-600"}>Losses</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 ${metrics.isPositive ? "bg-green-500" : "bg-red-500"} rounded ring-2 ${darkMode ? "ring-gray-800" : "ring-white"} flex items-center justify-center text-white text-xs font-bold`}>
              NOW
            </div>
            <span className={darkMode ? "text-gray-300" : "text-gray-700"}>Current</span>
          </div>
        </div>
        
        <div className={`text-xs text-center ${darkMode ? "text-gray-500" : "text-gray-500"}`}>
          Square size represents performance magnitude • Larger squares = bigger gains/losses
        </div>
      </div>
    </div>
  );
}