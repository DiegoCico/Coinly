import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar
} from "recharts";
import { BAR_DATA } from "../../data/mockData";

interface Props {
  darkMode: boolean;
  timeRange?: string;
}

export default function MonthlyBarChart({ darkMode, timeRange = "30d" }: Props) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={BAR_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "#374151" : "#e5e7eb"} />

        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{ fill: darkMode ? "#9ca3af" : "#6b7280", fontSize: 12 }}
          dy={10}
        />

        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: darkMode ? "#9ca3af" : "#6b7280", fontSize: 12 }}
          tickFormatter={(value) => `$${value / 1000}k`}
        />

        <Tooltip
          formatter={(value) => [`$${(value as number).toFixed(2)}`, "Spend"]}
          contentStyle={{
            backgroundColor: darkMode ? "#1f2937" : "#232f3e",
            border: "none",
            borderRadius: "4px",
            color: "#fff"
          }}
        />

        <Bar dataKey="spend" fill="#00A1C9" radius={[4, 4, 0, 0]} barSize={30} />
      </BarChart>
    </ResponsiveContainer>
  );
}
