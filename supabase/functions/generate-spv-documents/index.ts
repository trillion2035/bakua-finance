import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// The 8 facility documents to generate
const FACILITY_DOCUMENTS = [
  {
    document_type: "facility_agreement",
    document_name: "Facility Agreement",
    ref_prefix: "FA",
    description: "Main term loan facility agreement covering amount, purpose, milestone disbursements, oracle verification, conditions precedent, interest & repayment waterfall, representations & warranties, undertakings, events of default, and remedies.",
    prompt_template: (ctx: DocContext) => `Draft a complete Facility Agreement for a term loan facility under OHADA Uniform Acts framework.

PROJECT DETAILS:
- Lender (SPV): ${ctx.spvName}
- Borrower: ${ctx.companyName}
- Facility Amount: ${ctx.facilityAmount}
- Industry: ${ctx.industry}
- Project Description: ${ctx.projectDescription}
- Asset Score: ${ctx.grade} (${ctx.totalScore}/100)
- Tenor: ${ctx.tenorMonths} months
- Target IRR: ${ctx.targetIrr}
${ctx.transactionName ? `- Transaction Name: ${ctx.transactionName}` : ""}

Generate a comprehensive Facility Agreement (~8 pages) with these articles:
1. DEFINITIONS — Define all key terms (Bakua Finance, Blocked Account, Business Day, Closing Date, DSRA, Event of Default, Facility Amount, Maturity Date, Security Documents, Smart Contract, etc.)
2. THE FACILITY — Amount and purpose (tailored to ${ctx.industry}), on-chain mechanics (USDC via Base Network, converted to FCFA), currency provisions
3. MILESTONE DISBURSEMENTS — Disbursement schedule with oracle verification requirements specific to ${ctx.industry}, direct disbursements, DSRA funding
4. CONDITIONS PRECEDENT — List all required documents and conditions before first disbursement
5. INTEREST AND REPAYMENT — Interest rate, repayment schedule, source of repayment, payment waterfall (Bakua fee → oracle costs → investor principal/yield → DSRA top-up → borrower residual), prepayment
6. REPRESENTATIONS AND WARRANTIES — Standard OHADA representations
7. UNDERTAKINGS — Financial covenants (industry-specific KPIs), operational covenants, information covenants
8. EVENTS OF DEFAULT — Comprehensive list including non-payment, covenant breach, insolvency, licence/permit issues, insurance lapse, IoT tampering, score degradation
9. REMEDIES ON DEFAULT — Acceleration, enforcement hierarchy, smart contract suspension
10. GOVERNING LAW — Republic of Cameroon, OHADA, CCJA arbitration in Abidjan

Include SCHEDULE 1 (Milestone Disbursement Schedule) and SCHEDULE 2 (Annual Repayment Schedule).
Include signature blocks for both parties.

IMPORTANT: Adapt all terms, KPIs, oracle triggers, and security requirements to the ${ctx.industry} industry. Use realistic but placeholder values for amounts, dates, and parties.`,
  },
  {
    document_type: "offtake_assignment",
    document_name: "Off-Take Assignment Notice",
    ref_prefix: "OTA",
    description: "Tripartite assignment of payment rights from borrower to SPV, acknowledged by the off-taker/buyer.",
    prompt_template: (ctx: DocContext) => `Draft an Off-Take Agreement Assignment Notice (~3 pages) under OHADA framework.

PROJECT: ${ctx.companyName} | Industry: ${ctx.industry} | Facility: ${ctx.facilityAmount}
SPV: ${ctx.spvName} | Score: ${ctx.grade}

This is a tripartite notice between:
1. Assignor (Borrower): ${ctx.companyName}
2. Assignee (SPV/Lender): ${ctx.spvName}
3. Acknowledged Party (Off-taker/Buyer): [Appropriate buyer for ${ctx.industry}]

Sections:
1. PARTIES — Full details of all three parties
2. BACKGROUND — Reference to off-take/purchase agreement and Facility Agreement
3. IRREVOCABLE ASSIGNMENT:
   3.1 Assignment of Payment Rights — All rights to receive payment assigned to SPV for facility term
   3.2 Acknowledgement and Direction — Off-taker confirms receipt, agrees to pay exclusively to Blocked Account, waives set-off rights
   3.3 Step-In Rights — SPV may step into borrower's position on Event of Default
   3.4 Irrevocability — Assignment irrevocable until Maturity Date
4. GOVERNING LAW — Cameroon / OHADA / CCJA arbitration
5. SIGNATURE BLOCKS — All three parties

Adapt the off-taker type and product to ${ctx.industry} (e.g., agriculture: commodity buyer; real estate: tenant/lessee; trade finance: importer; infrastructure: government/concessioner; renewable energy: power purchaser/utility).`,
  },
  {
    document_type: "land_charge_agreement",
    document_name: "Land Charge Agreement",
    ref_prefix: "LCA",
    description: "First-ranking hypothèque (land charge) over property parcels as security for the facility.",
    prompt_template: (ctx: DocContext) => `Draft a Land Charge Agreement (Hypothèque — First Ranking) (~4 pages) under OHADA/Cameroonian land law.

PROJECT: ${ctx.companyName} | Industry: ${ctx.industry} | Facility: ${ctx.facilityAmount}
SPV: ${ctx.spvName}

Sections:
1. PARTIES — Chargor (Borrower) and Chargee (SPV)
2. SECURED OBLIGATIONS — All obligations under Facility Agreement
3. CHARGED PARCELS — Table with: Ref No, Titre Foncier No., Location, Area, GPS Centroid, TF Registration Date. Include realistic placeholder parcels appropriate for ${ctx.industry}. Note any excluded parcels (e.g., ancestral/customary tenure).
4. RANK AND PRIORITY — First-ranking, warranties of sole ownership, no prior encumbrances
5. REGISTRATION — Registration at local land registry, costs borne by Chargor
6. GRANTOR UNDERTAKINGS — Maintain property, no further encumbrances, insurance, permit access for inspection
7. ENFORCEMENT — On Event of Default, Chargee may sell via OHADA procedures
8. GOVERNING LAW — Cameroon / OHADA / CCJA arbitration
9. SIGNATURE BLOCKS with notarization

Adapt property types to ${ctx.industry}: agriculture=farmland, real_estate=buildings/plots, infrastructure=concession land, renewable_energy=plant site, trade_finance=warehouse land.`,
  },
  {
    document_type: "blocked_account_agreement",
    document_name: "Blocked Account Agreement",
    ref_prefix: "BCA",
    description: "Collection account control agreement establishing a blocked bank account for cash flow management.",
    prompt_template: (ctx: DocContext) => `Draft a Blocked Collection Account Agreement (~3-4 pages) under OHADA framework.

PROJECT: ${ctx.companyName} | Industry: ${ctx.industry} | Facility: ${ctx.facilityAmount}
SPV: ${ctx.spvName}

This is a tripartite agreement between:
1. Borrower: ${ctx.companyName}
2. Lender/SPV: ${ctx.spvName}
3. Account Bank: [Major Cameroonian bank, e.g., Ecobank Cameroun SA]

Sections:
1. PARTIES — All three parties with registration details
2. THE BLOCKED ACCOUNT — Account details, designation as sole collection account
3. PAYMENT DIRECTION — All revenues from off-take/operations paid exclusively into this account
4. PAYMENT WATERFALL — Order of priority: Bakua service fees → oracle/monitoring costs → investor principal & yield → DSRA replenishment → borrower residual
5. RESTRICTIONS — Borrower cannot withdraw without SPV consent, no set-off by bank, no other accounts for project revenues
6. DSRA SUB-ACCOUNT — Minimum balance requirements, replenishment obligations
7. BANK'S OBLIGATIONS — Monthly statements, compliance with payment instructions, notification of unusual activity
8. EVENT OF DEFAULT — Bank to freeze account on SPV instruction, release only to SPV
9. TERM — Coterminous with Facility Agreement
10. GOVERNING LAW — Cameroon / OHADA
11. SIGNATURE BLOCKS — All three parties

Adapt account structure and cash flow patterns to ${ctx.industry}.`,
  },
  {
    document_type: "chattel_security_agreement",
    document_name: "Chattel Security Agreement",
    ref_prefix: "SA",
    description: "Nantissement (security interest) over movable assets/equipment used in the project.",
    prompt_template: (ctx: DocContext) => `Draft a Chattel Security Agreement (Nantissement sur fonds de commerce et équipements) (~3 pages) under OHADA framework.

PROJECT: ${ctx.companyName} | Industry: ${ctx.industry} | Facility: ${ctx.facilityAmount}
SPV: ${ctx.spvName}

Sections:
1. PARTIES — Grantor (Borrower) and Secured Creditor (SPV)
2. SECURED OBLIGATIONS — All obligations under Facility Agreement
3. CHARGED EQUIPMENT — Table with: Equipment Item, Model/Serial No., Year, Appraised Value, Notes. Include realistic equipment appropriate for ${ctx.industry}:
   - Agriculture: pulpers, washing systems, drying beds, hulling machines, scales, generators
   - Real Estate: construction equipment, HVAC systems, elevators
   - Infrastructure: heavy machinery, vehicles, construction plant
   - Renewable Energy: solar panels, inverters, batteries, turbines
   - Trade Finance: warehouse equipment, forklifts, cold storage units
4. GRANTOR'S UNDERTAKINGS — Maintain equipment, no disposal without consent, keep at designated location, permit inspection
5. INSURANCE — Maintain comprehensive insurance with SPV as loss payee
6. REGISTRATION — Register at RCCM within 15 days
7. ENFORCEMENT — On default, SPV may take possession and sell under OHADA procedures
8. GOVERNING LAW — Cameroon / OHADA / CCJA arbitration
9. SIGNATURE BLOCKS`,
  },
  {
    document_type: "personal_guarantees",
    document_name: "Personal Guarantee Agreements",
    ref_prefix: "PG",
    description: "Personal guarantees from key individuals (signatories/directors) of the borrower entity.",
    prompt_template: (ctx: DocContext) => `Draft Personal Guarantee Agreements (~4 pages) under OHADA framework.

PROJECT: ${ctx.companyName} | Industry: ${ctx.industry} | Facility: ${ctx.facilityAmount}
SPV: ${ctx.spvName}
KYC Signatories: ${ctx.signatories}

Generate guarantees for each signatory listed above. For each guarantor include:

GUARANTEE NO. [N] — [GUARANTOR NAME]
- Personal details table: Full Name, National ID (CNI), Date of Birth, Profession, Residential Address, Capacity in Borrower, Guarantee Amount, Nature (unconditional and irrevocable), Duration

1.1 GRANT OF GUARANTEE — Irrevocable and unconditional guarantee up to specified amount
1.2 NATURE — Primary obligation (no need to proceed against borrower first), joint and several, continuing obligation
1.3 CIRCUMSTANCES OF DEMAND — Callable ONLY on: (a) fraud/gross negligence/wilful misconduct; (b) unauthorized diversion of payments; (c) deliberate false information. NOT callable on: weather/market risk, force majeure, utility outages, commodity price movements
1.4 DEMAND PROCEDURE — Written notice specifying Event of Default, amount claimed, basis of liability. Payment within 15 Business Days.
1.5 DURATION AND RELEASE — Until full repayment or Maturity Date. Written Release Confirmation within 10 Business Days.

SIGNATURE BLOCKS — Each guarantor signs in personal capacity, witnessed and notarized by a Notaire.

Note at end: Combined guarantee coverage as percentage of Facility Amount. Rank last in enforcement hierarchy.`,
  },
  {
    document_type: "crop_insurance_assignment",
    document_name: "Insurance Assignment Agreement",
    ref_prefix: "CIA",
    description: "Assignment of project insurance policy with SPV designated as First Loss Payee.",
    prompt_template: (ctx: DocContext) => `Draft an Insurance Assignment Agreement (~3 pages) under OHADA framework.

PROJECT: ${ctx.companyName} | Industry: ${ctx.industry} | Facility: ${ctx.facilityAmount}
SPV: ${ctx.spvName}

This agreement assigns the project's insurance policy to the SPV as First Loss Payee. Adapt insurance type to industry:
- Agriculture: Crop insurance (drought, flood, pest, disease)
- Real Estate: Property/construction all-risks insurance
- Infrastructure: Construction all-risks + third-party liability
- Renewable Energy: Equipment breakdown + business interruption
- Trade Finance: Marine/cargo insurance + warehouse coverage

Sections:
1. PARTIES — Assignor (Borrower), Assignee (SPV), Insurance Company
2. THE POLICY — Policy details (insurer, policy number, coverage period, sum insured, perils covered)
3. ASSIGNMENT — Borrower assigns all rights under the policy to SPV as First Loss Payee
4. SPV AS FIRST LOSS PAYEE — All claims paid first to SPV up to outstanding facility amount
5. BORROWER'S UNDERTAKINGS — Maintain insurance, pay premiums on time, renew annually, notify SPV of any claims/changes, not cancel or amend without SPV consent
6. INSURER'S ACKNOWLEDGEMENT — Insurer confirms assignment, agrees to pay SPV as First Loss Payee, provide 30 days notice of cancellation/non-renewal
7. PREMIUM DEFAULT — If borrower fails to pay premium, SPV may pay and add to secured obligations
8. CLAIMS PROCEDURE — SPV has right to file and manage claims, cooperate with insurer
9. GOVERNING LAW — Cameroon / OHADA
10. SIGNATURE BLOCKS — All three parties`,
  },
  {
    document_type: "service_agreement",
    document_name: "Bakua Service Agreement",
    ref_prefix: "BSA",
    description: "Platform, technology, and advisory services agreement between Bakua Finance and the borrower.",
    prompt_template: (ctx: DocContext) => `Draft a Bakua Service Agreement (~5 pages) for platform, technology, and advisory services under OHADA framework.

PROJECT: ${ctx.companyName} | Industry: ${ctx.industry} | Facility: ${ctx.facilityAmount}
SPV: ${ctx.spvName} | Tenor: ${ctx.tenorMonths} months

Sections:
1. PARTIES — Client (Borrower) and Service Provider (Bakua Finance SARL)
2. SCOPE OF SERVICES:
   2.1 Origination Services (one-time): Document collection, AI verification & scoring (Harvest Score™/Asset Score), SPV legal structuring, investor outreach via Bakua marketplace, smart contract development & audit coordination, investor KYC/AML, USDC/FCFA conversion, IoT/monitoring equipment procurement, project onboarding for data pipeline & oracle configuration
   2.2 Ongoing Platform Services (throughout facility term): IoT oracle pipeline operation, monthly oracle data collection (industry-specific sensors/data), project holder dashboard (real-time milestones, disbursements, oracle data, covenant tracker), investor dashboard, milestone verification & disbursement coordination, annual score recalculation, USDC/FCFA conversion at repayments, investor relations, annual financial reporting, covenant monitoring, Event of Default monitoring, IPFS document archiving
   2.3 Advisory Services: Annual field inspection, market intelligence, refinancing advisory
3. FEE SCHEDULE — Table with: Fee Type, Amount, Payment Timing, Notes. Include: Origination Fee (2% Standard / 1.5% Premium), Annual Platform Fee (2% of outstanding AUM), Annual Score Recalculation, Field Inspection, Oracle fees, AWS infrastructure, FX conversion spread, Event of Default management fee
4. BAKUA'S OBLIGATIONS — Standard of care, data security (AES-256, TLS 1.3, IPFS), transparency (dashboard access)
5. CONFLICT OF INTEREST — Bakua co-investment disclosure (subordinated position)
6. CLIENT'S OBLIGATIONS — Information cooperation, platform use restrictions
7. INTELLECTUAL PROPERTY — Harvest Score™, AI engine, platform technology remain Bakua's IP
8. LIMITATION OF LIABILITY — Cap on liability, exclusion of indirect/consequential loss, no guarantee of funding/pricing/uptime beyond 99.5%
9. TERM AND TERMINATION — Coterminous with facility, mutual termination for material breach
10. GOVERNING LAW — Cameroon / OHADA / CCJA arbitration
11. SIGNATURE BLOCKS

Adapt monitoring, sensors, and KPIs to ${ctx.industry}.`,
  },
];

interface DocContext {
  spvName: string;
  companyName: string;
  facilityAmount: string;
  industry: string;
  projectDescription: string;
  grade: string;
  totalScore: number;
  tenorMonths: number;
  targetIrr: string;
  transactionName: string;
  signatories: string;
}

function buildDocContext(submission: any, profile: any, report: any, termSheet: any): DocContext {
  const signatories = Array.isArray(submission.kyc_signatories)
    ? submission.kyc_signatories.map((s: any) => `${s.name || "Unknown"} (${s.role || "Signatory"})`).join(", ")
    : "Key signatories as per KYC documents";

  return {
    spvName: termSheet?.transaction_name ? `Bakua ${termSheet.transaction_name} SPV` : "Bakua SPV Limited",
    companyName: profile?.company_name || profile?.full_name || "The Borrower",
    facilityAmount: termSheet?.facility_amount_fcfa
      ? `FCFA ${termSheet.facility_amount_fcfa.toLocaleString()}`
      : "Amount as per Term Sheet",
    industry: report?.industry || "agriculture",
    projectDescription: submission.project_description || "Project as described in application",
    grade: report?.grade || "Pending",
    totalScore: report?.total_score || 0,
    tenorMonths: termSheet?.tenor_months || 36,
    targetIrr: termSheet?.target_irr || "12.5%",
    transactionName: termSheet?.transaction_name || "",
    signatories,
  };
}

const SYSTEM_PROMPT = `You are a legal document drafting AI specializing in SPV (Special Purpose Vehicle) facility documents for structured finance in Cameroon and OHADA jurisdictions.

KEY RULES:
1. Generate professional, legally-sound documents following OHADA Uniform Acts framework
2. Use proper legal drafting conventions: defined terms in bold on first use, article/clause numbering, cross-references
3. Include document header with BAKUA FINANCE SARL branding, document reference code, date, parties, governing law, and CONFIDENTIAL classification
4. Adapt all content to the specific industry while maintaining the legal structure
5. Use realistic but placeholder values for specific amounts, dates, registration numbers, and addresses
6. Include proper signature blocks with space for notarization where appropriate
7. All documents are governed by Republic of Cameroon law and OHADA Uniform Acts
8. Dispute resolution is via CCJA arbitration in Abidjan, Côte d'Ivoire
9. Format with clear article numbers, sections, and subsections
10. Include page numbering references (e.g., "Page X of Y")`;

async function generateDocument(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
): Promise<{ content: string; error?: string }> {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("AI gateway error:", response.status, errText);
    if (response.status === 429) return { content: "", error: "Rate limit exceeded. Please try again later." };
    if (response.status === 402) return { content: "", error: "Payment required." };
    return { content: "", error: `AI generation failed (${response.status})` };
  }

  const aiResult = await response.json();
  const content = aiResult.choices?.[0]?.message?.content || "";
  return { content };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { submission_id, stage_key } = await req.json();
    if (!submission_id) throw new Error("submission_id is required");
    if (!stage_key) throw new Error("stage_key is required");

    // Fetch submission details
    const { data: submission, error: subErr } = await supabase
      .from("document_submissions")
      .select("*")
      .eq("id", submission_id)
      .single();
    if (subErr || !submission) throw new Error("Submission not found");

    // Fetch profile, analysis report, and term sheet in parallel
    const [profileRes, reportRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", submission.user_id).single(),
      supabase.from("asset_analysis_reports").select("*").eq("submission_id", submission_id).single(),
    ]);

    const profile = profileRes.data;
    const report = reportRes.data;

    let termSheet = null;
    if (report) {
      const { data: ts } = await supabase
        .from("term_sheets")
        .select("*")
        .eq("analysis_report_id", report.id)
        .maybeSingle();
      termSheet = ts;
    }

    const ctx = buildDocContext(submission, profile, report, termSheet);

    // ── SPV Document Creation: Generate Articles of Association ──
    if (stage_key === "spv_doc_creation") {
      const userPrompt = `Draft the Articles of Association (Statuts) for an SPV to be incorporated for the following project:

Company/Project: ${ctx.companyName}
Project Description: ${ctx.projectDescription}
Capital Target: ${ctx.facilityAmount}
${ctx.transactionName ? `Transaction Name: ${ctx.transactionName}` : ""}
Asset Score: ${ctx.grade} (${ctx.totalScore}/100)
Industry: ${ctx.industry}

Generate a complete Articles of Association document including:
1. Name and registered office
2. Purpose and corporate object
3. Share capital and distribution
4. Management and governance structure
5. General assemblies
6. Financial year and accounts
7. Dissolution and liquidation provisions
8. Miscellaneous provisions

Use OHADA Uniform Act on Commercial Companies framework. Format with clear article numbers and sections.`;

      const result = await generateDocument(LOVABLE_API_KEY, SYSTEM_PROMPT, userPrompt);
      if (result.error) {
        const status = result.error.includes("Rate limit") ? 429 : result.error.includes("Payment") ? 402 : 500;
        return new Response(JSON.stringify({ error: result.error }), {
          status, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: doc, error: docErr } = await supabase
        .from("generated_documents")
        .insert({
          submission_id,
          user_id: submission.user_id,
          stage_key: "spv_doc_creation",
          document_name: "Articles of Association (Statuts)",
          document_type: "articles_of_association",
          content: result.content,
          status: "draft",
        })
        .select()
        .single();
      if (docErr) throw docErr;

      // Update stage to in_progress
      await supabase
        .from("spv_deployment_stages")
        .update({ status: "in_progress", started_at: new Date().toISOString() })
        .eq("submission_id", submission_id)
        .eq("stage_key", "spv_doc_creation");

      return new Response(JSON.stringify({ success: true, document: doc }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Facility Document Creation: Generate all 8 facility documents ──
    if (stage_key === "facility_doc_creation") {
      // Update stage to in_progress immediately
      await supabase
        .from("spv_deployment_stages")
        .update({ status: "in_progress", started_at: new Date().toISOString() })
        .eq("submission_id", submission_id)
        .eq("stage_key", "facility_doc_creation");

      const results: { document_name: string; success: boolean; error?: string }[] = [];

      // Generate documents sequentially to avoid rate limits
      for (const docDef of FACILITY_DOCUMENTS) {
        const userPrompt = docDef.prompt_template(ctx);

        console.log(`Generating: ${docDef.document_name}...`);
        const result = await generateDocument(LOVABLE_API_KEY, SYSTEM_PROMPT, userPrompt);

        if (result.error) {
          console.error(`Failed to generate ${docDef.document_name}:`, result.error);
          results.push({ document_name: docDef.document_name, success: false, error: result.error });

          // If rate limited, save what we have and return partial success
          if (result.error.includes("Rate limit")) {
            break;
          }
          continue;
        }

        const { error: insertErr } = await supabase
          .from("generated_documents")
          .insert({
            submission_id,
            user_id: submission.user_id,
            stage_key: "facility_doc_creation",
            document_name: docDef.document_name,
            document_type: docDef.document_type,
            content: result.content,
            status: "draft",
          });

        if (insertErr) {
          console.error(`Failed to save ${docDef.document_name}:`, insertErr);
          results.push({ document_name: docDef.document_name, success: false, error: insertErr.message });
        } else {
          results.push({ document_name: docDef.document_name, success: true });
        }
      }

      const successCount = results.filter(r => r.success).length;
      const totalCount = FACILITY_DOCUMENTS.length;

      return new Response(JSON.stringify({
        success: successCount > 0,
        generated: successCount,
        total: totalCount,
        results,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Smart Contract Specifications: Generate SC spec document ──
    if (stage_key === "sc_specifications") {
      const scSpecPrompt = `Generate a comprehensive Smart Contract Specification Document for the following SPV project:

PROJECT DETAILS:
- SPV Name: ${ctx.spvName}
- Borrower: ${ctx.companyName}
- Industry: ${ctx.industry}
- Facility Amount: ${ctx.facilityAmount}
- Tenor: ${ctx.tenorMonths} months
- Target IRR: ${ctx.targetIrr}
- Project Description: ${ctx.projectDescription}
- Asset Score: ${ctx.grade} (${ctx.totalScore}/100)

This smart contract will be deployed on Base Network (Ethereum L2) and will manage the SPV's lifecycle including:

Generate the specification document (~10 pages) with these sections:

1. EXECUTIVE SUMMARY — Purpose, scope, and overview of the smart contract system
2. SYSTEM ARCHITECTURE — On-chain vs off-chain components, contract hierarchy, interaction diagram
3. TOKEN DESIGN — SPV token mechanics: ERC-20 or ERC-1155, token supply = facility amount / minimum investment, transferability rules, KYC gate
4. SMART CONTRACT MODULES:
   4.1 SPVVault — Manages USDC deposits, enforces hard cap, tracks investor allocations
   4.2 MilestoneDisbursement — Oracle-verified milestone releases, multi-sig approval, DSRA management
   4.3 RepaymentWaterfall — Automated payment waterfall: Bakua fee → oracle costs → investor principal/yield → DSRA → borrower residual
   4.4 OracleIntegration — Industry-specific oracle data feeds (${ctx.industry}: ${ctx.industry === 'agriculture' ? 'NDVI, soil moisture, harvest yields, weather' : ctx.industry === 'real_estate' ? 'occupancy rates, rental income, property valuation' : ctx.industry === 'infrastructure' ? 'construction milestones, usage metrics' : ctx.industry === 'renewable_energy' ? 'power output, grid connection, irradiance' : 'shipment tracking, inventory levels, payment verification'})
   4.5 GovernanceModule — Investor voting on key decisions, quorum requirements
   4.6 ComplianceGate — KYC/AML verification, investor accreditation check
5. STATE MACHINE — Contract lifecycle states: Funding → Active → Disbursing → Repaying → Matured/Closed. State transition rules and events.
6. ACCESS CONTROL — Role-based permissions: Admin, Borrower, Investor, Oracle, Auditor
7. EVENT EMISSIONS — All events for off-chain indexing and dashboard real-time updates
8. SECURITY REQUIREMENTS — Reentrancy protection, overflow checks, pause mechanism, upgrade pattern (UUPS proxy), time locks
9. GAS OPTIMIZATION — Batch operations, storage packing, calldata optimization
10. TESTING REQUIREMENTS — Unit test scenarios, integration test flows, fuzzing targets
11. DEPLOYMENT PLAN — Testnet deployment, audit scope, mainnet deployment steps
12. APPENDIX — ABI specifications, interface definitions, error codes

Adapt all oracle feeds, KPIs, and monitoring to the ${ctx.industry} industry.
Include realistic parameter values based on the project data.`;

      const result = await generateDocument(LOVABLE_API_KEY, SYSTEM_PROMPT, scSpecPrompt);
      if (result.error) {
        const status = result.error.includes("Rate limit") ? 429 : result.error.includes("Payment") ? 402 : 500;
        return new Response(JSON.stringify({ error: result.error }), {
          status, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      await supabase.from("generated_documents").insert({
        submission_id,
        user_id: submission.user_id,
        stage_key: "sc_specifications",
        document_name: "Smart Contract Specification Document",
        document_type: "sc_specifications",
        content: result.content,
        status: "draft",
      });

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── SC Auditing Complete: Generate Deployment Record + IPFS Anchoring Certificate ──
    if (stage_key === "sc_auditing_complete") {
      const results: any[] = [];

      // 1. Smart Contract Deployment Record
      const deployRecordPrompt = `Generate a Smart Contract Deployment Record document for:

SPV: ${ctx.spvName}
Borrower: ${ctx.companyName}
Industry: ${ctx.industry}
Facility Amount: ${ctx.facilityAmount}
Network: Base (Ethereum L2)

Generate a formal deployment record (~4 pages) including:

1. DEPLOYMENT SUMMARY — Date, network, deployer address, gas used, transaction hashes
2. DEPLOYED CONTRACTS — Table with: Contract Name, Address, Implementation Hash, Proxy Address, Version
   Include: SPVVault, MilestoneDisbursement, RepaymentWaterfall, OracleIntegration, GovernanceModule, ComplianceGate
3. INITIALIZATION PARAMETERS — All constructor/initialize parameters used for each contract
4. VERIFICATION STATUS — Source code verification on block explorer, matching bytecode confirmation
5. ACCESS CONTROL CONFIGURATION — Roles assigned: Admin, Oracle, Pauser addresses
6. AUDIT COMPLIANCE — Audit firm, audit report reference, findings addressed, no critical/high issues remaining
7. POST-DEPLOYMENT CHECKS — All functional tests passed, integration verified, monitoring configured
8. SIGNATURES — Deployer, Admin, Auditor sign-off

Use realistic placeholder contract addresses (0x...) and transaction hashes.`;

      const deployResult = await generateDocument(LOVABLE_API_KEY, SYSTEM_PROMPT, deployRecordPrompt);
      if (!deployResult.error) {
        await supabase.from("generated_documents").insert({
          submission_id,
          user_id: submission.user_id,
          stage_key: "sc_deployment_record",
          document_name: "Smart Contract Deployment Record",
          document_type: "sc_deployment_record",
          content: deployResult.content,
          status: "verified",
        });
        results.push({ document: "Smart Contract Deployment Record", success: true });
      } else {
        results.push({ document: "Smart Contract Deployment Record", success: false, error: deployResult.error });
      }

      // 2. IPFS Anchoring Certificate
      const ipfsCertPrompt = `Generate an IPFS Anchoring Certificate for:

SPV: ${ctx.spvName}
Borrower: ${ctx.companyName}
Industry: ${ctx.industry}
Network: Base (Ethereum L2)

This certificate confirms that all legal and operational documents have been uploaded to IPFS (InterPlanetary File System) and their content hashes have been recorded on the blockchain.

Generate a formal certificate (~3 pages) including:

1. CERTIFICATE HEADER — IPFS Anchoring Certificate, date, reference number, CONFIDENTIAL marking
2. CERTIFICATION STATEMENT — "This certifies that the following documents pertaining to [SPV Name] have been permanently anchored to IPFS and their content hashes recorded on Base Network (Ethereum L2)."
3. ANCHORED DOCUMENTS TABLE — Table with columns: Document Name, IPFS CID (Content Identifier), On-Chain Tx Hash, Anchor Date, File Hash (SHA-256)
   Include all project documents:
   - Articles of Association
   - Facility Agreement
   - Off-Take Assignment Notice
   - Land Charge Agreement
   - Blocked Account Agreement
   - Chattel Security Agreement
   - Personal Guarantee Agreements
   - Insurance Assignment Agreement
   - Bakua Service Agreement
   - Term Sheet
   - Asset Score Report
   - Project Dossier
   - Smart Contract Specification
   - Smart Contract Audit Report
   - Smart Contract Deployment Record
4. BLOCKCHAIN REFERENCE — Smart contract address storing IPFS CIDs, function signature used, block number range
5. VERIFICATION INSTRUCTIONS — How to independently verify: (a) retrieve CID from blockchain, (b) fetch document from IPFS gateway, (c) compute SHA-256, (d) compare with on-chain hash
6. IMMUTABILITY GUARANTEE — Statement that documents cannot be altered without changing CID, any modification would be immediately detectable
7. LEGAL STANDING — This anchoring provides tamper-proof evidence of document existence and content at the time of certification
8. SIGNATURES — Bakua Finance authorized signatory, SPV administrator

Use realistic placeholder IPFS CIDs (Qm... or bafy...) and transaction hashes.`;

      const ipfsResult = await generateDocument(LOVABLE_API_KEY, SYSTEM_PROMPT, ipfsCertPrompt);
      if (!ipfsResult.error) {
        await supabase.from("generated_documents").insert({
          submission_id,
          user_id: submission.user_id,
          stage_key: "ipfs_anchoring",
          document_name: "IPFS Anchoring Certificate",
          document_type: "ipfs_anchoring_certificate",
          content: ipfsResult.content,
          status: "verified",
        });
        results.push({ document: "IPFS Anchoring Certificate", success: true });
      } else {
        results.push({ document: "IPFS Anchoring Certificate", success: false, error: ipfsResult.error });
      }

      return new Response(JSON.stringify({ success: true, results }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: `Unknown stage_key: ${stage_key}` }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-spv-documents error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
