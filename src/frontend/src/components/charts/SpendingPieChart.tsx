import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#00b3a4", "#33b8ff", "#775dd0", "#f2c94c", "#f2994a", "#eb5757"];

const data = [
  { name: "Food", value: 320 },
  { name: "Rent", value: 1800 },
  { name: "Shopping", value: 250 },
  { name: "Travel", value: 400 },
  { name: "Bills", value: 220 },
];

export default function SpendingPieChart() {
  return (
    <div style={{ width: "100%", height: 260 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
            label
          >
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
