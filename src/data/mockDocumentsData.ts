export type DocStatus = "verified" | "pending" | "action_required" | "not_uploaded";
export type DocSource = "business" | "platform";

export interface ProjectDocument {
  id: string;
  name: string;
  description: string;
  category: DocumentCategory;
  status: DocStatus;
  source: DocSource;
  fileName?: string;
  fileSize?: string;
  uploadedDate?: string;
  statusNote?: string;
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

// Generic required documents per asset type
export const requiredDocsByAssetType: Record<string, { name: string; description: string; category: DocumentCategory }[]> = {
  Agriculture: [
    { name: "RCCM / Business Registration Certificate", description: "Legal registration certificate proving entity's existence under local law.", category: "legal" },
    { name: "Tax Identification Certificate", description: "Tax registration confirming fiscal compliance status.", category: "legal" },
    { name: "Ministry of Agriculture Registration", description: "Official registration with the relevant agricultural ministry.", category: "legal" },
    { name: "Articles of Association / Statutes", description: "Founding documents including governance structure and membership rules.", category: "legal" },
    { name: "National ID — Primary Signatory", description: "Government-issued ID of the primary signatory for KYC verification.", category: "identity" },
    { name: "National ID — Secondary Signatory", description: "Government-issued ID of the secondary signatory / co-signatory.", category: "identity" },
    { name: "Land Titles / Tenure Certificates", description: "Proof of land ownership or long-term tenure rights for project parcels.", category: "asset" },
    { name: "GPS Survey / Farm Boundary Data", description: "GPS boundary survey data (.KML or PDF map) for all project land.", category: "asset" },
    { name: "Export / Operating Licence", description: "Relevant licence for export or commercial operations.", category: "asset" },
    { name: "Yield History (3 years)", description: "Certified production records for the past 3 seasons or years.", category: "asset" },
    { name: "Soil / Environmental Analysis", description: "Independent analysis reports (soil, water, environmental).", category: "asset" },
    { name: "Climate / Agro-Ecological Report", description: "Climate classification and weather trend data for project area.", category: "asset" },
    { name: "3-Year Financial Statements (audited)", description: "Audited income statements, balance sheets, and cash flow statements.", category: "financial" },
    { name: "Business Plan / Project Description", description: "Multi-year business plan with projections, capital utilisation schedule.", category: "financial" },
    { name: "Bank Account Confirmation Letter", description: "Official bank letter confirming account details and standing.", category: "financial" },
    { name: "Member / Stakeholder Register", description: "Complete list of members, shareholders, or key stakeholders.", category: "financial" },
    { name: "Off-Take / Purchase Agreement", description: "Binding agreement with a buyer for project output.", category: "contracts" },
    { name: "Board Resolution Authorising Fundraising", description: "Notarised board resolution authorising the capital raise.", category: "contracts" },
  ],
  "Energy & Solar": [
    { name: "Business Registration Certificate", description: "Legal registration certificate.", category: "legal" },
    { name: "Tax Identification Certificate", description: "Tax registration certificate.", category: "legal" },
    { name: "Energy Regulatory Licence", description: "Licence from the energy regulator authorising generation/distribution.", category: "legal" },
    { name: "Articles of Association", description: "Founding documents of the entity.", category: "legal" },
    { name: "National ID — Primary Signatory", description: "Government-issued ID for KYC.", category: "identity" },
    { name: "National ID — Secondary Signatory", description: "Government-issued ID of co-signatory.", category: "identity" },
    { name: "Site Ownership / Lease Agreement", description: "Proof of ownership or lease for the installation site.", category: "asset" },
    { name: "Environmental Impact Assessment", description: "EIA report approved by the relevant authority.", category: "asset" },
    { name: "Technical Feasibility Study", description: "Engineering feasibility study for the energy project.", category: "asset" },
    { name: "Equipment Specifications", description: "Specifications and warranties for solar panels, inverters, etc.", category: "asset" },
    { name: "Grid Connection Agreement", description: "Agreement with utility for grid connection (if applicable).", category: "asset" },
    { name: "3-Year Financial Statements", description: "Audited financial statements.", category: "financial" },
    { name: "Business Plan / Revenue Model", description: "Multi-year business plan with energy production forecasts.", category: "financial" },
    { name: "Bank Account Confirmation", description: "Bank letter confirming account details.", category: "financial" },
    { name: "Power Purchase Agreement (PPA)", description: "Binding agreement for sale of generated power.", category: "contracts" },
    { name: "Board Resolution", description: "Board resolution authorising the fundraise.", category: "contracts" },
  ],
  default: [
    { name: "Business Registration Certificate", description: "Legal registration.", category: "legal" },
    { name: "Tax Identification Certificate", description: "Tax registration.", category: "legal" },
    { name: "Articles of Association", description: "Founding documents.", category: "legal" },
    { name: "National ID — Primary Signatory", description: "Government-issued ID.", category: "identity" },
    { name: "National ID — Secondary Signatory", description: "Co-signatory ID.", category: "identity" },
    { name: "Asset Ownership / Lease Documents", description: "Proof of ownership or lease.", category: "asset" },
    { name: "Technical / Feasibility Study", description: "Project feasibility report.", category: "asset" },
    { name: "3-Year Financial Statements", description: "Audited financial statements.", category: "financial" },
    { name: "Business Plan", description: "Multi-year business plan.", category: "financial" },
    { name: "Bank Account Confirmation", description: "Bank confirmation letter.", category: "financial" },
    { name: "Off-Take / Revenue Agreement", description: "Agreement for revenue generation.", category: "contracts" },
    { name: "Board Resolution", description: "Board resolution authorising the fundraise.", category: "contracts" },
  ],
};

// MHCC mock uploaded documents
export const mockDocuments: ProjectDocument[] = [
  { id: "d1", name: "RCCM Certificate", description: "Legal registration — Tribunal de Grande Instance de Bamenda. RC/BAM/2009/B/0312.", category: "legal", status: "verified", source: "business", fileName: "MHCC_RCCM_RC_BAM_2009.pdf", fileSize: "2.1MB", uploadedDate: "Sep 4, 2024" },
  { id: "d2", name: "Tax Identification (NIU) Certificate", description: "Tax registration — Centre des Impôts de Bamenda. P 043 18862 Q.", category: "legal", status: "verified", source: "business", fileName: "MHCC_NIU_Certificate_2024.pdf", fileSize: "0.8MB", uploadedDate: "Sep 4, 2024" },
  { id: "d3", name: "MINADER Registration Certificate", description: "Official registration with the Ministry of Agriculture, Northwest Region.", category: "legal", status: "verified", source: "business", fileName: "MHCC_MINADER_Registration_2023.pdf", fileSize: "1.3MB", uploadedDate: "Sep 4, 2024" },
  { id: "d4", name: "Articles of Association / Statuts", description: "Founding statutes including governance, membership rules, profit distribution.", category: "legal", status: "verified", source: "business", fileName: "MHCC_Statuts_2009_updated2022.pdf", fileSize: "3.4MB", uploadedDate: "Sep 4, 2024" },
  { id: "d5", name: "National ID — Emmanuel Nkweti (President)", description: "CNI confirmed via KYC check against ANTIC national ID database.", category: "identity", status: "verified", source: "business", fileName: "Nkweti_Emmanuel_CNI_Front_Back.jpg", fileSize: "1.8MB", uploadedDate: "Sep 4, 2024", statusNote: "KYC Passed" },
  { id: "d6", name: "National ID — Agnes Fon (Secretary)", description: "CNI of co-signatory. KYC check performed.", category: "identity", status: "verified", source: "business", fileName: "Fon_Agnes_CNI_Front_Back.jpg", fileSize: "1.6MB", uploadedDate: "Sep 5, 2024", statusNote: "KYC Passed" },
  { id: "d7", name: "Land Titles (12 parcels, 480ha)", description: "8 freehold titles + 4 customary tenure certificates (ACT). 280ha fully titled.", category: "asset", status: "verified", source: "business", fileName: "TF_001–TF_012 (12 PDFs)", fileSize: "24.6MB", uploadedDate: "Sep 6, 2024", statusNote: "Partial title (8/12 full)" },
  { id: "d8", name: "GPS Survey / Farm Boundary Data", description: "Full GPS boundary survey of 480ha by Géo-Mesure Cameroun. Cross-validated against Sentinel-2 NDVI.", category: "asset", status: "verified", source: "business", fileName: "MHCC_GPS_Survey_2024.kml", fileSize: "3.2MB", uploadedDate: "Sep 7, 2024" },
  { id: "d9", name: "ONCC Export Licence", description: "Export licence from Office National du Café et du Cacao. Valid through June 2026.", category: "asset", status: "verified", source: "business", fileName: "MHCC_ONCC_ExportLicence_2024-2026.pdf", fileSize: "1.1MB", uploadedDate: "Sep 5, 2024" },
  { id: "d10", name: "Yield History (3 seasons)", description: "Certified harvest records — cherry intake, milled output, export volumes. ONCC field inspector certified.", category: "asset", status: "verified", source: "business", fileName: "MHCC_YieldHistory_3yr.pdf", fileSize: "2.8MB", uploadedDate: "Sep 6, 2024" },
  { id: "d11", name: "Soil Analysis Reports (6 sites)", description: "Independent analysis from IRAD — NPK levels, pH, organic matter, moisture retention.", category: "asset", status: "verified", source: "business", fileName: "MHCC_IRAD_SoilAnalysis_2024.pdf", fileSize: "3.6MB", uploadedDate: "Sep 9, 2024" },
  { id: "d12", name: "Climate / Agro-Ecological Zone Report", description: "Bafut classified in Agro-Ecological Zone 4, 10-year rainfall trend data included.", category: "asset", status: "verified", source: "business", fileName: "Bafut_ClimateReport_DMN_2024.pdf", fileSize: "2.3MB", uploadedDate: "Sep 12, 2024" },
  { id: "d13", name: "3-Year Financial Statements (audited)", description: "FY2021–2023 audited by Cabinet Comptable Mbah & Associés, Bamenda.", category: "financial", status: "verified", source: "business", fileName: "MHCC_FinancialStatements_2021-2023.pdf", fileSize: "5.1MB", uploadedDate: "Sep 9, 2024" },
  { id: "d14", name: "Business Plan 2024–2027", description: "3-year plan with crop cycle, input requirements, labour forecast, revenue projections.", category: "financial", status: "verified", source: "business", fileName: "MHCC_BusinessPlan_2024-2027.pdf", fileSize: "8.2MB", uploadedDate: "Sep 10, 2024" },
  { id: "d15", name: "Bank Account Confirmation Letter", description: "UBA Bamenda confirming account details and 12-month average balance.", category: "financial", status: "verified", source: "business", fileName: "MHCC_UBA_BankLetter_Sep2024.pdf", fileSize: "0.6MB", uploadedDate: "Sep 10, 2024" },
  { id: "d16", name: "Member Register (340 farmers)", description: "Full list with NIC, village, hectares, parcel GPS reference. 337/340 matched.", category: "financial", status: "verified", source: "business", fileName: "MHCC_MemberRegister_Sep2024.xlsx", fileSize: "1.2MB", uploadedDate: "Sep 11, 2024" },
  { id: "d17", name: "Off-Take Agreement — Sucafina Cameroon", description: "90MT Grade 1 washed Arabica @ USD 3.40/kg FOB Douala. Notarised in Geneva.", category: "contracts", status: "verified", source: "business", fileName: "MHCC_Sucafina_OfftakeAgreement_2024.pdf", fileSize: "4.2MB", uploadedDate: "Sep 8, 2024" },
  { id: "d18", name: "Board Resolution Authorising Fundraising", description: "Notarised extract from Board Minutes (Sep 2, 2024) authorising up to 50M FCFA raise.", category: "contracts", status: "verified", source: "business", fileName: "MHCC_BoardResolution_Sep2024.pdf", fileSize: "0.9MB", uploadedDate: "Sep 12, 2024" },
  // Platform-generated documents
  { id: "p1", name: "Asset Score™ Report (AS-88)", description: "AI-generated Asset Score™ report with 6-dimension breakdown. Ref: AS-MHCC-2025-001.", category: "platform", status: "verified", source: "platform", fileName: "AS_Report_MHCC_2025_001.pdf", fileSize: "3.8MB", uploadedDate: "Sep 15, 2024" },
  { id: "p2", name: "Standardised Term Sheet", description: "AI-generated term sheet — 47M FCFA, 12.5% effective rate, 36-month term, milestone schedule.", category: "platform", status: "verified", source: "platform", fileName: "TermSheet_SPV01_MHCC.pdf", fileSize: "1.4MB", uploadedDate: "Sep 15, 2024" },
  { id: "p3", name: "Financial Model (3-year projection)", description: "AI-projected revenue, costs, and investor returns over the 36-month SPV term.", category: "platform", status: "verified", source: "platform", fileName: "FinancialModel_SPV01_MHCC.pdf", fileSize: "2.1MB", uploadedDate: "Sep 15, 2024" },
  { id: "p4", name: "Facility Agreement", description: "Master loan agreement executed between Bakua SPV-01 Ltd and MHCC.", category: "platform", status: "verified", source: "platform", fileName: "FacilityAgreement_SPV01.pdf", fileSize: "6.3MB", uploadedDate: "Sep 20, 2024" },
  { id: "p5", name: "SPV Incorporation Certificate", description: "Bakua SPV-01 Limited — RC/YDE/2024/B/4417. SARL incorporated in Yaoundé.", category: "platform", status: "verified", source: "platform", fileName: "SPV01_IncorporationCert.pdf", fileSize: "0.7MB", uploadedDate: "Sep 19, 2024" },
];
