import { LineChart, Line, Tooltip, XAxis, YAxis, ResponsiveContainer } from "recharts";

const data = [
  { day: "Mon", amount: 23 },
  { day: "Tue", amount: 56 },
  { day: "Wed", amount: 12 },
  { day: "Thu", amount: 78 },
  { day: "Fri", amount: 44 },
  { day: "Sat", amount: 91 },
  { day: "Sun", amount: 32 },
];

export default function LineSpendingChart() {
  return (
    <div style={{ width: "100%", height: 260 }}>
      <ResponsiveContainer>
        <LineChart data={data}>
          <XAxis dataKey="day" stroke="#ddd" />
          <YAxis stroke="#ddd" />
          <Tooltip />
          <Line type="monotone" dataKey="amount" stroke="#00b3a4" strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
