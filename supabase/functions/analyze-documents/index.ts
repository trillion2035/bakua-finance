import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Industry-specific scoring dimensions
const INDUSTRY_DIMENSIONS = {
  agriculture: [
    { name: "Land Security", weight: 20, description: "Tenure, title verification, GPS validation" },
    { name: "Pedoclimatic Fitness", weight: 18, description: "Soil quality, rainfall, altitude, climate risks" },
    { name: "Crop Variety & Yield", weight: 17, description: "Crop types, yield history, quality metrics" },
    { name: "Market Access", weight: 20, description: "Off-taker agreements, pricing, creditworthiness" },
    { name: "Operator Capability", weight: 12, description: "Management experience, credit history, governance" },
    { name: "Financial Health", weight: 13, description: "Revenue, margins, debt ratios, audit history" },
  ],
  real_estate: [
    { name: "Title & Ownership", weight: 25, description: "Property title, encumbrances, legal status" },
    { name: "Location & Accessibility", weight: 20, description: "Location quality, infrastructure, connectivity" },
    { name: "Property Condition", weight: 15, description: "Building condition, maintenance, age" },
    { name: "Occupancy & Income", weight: 20, description: "Rental income, occupancy rates, tenant quality" },
    { name: "Market Comparables", weight: 10, description: "Comparable sales, market trends" },
    { name: "Operator & Management", weight: 10, description: "Property management capability" },
  ],
  trade_finance: [
    { name: "Counterparty Credit", weight: 25, description: "Buyer/seller creditworthiness" },
    { name: "Trade Documentation", weight: 20, description: "LC, invoices, shipping docs verification" },
    { name: "Goods & Collateral", weight: 15, description: "Commodity quality, storage, insurance" },
    { name: "Route & Logistics", weight: 15, description: "Shipping routes, transit times, risks" },
    { name: "Track Record", weight: 15, description: "Historical trade performance" },
    { name: "Compliance", weight: 10, description: "Regulatory, sanctions, AML checks" },
  ],
  infrastructure: [
    { name: "Technical Feasibility", weight: 20, description: "Engineering, design, permits" },
    { name: "Construction Risk", weight: 18, description: "Contractor capability, timeline, cost overruns" },
    { name: "Revenue Certainty", weight: 22, description: "Off-take agreements, tariffs, demand" },
    { name: "Regulatory Environment", weight: 15, description: "Licenses, permits, government support" },
    { name: "Environmental & Social", weight: 12, description: "ESIA, community impact, resettlement" },
    { name: "Sponsor Capability", weight: 13, description: "Experience, financial strength" },
  ],
  renewable_energy: [
    { name: "Resource Assessment", weight: 22, description: "Solar/wind resource quality, measurements" },
    { name: "Technical Design", weight: 18, description: "Equipment, EPC contractor, technology" },
    { name: "Off-Take & Grid", weight: 22, description: "PPA, grid connection, curtailment risk" },
    { name: "Permits & Land", weight: 15, description: "All permits, land rights secured" },
    { name: "Environmental", weight: 10, description: "EIA, biodiversity, community" },
    { name: "Sponsor & O&M", weight: 13, description: "Developer track record, O&M plan" },
  ],
};

const PASSING_THRESHOLD = 60;

// Generate reference codes
function generateRefCode(type: string, industry: string): string {
  const date = new Date();
  const year = date.getFullYear();
  const industryCode = industry.substring(0, 3).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${type}-${industryCode}-${year}-${random}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase credentials not configured");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { submission_id, industry = "agriculture" } = await req.json();

    if (!submission_id) {
      return new Response(JSON.stringify({ error: "submission_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch submission details
    const { data: submission, error: subError } = await supabase
      .from("document_submissions")
      .select("*")
      .eq("id", submission_id)
      .single();

    if (subError || !submission) {
      return new Response(JSON.stringify({ error: "Submission not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if analysis already exists
    const { data: existingReport } = await supabase
      .from("asset_analysis_reports")
      .select("id, analysis_status")
      .eq("submission_id", submission_id)
      .single();

    let reportId = existingReport?.id;

    if (!reportId) {
      // Create initial report record
      const { data: newReport, error: createError } = await supabase
        .from("asset_analysis_reports")
        .insert({
          submission_id,
          user_id: submission.user_id,
          industry,
          analysis_status: "processing",
        })
        .select()
        .single();

      if (createError) throw createError;
      reportId = newReport.id;
    } else {
      // Update status to processing
      await supabase
        .from("asset_analysis_reports")
        .update({ analysis_status: "processing" })
        .eq("id", reportId);
    }

    // Fetch uploaded documents from storage
    const { data: uploadedDocs } = await supabase.storage
      .from("project-documents")
      .list(submission.user_id, { sortBy: { column: "created_at", order: "desc" } });

    // Get all files recursively
    const allFiles: { name: string; category: string; path: string }[] = [];
    for (const item of uploadedDocs || []) {
      if (!item.id) {
        const { data: folderData } = await supabase.storage
          .from("project-documents")
          .list(`${submission.user_id}/${item.name}`);
        for (const file of folderData || []) {
          if (file.id) {
            allFiles.push({
              name: file.name,
              category: item.name,
              path: `${submission.user_id}/${item.name}/${file.name}`,
            });
          }
        }
      }
    }

    // Build prompt for AI analysis
    const dimensions = INDUSTRY_DIMENSIONS[industry as keyof typeof INDUSTRY_DIMENSIONS] || INDUSTRY_DIMENSIONS.agriculture;
    
    const systemPrompt = `You are the Bakua AI Engine, a sophisticated asset standardization analyst for structured finance in emerging markets. 
Your task is to analyze submitted project documents and generate a comprehensive Asset Standardization Score (similar to a credit score for assets).

INDUSTRY: ${industry}
SCORING DIMENSIONS (industry-specific):
${dimensions.map((d, i) => `${i + 1}. ${d.name} (Weight: ${d.weight}%) - ${d.description}`).join("\n")}

GRADING SCALE:
- HS-90 to HS-100: PREMIUM GRADE - Lowest risk, best terms
- HS-75 to HS-89: STANDARD GRADE - Eligible for marketplace listing
- HS-60 to HS-74: ENHANCED SCRUTINY - Requires additional conditions
- Below HS-60: FAIL - Not eligible, provide detailed improvement roadmap

IMPORTANT: The passing threshold is HS-60 (60 points minimum).

You must return a JSON object with the following structure:
{
  "total_score": <integer 0-100>,
  "grade": "<string e.g. HS-85>",
  "grade_label": "<Premium Grade|Standard Grade|Enhanced Scrutiny|Fail>",
  "document_completeness_score": <integer 0-100>,
  "score_dimensions": [
    {
      "name": "<dimension name>",
      "weight": <percentage>,
      "score": <integer 0-100>,
      "weighted_score": <calculated score>,
      "raw_input": "<summary of what was found in documents>",
      "standardized_output": "<AI analysis and interpretation>",
      "risk_flags": ["<any concerns>"]
    }
  ],
  "document_verification_log": [
    {
      "document": "<document name>",
      "verification_method": "<how it was verified>",
      "status": "<VERIFIED|PENDING|MISSING|ISSUE>",
      "score": <1-10>,
      "notes": "<any notes>"
    }
  ],
  "project_summary": "<2-3 paragraph executive summary of the project>",
  "recommendations": [
    {
      "priority": "<HIGH|MEDIUM|LOW>",
      "category": "<what area>",
      "recommendation": "<specific actionable recommendation>",
      "potential_score_impact": "<+X points if addressed>"
    }
  ],
  "risk_factors": [
    {
      "severity": "<HIGH|MEDIUM|LOW>",
      "factor": "<risk description>",
      "mitigation": "<suggested mitigation>"
    }
  ],
  "eligible_for_listing": <boolean>,
  "term_sheet_data": <null if score < 60, otherwise object with suggested terms>
}`;

    const userPrompt = `Analyze the following project submission for asset standardization scoring:

PROJECT DESCRIPTION:
${submission.project_description || "No description provided"}

KYC SIGNATORIES:
${JSON.stringify(submission.kyc_signatories || [], null, 2)}

SUBMITTED DOCUMENTS (${allFiles.length} files):
${allFiles.map(f => `- ${f.name} (Category: ${f.category})`).join("\n") || "No documents uploaded yet"}

Based on the available information, generate a comprehensive Asset Standardization Score analysis. 
If key documents are missing, factor that into your scoring and provide specific recommendations for what needs to be submitted.
Be thorough but fair - consider what can be inferred from the available data.`;

    // Call Lovable AI
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI Gateway error:", aiResponse.status, errorText);
      
      // Update report as failed
      await supabase
        .from("asset_analysis_reports")
        .update({ analysis_status: "failed" })
        .eq("id", reportId);

      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error("AI analysis failed");
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content;

    if (!aiContent) {
      throw new Error("No content in AI response");
    }

    // Parse AI response (extract JSON from potential markdown)
    let analysisResult;
    try {
      const jsonMatch = aiContent.match(/```json\n?([\s\S]*?)\n?```/) || 
                        aiContent.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : aiContent;
      analysisResult = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Failed to parse AI response:", aiContent);
      throw new Error("Failed to parse AI analysis");
    }

    // Update the analysis report
    const { error: updateError } = await supabase
      .from("asset_analysis_reports")
      .update({
        total_score: analysisResult.total_score,
        grade: analysisResult.grade,
        grade_label: analysisResult.grade_label,
        document_completeness_score: analysisResult.document_completeness_score,
        score_dimensions: analysisResult.score_dimensions,
        document_verification_log: analysisResult.document_verification_log,
        project_summary: analysisResult.project_summary,
        recommendations: analysisResult.recommendations,
        risk_factors: analysisResult.risk_factors,
        analysis_status: "completed",
        ai_model_version: "Bakua AI Engine v1.0 (Gemini 2.5 Pro)",
      })
      .eq("id", reportId);

    if (updateError) throw updateError;

    // If score >= 60, generate term sheet
    let termSheetId = null;
    if (analysisResult.total_score >= PASSING_THRESHOLD && analysisResult.term_sheet_data) {
      const termSheetRef = generateRefCode("TS", industry);
      
      const { data: termSheet, error: tsError } = await supabase
        .from("term_sheets")
        .insert({
          analysis_report_id: reportId,
          user_id: submission.user_id,
          reference_code: termSheetRef,
          transaction_name: analysisResult.term_sheet_data?.transaction_name || submission.project_description,
          facility_amount_fcfa: analysisResult.term_sheet_data?.facility_amount_fcfa,
          facility_amount_usd: analysisResult.term_sheet_data?.facility_amount_usd,
          tenor_months: analysisResult.term_sheet_data?.tenor_months || 36,
          target_irr: analysisResult.term_sheet_data?.target_irr || "15-20%",
          effective_rate: analysisResult.term_sheet_data?.effective_rate || "12.5%",
          milestones: analysisResult.term_sheet_data?.milestones || [],
          repayment_schedule: analysisResult.term_sheet_data?.repayment_schedule || [],
          fees: analysisResult.term_sheet_data?.fees || [],
          security_package: analysisResult.term_sheet_data?.security_package || [],
          conditions_precedent: analysisResult.term_sheet_data?.conditions_precedent || [],
          events_of_default: analysisResult.term_sheet_data?.events_of_default || [],
          valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        })
        .select()
        .single();

      if (!tsError && termSheet) {
        termSheetId = termSheet.id;
      }
    }

    // Update submission status
    await supabase
      .from("document_submissions")
      .update({ 
        status: analysisResult.total_score >= PASSING_THRESHOLD ? "approved" : "rejected",
        reviewed_at: new Date().toISOString(),
        reviewer_notes: `AI Analysis Score: ${analysisResult.grade} (${analysisResult.grade_label})`
      })
      .eq("id", submission_id);

    return new Response(
      JSON.stringify({
        success: true,
        report_id: reportId,
        score: analysisResult.total_score,
        grade: analysisResult.grade,
        grade_label: analysisResult.grade_label,
        eligible_for_listing: analysisResult.total_score >= PASSING_THRESHOLD,
        term_sheet_id: termSheetId,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Analysis error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Analysis failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
