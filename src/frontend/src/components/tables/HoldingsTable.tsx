import { useState } from "react";
import { MoreHorizontal } from "lucide-react";

interface HoldingsTableProps {
  darkMode: boolean;
  timeRange: string;
  privacyMode: boolean;
}

export default function HoldingsTable({ darkMode, privacyMode }: HoldingsTableProps) {
  const [sortBy, setSortBy] = useState<'value' | 'change' | 'percentage'>('value');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Mock holdings data
  const holdings = [
    {
      symbol: "AAPL",
      name: "Apple Inc.",
      shares: 125,
      price: 148.50,
      value: 18562.50,
      dayChange: 2.35,
      dayChangePercent: 1.61,
      totalReturn: 3420.50,
      totalReturnPercent: 22.6,
      sector: "Technology",
      allocation: 14.7
    },
    {
      symbol: "MSFT",
      name: "Microsoft Corporation",
      shares: 45,
      price: 338.25,
      value: 15221.25,
      dayChange: -1.85,
      dayChangePercent: -0.54,
      totalReturn: 2890.25,
      totalReturnPercent: 23.4,
      sector: "Technology",
      allocation: 12.1
    },
    {
      symbol: "GOOGL",
      name: "Alphabet Inc.",
      shares: 95,
      price: 134.80,
      value: 12806.00,
      dayChange: 3.20,
      dayChangePercent: 2.43,
      totalReturn: 1950.00,
      totalReturnPercent: 17.9,
      sector: "Technology",
      allocation: 10.2
    },
    {
      symbol: "NVDA",
      name: "NVIDIA Corporation",
      shares: 28,
      price: 407.15,
      value: 11400.20,
      dayChange: 12.45,
      dayChangePercent: 3.15,
      totalReturn: 4200.20,
      totalReturnPercent: 58.3,
      sector: "Technology",
      allocation: 9.1
    },
    {
      symbol: "TSLA",
      name: "Tesla, Inc.",
      shares: 40,
      price: 240.00,
      value: 9600.00,
      dayChange: -5.20,
      dayChangePercent: -2.12,
      totalReturn: 1200.00,
      totalReturnPercent: 14.3,
      sector: "Consumer Cyclical",
      allocation: 7.6
    },
    {
      symbol: "AMZN",
      name: "Amazon.com Inc.",
      shares: 65,
      price: 136.92,
      value: 8899.80,
      dayChange: 1.85,
      dayChangePercent: 1.37,
      totalReturn: 1450.80,
      totalReturnPercent: 19.5,
      sector: "Consumer Cyclical",
      allocation: 7.1
    },
    {
      symbol: "META",
      name: "Meta Platforms Inc.",
      shares: 25,
      price: 312.00,
      value: 7800.00,
      dayChange: -4.50,
      dayChangePercent: -1.42,
      totalReturn: 980.00,
      totalReturnPercent: 14.4,
      sector: "Technology",
      allocation: 6.2
    },
    {
      symbol: "SPY",
      name: "SPDR S&P 500 ETF",
      shares: 35,
      price: 445.71,
      value: 15599.85,
      dayChange: 2.15,
      dayChangePercent: 0.48,
      totalReturn: 1899.85,
      totalReturnPercent: 13.9,
      sector: "ETF",
      allocation: 12.4
    }
  ];

  const sortedHoldings = [...holdings].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'value':
        aValue = a.value;
        bValue = b.value;
        break;
      case 'change':
        aValue = a.dayChangePercent;
        bValue = b.dayChangePercent;
        break;
      case 'percentage':
        aValue = a.allocation;
        bValue = b.allocation;
        break;
      default:
        aValue = a.value;
        bValue = b.value;
    }
    
    if (sortOrder === 'asc') {
      return aValue - bValue;
    } else {
      return bValue - aValue;
    }
  });

  const handleSort = (column: 'value' | 'change' | 'percentage') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 p-4 pb-0">
        <div>
          <h3 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
            Holdings
          </h3>
          <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
            {holdings.length} positions • {privacyMode ? "••••••" : "$125,847"} total value
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <div className="min-w-full">
          {/* Table Header */}
          <div className={`grid grid-cols-12 gap-2 px-4 py-3 text-xs font-medium uppercase tracking-wider border-b ${
            darkMode ? "text-gray-400 border-gray-700" : "text-gray-500 border-gray-200"
          }`}>
            <div className="col-span-3">Symbol</div>
            <div className="col-span-2 text-right cursor-pointer hover:text-blue-500" onClick={() => handleSort('value')}>
              Value {sortBy === 'value' && (sortOrder === 'desc' ? '↓' : '↑')}
            </div>
            <div className="col-span-2 text-right cursor-pointer hover:text-blue-500" onClick={() => handleSort('change')}>
              Day Change {sortBy === 'change' && (sortOrder === 'desc' ? '↓' : '↑')}
            </div>
            <div className="col-span-2 text-right">Total Return</div>
            <div className="col-span-2 text-right cursor-pointer hover:text-blue-500" onClick={() => handleSort('percentage')}>
              Allocation {sortBy === 'percentage' && (sortOrder === 'desc' ? '↓' : '↑')}
            </div>
            <div className="col-span-1"></div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {sortedHoldings.map((holding, index) => (
              <div
                key={holding.symbol}
                className={`grid grid-cols-12 gap-2 px-4 py-3 hover:bg-opacity-50 hover:bg-gray-500 transition-colors ${
                  darkMode ? "text-gray-200" : "text-gray-800"
                }`}
              >
                {/* Symbol & Name */}
                <div className="col-span-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white`}
                         style={{ backgroundColor: `hsl(${index * 45}, 70%, 50%)` }}>
                      {holding.symbol.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium">{holding.symbol}</div>
                      <div className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        {holding.shares} shares
                      </div>
                    </div>
                  </div>
                </div>

                {/* Value */}
                <div className="col-span-2 text-right">
                  <div className="font-semibold">
                    {privacyMode ? "••••••" : `$${holding.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                  </div>
                  <div className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                    {privacyMode ? "••••" : `$${holding.price.toFixed(2)}`}
                  </div>
                </div>

                {/* Day Change */}
                <div className="col-span-2 text-right">
                  <div className={`font-semibold ${holding.dayChangePercent >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {holding.dayChangePercent >= 0 ? "+" : ""}{holding.dayChangePercent.toFixed(2)}%
                  </div>
                  <div className={`text-xs ${holding.dayChangePercent >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {holding.dayChangePercent >= 0 ? "+" : ""}{privacyMode ? "••••" : `$${holding.dayChange.toFixed(2)}`}
                  </div>
                </div>

                {/* Total Return */}
                <div className="col-span-2 text-right">
                  <div className={`font-semibold ${holding.totalReturnPercent >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {holding.totalReturnPercent >= 0 ? "+" : ""}{holding.totalReturnPercent.toFixed(1)}%
                  </div>
                  <div className={`text-xs ${holding.totalReturnPercent >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {holding.totalReturnPercent >= 0 ? "+" : ""}{privacyMode ? "••••••" : `$${holding.totalReturn.toLocaleString()}`}
                  </div>
                </div>

                {/* Allocation */}
                <div className="col-span-2 text-right">
                  <div className="font-semibold">{holding.allocation}%</div>
                  <div className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                    {holding.sector}
                  </div>
                </div>

                {/* Actions */}
                <div className="col-span-1 flex justify-end">
                  <button className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}>
                    <MoreHorizontal size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className={`mt-4 p-4 border-t ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className={`font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
              Total Positions
            </div>
            <div className={`text-lg font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
              {holdings.length}
            </div>
          </div>
          <div className="text-center">
            <div className={`font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
              Day's Best
            </div>
            <div className="text-lg font-bold text-green-400">
              NVDA +3.15%
            </div>
          </div>
          <div className="text-center">
            <div className={`font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
              Day's Worst
            </div>
            <div className="text-lg font-bold text-red-400">
              TSLA -2.12%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}