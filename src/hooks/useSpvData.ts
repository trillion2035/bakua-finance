import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useOwnerSpvs() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["owner-spvs", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("spvs")
        .select("*")
        .eq("owner_id", user!.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useSpvDetail(spvId: string | undefined) {
  return useQuery({
    queryKey: ["spv-detail", spvId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("spvs")
        .select("*")
        .eq("id", spvId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!spvId,
  });
}

export function useSpvMilestones(spvId: string | undefined) {
  return useQuery({
    queryKey: ["spv-milestones", spvId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("spv_milestones")
        .select("*")
        .eq("spv_id", spvId!)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
    enabled: !!spvId,
  });
}

export function useSpvDocuments(spvId: string | undefined) {
  return useQuery({
    queryKey: ["spv-documents", spvId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("spv_documents")
        .select("*")
        .eq("spv_id", spvId!)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
    enabled: !!spvId,
  });
}

export function useSpvContracts(spvId: string | undefined) {
  return useQuery({
    queryKey: ["spv-contracts", spvId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("spv_contracts")
        .select("*")
        .eq("spv_id", spvId!);
      if (error) throw error;
      return data;
    },
    enabled: !!spvId,
  });
}

export function useSpvScoreDimensions(spvId: string | undefined) {
  return useQuery({
    queryKey: ["spv-scores", spvId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("spv_score_dimensions")
        .select("*")
        .eq("spv_id", spvId!);
      if (error) throw error;
      return data;
    },
    enabled: !!spvId,
  });
}

export function useInvestorSegments(spvId: string | undefined) {
  return useQuery({
    queryKey: ["investor-segments", spvId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("investor_segments")
        .select("*")
        .eq("spv_id", spvId!);
      if (error) throw error;
      return data;
    },
    enabled: !!spvId,
  });
}

export function useHarvestData(spvId: string | undefined) {
  return useQuery({
    queryKey: ["harvest-data", spvId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("harvest_data")
        .select("*")
        .eq("spv_id", spvId!);
      if (error) throw error;
      return data;
    },
    enabled: !!spvId,
  });
}

export function useNdviReadings(spvId: string | undefined) {
  return useQuery({
    queryKey: ["ndvi-readings", spvId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ndvi_readings")
        .select("*")
        .eq("spv_id", spvId!);
      if (error) throw error;
      return data;
    },
    enabled: !!spvId,
  });
}

export function useMonthlyFinancials(spvId: string | undefined) {
  return useQuery({
    queryKey: ["monthly-financials", spvId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("monthly_financials")
        .select("*")
        .eq("spv_id", spvId!);
      if (error) throw error;
      return data;
    },
    enabled: !!spvId,
  });
}

export function useSensorReadings(spvId: string | undefined) {
  return useQuery({
    queryKey: ["sensor-readings", spvId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sensor_readings")
        .select("*")
        .eq("spv_id", spvId!);
      if (error) throw error;
      return data;
    },
    enabled: !!spvId,
  });
}

export function useOracleEvents(spvId: string | undefined) {
  return useQuery({
    queryKey: ["oracle-events", spvId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("oracle_events")
        .select("*")
        .eq("spv_id", spvId!)
        .order("event_timestamp", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!spvId,
  });
}
