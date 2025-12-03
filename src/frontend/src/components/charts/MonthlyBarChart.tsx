import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { month: "Jan", spending: 1350 },
  { month: "Feb", spending: 1450 },
  { month: "Mar", spending: 1100 },
  { month: "Apr", spending: 1650 },
  { month: "May", spending: 1720 },
];

export default function MonthlyBarChart() {
  return (
    <div style={{ width: "100%", height: 260 }}>
      <ResponsiveContainer>
        <BarChart data={data}>
          <XAxis dataKey="month" stroke="#ddd" />
          <YAxis stroke="#ddd" />
          <Tooltip />
          <Bar dataKey="spending" fill="#33b8ff" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
