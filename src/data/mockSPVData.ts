export interface ScoreDimension {
  name: string;
  rawInput: string;
  standardizedOutput: string;
  weight: string;
  score: number;
}

export interface LegalDocument {
  id: number;
  name: string;
  purpose: string;
  parties: string;
  signedDate: string;
}

export interface ContractAddress {
  name: string;
  address: string;
  deployedDate: string;
}

export const mockScoreDimensions: ScoreDimension[] = [
  { name: "Land Security & Tenure", rawInput: "8/12 full title; 4/12 ACT; GPS validated 480ha", standardizedOutput: "Tenure Security Index: 0.83 (83% fully titled)", weight: "20%", score: 88 },
  { name: "Pedoclimatic Fitness", rawInput: "pH 5.8–6.4, N/P/K balanced; 1,820mm/yr bimodal; alt. 1,350–1,780m", standardizedOutput: "Soil Suitability Index: 0.88. Optimal altitude for SL-28 Arabica.", weight: "18%", score: 85 },
  { name: "Crop Variety & Historical Yield", rawInput: "SL-28 (65%), Blue Mountain (25%), Jackson (10%). 3-yr avg: 820kg/ha", standardizedOutput: "Yield Index: 0.92. Above regional mean of 680kg/ha.", weight: "17%", score: 92 },
  { name: "Market Access & Off-Taker", rawInput: "Sucafina contract: 90MT @ USD 3.40/kg; D&B: AAA rated", standardizedOutput: "Off-taker D&B score: 5A1 (highest). Fixed floor price.", weight: "20%", score: 91 },
  { name: "Operator Capability", rawInput: "15 yrs experience; 3 technicians; 2 prior loans repaid", standardizedOutput: "Operator Index: 0.84. Prior credit fully repaid.", weight: "13%", score: 84 },
  { name: "Financial Health", rawInput: "FY2023 revenue: 62M FCFA; net margin: 11%; D/E: 0.24", standardizedOutput: "Financial Index: 0.86. Revenue +18% CAGR 3yr.", weight: "12%", score: 86 },
];

export const mockLegalDocs: LegalDocument[] = [
  { id: 1, name: "Facility Agreement", purpose: "Master loan: 47M FCFA at 12.5% p.a.; 36-month term; milestone disbursement", parties: "Bakua SPV-01 Ltd / MHCC", signedDate: "Sep 20, 2024" },
  { id: 2, name: "Off-Take Assignment Notice", purpose: "MHCC assigns Sucafina payment rights to SPV-01. Sucafina countersigned.", parties: "MHCC / SPV-01 / Sucafina", signedDate: "Sep 23, 2024" },
  { id: 3, name: "Land Charge Agreement (Hypothèque)", purpose: "First-ranking charge over 8 freehold parcels (280ha) as security.", parties: "MHCC / SPV-01", signedDate: "Sep 26, 2024" },
  { id: 4, name: "Blocked Collection Account Agreement", purpose: "Tripartite escrow with Ecobank. MHCC has no withdrawal rights.", parties: "MHCC / SPV-01 / Ecobank", signedDate: "Sep 28, 2024" },
  { id: 5, name: "Security Agreement (Chattel)", purpose: "Charge over mill processing equipment (appraised 8.4M FCFA).", parties: "MHCC / SPV-01", signedDate: "Sep 28, 2024" },
  { id: 6, name: "Personal Guarantee Agreements", purpose: "Personal guarantees from President & Secretary (5M FCFA each).", parties: "Nkweti / Fon / SPV-01", signedDate: "Oct 1, 2024" },
  { id: 7, name: "Crop Insurance Assignment", purpose: "SAAR crop insurance (35M FCFA) assigned to SPV-01 as beneficiary.", parties: "MHCC / SPV-01 / SAAR", signedDate: "Oct 2, 2024" },
  { id: 8, name: "Bakua Service Agreement", purpose: "Origination fee 2%, annual platform fee 2% AUM, IoT coordination.", parties: "MHCC / Bakua Finance", signedDate: "Oct 4, 2024" },
];

export const mockContractAddresses: ContractAddress[] = [
  { name: "SPV-01 Main Vault", address: "0x7f3A9e2C4B1d88F2a47E3f9C6D0b5A1E8c2F4d6", deployedDate: "Oct 8, 2024" },
  { name: "Investor Token (SPV01-MHCC)", address: "0x3d8B2f1A7C4e9F0b6D3a5E8c1F2B4d7A9e0C3f", deployedDate: "Oct 8, 2024" },
  { name: "Chainlink Oracle Adapter", address: "0x1a5C8F3B7E2d4A9f0C6b8D1e3F5a7B2c4E8d0f", deployedDate: "Oct 7, 2024" },
  { name: "Disbursement Waterfall", address: "0x9b4D1e6F3a8C2f5A7e0B9d3C1F4b8E2a5D7f1c", deployedDate: "Oct 8, 2024" },
];

export const mockSPVEntity = {
  fullName: "Bakua SPV-01 Limited",
  registrationNo: "RC/YDE/2024/B/4417",
  jurisdiction: "Republic of Cameroon",
  companyType: "SARL — Private Limited Company",
  registeredOffice: "Rue Narvick, Bastos, Yaoundé",
  incorporationDate: "September 19, 2024",
  capitalSocial: "1,000,000 FCFA",
  shareholder: "Bakua Finance SARL (100% initially → tokenised)",
  network: "Base (Coinbase L2)",
  auditor: "Hacken.io — Report HAC-2024-1089",
};

// Capital & Fundraising data

export interface Milestone {
  id: string;
  name: string;
  amount: string;
  amountRaw: number;
  recipients: string;
  oracleTrigger: string;
  dateDisbursed: string;
  status: "disbursed" | "pending";
}

export interface InvestorSegment {
  name: string;
  usdcRaised: string;
  fcfaEquivalent: string;
  percentOfSPV: string;
  investorCount: number;
}

export const mockMilestones: Milestone[] = [
  { id: "M1", name: "Origination & Setup", amount: "8,350,000 FCFA", amountRaw: 8350000, recipients: "Bakua (origination) · AgriSensors Kenya (IoT) · Bakua ops", oracleTrigger: "Document completeness ≥ 97/100 + smart contract deployed", dateDisbursed: "Oct 21, 2024", status: "disbursed" },
  { id: "M2", name: "Pre-Planting Inputs", amount: "12,500,000 FCFA", amountRaw: 12500000, recipients: "MHCC (fertiliser + pesticides) · MHCC (labour advance)", oracleTrigger: "Soil moisture > 18% (6 probes) + land GPS match confirmed", dateDisbursed: "Nov 4, 2024", status: "disbursed" },
  { id: "M3", name: "Mid-Season Operations", amount: "9,500,000 FCFA", amountRaw: 9500000, recipients: "MHCC (labour, crop protection) · Mill maintenance", oracleTrigger: "NDVI ≥ 0.55 confirmed by Sentinel-2 + IoT canopy health OK", dateDisbursed: "Jan 8, 2025", status: "disbursed" },
  { id: "M4", name: "Harvest Advance", amount: "11,750,000 FCFA", amountRaw: 11750000, recipients: "MHCC (harvest pickers, bags, milling)", oracleTrigger: "Weighbridge confirms ≥ 60MT cherry intake", dateDisbursed: "Apr 15, 2025", status: "disbursed" },
  { id: "M5", name: "Processing & Export", amount: "4,900,000 FCFA", amountRaw: 4900000, recipients: "MHCC (export logistics, port fees, ONCC certification)", oracleTrigger: "ONCC export certificate + Sucafina inspection report", dateDisbursed: "Pending: June 2025", status: "pending" },
];

export const mockInvestorSegments: InvestorSegment[] = [
  { name: "Retail / DeFi", usdcRaised: "$35,300", fcfaEquivalent: "21.2M FCFA", percentOfSPV: "45.1%", investorCount: 47 },
  { name: "Mercy Corps Ventures", usdcRaised: "$15,000", fcfaEquivalent: "9.0M FCFA", percentOfSPV: "19.1%", investorCount: 1 },
  { name: "Family Office A (Lagos)", usdcRaised: "$9,500", fcfaEquivalent: "5.7M FCFA", percentOfSPV: "12.1%", investorCount: 1 },
  { name: "Family Office B (London)", usdcRaised: "$6,800", fcfaEquivalent: "4.1M FCFA", percentOfSPV: "8.7%", investorCount: 1 },
  { name: "Bakua Co-Investment", usdcRaised: "$11,650", fcfaEquivalent: "7.0M FCFA", percentOfSPV: "14.9%", investorCount: 1 },
];

export const mockFundingSummary = {
  totalTarget: "47,000,000 FCFA",
  totalTargetUSD: "$78,250 USDC",
  totalFunded: "47,000,000 FCFA",
  fundedPercent: 100,
  totalInvestors: 51,
  fundingDuration: "10 days",
  listingDate: "Oct 8, 2024",
  fullyFundedDate: "Oct 18, 2024",
  totalDisbursed: "42,100,000 FCFA",
  disbursedPercent: 89.6,
  remainingInVault: "4,900,000 FCFA",
  dsraReserve: "1,260,000 FCFA",
};
