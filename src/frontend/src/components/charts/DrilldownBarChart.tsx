import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  Cell
} from "recharts";
import { DRILLDOWN_DATA } from "../../data/mockData";

interface Props {
  darkMode: boolean;
}

export default function DrilldownBarChart({ darkMode }: Props) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart layout="vertical" data={DRILLDOWN_DATA} margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={darkMode ? "#374151" : "#e5e7eb"} />

        <XAxis
          type="number"
          axisLine={false}
          tickLine={false}
          tick={{ fill: darkMode ? "#9ca3af" : "#6b7280", fontSize: 12 }}
          tickFormatter={(value) => `$${value}`}
        />

        <YAxis
          type="category"
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{ fill: darkMode ? "#9ca3af" : "#6b7280", fontSize: 12 }}
          dx={-10}
          width={80}
        />

        <Tooltip
          formatter={(val) => [`$${(val as number).toFixed(2)}`, "Cost"]}
          contentStyle={{
            backgroundColor: darkMode ? "#1f2937" : "#232f3e",
            border: "none",
            borderRadius: "4px",
            color: "#fff"
          }}
        />

        <Bar dataKey="cost" barSize={20} radius={[0, 4, 4, 0]}>
          {DRILLDOWN_DATA.map((d, i) => (
            <Cell key={i} fill={d.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
