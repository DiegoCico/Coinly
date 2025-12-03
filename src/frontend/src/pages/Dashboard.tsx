import Widget from "../components/ui/Widget";
import SpendingPieChart from "../components/charts/SpendingPieChart";
import MonthlyBarChart from "../components/charts/MonthlyBarChart";
import LineSpendingChart from "../components/charts/LineSpendingChart";
import TransactionsTable from "../components/tables/TransactionsTable";

export default function Dashboard() {
  return (
    <div style={{ padding: "30px", display: "grid", gap: "20px" }}>
      <Widget title="Spending Distribution">
        <SpendingPieChart />
      </Widget>

      <Widget title="Monthly Spending">
        <MonthlyBarChart />
      </Widget>

      <Widget title="Daily Trend">
        <LineSpendingChart />
      </Widget>

      <Widget title="Recent Transactions">
        <TransactionsTable />
      </Widget>
    </div>
  );
}
