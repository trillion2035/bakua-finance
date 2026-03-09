import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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

    // Derive mainnet RPC from Alchemy key in BASE_RPC_URL
    let rpcUrl: string;
    if (network === "mainnet") {
      // Extract Alchemy API key from the testnet URL and build mainnet URL
      const alchemyKeyMatch = BASE_RPC_URL.match(/\/v2\/(.+)$/);
      if (alchemyKeyMatch) {
        rpcUrl = `https://base-mainnet.g.alchemy.com/v2/${alchemyKeyMatch[1]}`;
      } else {
        rpcUrl = "https://mainnet.base.org";
      }
    } else {
      rpcUrl = BASE_RPC_URL;
    }
    const chainId = network === "mainnet" ? 8453 : 84532;
    const networkName = network === "mainnet" ? "Base Mainnet" : "Base Sepolia";
    const networkLabel = network === "mainnet" ? "mainnet" : "testnet";

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

    // Get profile for SPV naming
    const { data: profile } = await supabase.from("profiles").select("*").eq("user_id", submission.user_id).single();
    const { data: report } = await supabase.from("asset_analysis_reports").select("*").eq("submission_id", submission_id).single();

    const spvName = profile?.company_name || "Bakua SPV";
    const industry = report?.industry || "agriculture";

    // For mainnet, check if there's a successful testnet deployment to reuse the same source code
    let soliditySource = "";
    if (network === "mainnet") {
      const { data: testnetRecord } = await supabase
        .from("generated_documents")
        .select("content")
        .eq("submission_id", submission_id)
        .eq("document_type", "sc_deployment_record")
        .order("created_at", { ascending: false })
        .limit(1);

      if (testnetRecord?.[0]?.content) {
        // Extract source code from existing deployment record
        const sourceMatch = testnetRecord[0].content.match(/## Source Code\s*```solidity\s*([\s\S]*?)```/);
        if (sourceMatch) {
          soliditySource = sourceMatch[1].trim();
          console.log(`Reusing verified source code from previous deployment (${soliditySource.length} chars)`);
        }
      }
    }

    // If no existing source (or testnet deployment), generate fresh
    if (!soliditySource) {
      console.log("Asking AI to produce deployment-ready Solidity code...");

      const usdcAddress = network === "mainnet"
        ? "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"  // USDC on Base Mainnet
        : "0x036CbD53842c5426634e7929541eC2318f3dCF7e";  // USDC on Base Sepolia

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
10. Use USDC address: ${usdcAddress} (or accept as constructor param)
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
      soliditySource = aiResult.choices?.[0]?.message?.content || "";

      soliditySource = soliditySource
        .replace(/^```solidity\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

      if (!soliditySource.includes("pragma solidity")) {
        throw new Error("AI did not produce valid Solidity code");
      }
    }

    console.log(`Generated Solidity contract (${soliditySource.length} chars)`);

    // Compile using solc
    console.log("Compiling Solidity...");
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
    if (errors.length > 0) {
      const errorMessages = errors.map((e: any) => e.formattedMessage || e.message).join("\n");
      console.error("Solidity compilation errors:", errorMessages);

      await supabase.from("generated_documents").insert({
        submission_id, user_id: submission.user_id, stage_key: "sc_deployment",
        document_name: `Deployment Attempt (${networkLabel}) - Compilation Failed`,
        document_type: "sc_deployment_log", status: "failed",
        content: `## Compilation Errors\n\n${errorMessages}\n\n## Source Code\n\n\`\`\`solidity\n${soliditySource}\n\`\`\``,
      });

      return new Response(JSON.stringify({
        success: false, error: "Solidity compilation failed",
        compilation_errors: errorMessages, source_code: soliditySource,
      }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const contracts = solcOutput.contracts?.["SPVContract.sol"];
    if (!contracts) throw new Error("No contracts found in compilation output");

    const contractName = Object.keys(contracts)[0];
    const compiledContract = contracts[contractName];
    const abi = compiledContract.abi;
    const bytecode = "0x" + compiledContract.evm.bytecode.object;

    if (!bytecode || bytecode === "0x") throw new Error("Compilation produced empty bytecode");

    console.log(`Compiled ${contractName}: ABI has ${abi.length} entries, bytecode ${bytecode.length} chars`);

    // Deploy using ethers.js
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

    const factory = new ethers.ContractFactory(abi, bytecode, wallet);

    // Dynamically build constructor arguments based on ABI
    const constructorAbi = abi.find((item: any) => item.type === "constructor");
    const constructorArgs: any[] = [];

    if (constructorAbi && constructorAbi.inputs) {
      const USDC_ADDRESS = network === "mainnet"
        ? "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
        : "0x036CbD53842c5426634e7929541eC2318f3dCF7e";

      for (const input of constructorAbi.inputs) {
        const name = (input.name || "").toLowerCase();
        const type = input.type;

        if (type === "string") {
          constructorArgs.push(spvName);
        } else if (type === "address") {
          if (name.includes("usdc") || name.includes("token") || name.includes("erc20")) {
            constructorArgs.push(USDC_ADDRESS);
          } else {
            constructorArgs.push(deployerAddress);
          }
        } else if (type.startsWith("uint")) {
          constructorArgs.push(0);
        } else if (type === "bool") {
          constructorArgs.push(true);
        } else {
          constructorArgs.push(ethers.ZeroAddress);
        }
      }
    }

    console.log(`Constructor args (${constructorArgs.length}):`, JSON.stringify(constructorArgs));

    // Get fresh nonce to avoid "already known" errors from previous attempts
    const nonce = await provider.getTransactionCount(deployerAddress, "pending");
    console.log(`Using nonce: ${nonce}`);

    let deployTx: any;
    try {
      deployTx = await factory.deploy(...constructorArgs, { nonce });
    } catch (deployError: any) {
      console.error("Deploy failed:", deployError.message);
      throw new Error(`Deployment failed: ${deployError.message}`);
    }

    console.log(`Transaction sent: ${deployTx.deploymentTransaction()?.hash}`);

    await deployTx.waitForDeployment();
    const contractAddress = await deployTx.getAddress();
    const txHash = deployTx.deploymentTransaction()?.hash;

    console.log(`Contract deployed at: ${contractAddress} (tx: ${txHash})`);

    // Store in database
    let spvId = submission.spv_id;
    if (!spvId) {
      const { data: existingSpv } = await supabase
        .from("spvs").select("id").eq("owner_id", submission.user_id).limit(1).single();
      spvId = existingSpv?.id;
    }

    if (spvId) {
      await supabase.from("spv_contracts").insert({
        spv_id: spvId,
        name: contractName,
        address: contractAddress,
        deployed_date: new Date().toISOString().split("T")[0],
        network: networkLabel,
      });
    }

    const explorerBase = network === "mainnet" ? "https://basescan.org" : "https://sepolia.basescan.org";
    const explorerUrl = `${explorerBase}/address/${contractAddress}`;
    const txExplorerUrl = `${explorerBase}/tx/${txHash}`;

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
      submission_id, user_id: submission.user_id, stage_key: "sc_deployment",
      document_name: `Deployed (${networkName}): ${contractName}`,
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
      network_label: networkLabel,
      chain_id: chainId,
      deployer: deployerAddress,
      explorer_url: explorerUrl,
      tx_explorer_url: txExplorerUrl,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (e) {
    console.error("deploy-smart-contract error:", e);
    return new Response(JSON.stringify({
      success: false,
      error: e instanceof Error ? e.message : "Unknown deployment error",
    }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
