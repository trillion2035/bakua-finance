import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(supabaseUrl, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });

  const body = await req.json().catch(() => ({}));
  const email = "emmanuel@mhcc.cm";

  // Find user
  const { data: existingUsers } = await admin.auth.admin.listUsers();
  const existing = existingUsers?.users?.find((u: any) => u.email === email);

  if (body.action === "delete") {
    if (!existing) {
      return new Response(JSON.stringify({ success: true, message: "User not found, nothing to delete" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const userId = existing.id;

    // Delete all SPV-related data
    const { data: spvs } = await admin.from("spvs").select("id").eq("owner_id", userId);
    if (spvs) {
      for (const spv of spvs) {
        await Promise.all([
          admin.from("harvest_data").delete().eq("spv_id", spv.id),
          admin.from("monthly_financials").delete().eq("spv_id", spv.id),
          admin.from("ndvi_readings").delete().eq("spv_id", spv.id),
          admin.from("sensor_readings").delete().eq("spv_id", spv.id),
          admin.from("oracle_events").delete().eq("spv_id", spv.id),
          admin.from("spv_milestones").delete().eq("spv_id", spv.id),
          admin.from("spv_documents").delete().eq("spv_id", spv.id),
          admin.from("spv_contracts").delete().eq("spv_id", spv.id),
          admin.from("spv_score_dimensions").delete().eq("spv_id", spv.id),
          admin.from("investor_segments").delete().eq("spv_id", spv.id),
          admin.from("investments").delete().eq("spv_id", spv.id),
        ]);
      }
      await admin.from("spvs").delete().eq("owner_id", userId);
    }

    // Delete user data
    await admin.from("notifications").delete().eq("user_id", userId);
    await admin.from("user_roles").delete().eq("user_id", userId);
    await admin.from("profiles").delete().eq("user_id", userId);

    // Delete auth user
    await admin.auth.admin.deleteUser(userId);

    return new Response(JSON.stringify({ success: true, message: "User and all data deleted" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  return new Response(JSON.stringify({ error: "Use action: delete" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
});
