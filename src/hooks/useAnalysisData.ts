import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface ScoreDimension {
  name: string;
  weight: number;
  score: number;
  weighted_score: number;
  raw_input: string;
  standardized_output: string;
  risk_flags: string[];
}

export interface DocumentVerification {
  document: string;
  verification_method: string;
  status: "VERIFIED" | "PENDING" | "MISSING" | "ISSUE";
  score: number;
  notes: string;
}

export interface Recommendation {
  priority: "HIGH" | "MEDIUM" | "LOW";
  category: string;
  recommendation: string;
  potential_score_impact: string;
}

export interface RiskFactor {
  severity: "HIGH" | "MEDIUM" | "LOW";
  factor: string;
  mitigation: string;
}

export interface AnalysisReport {
  id: string;
  submission_id: string;
  user_id: string;
  industry: string;
  total_score: number;
  grade: string;
  grade_label: string;
  analysis_status: "pending" | "processing" | "completed" | "failed";
  document_completeness_score: number;
  score_dimensions: ScoreDimension[];
  document_verification_log: DocumentVerification[];
  project_summary: string;
  recommendations: Recommendation[];
  risk_factors: RiskFactor[];
  dossier_pdf_path: string | null;
  term_sheet_pdf_path: string | null;
  rejection_report_pdf_path: string | null;
  ai_model_version: string;
  human_reviewer: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TermSheet {
  id: string;
  analysis_report_id: string;
  user_id: string;
  reference_code: string;
  transaction_name: string;
  facility_amount_fcfa: number;
  facility_amount_usd: string;
  tenor_months: number;
  target_irr: string;
  effective_rate: string;
  milestones: any[];
  repayment_schedule: any[];
  fees: any[];
  security_package: any[];
  conditions_precedent: any[];
  events_of_default: any[];
  pdf_path: string | null;
  valid_until: string;
  created_at: string;
  updated_at: string;
}

// Fetch analysis report for a submission
export function useAnalysisReport(submissionId: string | undefined) {
  return useQuery({
    queryKey: ["analysis-report", submissionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("asset_analysis_reports")
        .select("*")
        .eq("submission_id", submissionId!)
        .maybeSingle();
      
      if (error) throw error;
      return data as unknown as AnalysisReport | null;
    },
    enabled: !!submissionId,
  });
}

// Fetch user's analysis reports
export function useUserAnalysisReports() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["user-analysis-reports", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("asset_analysis_reports")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as unknown as AnalysisReport[];
    },
    enabled: !!user,
  });
}

// Fetch all pending submissions (admin)
export function usePendingSubmissions() {
  return useQuery({
    queryKey: ["pending-submissions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("document_submissions")
        .select(`
          *,
          profiles:user_id (full_name, company_name)
        `)
        .eq("status", "pending")
        .order("submitted_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
}

// Fetch all submissions with their analysis status (admin)
export function useAllSubmissionsWithAnalysis() {
  return useQuery({
    queryKey: ["all-submissions-analysis"],
    queryFn: async () => {
      // Fetch submissions
      const { data: submissions, error } = await supabase
        .from("document_submissions")
        .select("*")
        .order("submitted_at", { ascending: false });
      
      if (error) throw error;
      if (!submissions || submissions.length === 0) return [];

      // Fetch profiles for these users
      const userIds = [...new Set(submissions.map(s => s.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, company_name")
        .in("user_id", userIds);

      // Fetch analysis reports for these submissions
      const submissionIds = submissions.map(s => s.id);
      const { data: reports } = await supabase
        .from("asset_analysis_reports")
        .select("*")
        .in("submission_id", submissionIds);

      // Merge data
      return submissions.map(sub => ({
        ...sub,
        profiles: profiles?.find(p => p.user_id === sub.user_id) || null,
        analysis_report: reports?.find(r => r.submission_id === sub.id) || null,
      }));
    },
  });
}

// Fetch term sheet for an analysis report
export function useTermSheet(analysisReportId: string | undefined) {
  return useQuery({
    queryKey: ["term-sheet", analysisReportId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("term_sheets")
        .select("*")
        .eq("analysis_report_id", analysisReportId!)
        .maybeSingle();
      
      if (error) throw error;
      return data as TermSheet | null;
    },
    enabled: !!analysisReportId,
  });
}

// Trigger AI analysis mutation
export function useTriggerAnalysis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ submissionId, industry }: { submissionId: string; industry?: string }) => {
      const response = await supabase.functions.invoke("analyze-documents", {
        body: { submission_id: submissionId, industry: industry || "agriculture" },
      });

      if (response.error) {
        throw new Error(response.error.message || "Analysis failed");
      }

      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["analysis-report"] });
      queryClient.invalidateQueries({ queryKey: ["pending-submissions"] });
      queryClient.invalidateQueries({ queryKey: ["all-submissions-analysis"] });
      queryClient.invalidateQueries({ queryKey: ["document-submission"] });
      
      if (data.eligible_for_listing) {
        toast.success(`Analysis complete: ${data.grade} - ${data.grade_label}`, {
          description: "Project is eligible for marketplace listing.",
        });
      } else {
        toast.warning(`Analysis complete: ${data.grade} - ${data.grade_label}`, {
          description: "Project did not meet the minimum threshold.",
        });
      }
    },
    onError: (error) => {
      toast.error("Analysis failed", {
        description: error instanceof Error ? error.message : "Please try again later.",
      });
    },
  });
}

// Release analysis results to client
export function useReleaseToClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (submissionId: string) => {
      const { error } = await supabase
        .from("document_submissions")
        .update({
          released_to_client: true,
          released_at: new Date().toISOString(),
        } as any)
        .eq("id", submissionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-submissions-analysis"] });
      queryClient.invalidateQueries({ queryKey: ["document-submission"] });
      toast.success("Results released to project owner", {
        description: "The project owner can now view their analysis results.",
      });
    },
    onError: (error) => {
      toast.error("Failed to release results", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    },
  });
}
