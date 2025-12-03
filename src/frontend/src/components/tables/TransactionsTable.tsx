import Table from "@cloudscape-design/components/table";

const rows = [
  { date: "2025-02-11", name: "Uber", amount: -18.25 },
  { date: "2025-02-11", name: "Starbucks", amount: -4.50 },
  { date: "2025-02-10", name: "Rent", amount: -1800.00 },
  { date: "2025-02-09", name: "Amazon", amount: -36.99 },
];

export default function TransactionsTable() {
  return (
    <Table
      columnDefinitions={[
        { id: "date", header: "Date", cell: (item) => item.date },
        { id: "name", header: "Name", cell: (item) => item.name },
        { id: "amount", header: "Amount", cell: (item) => `$${item.amount.toFixed(2)}` },
      ]}
      items={rows}
      sortingDisabled={false}
      wrapLines={false}
      stripedRows
      variant="embedded"
    />
  );
}
