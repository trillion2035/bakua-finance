export interface Investment {
  id: string;
  spvName: string;
  asset: string;
  amountInvested: string;
  currency: string;
  currentValue: string;
  irr: string;
  status: "Active" | "Distributing" | "Matured";
  nextDistribution: string;
  investedDate: string;
}

export const mockInvestments: Investment[] = [
  {
    id: "INV-001",
    spvName: "Kenya Solar Grid SPV",
    asset: "Solar Energy",
    amountInvested: "$25,000",
    currency: "USDC",
    currentValue: "$27,312",
    irr: "18.5%",
    status: "Active",
    nextDistribution: "Mar 15, 2026",
    investedDate: "Jan 10, 2026",
  },
  {
    id: "INV-002",
    spvName: "Lagos Water Treatment SPV",
    asset: "Water Infrastructure",
    amountInvested: "$50,000",
    currency: "USDT",
    currentValue: "$53,150",
    irr: "14.2%",
    status: "Distributing",
    nextDistribution: "Mar 22, 2026",
    investedDate: "Dec 5, 2025",
  },
];

export const mockPortfolioStats = {
  totalInvested: "$75,000",
  currentValue: "$80,462",
  totalYield: "$5,462",
  yieldPercent: "+7.3%",
  activeSpvs: 2,
  nextPayout: "Mar 15, 2026",
  walletBalance: "$42,580 USDC",
};

export const mockTransactions = [
  { id: "TX-001", type: "Investment", spv: "Kenya Solar Grid SPV", amount: "$25,000", date: "Jan 10, 2026", hash: "0xabc1...ef42" },
  { id: "TX-002", type: "Investment", spv: "Lagos Water Treatment SPV", amount: "$50,000", date: "Dec 5, 2025", hash: "0xdef3...a891" },
  { id: "TX-003", type: "Distribution", spv: "Lagos Water Treatment SPV", amount: "+$2,130", date: "Feb 22, 2026", hash: "0x1234...5678" },
  { id: "TX-004", type: "Distribution", spv: "Kenya Solar Grid SPV", amount: "+$1,156", date: "Feb 15, 2026", hash: "0x9abc...def0" },
];
