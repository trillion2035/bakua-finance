import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * Smart Contract Deployment Edge Function
 * 
 * 1. Collects all Solidity code from sc_step_output documents
 * 2. Sends to AI to produce a single, deployable, flattened Solidity contract
 * 3. Compiles using solc (loaded from CDN)
 * 4. Deploys to Base Sepolia (or mainnet) using ethers.js
 * 5. Stores contract address in spv_contracts + generated_documents
 */

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const DEPLOYER_PRIVATE_KEY = Deno.env.get("DEPLOYER_PRIVATE_KEY");
    const BASE_RPC_URL = Deno.env.get("BASE_RPC_URL") || "https://sepolia.base.org";
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!DEPLOYER_PRIVATE_KEY) throw new Error("DEPLOYER_PRIVATE_KEY is not configured");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { submission_id, network } = await req.json();
    if (!submission_id) throw new Error("submission_id is required");

    const rpcUrl = network === "mainnet" ? (BASE_RPC_URL.includes("sepolia") ? "https://mainnet.base.org" : BASE_RPC_URL) : BASE_RPC_URL;
    const chainId = network === "mainnet" ? 8453 : 84532;
    const networkName = network === "mainnet" ? "Base Mainnet" : "Base Sepolia";

    console.log(`Deploying to ${networkName} (chainId: ${chainId}, rpc: ${rpcUrl})`);

    // 1. Fetch submission + context
    const { data: submission, error: subErr } = await supabase
      .from("document_submissions")
      .select("*")
      .eq("id", submission_id)
      .single();
    if (subErr || !submission) throw new Error("Submission not found");

    // 2. Gather all step outputs (Solidity code from development steps)
    const { data: stepOutputs } = await supabase
      .from("generated_documents")
      .select("document_name, content")
      .eq("submission_id", submission_id)
      .eq("document_type", "sc_step_output")
      .order("created_at", { ascending: true });

    // Also get the SC spec for context
    const { data: specDocs } = await supabase
      .from("generated_documents")
      .select("content")
      .eq("submission_id", submission_id)
      .eq("stage_key", "sc_specifications")
      .order("created_at", { ascending: false })
      .limit(1);

    // Get the development plan for context
    const { data: planDocs } = await supabase
      .from("generated_documents")
      .select("content")
      .eq("submission_id", submission_id)
      .eq("document_type", "sc_development_plan")
      .order("created_at", { ascending: false })
      .limit(1);

    const allStepCode = stepOutputs?.map((o: any) => `### ${o.document_name}\n${o.content || ""}`).join("\n\n---\n\n") || "";
    const specContent = specDocs?.[0]?.content || "";
    let planData: any = null;
    try { planData = planDocs?.[0]?.content ? JSON.parse(planDocs[0].content) : null; } catch {}

    // Get profile for SPV naming
    const { data: profile } = await supabase.from("profiles").select("*").eq("user_id", submission.user_id).single();
    const { data: report } = await supabase.from("asset_analysis_reports").select("*").eq("submission_id", submission_id).single();

    const spvName = profile?.company_name || "Bakua SPV";
    const industry = report?.industry || "agriculture";

    // 3. Ask AI to produce a single, compilable, flattened Solidity contract
    console.log("Asking AI to produce deployment-ready Solidity code...");

    const consolidationPrompt = `You are a senior Solidity engineer. Your task is to produce a SINGLE, COMPILABLE, SELF-CONTAINED Solidity smart contract that can be deployed directly.

CONTEXT:
- This is for an SPV (Special Purpose Vehicle) called "${spvName}" in the ${industry} industry.
- Network: ${networkName} (Base L2, EVM-compatible)
- The contract should handle: investor deposits (USDC), milestone disbursements, repayment waterfall, and basic governance.

DEVELOPMENT WORK COMPLETED:
${allStepCode.substring(0, 20000)}

SPECIFICATION EXCERPT:
${(specContent || "").substring(0, 5000)}

CRITICAL REQUIREMENTS:
1. Output ONLY valid Solidity code - no markdown, no explanations, no code fences
2. Use EXACTLY this pragma: pragma solidity 0.8.28;
3. Do NOT import from external files (no @openzeppelin imports) - inline everything needed
4. The contract must compile with solc 0.8.28 without errors
5. Use ONLY ASCII characters everywhere. NO Unicode, NO Chinese characters, NO non-ASCII.
6. Use ONLY standard Solidity syntax. Use .length for arrays, NOT .size(). Do NOT define helper libraries.
7. Use standard modifier names like onlyAdmin, onlyManager - plain English camelCase.
8. Include a constructor that accepts (string memory _name, address _admin)
9. Include basic functions: deposit, withdraw, disburseMilestone, getBalance, getInvestorBalance
10. Use USDC address for Base Sepolia: 0x036CbD53842c5426634e7929541eC2318f3dCF7e (or accept as constructor param)
11. Add events for all state changes
12. Start with: // SPDX-License-Identifier: MIT

Output the complete Solidity source code only.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a Solidity compiler. Output ONLY valid Solidity code. No markdown, no explanations, no code fences. Start directly with // SPDX-License-Identifier: MIT" },
          { role: "user", content: consolidationPrompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI consolidation error:", aiResponse.status, errText);
      throw new Error(`AI failed to generate contract code: ${aiResponse.status}`);
    }

    const aiResult = await aiResponse.json();
    let soliditySource = aiResult.choices?.[0]?.message?.content || "";

    // Clean up any markdown fences the AI might have included
    soliditySource = soliditySource
      .replace(/^```solidity\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    if (!soliditySource.includes("pragma solidity")) {
      throw new Error("AI did not produce valid Solidity code");
    }

    console.log(`Generated Solidity contract (${soliditySource.length} chars)`);

    // 4. Compile using solc via JSON input
    console.log("Compiling Solidity...");
    
    // Import solc dynamically
    const solcModule = await import("https://esm.sh/solc@0.8.28");
    const solc = solcModule.default || solcModule;

    const solcInput = JSON.stringify({
      language: "Solidity",
      sources: {
        "SPVContract.sol": { content: soliditySource },
      },
      settings: {
        outputSelection: {
          "*": {
            "*": ["abi", "evm.bytecode.object"],
          },
        },
        optimizer: { enabled: true, runs: 200 },
      },
    });

    const solcOutput = JSON.parse(solc.compile(solcInput));

    // Check for compilation errors
    const errors = solcOutput.errors?.filter((e: any) => e.severity === "error") || [];
    if (errors.length > 0) {
      const errorMessages = errors.map((e: any) => e.formattedMessage || e.message).join("\n");
      console.error("Solidity compilation errors:", errorMessages);

      // Store the error and source code for debugging
      await supabase.from("generated_documents").insert({
        submission_id,
        user_id: submission.user_id,
        stage_key: "sc_deployment",
        document_name: "Deployment Attempt - Compilation Failed",
        document_type: "sc_deployment_log",
        content: `## Compilation Errors\n\n${errorMessages}\n\n## Source Code\n\n\`\`\`solidity\n${soliditySource}\n\`\`\``,
        status: "failed",
      });

      return new Response(JSON.stringify({
        success: false,
        error: "Solidity compilation failed",
        compilation_errors: errorMessages,
        source_code: soliditySource,
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get the compiled contract (first contract found)
    const contracts = solcOutput.contracts?.["SPVContract.sol"];
    if (!contracts) throw new Error("No contracts found in compilation output");

    const contractName = Object.keys(contracts)[0];
    const compiledContract = contracts[contractName];
    const abi = compiledContract.abi;
    const bytecode = "0x" + compiledContract.evm.bytecode.object;

    if (!bytecode || bytecode === "0x") {
      throw new Error("Compilation produced empty bytecode");
    }

    console.log(`Compiled ${contractName}: ABI has ${abi.length} entries, bytecode ${bytecode.length} chars`);

    // 5. Deploy using ethers.js
    console.log(`Deploying ${contractName} to ${networkName}...`);

    const { ethers } = await import("https://esm.sh/ethers@6.13.4");

    const provider = new ethers.JsonRpcProvider(rpcUrl, chainId);
    const wallet = new ethers.Wallet(DEPLOYER_PRIVATE_KEY, provider);

    const deployerAddress = wallet.address;
    const balance = await provider.getBalance(deployerAddress);
    console.log(`Deployer: ${deployerAddress}, Balance: ${ethers.formatEther(balance)} ETH`);

    if (balance === 0n) {
      throw new Error(`Deployer wallet ${deployerAddress} has no ETH on ${networkName}. Please fund it first.`);
    }

    // Deploy the contract
    const factory = new ethers.ContractFactory(abi, bytecode, wallet);

    // Determine constructor params - try SPV name and admin address
    let deployTx: any;
    try {
      // Try deploying with (string name, address admin) constructor
      const constructorAbi = abi.find((item: any) => item.type === "constructor");
      if (constructorAbi && constructorAbi.inputs?.length >= 2) {
        deployTx = await factory.deploy(spvName, deployerAddress);
      } else if (constructorAbi && constructorAbi.inputs?.length === 1) {
        // Single param - likely admin address or name
        const paramType = constructorAbi.inputs[0].type;
        deployTx = paramType === "address" ? await factory.deploy(deployerAddress) : await factory.deploy(spvName);
      } else {
        deployTx = await factory.deploy();
      }
    } catch (deployError: any) {
      console.error("Deploy with params failed, trying no-args:", deployError.message);
      try {
        deployTx = await factory.deploy();
      } catch (e2: any) {
        throw new Error(`Deployment failed: ${e2.message}`);
      }
    }

    console.log(`Transaction sent: ${deployTx.deploymentTransaction()?.hash}`);

    // Wait for deployment
    const receipt = await deployTx.waitForDeployment();
    const contractAddress = await deployTx.getAddress();
    const txHash = deployTx.deploymentTransaction()?.hash;

    console.log(`✅ Contract deployed at: ${contractAddress} (tx: ${txHash})`);

    // 6. Store in database
    // Get or create SPV record
    let spvId = submission.spv_id;
    if (!spvId) {
      // Try to find an existing SPV for this owner
      const { data: existingSpv } = await supabase
        .from("spvs")
        .select("id")
        .eq("owner_id", submission.user_id)
        .limit(1)
        .single();
      spvId = existingSpv?.id;
    }

    if (spvId) {
      // Store contract in spv_contracts
      await supabase.from("spv_contracts").insert({
        spv_id: spvId,
        name: contractName,
        address: contractAddress,
        deployed_date: new Date().toISOString().split("T")[0],
      });
    }

    const explorerUrl = network === "mainnet"
      ? `https://basescan.org/address/${contractAddress}`
      : `https://sepolia.basescan.org/address/${contractAddress}`;

    const txExplorerUrl = network === "mainnet"
      ? `https://basescan.org/tx/${txHash}`
      : `https://sepolia.basescan.org/tx/${txHash}`;

    // Store deployment record as generated document
    const deploymentRecord = `# Smart Contract Deployment Record

## Deployment Summary
- **Contract Name:** ${contractName}
- **Network:** ${networkName}
- **Chain ID:** ${chainId}
- **Contract Address:** \`${contractAddress}\`
- **Transaction Hash:** \`${txHash}\`
- **Deployer Address:** \`${deployerAddress}\`
- **Deployed At:** ${new Date().toISOString()}
- **Block Explorer:** [View Contract](${explorerUrl})
- **Transaction:** [View Transaction](${txExplorerUrl})

## Contract ABI
\`\`\`json
${JSON.stringify(abi, null, 2)}
\`\`\`

## Source Code
\`\`\`solidity
${soliditySource}
\`\`\`

## Compiler Settings
- Solidity Version: 0.8.28
- Optimizer: Enabled (200 runs)
- EVM Target: Default (Shanghai)
`;

    await supabase.from("generated_documents").insert({
      submission_id,
      user_id: submission.user_id,
      stage_key: "sc_deployment",
      document_name: `Deployed: ${contractName}`,
      document_type: "sc_deployment_record",
      content: deploymentRecord,
      status: "verified",
    });

    return new Response(JSON.stringify({
      success: true,
      contract_name: contractName,
      contract_address: contractAddress,
      tx_hash: txHash,
      network: networkName,
      chain_id: chainId,
      deployer: deployerAddress,
      explorer_url: explorerUrl,
      tx_explorer_url: txExplorerUrl,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("deploy-smart-contract error:", e);
    return new Response(JSON.stringify({
      success: false,
      error: e instanceof Error ? e.message : "Unknown deployment error",
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
