export type ProcessStepStatus = "completed" | "in_progress" | "pending";

export interface ProcessStep {
  id: number;
  title: string;
  description: string;
  status: ProcessStepStatus;
  dateRange: string;
  details?: string;
  actionLabel?: string;
}

export interface KPIData {
  label: string;
  value: string;
  subtext?: string;
}

export interface SPVSummary {
  id: string;
  name: string;
  entity: string;
  assetType: string;
  capitalTarget: string;
  capitalTargetRaw: number;
  fundedPercent: number;
  creditScore: string;
  creditScoreRaw: number;
  irrTarget: string;
  irrTargetRaw: number;
  term: string;
  status: string;
  processSteps: ProcessStep[];
}

export const mockSPV: SPVSummary = {
  id: "SPV-01",
  name: "Menoua Highlands Coffee Cooperative",
  entity: "Bakua SPV-01 Limited",
  assetType: "Agriculture",
  capitalTarget: "47M FCFA",
  capitalTargetRaw: 47000000,
  fundedPercent: 100,
  creditScore: "AS-88",
  creditScoreRaw: 88,
  irrTarget: "19.2%",
  irrTargetRaw: 19.2,
  term: "36 months",
  status: "Active",
  processSteps: [
    {
      id: 1,
      title: "Document Submission",
      description: "Register and upload all required project documents for review.",
      status: "completed",
      dateRange: "Sep 3–12, 2024",
      details: "18 documents submitted. Document Completeness Score: 97/100.",
    },
    {
      id: 2,
      title: "Asset Standardization",
      description: "AI engine processes documents, generates Asset Score™ and financial model.",
      status: "completed",
      dateRange: "Sep 13–15, 2024",
      details: "Asset Score™ AS-88 (Standard Grade). 6 dimensions analysed. AI Engine v2.1.",
    },
    {
      id: 3,
      title: "SPV Deployment",
      description: "Legal entity incorporated, contracts executed, smart contract deployed on-chain.",
      status: "completed",
      dateRange: "Sep 16 – Oct 8, 2024",
      details: "Bakua SPV-01 Ltd incorporated (RC/YDE/2024/B/4417). 8 legal docs executed. Smart contract on Base Network.",
    },
    {
      id: 4,
      title: "Listing & Funding",
      description: "SPV listed on marketplace. Investors deposit capital until target is met.",
      status: "completed",
      dateRange: "Oct 8–18, 2024",
      details: "Fully funded in 10 days. 51 investors across 3 continents. $78,250 USDC raised.",
    },
    {
      id: 5,
      title: "Capital Deployment",
      description: "Funds released in milestones, verified by IoT oracles and smart contracts.",
      status: "in_progress",
      dateRange: "Oct 21, 2024 – ongoing",
      details: "4 of 5 milestones disbursed (42.1M FCFA). Milestone 5 pending: 4.9M FCFA.",
    },
  ],
};

export const mockKPIs: KPIData[] = [
  { label: "Total Capital Target", value: "47M FCFA", subtext: "~$78,300 USD" },
  { label: "Funded", value: "100%", subtext: "Fully funded" },
  { label: "Asset Score™", value: "AS-88", subtext: "Standard Grade" },
  { label: "IRR Target", value: "19.2%", subtext: "36-month term" },
];

export const mockCompany = {
  name: "Menoua Highlands Coffee Cooperative",
  shortName: "MHCC",
  contact: "Emmanuel Nkweti",
  role: "President",
  country: "Cameroon",
  assetType: "Agriculture",
  spvCount: 1,
};
