import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const BASESCAN_API_KEY = Deno.env.get("BASESCAN_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!BASESCAN_API_KEY) {
      return new Response(JSON.stringify({
        success: false,
        error: "BASESCAN_API_KEY is not configured. Please add it in project settings.",
      }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { submission_id, network, contract_address } = await req.json();

    if (!submission_id || !contract_address) {
      throw new Error("submission_id and contract_address are required");
    }

    const networkLabel = network === "mainnet" ? "mainnet" : "testnet";
    const apiBase = network === "mainnet"
      ? "https://api.basescan.org/api"
      : "https://api-sepolia.basescan.org/api";

    // Find the deployment record to extract source code and compiler info
    const { data: deployRecords } = await supabase
      .from("generated_documents")
      .select("*")
      .eq("submission_id", submission_id)
      .eq("document_type", "sc_deployment_record")
      .eq("status", "verified");

    const record = deployRecords?.find((r: any) =>
      r.content?.includes(contract_address)
    );

    if (!record?.content) {
      throw new Error("Deployment record not found for this contract");
    }

    // Extract source code from deployment record
    const sourceMatch = record.content.match(/## Source Code\n\n```solidity\n([\s\S]*?)```/);
    if (!sourceMatch) throw new Error("Source code not found in deployment record");
    const sourceCode = sourceMatch[1].trim();

    // Extract contract name
    const nameMatch = record.content.match(/\*\*Contract Name:\*\*\s*(.+)/);
    const contractName = nameMatch?.[1]?.trim() || "SPVContract";

    // Extract constructor arguments (ABI-encoded)
    const abiMatch = record.content.match(/## Contract ABI\n\n```json\n([\s\S]*?)```/);
    let constructorArgs = "";
    // For now, we'll let Basescan auto-detect constructor args

    console.log(`Verifying ${contractName} at ${contract_address} on ${networkLabel}`);

    // Submit verification request to Basescan
    const formData = new URLSearchParams({
      apikey: BASESCAN_API_KEY,
      module: "contract",
      action: "verifysourcecode",
      contractaddress: contract_address,
      sourceCode: sourceCode,
      codeformat: "solidity-single-file",
      contractname: `SPVContract.sol:${contractName}`,
      compilerversion: "v0.8.28+commit.7893614a",
      optimizationUsed: "1",
      runs: "200",
      evmversion: "",
      licenseType: "3", // MIT
    });

    const verifyResponse = await fetch(apiBase, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    });

    const verifyResult = await verifyResponse.json();
    console.log("Basescan verify response:", JSON.stringify(verifyResult));

    if (verifyResult.status === "1") {
      // Verification submitted, now check status
      const guid = verifyResult.result;
      console.log(`Verification GUID: ${guid}`);

      // Poll for verification result (up to 60 seconds)
      let verified = false;
      let statusMessage = "Pending";
      for (let i = 0; i < 12; i++) {
        await new Promise(r => setTimeout(r, 5000));

        const checkUrl = `${apiBase}?apikey=${BASESCAN_API_KEY}&module=contract&action=checkverifystatus&guid=${guid}`;
        const checkResponse = await fetch(checkUrl);
        const checkResult = await checkResponse.json();
        console.log(`Check attempt ${i + 1}:`, JSON.stringify(checkResult));

        if (checkResult.result === "Pass - Verified") {
          verified = true;
          statusMessage = "Verified and Published";
          break;
        } else if (checkResult.result?.includes("Fail")) {
          statusMessage = checkResult.result;
          break;
        }
      }

      const explorerBase = network === "mainnet" ? "https://basescan.org" : "https://sepolia.basescan.org";

      return new Response(JSON.stringify({
        success: verified,
        status: statusMessage,
        contract_address,
        network: networkLabel,
        explorer_url: `${explorerBase}/address/${contract_address}#code`,
        guid,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

    } else {
      // Verification submission failed
      const errorMsg = verifyResult.result || "Unknown error";
      console.error("Verification failed:", errorMsg);

      // Check if already verified
      if (errorMsg.includes("Already Verified")) {
        const explorerBase = network === "mainnet" ? "https://basescan.org" : "https://sepolia.basescan.org";
        return new Response(JSON.stringify({
          success: true,
          status: "Already Verified",
          contract_address,
          network: networkLabel,
          explorer_url: `${explorerBase}/address/${contract_address}#code`,
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      return new Response(JSON.stringify({
        success: false,
        error: `Verification failed: ${errorMsg}`,
        contract_address,
        network: networkLabel,
      }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

  } catch (e) {
    console.error("verify-contract error:", e);
    return new Response(JSON.stringify({
      success: false,
      error: e instanceof Error ? e.message : "Unknown error",
    }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
