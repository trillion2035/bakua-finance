import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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

    // Fetch profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", submission.user_id)
      .single();

    // Fetch analysis report
    const { data: report } = await supabase
      .from("asset_analysis_reports")
      .select("*")
      .eq("submission_id", submission_id)
      .single();

    // Fetch term sheet
    let termSheet = null;
    if (report) {
      const { data: ts } = await supabase
        .from("term_sheets")
        .select("*")
        .eq("analysis_report_id", report.id)
        .maybeSingle();
      termSheet = ts;
    }

    const companyName = profile?.company_name || profile?.full_name || "The Company";
    const projectDescription = submission.project_description || "Agricultural project";

    if (stage_key === "spv_doc_creation") {
      // Generate Articles of Association
      const systemPrompt = `You are a legal document drafting AI specializing in SPV (Special Purpose Vehicle) incorporation documents for structured finance in Cameroon and OHADA jurisdictions. Generate professional, legally-sound documents.`;

      const userPrompt = `Draft the Articles of Association (Statuts) for an SPV to be incorporated for the following project:

Company/Project: ${companyName}
Project Description: ${projectDescription}
Capital Target: ${termSheet?.facility_amount_fcfa ? `FCFA ${termSheet.facility_amount_fcfa.toLocaleString()}` : "To be determined"}
${termSheet?.transaction_name ? `Transaction Name: ${termSheet.transaction_name}` : ""}
Asset Score: ${report?.grade || "Pending"} (${report?.total_score || 0}/100)
Industry: ${report?.industry || "agriculture"}

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

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
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
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (response.status === 402) {
          return new Response(JSON.stringify({ error: "Payment required." }), {
            status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        throw new Error("AI generation failed");
      }

      const aiResult = await response.json();
      const content = aiResult.choices?.[0]?.message?.content || "";

      // Save the generated document
      const { data: doc, error: docErr } = await supabase
        .from("generated_documents")
        .insert({
          submission_id,
          user_id: submission.user_id,
          stage_key: "spv_doc_creation",
          document_name: "Articles of Association (Statuts)",
          document_type: "articles_of_association",
          content,
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

    // Placeholder for facility_doc_creation (will be implemented when user provides the 9 document names)
    if (stage_key === "facility_doc_creation") {
      return new Response(JSON.stringify({ error: "Facility document generation not yet configured. Awaiting document list." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
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
