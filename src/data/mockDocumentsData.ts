import type { ProcessStepStatus } from "./mockDashboardData";

export type DocStatus = "verified" | "pending" | "action_required" | "not_uploaded" | "locked";
export type DocSource = "business" | "platform";
export type DocAction = "view" | "download" | "sign" | "upload";

/** Process stages that documents belong to */
export type ProcessStage =
  | "document_submission"
  | "asset_standardization"
  | "spv_deployment"
  | "listing"
  | "funding"
  | "capital_disbursement";

export const stageLabels: Record<ProcessStage, string> = {
  document_submission: "Document Submission",
  asset_standardization: "Asset Standardization",
  spv_deployment: "SPV Deployment",
  listing: "Listing",
  funding: "Funding",
  capital_disbursement: "Capital Disbursement",
};

export const stageIcons: Record<ProcessStage, string> = {
  document_submission: "📄",
  asset_standardization: "⚙️",
  spv_deployment: "🏛️",
  listing: "🚀",
  funding: "💵",
  capital_disbursement: "💰",
};

/** Maps process step id (1-6) to stage key */
export const stepIdToStage: Record<number, ProcessStage> = {
  1: "document_submission",
  2: "asset_standardization",
  3: "spv_deployment",
  4: "listing",
  5: "funding",
  6: "capital_disbursement",
};

export interface ProjectDocument {
  id: string;
  name: string;
  description: string;
  category: DocumentCategory;
  status: DocStatus;
  source: DocSource;
  stage: ProcessStage;
  actions: DocAction[];
  fileName?: string;
  fileSize?: string;
  uploadedDate?: string;
  statusNote?: string;
  /** Sub-phase within a stage (e.g. "SPV Creation", "Legal Agreements") */
  subPhase?: string;
}

export type DocumentCategory =
  | "legal"
  | "identity"
  | "asset"
  | "financial"
  | "contracts"
  | "platform";

export const categoryLabels: Record<DocumentCategory, string> = {
  legal: "Legal & Registration",
  identity: "Identity & KYC",
  asset: "Asset-Specific",
  financial: "Financial",
  contracts: "Contracts & Agreements",
  platform: "Platform-Generated",
};

export const categoryIcons: Record<DocumentCategory, string> = {
  legal: "🏛️",
  identity: "🪪",
  asset: "🗺️",
  financial: "💰",
  contracts: "🤝",
  platform: "📋",
};

// ─── Stage 1: Document Submission (user-uploaded) ───

const stage1Docs: ProjectDocument[] = [
  { id: "d1", name: "RCCM Certificate", description: "Legal registration — Tribunal de Grande Instance de Bamenda. RC/BAM/2009/B/0312.", category: "legal", status: "verified", source: "business", stage: "document_submission", actions: ["view", "download"], fileName: "MHCC_RCCM_RC_BAM_2009.pdf", fileSize: "2.1MB", uploadedDate: "Sep 4, 2024" },
  { id: "d2", name: "Tax Identification (NIU) Certificate", description: "Tax registration — Centre des Impôts de Bamenda. P 043 18862 Q.", category: "legal", status: "verified", source: "business", stage: "document_submission", actions: ["view", "download"], fileName: "MHCC_NIU_Certificate_2024.pdf", fileSize: "0.8MB", uploadedDate: "Sep 4, 2024" },
  { id: "d3", name: "MINADER Registration Certificate", description: "Official registration with the Ministry of Agriculture, Northwest Region.", category: "legal", status: "verified", source: "business", stage: "document_submission", actions: ["view", "download"], fileName: "MHCC_MINADER_Registration_2023.pdf", fileSize: "1.3MB", uploadedDate: "Sep 4, 2024" },
  { id: "d4", name: "Articles of Association / Statuts", description: "Founding statutes including governance, membership rules, profit distribution.", category: "legal", status: "verified", source: "business", stage: "document_submission", actions: ["view", "download"], fileName: "MHCC_Statuts_2009_updated2022.pdf", fileSize: "3.4MB", uploadedDate: "Sep 4, 2024" },
  { id: "d5", name: "National ID — Emmanuel Nkweti (President)", description: "CNI confirmed via KYC check against ANTIC national ID database.", category: "identity", status: "verified", source: "business", stage: "document_submission", actions: ["view", "download"], fileName: "Nkweti_Emmanuel_CNI_Front_Back.jpg", fileSize: "1.8MB", uploadedDate: "Sep 4, 2024", statusNote: "KYC Passed" },
  { id: "d6", name: "National ID — Agnes Fon (Secretary)", description: "CNI of co-signatory. KYC check performed.", category: "identity", status: "verified", source: "business", stage: "document_submission", actions: ["view", "download"], fileName: "Fon_Agnes_CNI_Front_Back.jpg", fileSize: "1.6MB", uploadedDate: "Sep 5, 2024", statusNote: "KYC Passed" },
  { id: "d7", name: "Land Titles (12 parcels, 480ha)", description: "8 freehold titles + 4 customary tenure certificates (ACT). 280ha fully titled.", category: "asset", status: "verified", source: "business", stage: "document_submission", actions: ["view", "download"], fileName: "TF_001–TF_012 (12 PDFs)", fileSize: "24.6MB", uploadedDate: "Sep 6, 2024", statusNote: "Partial title (8/12 full)" },
  { id: "d8", name: "GPS Survey / Farm Boundary Data", description: "Full GPS boundary survey of 480ha by Géo-Mesure Cameroun.", category: "asset", status: "verified", source: "business", stage: "document_submission", actions: ["view", "download"], fileName: "MHCC_GPS_Survey_2024.kml", fileSize: "3.2MB", uploadedDate: "Sep 7, 2024" },
  { id: "d9", name: "ONCC Export Licence", description: "Export licence from Office National du Café et du Cacao. Valid through June 2026.", category: "asset", status: "verified", source: "business", stage: "document_submission", actions: ["view", "download"], fileName: "MHCC_ONCC_ExportLicence_2024-2026.pdf", fileSize: "1.1MB", uploadedDate: "Sep 5, 2024" },
  { id: "d10", name: "Yield History (3 seasons)", description: "Certified harvest records — cherry intake, milled output, export volumes.", category: "asset", status: "verified", source: "business", stage: "document_submission", actions: ["view", "download"], fileName: "MHCC_YieldHistory_3yr.pdf", fileSize: "2.8MB", uploadedDate: "Sep 6, 2024" },
  { id: "d11", name: "Soil Analysis Reports (6 sites)", description: "Independent analysis from IRAD — NPK levels, pH, organic matter, moisture retention.", category: "asset", status: "verified", source: "business", stage: "document_submission", actions: ["view", "download"], fileName: "MHCC_IRAD_SoilAnalysis_2024.pdf", fileSize: "3.6MB", uploadedDate: "Sep 9, 2024" },
  { id: "d12", name: "Climate / Agro-Ecological Zone Report", description: "Bafut classified in Agro-Ecological Zone 4, 10-year rainfall trend data.", category: "asset", status: "verified", source: "business", stage: "document_submission", actions: ["view", "download"], fileName: "Bafut_ClimateReport_DMN_2024.pdf", fileSize: "2.3MB", uploadedDate: "Sep 12, 2024" },
  { id: "d13", name: "3-Year Financial Statements (audited)", description: "FY2021–2023 audited by Cabinet Comptable Mbah & Associés, Bamenda.", category: "financial", status: "verified", source: "business", stage: "document_submission", actions: ["view", "download"], fileName: "MHCC_FinancialStatements_2021-2023.pdf", fileSize: "5.1MB", uploadedDate: "Sep 9, 2024" },
  { id: "d14", name: "Business Plan 2024–2027", description: "3-year plan with crop cycle, input requirements, labour forecast, revenue projections.", category: "financial", status: "verified", source: "business", stage: "document_submission", actions: ["view", "download"], fileName: "MHCC_BusinessPlan_2024-2027.pdf", fileSize: "8.2MB", uploadedDate: "Sep 10, 2024" },
  { id: "d15", name: "Bank Account Confirmation Letter", description: "UBA Bamenda confirming account details and 12-month average balance.", category: "financial", status: "verified", source: "business", stage: "document_submission", actions: ["view", "download"], fileName: "MHCC_UBA_BankLetter_Sep2024.pdf", fileSize: "0.6MB", uploadedDate: "Sep 10, 2024" },
  { id: "d16", name: "Member Register (340 farmers)", description: "Full list with NIC, village, hectares, parcel GPS reference.", category: "financial", status: "verified", source: "business", stage: "document_submission", actions: ["view", "download"], fileName: "MHCC_MemberRegister_Sep2024.xlsx", fileSize: "1.2MB", uploadedDate: "Sep 11, 2024" },
  { id: "d17", name: "Off-Take Agreement — Sucafina Cameroon", description: "90MT Grade 1 washed Arabica @ USD 3.40/kg FOB Douala. Notarised in Geneva.", category: "contracts", status: "verified", source: "business", stage: "document_submission", actions: ["view", "download"], fileName: "MHCC_Sucafina_OfftakeAgreement_2024.pdf", fileSize: "4.2MB", uploadedDate: "Sep 8, 2024" },
  { id: "d18", name: "Board Resolution Authorising Fundraising", description: "Notarised extract from Board Minutes (Sep 2, 2024) authorising up to 50M FCFA raise.", category: "contracts", status: "verified", source: "business", stage: "document_submission", actions: ["view", "download"], fileName: "MHCC_BoardResolution_Sep2024.pdf", fileSize: "0.9MB", uploadedDate: "Sep 12, 2024" },
];

// ─── Stage 2: Asset Standardization (platform-generated) ───

const stage2Docs: ProjectDocument[] = [
  { id: "as1", name: "Project Dossier with Asset Score™ (AS-88)", description: "AI-generated Asset Score™ report with 6-dimension breakdown. Ref: AS-MHCC-2025-001.", category: "platform", status: "verified", source: "platform", stage: "asset_standardization", actions: ["view", "download"], fileName: "AS_Report_MHCC_2025_001.pdf", fileSize: "3.8MB", uploadedDate: "Sep 15, 2024", subPhase: "Credit Scoring" },
  { id: "as2", name: "Standardised Term Sheet", description: "AI-generated term sheet — 47M FCFA, 12.5% effective rate, 36-month term, milestone schedule.", category: "platform", status: "verified", source: "platform", stage: "asset_standardization", actions: ["view", "download", "sign"], fileName: "TermSheet_SPV01_MHCC.pdf", fileSize: "1.4MB", uploadedDate: "Sep 15, 2024", statusNote: "Signed", subPhase: "Term Sheet" },
  { id: "as3", name: "Financial Model (3-year projection)", description: "AI-projected revenue, costs, and investor returns over the 36-month SPV term.", category: "platform", status: "verified", source: "platform", stage: "asset_standardization", actions: ["view", "download"], fileName: "FinancialModel_SPV01_MHCC.pdf", fileSize: "2.1MB", uploadedDate: "Sep 15, 2024", subPhase: "Financial Modelling" },
];

// ─── Stage 3: SPV Deployment ───

const stage3Docs: ProjectDocument[] = [
  // SPV Creation sub-phase
  { id: "spv1", name: "SPV Articles of Association", description: "Articles of Bakua SPV-01 Limited — SARL structure under OHADA Uniform Act.", category: "platform", status: "verified", source: "platform", stage: "spv_deployment", actions: ["view", "download"], fileName: "SPV01_ArticlesOfAssociation.pdf", fileSize: "2.8MB", uploadedDate: "Sep 16, 2024", subPhase: "SPV Creation" },
  { id: "spv2", name: "SPV Incorporation Certificate", description: "Bakua SPV-01 Limited — RC/YDE/2024/B/4417. SARL incorporated in Yaoundé.", category: "platform", status: "verified", source: "platform", stage: "spv_deployment", actions: ["view", "download"], fileName: "SPV01_IncorporationCert.pdf", fileSize: "0.7MB", uploadedDate: "Sep 19, 2024", subPhase: "SPV Creation" },
  // Legal Agreements sub-phase
  { id: "spv3", name: "Backup Service Agreement", description: "Agreement appointing backup servicer for continuity of SPV operations.", category: "platform", status: "verified", source: "platform", stage: "spv_deployment", actions: ["view", "download"], fileName: "SPV01_BackupServiceAgreement.pdf", fileSize: "1.6MB", uploadedDate: "Sep 22, 2024", subPhase: "Legal Agreements" },
  { id: "spv4", name: "Facility Agreement", description: "Master loan agreement executed between Bakua SPV-01 Ltd and MHCC.", category: "platform", status: "verified", source: "platform", stage: "spv_deployment", actions: ["view", "download"], fileName: "FacilityAgreement_SPV01.pdf", fileSize: "6.3MB", uploadedDate: "Sep 20, 2024", subPhase: "Legal Agreements" },
  { id: "spv5", name: "Land Charge Agreement", description: "Charge over project land parcels securing SPV obligations.", category: "platform", status: "verified", source: "platform", stage: "spv_deployment", actions: ["view", "download"], fileName: "SPV01_LandChargeAgreement.pdf", fileSize: "2.1MB", uploadedDate: "Sep 23, 2024", subPhase: "Legal Agreements" },
  { id: "spv6", name: "Chattel Security Agreement", description: "Security interest over movable assets (equipment, inventory, receivables).", category: "platform", status: "verified", source: "platform", stage: "spv_deployment", actions: ["view", "download"], fileName: "SPV01_ChattelSecurity.pdf", fileSize: "1.9MB", uploadedDate: "Sep 23, 2024", subPhase: "Legal Agreements" },
  { id: "spv7", name: "Off-Take Assignment Notice", description: "Notice assigning off-take proceeds to SPV collection account.", category: "platform", status: "verified", source: "platform", stage: "spv_deployment", actions: ["view", "download"], fileName: "SPV01_OfftakeAssignment.pdf", fileSize: "0.8MB", uploadedDate: "Sep 24, 2024", subPhase: "Legal Agreements" },
  { id: "spv8", name: "Blocked Collection Account Agreement", description: "Agreement establishing controlled collection account at UBA Cameroon.", category: "platform", status: "verified", source: "platform", stage: "spv_deployment", actions: ["view", "download"], fileName: "SPV01_BlockedAccountAgreement.pdf", fileSize: "1.4MB", uploadedDate: "Sep 25, 2024", subPhase: "Legal Agreements" },
  { id: "spv9", name: "Personal Guarantee — Emmanuel Nkweti", description: "Personal guarantee from MHCC President securing SPV obligations.", category: "platform", status: "verified", source: "platform", stage: "spv_deployment", actions: ["view", "download"], fileName: "SPV01_PersonalGuarantee_Nkweti.pdf", fileSize: "0.6MB", uploadedDate: "Sep 26, 2024", subPhase: "Legal Agreements" },
  { id: "spv10", name: "Personal Guarantee — Agnes Fon", description: "Personal guarantee from MHCC Secretary co-securing SPV obligations.", category: "platform", status: "verified", source: "platform", stage: "spv_deployment", actions: ["view", "download"], fileName: "SPV01_PersonalGuarantee_Fon.pdf", fileSize: "0.5MB", uploadedDate: "Sep 26, 2024", subPhase: "Legal Agreements" },
  { id: "spv11", name: "Crop Insurance Assignment", description: "Assignment of crop insurance policy proceeds to SPV as additional security.", category: "platform", status: "verified", source: "platform", stage: "spv_deployment", actions: ["view", "download"], fileName: "SPV01_CropInsuranceAssignment.pdf", fileSize: "0.9MB", uploadedDate: "Sep 28, 2024", subPhase: "Legal Agreements" },
  { id: "spv12", name: "Closing Certificate", description: "Certificate confirming all conditions precedent satisfied for SPV closing.", category: "platform", status: "verified", source: "platform", stage: "spv_deployment", actions: ["view", "download"], fileName: "SPV01_ClosingCertificate.pdf", fileSize: "0.4MB", uploadedDate: "Oct 1, 2024", subPhase: "Closing" },
];

// ─── Stage 4: Listing ───

const stage4Docs: ProjectDocument[] = [
  { id: "lf1", name: "Smart Contract Technical Specification", description: "Technical specification document for SPV tokenization smart contract on Base Network.", category: "platform", status: "verified", source: "platform", stage: "listing", actions: ["view", "download"], fileName: "SPV01_SC_TechSpec_v1.pdf", fileSize: "3.2MB", uploadedDate: "Oct 2, 2024", subPhase: "Smart Contract" },
  { id: "lf2", name: "Smart Contract Audit Report", description: "Independent audit of SPV smart contract by CertiK. No critical findings.", category: "platform", status: "verified", source: "platform", stage: "listing", actions: ["view", "download"], fileName: "SPV01_SC_AuditReport_CertiK.pdf", fileSize: "4.5MB", uploadedDate: "Oct 5, 2024", subPhase: "Smart Contract" },
  { id: "lf3", name: "Smart Contract Deployment Record", description: "On-chain deployment record — Base Network, contract address, constructor args.", category: "platform", status: "verified", source: "platform", stage: "listing", actions: ["view", "download"], fileName: "SPV01_SC_DeploymentRecord.pdf", fileSize: "0.6MB", uploadedDate: "Oct 6, 2024", subPhase: "Smart Contract" },
  { id: "lf4", name: "IPFS Anchoring Certificate", description: "Certificate confirming all SPV documents anchored to IPFS with content hashes.", category: "platform", status: "verified", source: "platform", stage: "listing", actions: ["view", "download"], fileName: "SPV01_IPFS_AnchoringCert.pdf", fileSize: "0.3MB", uploadedDate: "Oct 6, 2024", subPhase: "Smart Contract" },
  { id: "lf5", name: "Investor Marketplace Listing Document", description: "Legal offering document for retail and institutional investors. Includes risk disclosures.", category: "platform", status: "verified", source: "platform", stage: "listing", actions: ["view", "download"], fileName: "SPV01_MarketplaceListingDoc.pdf", fileSize: "8.7MB", uploadedDate: "Oct 8, 2024", subPhase: "Marketplace" },
];

// ─── Stage 5: Funding ───

const stage5Docs: ProjectDocument[] = [
  { id: "lf6", name: "Investor Token Conversion Confirmation", description: "Confirmation of token issuance to investors upon USDC deposit.", category: "platform", status: "verified", source: "platform", stage: "funding", actions: ["view", "download"], fileName: "SPV01_TokenConversion_Confirmation.pdf", fileSize: "1.1MB", uploadedDate: "Oct 18, 2024" },
  { id: "lf7", name: "Institutional Side Letter", description: "Side letter for institutional investors with enhanced reporting and governance rights.", category: "platform", status: "verified", source: "platform", stage: "funding", actions: ["view", "download"], fileName: "SPV01_InstitutionalSideLetter.pdf", fileSize: "2.3MB", uploadedDate: "Oct 15, 2024" },
  { id: "lf8", name: "Funding Completion Certificate", description: "Certificate confirming SPV fully funded — $78,250 USDC from 51 investors.", category: "platform", status: "verified", source: "platform", stage: "funding", actions: ["view", "download"], fileName: "SPV01_FundingCompletionCert.pdf", fileSize: "0.5MB", uploadedDate: "Oct 18, 2024" },
];

// ─── Stage 6: Capital Disbursement ───

const stage6Docs: ProjectDocument[] = [
  { id: "cd1", name: "Yellow Card Conversion Confirmation", description: "Confirmation of USDC → FCFA conversion via Yellow Card for milestone disbursement.", category: "platform", status: "verified", source: "platform", stage: "capital_disbursement", actions: ["view", "download"], fileName: "SPV01_YellowCard_Conversion_M1-M4.pdf", fileSize: "1.8MB", uploadedDate: "Oct 21, 2024", subPhase: "Disbursement" },
];

// ─── Combined export ───

export const mockDocuments: ProjectDocument[] = [
  ...stage1Docs,
  ...stage2Docs,
  ...stage3Docs,
  ...stage4Docs,
  ...stage5Docs,
  ...stage6Docs,
];

/** Get documents for a specific process stage */
export function getDocsByStage(stage: ProcessStage): ProjectDocument[] {
  return mockDocuments.filter((d) => d.stage === stage);
}

/** Get documents grouped by sub-phase within a stage */
export function getDocsBySubPhase(stage: ProcessStage): { subPhase: string; docs: ProjectDocument[] }[] {
  const stageDocs = getDocsByStage(stage);
  const phases = new Map<string, ProjectDocument[]>();
  for (const doc of stageDocs) {
    const key = doc.subPhase || "Documents";
    if (!phases.has(key)) phases.set(key, []);
    phases.get(key)!.push(doc);
  }
  return Array.from(phases.entries()).map(([subPhase, docs]) => ({ subPhase, docs }));
}

/** Determine stage status from process steps */
export function getStageStatus(stepId: number, processSteps: { id: number; status: string }[]): ProcessStepStatus {
  const step = processSteps.find((s) => s.id === stepId);
  return (step?.status as ProcessStepStatus) || "pending";
}

// Keep backward-compat exports
export const requiredDocsByAssetType: Record<string, { name: string; description: string; category: DocumentCategory }[]> = {
  Agriculture: stage1Docs.map((d) => ({ name: d.name, description: d.description, category: d.category })),
};
