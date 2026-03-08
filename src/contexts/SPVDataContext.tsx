import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";

// Types matching the database schema
export interface SPVData {
  id: string;
  name: string;
  spv_code: string;
  status: string;
  asset_type: string | null;
  target_amount: number | null;
  target_amount_usd: string | null;
  funded_amount: number | null;
  funded_percent: number | null;
  total_investors: number | null;
  total_disbursed: number | null;
  disbursed_percent: number | null;
  remaining_in_vault: number | null;
  dsra_reserve: string | null;
  target_irr: string | null;
  projected_irr: string | null;
  currency: string | null;
  network: string | null;
  listing_date: string | null;
  fully_funded_date: string | null;
  full_legal_name: string | null;
  registration_no: string | null;
  jurisdiction: string | null;
  company_type: string | null;
  registered_office: string | null;
  incorporation_date: string | null;
  capital_social: string | null;
  shareholder: string | null;
  auditor: string | null;
  description: string | null;
  owner_id: string;
}

export interface ScoreDimension {
  id: string;
  name: string;
  raw_input: string | null;
  standardized_output: string | null;
  weight: string | null;
  score: number;
}

export interface SPVDocument {
  id: string;
  name: string;
  purpose: string | null;
  parties: string | null;
  signed_date: string | null;
  sort_order: number | null;
  file_url: string | null;
}

export interface SPVContract {
  id: string;
  name: string;
  address: string;
  deployed_date: string | null;
}

export interface Milestone {
  id: string;
  milestone_code: string;
  name: string;
  amount: string | null;
  amount_raw: number | null;
  recipients: string | null;
  oracle_trigger: string | null;
  date_disbursed: string | null;
  status: "pending" | "disbursed";
  sort_order: number | null;
}

export interface InvestorSegment {
  id: string;
  name: string;
  usdc_raised: string | null;
  fcfa_equivalent: string | null;
  percent_of_spv: string | null;
  investor_count: number | null;
}

export interface OracleEvent {
  id: string;
  event_timestamp: string;
  event_type: string;
  title: string;
  description: string | null;
  status: "confirmed" | "pending" | "failed";
  tx_hash: string | null;
  amount: number | null;
  currency: string | null;
  payment_channel: any;
  source: string | null;
  metadata: any;
}

export interface SensorReading {
  id: string;
  device_id: string;
  device_name: string | null;
  location: string | null;
  metric: string;
  unit: string | null;
  value: number;
  threshold_min: number | null;
  threshold_max: number | null;
  status: "normal" | "warning" | "critical";
  reading_timestamp: string;
}

export interface NDVIReading {
  id: string;
  reading_date: string;
  value: number;
  source: string | null;
}

export interface HarvestRecord {
  id: string;
  month: string;
  cherry_intake: number | null;
  green_yield: number | null;
  conversion_rate: number | null;
  grade_a_percent: number | null;
}

export interface MonthlyFinancial {
  id: string;
  month: string;
  revenue: number | null;
  operating_cost: number | null;
  net_margin: number | null;
  collections: number | null;
  collection_rate: number | null;
  tx_count: number | null;
  loan_repayment: number | null;
}

interface SPVContextType {
  spv: SPVData | null;
  scoreDimensions: ScoreDimension[];
  documents: SPVDocument[];
  contracts: SPVContract[];
  milestones: Milestone[];
  investorSegments: InvestorSegment[];
  oracleEvents: OracleEvent[];
  sensorReadings: SensorReading[];
  ndviReadings: NDVIReading[];
  harvestData: HarvestRecord[];
  monthlyFinancials: MonthlyFinancial[];
  profile: { full_name: string | null; company_name: string | null } | null;
  loading: boolean;
}

const SPVDataContext = createContext<SPVContextType>({
  spv: null,
  scoreDimensions: [],
  documents: [],
  contracts: [],
  milestones: [],
  investorSegments: [],
  oracleEvents: [],
  sensorReadings: [],
  ndviReadings: [],
  harvestData: [],
  monthlyFinancials: [],
  profile: null,
  loading: true,
});

export function SPVDataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [state, setState] = useState<SPVContextType>({
    spv: null,
    scoreDimensions: [],
    documents: [],
    contracts: [],
    milestones: [],
    investorSegments: [],
    oracleEvents: [],
    sensorReadings: [],
    ndviReadings: [],
    harvestData: [],
    monthlyFinancials: [],
    profile: null,
    loading: true,
  });

  useEffect(() => {
    if (!user) {
      setState((s) => ({ ...s, loading: false }));
      return;
    }

    async function fetchAll() {
      // Get profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, company_name")
        .eq("user_id", user!.id)
        .maybeSingle();

      // Get user's SPV (first one)
      const { data: spvs } = await supabase
        .from("spvs")
        .select("*")
        .eq("owner_id", user!.id)
        .limit(1);

      const spv = spvs?.[0] || null;

      if (!spv) {
        setState((s) => ({ ...s, spv: null, profile, loading: false }));
        return;
      }

      // Fetch all related data in parallel
      const [
        { data: scoreDimensions },
        { data: documents },
        { data: contracts },
        { data: milestones },
        { data: investorSegments },
        { data: oracleEvents },
        { data: sensorReadings },
        { data: ndviReadings },
        { data: harvestData },
        { data: monthlyFinancials },
      ] = await Promise.all([
        supabase.from("spv_score_dimensions").select("*").eq("spv_id", spv.id).order("score", { ascending: false }),
        supabase.from("spv_documents").select("*").eq("spv_id", spv.id).order("sort_order"),
        supabase.from("spv_contracts").select("*").eq("spv_id", spv.id),
        supabase.from("spv_milestones").select("*").eq("spv_id", spv.id).order("sort_order"),
        supabase.from("investor_segments").select("*").eq("spv_id", spv.id),
        supabase.from("oracle_events").select("*").eq("spv_id", spv.id).order("event_timestamp", { ascending: false }),
        supabase.from("sensor_readings").select("*").eq("spv_id", spv.id),
        supabase.from("ndvi_readings").select("*").eq("spv_id", spv.id).order("reading_date"),
        supabase.from("harvest_data").select("*").eq("spv_id", spv.id).order("month"),
        supabase.from("monthly_financials").select("*").eq("spv_id", spv.id).order("month"),
      ]);

      setState({
        spv: spv as SPVData,
        scoreDimensions: (scoreDimensions || []) as ScoreDimension[],
        documents: (documents || []) as SPVDocument[],
        contracts: (contracts || []) as SPVContract[],
        milestones: (milestones || []) as Milestone[],
        investorSegments: (investorSegments || []) as InvestorSegment[],
        oracleEvents: (oracleEvents || []) as OracleEvent[],
        sensorReadings: (sensorReadings || []) as SensorReading[],
        ndviReadings: (ndviReadings || []) as NDVIReading[],
        harvestData: (harvestData || []) as HarvestRecord[],
        monthlyFinancials: (monthlyFinancials || []) as MonthlyFinancial[],
        profile,
        loading: false,
      });
    }

    fetchAll();
  }, [user]);

  return <SPVDataContext.Provider value={state}>{children}</SPVDataContext.Provider>;
}

export function useSPVData() {
  return useContext(SPVDataContext);
}
