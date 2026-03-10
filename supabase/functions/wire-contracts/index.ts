import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const DEPLOYER_PRIVATE_KEY = Deno.env.get("DEPLOYER_PRIVATE_KEY");
    const BASE_RPC_URL = Deno.env.get("BASE_RPC_URL") || "https://sepolia.base.org";
    if (!DEPLOYER_PRIVATE_KEY) throw new Error("DEPLOYER_PRIVATE_KEY not configured");

    const { network = "mainnet", contracts } = await req.json();
    const { ipt, oracle, vault, waterfall } = contracts;

    if (!ipt || !oracle || !vault || !waterfall) {
      throw new Error("All 4 contract addresses required: ipt, oracle, vault, waterfall");
    }

    const isMainnet = network === "mainnet";
    const chainId = isMainnet ? 8453 : 84532;
    let rpcUrl: string;
    if (isMainnet) {
      const m = BASE_RPC_URL.match(/\/v2\/(.+)$/);
      rpcUrl = m ? `https://base-mainnet.g.alchemy.com/v2/${m[1]}` : "https://mainnet.base.org";
    } else {
      rpcUrl = BASE_RPC_URL;
    }

    const { ethers } = await import("https://esm.sh/ethers@6.13.4");
    const provider = new ethers.JsonRpcProvider(rpcUrl, chainId);
    const wallet = new ethers.Wallet(DEPLOYER_PRIVATE_KEY, provider);

    const results: string[] = [];

    // 1. IPT.setMinter(vault)
    const iptAbi = ["function setMinter(address)", "function toggleWhitelist(bool)"];
    const iptContract = new ethers.Contract(ipt, iptAbi, wallet);
    let tx = await iptContract.setMinter(vault);
    await tx.wait();
    results.push(`IPT.setMinter(${vault}) ✓ tx: ${tx.hash}`);
    console.log(results[results.length - 1]);

    // 2. IPT.toggleWhitelist(false) - disable for initial setup
    tx = await iptContract.toggleWhitelist(false);
    await tx.wait();
    results.push(`IPT.toggleWhitelist(false) ✓ tx: ${tx.hash}`);
    console.log(results[results.length - 1]);

    // 3. Oracle.setVault(vault)
    const oracleAbi = ["function setVault(address)"];
    const oracleContract = new ethers.Contract(oracle, oracleAbi, wallet);
    tx = await oracleContract.setVault(vault);
    await tx.wait();
    results.push(`Oracle.setVault(${vault}) ✓ tx: ${tx.hash}`);
    console.log(results[results.length - 1]);

    // 4. Waterfall.setVault(vault)
    const wfAbi = ["function setVault(address)"];
    const wfContract = new ethers.Contract(waterfall, wfAbi, wallet);
    tx = await wfContract.setVault(vault);
    await tx.wait();
    results.push(`Waterfall.setVault(${vault}) ✓ tx: ${tx.hash}`);
    console.log(results[results.length - 1]);

    // 5. Vault.setDistributionWaterfall(waterfall)
    const vaultAbi = ["function setDistributionWaterfall(address)"];
    const vaultContract = new ethers.Contract(vault, vaultAbi, wallet);
    tx = await vaultContract.setDistributionWaterfall(waterfall);
    await tx.wait();
    results.push(`Vault.setDistributionWaterfall(${waterfall}) ✓ tx: ${tx.hash}`);
    console.log(results[results.length - 1]);

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("wire-contracts error:", e);
    return new Response(JSON.stringify({
      success: false, error: e instanceof Error ? e.message : "Unknown error",
    }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
