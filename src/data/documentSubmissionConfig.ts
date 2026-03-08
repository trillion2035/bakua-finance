// Document categories and selectable documents for the submission wizard

export interface SelectableDocument {
  id: string;
  name: string;
  description: string;
}

export interface DocumentCategoryConfig {
  key: string;
  label: string;
  icon: string;
  description: string;
  documents: SelectableDocument[];
  allowOther: boolean;
}

// Sector-specific asset documents
const sectorAssetDocs: Record<string, SelectableDocument[]> = {
  "Agriculture": [
    { id: "land-titles", name: "Land Titles / Tenure Certificates", description: "Proof of land ownership or long-term tenure rights." },
    { id: "gps-survey", name: "GPS Survey / Boundary Data", description: "GPS boundary survey data for all project land." },
    { id: "export-licence", name: "Export / Operating Licence", description: "Relevant licence for export or commercial operations." },
    { id: "yield-history", name: "Yield / Production History", description: "Certified production records for the past 3+ years." },
    { id: "soil-analysis", name: "Soil / Environmental Analysis", description: "Independent soil, water, or environmental reports." },
    { id: "climate-report", name: "Climate / Agro-Ecological Report", description: "Climate classification and weather trend data." },
    { id: "crop-insurance", name: "Crop Insurance Certificate", description: "Proof of crop or agricultural insurance coverage." },
  ],
  "Energy & Solar": [
    { id: "site-ownership", name: "Site Ownership / Lease Agreement", description: "Proof of ownership or lease for the installation site." },
    { id: "eia", name: "Environmental Impact Assessment", description: "EIA report approved by the relevant authority." },
    { id: "tech-feasibility", name: "Technical Feasibility Study", description: "Engineering feasibility study for the project." },
    { id: "equipment-specs", name: "Equipment Specifications", description: "Specifications and warranties for equipment." },
    { id: "grid-connection", name: "Grid Connection Agreement", description: "Agreement with utility for grid connection." },
    { id: "generation-licence", name: "Generation / Distribution Licence", description: "Licence from the energy regulator." },
  ],
  "Real Estate": [
    { id: "title-deeds", name: "Title Deeds", description: "Proof of property ownership." },
    { id: "building-permits", name: "Building Permits", description: "Approved permits for construction or renovation." },
    { id: "zoning-cert", name: "Zoning Certificate", description: "Proof of zoning compliance for the property." },
    { id: "valuation-report", name: "Property Valuation Report", description: "Independent property valuation from a certified valuer." },
    { id: "architectural-plans", name: "Architectural Plans", description: "Approved architectural drawings and plans." },
    { id: "eia", name: "Environmental Impact Assessment", description: "EIA report for the development." },
  ],
  "default": [
    { id: "asset-ownership", name: "Asset Ownership / Lease Documents", description: "Proof of ownership or lease for project assets." },
    { id: "tech-feasibility", name: "Technical / Feasibility Study", description: "Project feasibility or engineering report." },
    { id: "eia", name: "Environmental & Social Impact Assessment", description: "ESG or environmental impact report." },
    { id: "site-survey", name: "Site Survey / Mapping Data", description: "Survey or mapping data for the project location." },
    { id: "operating-licence", name: "Operating Licence / Permit", description: "Relevant licence for operations." },
    { id: "insurance", name: "Insurance Certificate", description: "Proof of asset or project insurance coverage." },
  ],
};

export function getDocumentCategories(sector: string): DocumentCategoryConfig[] {
  const assetDocs = sectorAssetDocs[sector] || sectorAssetDocs["default"];
  const sectorLabel = sector === "default" ? "Project" : sector;

  return [
    {
      key: "project",
      label: "Project Documents",
      icon: "📄",
      description: "Core documents describing your project and business.",
      allowOther: true,
      documents: [
        { id: "business-plan", name: "Business Plan", description: "Multi-year business plan with projections and strategy." },
        { id: "pitch-deck", name: "Pitch Deck / Presentation", description: "Investor-facing presentation summarizing the project." },
        { id: "project-brochure", name: "Project Brochure / Summary", description: "Overview document describing the project scope." },
        { id: "feasibility-study", name: "Feasibility Study", description: "Technical or commercial feasibility assessment." },
        { id: "impact-assessment", name: "Impact Assessment (ESG)", description: "Environmental, social, and governance impact report." },
        { id: "technical-report", name: "Technical / Engineering Report", description: "Detailed technical specifications or engineering study." },
      ],
    },
    {
      key: "legal",
      label: "Legal & Registration",
      icon: "🏛️",
      description: "Legal documents proving your entity's registration and compliance.",
      allowOther: true,
      documents: [
        { id: "registration-cert", name: "Business Registration / Incorporation Certificate", description: "Legal registration certificate proving entity existence." },
        { id: "tax-cert", name: "Tax Compliance Certificate", description: "Tax registration confirming fiscal compliance status." },
        { id: "sector-approval", name: "Sector Regulatory Approval", description: "Approval or registration from the relevant sector authority." },
        { id: "articles", name: "Articles of Association / Statutes", description: "Founding documents including governance structure." },
        { id: "cap-table", name: "Cap Table / Ownership Structure", description: "Breakdown of company ownership and shareholding." },
        { id: "shareholder-agreement", name: "Shareholder Agreement", description: "Agreement governing shareholder rights and obligations." },
        { id: "govt-permits", name: "Government Permits / Concessions", description: "Relevant government permits or concession agreements." },
      ],
    },
    {
      key: "identity",
      label: "Identity & KYC",
      icon: "🪪",
      description: "Identity documents for key signatories and management.",
      allowOther: false,
      documents: [], // Handled specially with person-based UI
    },
    {
      key: "financial",
      label: "Financial Documents",
      icon: "💰",
      description: "Financial records demonstrating your project's fiscal health.",
      allowOther: true,
      documents: [
        { id: "financial-statements", name: "Financial Statements", description: "Income statements, balance sheets, and cash flow statements." },
        { id: "financial-projections", name: "Financial Projections / Model", description: "Forward-looking revenue and cost projections." },
        { id: "revenue-records", name: "Revenue / Sales Records", description: "Historical revenue or sales documentation." },
        { id: "tax-returns", name: "Tax Returns", description: "Filed tax returns for previous fiscal years." },
        { id: "debt-schedule", name: "Existing Debt Schedule", description: "Summary of any outstanding loans or liabilities." },
      ],
    },
    {
      key: "contracts",
      label: "Contracts & Agreements",
      icon: "🤝",
      description: "Key contracts and agreements related to your project.",
      allowOther: true,
      documents: [
        { id: "offtake", name: "Off-Taker / Purchase Agreement", description: "Binding agreement with a buyer for project output." },
        { id: "board-resolution", name: "Board Resolution Authorising Fundraising", description: "Board resolution authorising the capital raise." },
        { id: "partnership-jv", name: "Partnership / JV Agreement", description: "Joint venture or partnership agreement if applicable." },
        { id: "insurance-policy", name: "Insurance Policy", description: "Active insurance policy covering project risks." },
        { id: "service-contracts", name: "Service / Supply Contracts", description: "Contracts with key service providers or suppliers." },
      ],
    },
    {
      key: "sector",
      label: `${sectorLabel}-Specific Documents`,
      icon: "🗺️",
      description: `Documents specific to your ${sectorLabel.toLowerCase()} project.`,
      allowOther: true,
      documents: assetDocs,
    },
  ];
}
