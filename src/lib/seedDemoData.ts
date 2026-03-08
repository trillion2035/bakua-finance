import { supabase } from "@/integrations/supabase/client";

/**
 * Seeds SPV-01 demo data for a newly registered project owner.
 * Call once after signup completes.
 */
export async function seedDemoData(ownerId: string): Promise<string | null> {
  // 1. Create SPV
  const { data: spv, error: spvErr } = await supabase
    .from("spvs")
    .insert({
      owner_id: ownerId,
      name: "Menoua Highlands Coffee Cooperative",
      spv_code: "SPV-01",
      status: "funded",
      asset_type: "Agriculture",
      target_amount: 47000000,
      target_amount_usd: "$78,250 USDC",
      funded_amount: 47000000,
      funded_percent: 100,
      total_investors: 51,
      total_disbursed: 42100000,
      disbursed_percent: 89.6,
      remaining_in_vault: 4900000,
      currency: "FCFA",
      target_irr: "19.2%",
      projected_irr: "18.7%",
      dsra_reserve: "1,260,000 FCFA",
      listing_date: "Oct 8, 2024",
      fully_funded_date: "Oct 18, 2024",
      full_legal_name: "Bakua SPV-01 Limited",
      registration_no: "RC/YDE/2024/B/4417",
      jurisdiction: "Republic of Cameroon",
      company_type: "SARL — Private Limited Company",
      registered_office: "Rue Narvick, Bastos, Yaoundé",
      incorporation_date: "September 19, 2024",
      capital_social: "1,000,000 FCFA",
      shareholder: "Bakua Finance SARL (100% initially → tokenised)",
      network: "Base (Coinbase L2)",
      auditor: "Hacken.io — Report HAC-2024-1089",
      description: "Specialty Arabica coffee cooperative in Western Highlands of Cameroon",
    })
    .select("id")
    .single();

  if (spvErr || !spv) {
    console.error("Failed to seed SPV:", spvErr);
    return null;
  }

  const spvId = spv.id;

  // 2. Score dimensions
  await supabase.from("spv_score_dimensions").insert([
    { spv_id: spvId, name: "Land Security & Tenure", score: 88, weight: "20%", raw_input: "8/12 full title; 4/12 ACT; GPS validated 480ha", standardized_output: "Tenure Security Index: 0.83" },
    { spv_id: spvId, name: "Pedoclimatic Fitness", score: 85, weight: "18%", raw_input: "pH 5.8–6.4, N/P/K balanced; 1,820mm/yr", standardized_output: "Soil Suitability Index: 0.88" },
    { spv_id: spvId, name: "Crop Variety & Historical Yield", score: 92, weight: "17%", raw_input: "SL-28 (65%), Blue Mountain (25%). 3-yr avg: 820kg/ha", standardized_output: "Yield Index: 0.92" },
    { spv_id: spvId, name: "Market Access & Off-Taker", score: 91, weight: "20%", raw_input: "Sucafina contract: 90MT @ USD 3.40/kg", standardized_output: "Off-taker D&B score: 5A1" },
    { spv_id: spvId, name: "Operator Capability", score: 84, weight: "13%", raw_input: "15 yrs experience; 3 technicians", standardized_output: "Operator Index: 0.84" },
    { spv_id: spvId, name: "Financial Health", score: 86, weight: "12%", raw_input: "FY2023 revenue: 62M FCFA; net margin: 11%", standardized_output: "Financial Index: 0.86" },
  ]);

  // 3. Milestones
  await supabase.from("spv_milestones").insert([
    { spv_id: spvId, milestone_code: "M1", name: "Origination & Setup", amount: "8,350,000 FCFA", amount_raw: 8350000, recipients: "Bakua (origination) · AgriSensors Kenya (IoT) · Bakua ops", oracle_trigger: "Document completeness ≥ 97/100 + smart contract deployed", date_disbursed: "Oct 21, 2024", status: "disbursed", sort_order: 1 },
    { spv_id: spvId, milestone_code: "M2", name: "Pre-Planting Inputs", amount: "12,500,000 FCFA", amount_raw: 12500000, recipients: "MHCC (fertiliser + pesticides) · MHCC (labour advance)", oracle_trigger: "Soil moisture > 18% (6 probes) + land GPS match confirmed", date_disbursed: "Nov 4, 2024", status: "disbursed", sort_order: 2 },
    { spv_id: spvId, milestone_code: "M3", name: "Mid-Season Operations", amount: "9,500,000 FCFA", amount_raw: 9500000, recipients: "MHCC (labour, crop protection) · Mill maintenance", oracle_trigger: "NDVI ≥ 0.55 confirmed by Sentinel-2 + IoT canopy health OK", date_disbursed: "Jan 8, 2025", status: "disbursed", sort_order: 3 },
    { spv_id: spvId, milestone_code: "M4", name: "Harvest Advance", amount: "11,750,000 FCFA", amount_raw: 11750000, recipients: "MHCC (harvest pickers, bags, milling)", oracle_trigger: "Weighbridge confirms ≥ 60MT cherry intake", date_disbursed: "Apr 15, 2025", status: "disbursed", sort_order: 4 },
    { spv_id: spvId, milestone_code: "M5", name: "Processing & Export", amount: "4,900,000 FCFA", amount_raw: 4900000, recipients: "MHCC (export logistics, port fees, ONCC certification)", oracle_trigger: "ONCC export certificate + Sucafina inspection report", date_disbursed: "Pending: June 2025", status: "pending", sort_order: 5 },
  ]);

  // 4. Legal docs
  await supabase.from("spv_documents").insert([
    { spv_id: spvId, name: "Facility Agreement", purpose: "Master loan: 47M FCFA at 12.5% p.a.; 36-month term", parties: "Bakua SPV-01 Ltd / MHCC", signed_date: "Sep 20, 2024", sort_order: 1 },
    { spv_id: spvId, name: "Off-Take Assignment Notice", purpose: "MHCC assigns Sucafina payment rights to SPV-01", parties: "MHCC / SPV-01 / Sucafina", signed_date: "Sep 23, 2024", sort_order: 2 },
    { spv_id: spvId, name: "Land Charge Agreement", purpose: "First-ranking charge over 8 freehold parcels (280ha)", parties: "MHCC / SPV-01", signed_date: "Sep 26, 2024", sort_order: 3 },
    { spv_id: spvId, name: "Blocked Collection Account Agreement", purpose: "Tripartite escrow with Ecobank", parties: "MHCC / SPV-01 / Ecobank", signed_date: "Sep 28, 2024", sort_order: 4 },
    { spv_id: spvId, name: "Security Agreement (Chattel)", purpose: "Charge over mill processing equipment", parties: "MHCC / SPV-01", signed_date: "Sep 28, 2024", sort_order: 5 },
    { spv_id: spvId, name: "Personal Guarantee Agreements", purpose: "Personal guarantees from President & Secretary", parties: "Nkweti / Fon / SPV-01", signed_date: "Oct 1, 2024", sort_order: 6 },
    { spv_id: spvId, name: "Crop Insurance Assignment", purpose: "SAAR crop insurance assigned to SPV-01", parties: "MHCC / SPV-01 / SAAR", signed_date: "Oct 2, 2024", sort_order: 7 },
    { spv_id: spvId, name: "Bakua Service Agreement", purpose: "Origination fee 2%, annual platform fee 2% AUM", parties: "MHCC / Bakua Finance", signed_date: "Oct 4, 2024", sort_order: 8 },
  ]);

  // 5. Contracts
  await supabase.from("spv_contracts").insert([
    { spv_id: spvId, name: "SPV-01 Main Vault", address: "0x7f3A9e2C4B1d88F2a47E3f9C6D0b5A1E8c2F4d6", deployed_date: "Oct 8, 2024" },
    { spv_id: spvId, name: "Investor Token (SPV01-MHCC)", address: "0x3d8B2f1A7C4e9F0b6D3a5E8c1F2B4d7A9e0C3f", deployed_date: "Oct 8, 2024" },
    { spv_id: spvId, name: "Chainlink Oracle Adapter", address: "0x1a5C8F3B7E2d4A9f0C6b8D1e3F5a7B2c4E8d0f", deployed_date: "Oct 7, 2024" },
    { spv_id: spvId, name: "Disbursement Waterfall", address: "0x9b4D1e6F3a8C2f5A7e0B9d3C1F4b8E2a5D7f1c", deployed_date: "Oct 8, 2024" },
  ]);

  // 6. Investor segments
  await supabase.from("investor_segments").insert([
    { spv_id: spvId, name: "Retail / DeFi", usdc_raised: "$35,300", fcfa_equivalent: "21.2M FCFA", percent_of_spv: "45.1%", investor_count: 47 },
    { spv_id: spvId, name: "Mercy Corps Ventures", usdc_raised: "$15,000", fcfa_equivalent: "9.0M FCFA", percent_of_spv: "19.1%", investor_count: 1 },
    { spv_id: spvId, name: "Family Office A (Lagos)", usdc_raised: "$9,500", fcfa_equivalent: "5.7M FCFA", percent_of_spv: "12.1%", investor_count: 1 },
    { spv_id: spvId, name: "Family Office B (London)", usdc_raised: "$6,800", fcfa_equivalent: "4.1M FCFA", percent_of_spv: "8.7%", investor_count: 1 },
    { spv_id: spvId, name: "Bakua Co-Investment", usdc_raised: "$11,650", fcfa_equivalent: "7.0M FCFA", percent_of_spv: "14.9%", investor_count: 1 },
  ]);

  // 7. Harvest data
  await supabase.from("harvest_data").insert([
    { spv_id: spvId, month: "Nov 2024", cherry_intake: 8200, green_yield: 1640, conversion_rate: 20.0, grade_a_percent: 72 },
    { spv_id: spvId, month: "Dec 2024", cherry_intake: 14500, green_yield: 3045, conversion_rate: 21.0, grade_a_percent: 78 },
    { spv_id: spvId, month: "Jan 2025", cherry_intake: 18200, green_yield: 4004, conversion_rate: 22.0, grade_a_percent: 81 },
    { spv_id: spvId, month: "Feb 2025", cherry_intake: 16800, green_yield: 3528, conversion_rate: 21.0, grade_a_percent: 79 },
    { spv_id: spvId, month: "Mar 2025", cherry_intake: 12400, green_yield: 2604, conversion_rate: 21.0, grade_a_percent: 76 },
  ]);

  // 8. NDVI readings
  await supabase.from("ndvi_readings").insert([
    { spv_id: spvId, reading_date: "Oct 2024", value: 0.42, source: "Sentinel-2" },
    { spv_id: spvId, reading_date: "Nov 2024", value: 0.48, source: "Sentinel-2" },
    { spv_id: spvId, reading_date: "Dec 2024", value: 0.53, source: "Sentinel-2" },
    { spv_id: spvId, reading_date: "Jan 2025", value: 0.58, source: "Sentinel-2" },
    { spv_id: spvId, reading_date: "Feb 2025", value: 0.61, source: "Sentinel-2" },
    { spv_id: spvId, reading_date: "Mar 2025", value: 0.63, source: "Sentinel-2" },
  ]);

  // 9. Monthly financials
  await supabase.from("monthly_financials").insert([
    { spv_id: spvId, month: "Nov 2024", revenue: 4800000, operating_cost: 4100000, net_margin: 14.6, collections: 4800000, collection_rate: 100, tx_count: 2, loan_repayment: 0 },
    { spv_id: spvId, month: "Dec 2024", revenue: 10400000, operating_cost: 8700000, net_margin: 16.3, collections: 10400000, collection_rate: 100, tx_count: 3, loan_repayment: 0 },
    { spv_id: spvId, month: "Jan 2025", revenue: 12200000, operating_cost: 9400000, net_margin: 23.0, collections: 11800000, collection_rate: 96.7, tx_count: 4, loan_repayment: 0 },
    { spv_id: spvId, month: "Feb 2025", revenue: 9800000, operating_cost: 7600000, net_margin: 22.4, collections: 9800000, collection_rate: 100, tx_count: 3, loan_repayment: 4700000 },
    { spv_id: spvId, month: "Mar 2025", revenue: 6400000, operating_cost: 5200000, net_margin: 18.8, collections: 5100000, collection_rate: 79.7, tx_count: 2, loan_repayment: 0 },
  ]);

  // 10. Sensor readings
  await supabase.from("sensor_readings").insert([
    { spv_id: spvId, device_id: "SM-01", device_name: "SoilProbe Alpha-1", location: "Plot A — Nkwen (1,420m)", metric: "Soil Moisture", unit: "%", value: 22.4, threshold_min: 18, threshold_max: 35, status: "normal" },
    { spv_id: spvId, device_id: "SM-02", device_name: "SoilProbe Alpha-2", location: "Plot C — Fongo-Tongo (1,650m)", metric: "Soil Moisture", unit: "%", value: 26.1, threshold_min: 18, threshold_max: 35, status: "normal" },
    { spv_id: spvId, device_id: "TH-01", device_name: "WeatherNode Bravo-1", location: "Plot A — Nkwen (1,420m)", metric: "Temperature", unit: "°C", value: 21.3, threshold_min: 15, threshold_max: 28, status: "normal" },
    { spv_id: spvId, device_id: "RH-01", device_name: "WeatherNode Bravo-1", location: "Plot A — Nkwen (1,420m)", metric: "Relative Humidity", unit: "%", value: 78.2, threshold_min: 60, threshold_max: 90, status: "normal" },
    { spv_id: spvId, device_id: "RF-01", device_name: "RainGauge Charlie-1", location: "Plot B — Dschang (1,780m)", metric: "Rainfall (7-day)", unit: "mm", value: 42.6, threshold_min: 20, threshold_max: 80, status: "normal" },
    { spv_id: spvId, device_id: "WB-01", device_name: "Weighbridge Delta-1", location: "MHCC Mill — Dschang", metric: "Cherry Intake (today)", unit: "kg", value: 1240, threshold_min: 500, threshold_max: 3000, status: "normal" },
  ]);

  // 11. Oracle events
  await supabase.from("oracle_events").insert([
    { spv_id: spvId, event_type: "payment_received", title: "Off-taker payment received", description: "Atlantic Commodities Ltd wired payment for Feb 2025 green bean shipment.", status: "confirmed", tx_hash: "0x8a3f...c7d2", amount: 12400000, currency: "FCFA", payment_channel: { type: "corporate", payer: "Atlantic Commodities Ltd", method: "bank_transfer" }, source: "Bank API → Chainlink Adapter", event_timestamp: "2025-03-07T14:32:00Z" },
    { spv_id: spvId, event_type: "milestone_verified", title: "Milestone 3 — NDVI threshold met", description: "Sentinel-2 NDVI reading of 0.63 exceeds 0.55 threshold.", status: "confirmed", tx_hash: "0x4b1e...a9f8", source: "Sentinel-2 → Chainlink Adapter", event_timestamp: "2025-03-06T09:15:00Z" },
    { spv_id: spvId, event_type: "disbursement_triggered", title: "Milestone 3 disbursement executed", description: "Smart contract released 18,000,000 FCFA to project escrow.", status: "confirmed", tx_hash: "0x7c9d...b3e1", amount: 18000000, currency: "FCFA", payment_channel: { type: "platform", payer: "SPV-01 Smart Contract", method: "escrow_release" }, source: "Base L2 Smart Contract", event_timestamp: "2025-03-05T16:48:00Z" },
    { spv_id: spvId, event_type: "sensor_alert", title: "Soil moisture approaching lower bound", description: "SoilProbe Alpha-1 at Plot A reading 18.5% — approaching 18% min threshold.", status: "confirmed", source: "IoT Gateway", event_timestamp: "2025-03-04T11:22:00Z" },
    { spv_id: spvId, event_type: "payment_received", title: "Off-taker advance payment", description: "Specialty Coffee Traders GmbH advance for Q1 2025.", status: "confirmed", tx_hash: "0x2f5a...d4c6", amount: 8600000, currency: "FCFA", payment_channel: { type: "corporate", payer: "Specialty Coffee Traders GmbH", method: "wire" }, source: "Bank API → Chainlink Adapter", event_timestamp: "2025-03-03T08:00:00Z" },
    { spv_id: spvId, event_type: "compliance_check", title: "Quarterly compliance verification", description: "Automated RWA compliance check passed. All covenants within bounds.", status: "confirmed", source: "Compliance Engine", event_timestamp: "2025-03-02T19:30:00Z" },
    { spv_id: spvId, event_type: "payment_confirmed", title: "Payment on-chain confirmation", description: "Off-chain bank payment verified and logged on-chain.", status: "confirmed", tx_hash: "0x1d8b...e2a7", amount: 12400000, currency: "FCFA", source: "Chainlink Adapter → Base L2", event_timestamp: "2025-03-01T12:45:00Z" },
  ]);

  return spvId;
}
