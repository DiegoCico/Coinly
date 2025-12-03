export interface PieItem {
  name: string;
  value: number;
  color: string;
}

export interface BarItem {
  name: string;
  spend: number;
}

export interface DrillItem {
  name: string;
  cost: number;
  color: string;
}

export interface SavingsItem {
  opportunity: string;
  potential: number;
  description: string;
}

export interface TransactionItem {
  id: string;
  service: string;
  date: string;
  amount: string;
  status: string;
}

export const PIE_DATA: PieItem[] = [
  { name: "Cloud Services", value: 400, color: "#FF9900" },
  { name: "Database", value: 300, color: "#00A1C9" },
  { name: "Compute", value: 300, color: "#1D8102" },
  { name: "Storage", value: 200, color: "#D13212" }
];

export const BAR_DATA: BarItem[] = [
  { name: "Jan", spend: 4000 },
  { name: "Feb", spend: 3000 },
  { name: "Mar", spend: 2000 },
  { name: "Apr", spend: 2780 },
  { name: "May", spend: 1890 },
  { name: "Jun", spend: 2390 }
];

export const DRILLDOWN_DATA: DrillItem[] = [
  { name: "EC2", cost: 650, color: "#1D8102" },
  { name: "S3", cost: 400, color: "#D13212" },
  { name: "Lambda", cost: 150, color: "#00A1C9" },
  { name: "DynamoDB", cost: 200, color: "#FF9900" },
  { name: "VPC", cost: 50, color: "#6a7280" }
];

export const SAVINGS_DATA: SavingsItem[] = [
  { opportunity: "Unused Resources", potential: 750, description: "Terminate 5 idle EC2 instances." },
  { opportunity: "Reserved Instances", potential: 1200, description: "Convert current usage to 1-year RIs." },
  { opportunity: "Storage Tiering", potential: 300, description: "Move old S3 data to Glacier." }
];

export const TRANSACTIONS: TransactionItem[] = [
  { id: "tx_01", service: "EC2 Instances", date: "2023-10-24", amount: "$120.50", status: "Completed" },
  { id: "tx_02", service: "RDS Database", date: "2023-10-23", amount: "$85.00", status: "Pending" },
  { id: "tx_03", service: "S3 Storage", date: "2023-10-23", amount: "$12.99", status: "Completed" },
  { id: "tx_04", service: "CloudFront", date: "2023-10-22", amount: "$45.20", status: "Completed" },
  { id: "tx_05", service: "Lambda Functions", date: "2023-10-21", amount: "$5.00", status: "Completed" }
];
