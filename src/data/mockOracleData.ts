// Oracle trigger events — dynamic payment channel support

export type PaymentChannel =
  | { type: "corporate"; payer: string; method: "bank_transfer" | "wire" | "check" }
  | { type: "retail"; payer: string; method: "mobile_money" | "card" | "ussd"; provider?: string }
  | { type: "platform"; payer: string; method: "escrow_release" | "smart_contract" };

export type OracleEventType =
  | "payment_received"
  | "payment_confirmed"
  | "milestone_verified"
  | "sensor_alert"
  | "threshold_breach"
  | "disbursement_triggered"
  | "compliance_check";

export interface OracleEvent {
  id: string;
  timestamp: string;
  type: OracleEventType;
  title: string;
  description: string;
  status: "confirmed" | "pending" | "failed";
  txHash?: string;
  amount?: number;
  currency?: string;
  paymentChannel?: PaymentChannel;
  source: string; // e.g. "Chainlink Adapter", "IoT Gateway", "Bank API", "MoMo API"
  metadata?: Record<string, string>;
}

export const mockOracleEvents: OracleEvent[] = [
  {
    id: "OE-001",
    timestamp: "2025-03-07T14:32:00Z",
    type: "payment_received",
    title: "Off-taker payment received",
    description: "Atlantic Commodities Ltd wired payment for Feb 2025 green bean shipment (Lot #GBL-2025-014).",
    status: "confirmed",
    txHash: "0x8a3f...c7d2",
    amount: 12_400_000,
    currency: "FCFA",
    paymentChannel: { type: "corporate", payer: "Atlantic Commodities Ltd", method: "bank_transfer" },
    source: "Bank API → Chainlink Adapter",
    metadata: { lot: "GBL-2025-014", invoice: "INV-2025-087" },
  },
  {
    id: "OE-002",
    timestamp: "2025-03-06T09:15:00Z",
    type: "milestone_verified",
    title: "Milestone 3 — NDVI threshold met",
    description: "Sentinel-2 NDVI reading of 0.63 exceeds 0.55 threshold. Milestone 3 disbursement authorized.",
    status: "confirmed",
    txHash: "0x4b1e...a9f8",
    source: "Sentinel-2 → Chainlink Adapter",
    metadata: { ndvi: "0.63", threshold: "0.55", coverage: "480 ha" },
  },
  {
    id: "OE-003",
    timestamp: "2025-03-05T16:48:00Z",
    type: "disbursement_triggered",
    title: "Milestone 3 disbursement executed",
    description: "Smart contract released 18,000,000 FCFA to project escrow following M3 verification.",
    status: "confirmed",
    txHash: "0x7c9d...b3e1",
    amount: 18_000_000,
    currency: "FCFA",
    paymentChannel: { type: "platform", payer: "SPV-01 Smart Contract", method: "escrow_release" },
    source: "Base L2 Smart Contract",
  },
  {
    id: "OE-004",
    timestamp: "2025-03-04T11:22:00Z",
    type: "sensor_alert",
    title: "Soil moisture approaching lower bound",
    description: "SoilProbe Alpha-1 at Plot A reading 18.5% — approaching 18% min threshold.",
    status: "confirmed",
    source: "IoT Gateway",
    metadata: { sensor: "SM-01", reading: "18.5%", threshold: "18%" },
  },
  {
    id: "OE-005",
    timestamp: "2025-03-03T08:00:00Z",
    type: "payment_received",
    title: "Off-taker advance payment",
    description: "Specialty Coffee Traders GmbH advance for Q1 2025 contracted volume.",
    status: "confirmed",
    txHash: "0x2f5a...d4c6",
    amount: 8_600_000,
    currency: "FCFA",
    paymentChannel: { type: "corporate", payer: "Specialty Coffee Traders GmbH", method: "wire" },
    source: "Bank API → Chainlink Adapter",
    metadata: { contract: "SCT-Q1-2025" },
  },
  {
    id: "OE-006",
    timestamp: "2025-03-02T19:30:00Z",
    type: "compliance_check",
    title: "Quarterly compliance verification",
    description: "Automated RWA compliance check passed. All covenants within bounds.",
    status: "confirmed",
    source: "Compliance Engine",
    metadata: { covenants: "4/4 passed", nextCheck: "Jun 2025" },
  },
  {
    id: "OE-007",
    timestamp: "2025-03-01T12:45:00Z",
    type: "payment_confirmed",
    title: "Payment on-chain confirmation",
    description: "Off-chain bank payment from Atlantic Commodities verified and logged on-chain.",
    status: "confirmed",
    txHash: "0x1d8b...e2a7",
    amount: 12_400_000,
    currency: "FCFA",
    source: "Chainlink Adapter → Base L2",
  },
];

// Example energy project events (for reference — shows retail/MoMo pattern)
export const mockEnergyOracleEvents: OracleEvent[] = [
  {
    id: "EOE-001",
    timestamp: "2025-03-07T23:59:00Z",
    type: "payment_received",
    title: "Daily MoMo collections aggregated",
    description: "342 retail payments received via MTN MoMo. Daily total: 1,240,000 FCFA.",
    status: "confirmed",
    txHash: "0xaa12...ff34",
    amount: 1_240_000,
    currency: "FCFA",
    paymentChannel: { type: "retail", payer: "342 retail customers", method: "mobile_money", provider: "MTN MoMo" },
    source: "MoMo API → Chainlink Adapter",
    metadata: { txCount: "342", avgTicket: "3,626 FCFA" },
  },
  {
    id: "EOE-002",
    timestamp: "2025-03-07T23:59:00Z",
    type: "payment_received",
    title: "Daily Orange Money collections",
    description: "128 retail payments received via Orange Money. Daily total: 486,000 FCFA.",
    status: "confirmed",
    txHash: "0xbb45...cc67",
    amount: 486_000,
    currency: "FCFA",
    paymentChannel: { type: "retail", payer: "128 retail customers", method: "mobile_money", provider: "Orange Money" },
    source: "Orange API → Chainlink Adapter",
    metadata: { txCount: "128", avgTicket: "3,797 FCFA" },
  },
];

// Monthly financial data (replacing quarterly)
export interface MonthlyFinancial {
  month: string;
  revenue: number;
  operatingCost: number;
  netMargin: number;
  collections: number;
  collectionRate: number; // %
  txCount: number;
  loanRepayment: number;
}

export const mockMonthlyFinancials: MonthlyFinancial[] = [
  { month: "Nov 2024", revenue: 4_800_000, operatingCost: 4_100_000, netMargin: 14.6, collections: 4_800_000, collectionRate: 100, txCount: 2, loanRepayment: 0 },
  { month: "Dec 2024", revenue: 10_400_000, operatingCost: 8_700_000, netMargin: 16.3, collections: 10_400_000, collectionRate: 100, txCount: 3, loanRepayment: 0 },
  { month: "Jan 2025", revenue: 12_200_000, operatingCost: 9_400_000, netMargin: 23.0, collections: 11_800_000, collectionRate: 96.7, txCount: 4, loanRepayment: 0 },
  { month: "Feb 2025", revenue: 9_800_000, operatingCost: 7_600_000, netMargin: 22.4, collections: 9_800_000, collectionRate: 100, txCount: 3, loanRepayment: 4_700_000 },
  { month: "Mar 2025", revenue: 6_400_000, operatingCost: 5_200_000, netMargin: 18.8, collections: 5_100_000, collectionRate: 79.7, txCount: 2, loanRepayment: 0 },
];
