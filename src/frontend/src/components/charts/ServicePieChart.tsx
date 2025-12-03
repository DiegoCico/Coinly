import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { PIE_DATA } from "../../data/mockData";

interface Props {
  darkMode: boolean;
}

export default function ServicePieChart({ darkMode }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const totalValue = useMemo(
    () => PIE_DATA.reduce((acc, cur) => acc + cur.value, 0),
    []
  );
  const activeItem = activeIndex !== null ? PIE_DATA[activeIndex] : null;

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={PIE_DATA as any}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={activeIndex !== null ? 86 : 80}
              paddingAngle={4}
              dataKey="value"
              stroke="none"
              onMouseEnter={(_, i) => setActiveIndex(i)}
              onMouseLeave={() => setActiveIndex(null)}
              labelLine={false}
            >
              {PIE_DATA.map((d, i) => (
                <Cell
                  key={i}
                  fill={d.color}
                  stroke={activeIndex === i ? (darkMode ? '#1f2937' : '#f8f9fa') : 'none'}
                  strokeWidth={activeIndex === i ? 2 : 0}
                  style={{ outline: 'none', transition: 'all 0.15s ease-out' }}
                />
              ))}
            </Pie>

            {/* center text */}
            <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
              <tspan x="50%" dy="-1.0em" fontSize="12" fill={darkMode ? "#9ca3af" : "#6b7280"} fontWeight="500">
                {activeItem ? activeItem.name : "Total Monthly"}
              </tspan>
              <tspan x="50%" dy="1.6em" fontSize="22" fill={darkMode ? "#fff" : "#111827"} fontWeight="bold">
                ${activeItem ? activeItem.value.toFixed(2) : totalValue.toFixed(2)}
              </tspan>
            </text>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 pt-4 border-t border-gray-700/50">
        {PIE_DATA.map((item, index) => (
          <div
            key={item.name}
            className={`flex items-center gap-2 cursor-pointer transition-all duration-150 ${
              activeIndex !== null && activeIndex !== index ? 'opacity-40' : 'opacity-100'
            }`}
            onMouseEnter={() => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
          >
            <div
              className="w-3 h-3 rounded-full shadow-sm"
              style={{ backgroundColor: item.color }}
            />
            <span className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {item.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
