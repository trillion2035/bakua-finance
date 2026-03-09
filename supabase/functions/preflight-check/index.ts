import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * Pre-flight Check Edge Function
 * 
 * Validates deployment readiness before actual smart contract deployment:
 * 1. Checks DEPLOYER_PRIVATE_KEY and BASE_RPC_URL secrets exist
 * 2. Checks wallet ETH balance on target network
 * 3. Checks all development step outputs exist
 * 4. Consolidates Solidity code via AI and attempts compilation
 * 5. Returns pass/fail for each check with details
 * 
 * mode: "check" (default) — just validate
 * mode: "fix" — attempt AI auto-fix for compilation errors
 */

interface CheckResult {
  id: string;
  label: string;
  status: "pass" | "fail" | "warning";
  message: string;
  details?: string;
  fixable?: boolean;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { submission_id, network = "testnet", mode = "check" } = await req.json();
    if (!submission_id) throw new Error("submission_id is required");

    const checks: CheckResult[] = [];
    const rpcUrl = network === "mainnet" ? "https://mainnet.base.org" : (Deno.env.get("BASE_RPC_URL") || "https://sepolia.base.org");
    const chainId = network === "mainnet" ? 8453 : 84532;
    const networkName = network === "mainnet" ? "Base Mainnet" : "Base Sepolia";

    // ── Check 1: Secrets configured ──
    const deployerKey = Deno.env.get("DEPLOYER_PRIVATE_KEY");
    const lovableKey = Deno.env.get("LOVABLE_API_KEY");

    if (!deployerKey) {
      checks.push({ id: "secrets_deployer", label: "Deployer Private Key", status: "fail", message: "DEPLOYER_PRIVATE_KEY secret is not configured.", fixable: false });
    } else {
      checks.push({ id: "secrets_deployer", label: "Deployer Private Key", status: "pass", message: "DEPLOYER_PRIVATE_KEY is configured." });
    }

    if (!lovableKey) {
      checks.push({ id: "secrets_ai", label: "AI API Key", status: "fail", message: "LOVABLE_API_KEY is not configured. AI consolidation will fail.", fixable: false });
    } else {
      checks.push({ id: "secrets_ai", label: "AI API Key", status: "pass", message: "AI API key is configured." });
    }

    // ── Check 2: Wallet balance ──
    if (deployerKey) {
      try {
        const { ethers } = await import("https://esm.sh/ethers@6.13.4");
        const provider = new ethers.JsonRpcProvider(rpcUrl, chainId);
        const wallet = new ethers.Wallet(deployerKey, provider);
        const balance = await provider.getBalance(wallet.address);
        const balanceEth = ethers.formatEther(balance);

        if (balance === 0n) {
          checks.push({
            id: "wallet_balance",
            label: "Wallet Balance",
            status: "fail",
            message: `Wallet ${wallet.address} has 0 ETH on ${networkName}. Deployment requires gas fees.`,
            details: network === "testnet"
              ? "Get free testnet ETH from https://www.base.org/faucet or https://faucets.chain.link/base-sepolia"
              : "Transfer ETH to your deployer wallet on Base Mainnet.",
            fixable: false,
          });
        } else if (parseFloat(balanceEth) < 0.001) {
          checks.push({
            id: "wallet_balance",
            label: "Wallet Balance",
            status: "warning",
            message: `Wallet has ${balanceEth} ETH — might not be enough for deployment gas. Consider adding more.`,
            details: `Wallet: ${wallet.address}`,
          });
        } else {
          checks.push({
            id: "wallet_balance",
            label: "Wallet Balance",
            status: "pass",
            message: `Wallet has ${balanceEth} ETH on ${networkName}.`,
            details: `Wallet: ${wallet.address}`,
          });
        }
      } catch (e: any) {
        checks.push({
          id: "wallet_balance",
          label: "Wallet Balance",
          status: "fail",
          message: `Failed to check wallet balance: ${e.message}`,
          details: `RPC: ${rpcUrl}`,
          fixable: false,
        });
      }
    }

    // ── Check 3: Development step outputs exist ──
    const { data: stepOutputs } = await supabase
      .from("generated_documents")
      .select("document_name, content")
      .eq("submission_id", submission_id)
      .eq("document_type", "sc_step_output")
      .order("created_at", { ascending: true });

    if (!stepOutputs || stepOutputs.length === 0) {
      checks.push({
        id: "step_outputs",
        label: "Development Step Outputs",
        status: "fail",
        message: "No smart contract development step outputs found. Run the AI Development Agent first and execute all steps.",
        fixable: false,
      });
    } else {
      // Check if any steps have empty content
      const emptySteps = stepOutputs.filter((s: any) => !s.content || s.content.trim().length < 50);
      if (emptySteps.length > 0) {
        checks.push({
          id: "step_outputs",
          label: "Development Step Outputs",
          status: "warning",
          message: `${stepOutputs.length} step outputs found, but ${emptySteps.length} have very little content.`,
          details: `Steps with issues: ${emptySteps.map((s: any) => s.document_name).join(", ")}`,
        });
      } else {
        checks.push({
          id: "step_outputs",
          label: "Development Step Outputs",
          status: "pass",
          message: `${stepOutputs.length} development step outputs found with valid content.`,
        });
      }
    }

    // ── Check 4: SC Specification exists ──
    const { data: specDocs } = await supabase
      .from("generated_documents")
      .select("id")
      .eq("submission_id", submission_id)
      .eq("stage_key", "sc_specifications")
      .limit(1);

    if (!specDocs || specDocs.length === 0) {
      checks.push({
        id: "spec_doc",
        label: "SC Specification Document",
        status: "warning",
        message: "No SC specification document found. AI will have less context for code consolidation.",
      });
    } else {
      checks.push({
        id: "spec_doc",
        label: "SC Specification Document",
        status: "pass",
        message: "SC specification document exists.",
      });
    }

    // ── Check 5: Compilation test ──
    // Only attempt if we have step outputs and AI key
    if (stepOutputs && stepOutputs.length > 0 && lovableKey) {
      try {
        const { data: submission } = await supabase
          .from("document_submissions")
          .select("user_id")
          .eq("id", submission_id)
          .single();

        const { data: profile } = await supabase
          .from("profiles")
          .select("company_name")
          .eq("user_id", submission?.user_id)
          .single();

        const spvName = profile?.company_name || "Bakua SPV";

        const allStepCode = stepOutputs.map((o: any) => `### ${o.document_name}\n${o.content || ""}`).join("\n\n---\n\n");

        const isFixMode = mode === "fix";
        
        // Fetch previous compilation errors if in fix mode
        let previousErrors = "";
        if (isFixMode) {
          const { data: failedDocs } = await supabase
            .from("generated_documents")
            .select("content")
            .eq("submission_id", submission_id)
            .eq("document_type", "sc_preflight_compile_test")
            .eq("status", "failed")
            .order("created_at", { ascending: false })
            .limit(1);
          
          if (failedDocs?.[0]?.content) {
            previousErrors = failedDocs[0].content;
          }
        }

        const prompt = isFixMode
          ? `You are a senior Solidity engineer. Your task is to produce a SINGLE, COMPILABLE, SELF-CONTAINED Solidity smart contract.

PREVIOUS ATTEMPT FAILED with these errors:
${previousErrors}

FIX all compilation errors. The contract must compile with solc 0.8.28. Use EXACTLY: pragma solidity 0.8.28;

DEVELOPMENT WORK:
${allStepCode.substring(0, 20000)}

CRITICAL REQUIREMENTS:
1. Output ONLY valid Solidity code - no markdown, no explanations, no code fences
2. Use EXACTLY this pragma: pragma solidity 0.8.28;  (DO NOT use 0.8.20 or ^0.8.20)
3. Do NOT import from external files - inline everything needed
4. Must compile without errors
5. Use ONLY ASCII characters in all identifiers, modifiers, function names, and comments. NO Unicode, NO Chinese characters.
5. Include constructor, deposit, withdraw, disburseMilestone, getBalance functions
6. Add events for all state changes
7. Start with: // SPDX-License-Identifier: MIT

Output the complete fixed Solidity source code only.`
          : `You are a senior Solidity engineer. Produce a SINGLE, COMPILABLE Solidity smart contract for an SPV called "${spvName}".

DEVELOPMENT WORK:
${allStepCode.substring(0, 20000)}

CRITICAL REQUIREMENTS:
1. Output ONLY valid Solidity code - no markdown, no explanations, no code fences
2. Use EXACTLY this pragma: pragma solidity 0.8.28;  (DO NOT use 0.8.20 or ^0.8.20)
3. Do NOT import from external files - inline everything
4. Must compile with solc 0.8.28 without errors
5. Use ONLY ASCII characters in all identifiers, modifiers, function names, and comments. NO Unicode, NO Chinese characters.
5. Include constructor, deposit, withdraw, disburseMilestone, getBalance
6. Start with: // SPDX-License-Identifier: MIT

Output the complete Solidity source code only.`;

        console.log(`${isFixMode ? "Fix mode" : "Check mode"}: Asking AI to consolidate contract code...`);

        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${lovableKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              { role: "system", content: "You are a Solidity compiler. Output ONLY valid Solidity code. No markdown, no explanations, no code fences." },
              { role: "user", content: prompt },
            ],
          }),
        });

        if (!aiResponse.ok) {
          checks.push({
            id: "compilation",
            label: "Solidity Compilation",
            status: "fail",
            message: `AI code consolidation failed (HTTP ${aiResponse.status}).`,
            fixable: true,
          });
        } else {
          const aiResult = await aiResponse.json();
          let soliditySource = aiResult.choices?.[0]?.message?.content || "";
          soliditySource = soliditySource
            .replace(/^```solidity\s*/i, "")
            .replace(/^```\s*/i, "")
            .replace(/\s*```$/i, "")
            .trim();

          if (!soliditySource.includes("pragma solidity")) {
            checks.push({
              id: "compilation",
              label: "Solidity Compilation",
              status: "fail",
              message: "AI did not produce valid Solidity code. No 'pragma solidity' found.",
              fixable: true,
            });
          } else {
            // Attempt compilation
            console.log("Compiling Solidity for validation...");
            const solcModule = await import("https://esm.sh/solc@0.8.28");
            const solc = solcModule.default || solcModule;

            const solcInput = JSON.stringify({
              language: "Solidity",
              sources: { "SPVContract.sol": { content: soliditySource } },
              settings: {
                outputSelection: { "*": { "*": ["abi", "evm.bytecode.object"] } },
                optimizer: { enabled: true, runs: 200 },
              },
            });

            const solcOutput = JSON.parse(solc.compile(solcInput));
            const errors = solcOutput.errors?.filter((e: any) => e.severity === "error") || [];
            const warnings = solcOutput.errors?.filter((e: any) => e.severity === "warning") || [];

            if (errors.length > 0) {
              const errorMessages = errors.map((e: any) => e.formattedMessage || e.message).join("\n");
              
              // Store the failed compilation for fix mode reference
              await supabase.from("generated_documents").insert({
                submission_id,
                user_id: submission?.user_id,
                stage_key: "sc_deployment",
                document_name: isFixMode ? "Pre-flight Fix Attempt" : "Pre-flight Compilation Test",
                document_type: "sc_preflight_compile_test",
                content: `## Compilation Errors\n\n${errorMessages}\n\n## Source Code\n\n\`\`\`solidity\n${soliditySource}\n\`\`\``,
                status: "failed",
              });

              checks.push({
                id: "compilation",
                label: "Solidity Compilation",
                status: "fail",
                message: `Compilation failed with ${errors.length} error(s).`,
                details: errorMessages,
                fixable: true,
              });
            } else {
              // Compilation succeeded — store the verified source for deployment to use
              // Delete any previous preflight compile tests first
              await supabase
                .from("generated_documents")
                .delete()
                .eq("submission_id", submission_id)
                .eq("document_type", "sc_preflight_compile_test");

              await supabase.from("generated_documents").insert({
                submission_id,
                user_id: submission?.user_id,
                stage_key: "sc_deployment",
                document_name: "Pre-flight Verified Contract",
                document_type: "sc_preflight_compile_test",
                content: soliditySource,
                status: "verified",
              });

              const contractNames = Object.keys(solcOutput.contracts?.["SPVContract.sol"] || {});
              checks.push({
                id: "compilation",
                label: "Solidity Compilation",
                status: "pass",
                message: `Compilation successful! Contract${contractNames.length > 1 ? "s" : ""}: ${contractNames.join(", ")}`,
                details: warnings.length > 0 ? `${warnings.length} warning(s) — non-blocking.` : undefined,
              });
            }
          }
        }
      } catch (e: any) {
        checks.push({
          id: "compilation",
          label: "Solidity Compilation",
          status: "fail",
          message: `Compilation check failed: ${e.message}`,
          fixable: true,
        });
      }
    }

    // ── Summary ──
    const failCount = checks.filter(c => c.status === "fail").length;
    const warnCount = checks.filter(c => c.status === "warning").length;
    const allPass = failCount === 0;
    const hasFixable = checks.some(c => c.status === "fail" && c.fixable);

    return new Response(JSON.stringify({
      success: true,
      ready: allPass,
      summary: allPass
        ? `All ${checks.length} checks passed. Ready to deploy!`
        : `${failCount} issue(s) found${warnCount > 0 ? `, ${warnCount} warning(s)` : ""}. Please resolve before deploying.`,
      checks,
      has_fixable_issues: hasFixable,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("preflight-check error:", e);
    return new Response(JSON.stringify({
      success: false,
      error: e instanceof Error ? e.message : "Unknown error",
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
