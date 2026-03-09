import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface DeploymentStage {
  id: string;
  submission_id: string;
  user_id: string;
  stage_order: number;
  stage_key: string;
  stage_label: string;
  description: string | null;
  status: "pending" | "in_progress" | "completed";
  started_at: string | null;
  completed_at: string | null;
  completed_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface GeneratedDocument {
  id: string;
  submission_id: string;
  user_id: string;
  stage_key: string;
  document_name: string;
  document_type: string;
  content: string | null;
  file_url: string | null;
  status: string;
  signed_at: string | null;
  signed_by: string | null;
  signature_data: string | null;
  created_at: string;
  updated_at: string;
}

// Fetch deployment stages for a submission
export function useDeploymentStages(submissionId: string | undefined) {
  return useQuery({
    queryKey: ["deployment-stages", submissionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("spv_deployment_stages" as any)
        .select("*")
        .eq("submission_id", submissionId!)
        .order("stage_order", { ascending: true });
      if (error) throw error;
      return (data as any[]) as DeploymentStage[];
    },
    enabled: !!submissionId,
  });
}

// Fetch generated documents for a submission
export function useGeneratedDocuments(submissionId: string | undefined) {
  return useQuery({
    queryKey: ["generated-documents", submissionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("generated_documents" as any)
        .select("*")
        .eq("submission_id", submissionId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data as any[]) as GeneratedDocument[];
    },
    enabled: !!submissionId,
  });
}

// Admin: Approve SPV deployment (creates stages + triggers AI doc generation)
export function useApproveDeployment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ submissionId, userId }: { submissionId: string; userId: string }) => {
      // 1. Update submission as deployment approved
      const { error: updateErr } = await supabase
        .from("document_submissions")
        .update({
          deployment_approved: true,
          deployment_approved_at: new Date().toISOString(),
        } as any)
        .eq("id", submissionId);
      if (updateErr) throw updateErr;

      // 2. Create the 4 deployment stages
      const stages = [
        { stage_order: 1, stage_key: "spv_doc_creation", stage_label: "SPV Document Creation", description: "AI agent drafts the Articles of Association for the SPV incorporation." },
        { stage_order: 2, stage_key: "spv_incorporation", stage_label: "SPV Incorporation", description: "Legal entity is formally incorporated with the relevant authorities." },
        { stage_order: 3, stage_key: "facility_doc_creation", stage_label: "Facility Document Creation", description: "AI agent drafts the facility agreement documents for legal close." },
        { stage_order: 4, stage_key: "legal_close", stage_label: "Legal Close", description: "All facility documents are reviewed and signed by all parties." },
      ];

      const { error: stageErr } = await supabase
        .from("spv_deployment_stages" as any)
        .insert(stages.map(s => ({
          ...s,
          submission_id: submissionId,
          user_id: userId,
        })));
      if (stageErr) throw stageErr;

      // 3. Trigger AI generation of Articles of Association
      const response = await supabase.functions.invoke("generate-spv-documents", {
        body: { submission_id: submissionId, stage_key: "spv_doc_creation" },
      });
      if (response.error) {
        console.error("AI doc generation error:", response.error);
        // Don't fail the whole operation - stages are created
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-submissions-analysis"] });
      queryClient.invalidateQueries({ queryKey: ["deployment-stages"] });
      queryClient.invalidateQueries({ queryKey: ["generated-documents"] });
      toast.success("SPV Deployment approved", {
        description: "AI is now generating the Articles of Association.",
      });
    },
    onError: (error) => {
      toast.error("Failed to approve deployment", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    },
  });
}

// Admin: Advance a stage to completed
export function useCompleteStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ stageId, submissionId, currentStageKey }: { stageId: string; submissionId: string; currentStageKey: string }) => {
      // Complete the current stage
      const { error } = await supabase
        .from("spv_deployment_stages" as any)
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
        } as any)
        .eq("id", stageId);
      if (error) throw error;

      // Determine and start next stage
      const stageOrder = ["spv_doc_creation", "spv_incorporation", "facility_doc_creation", "legal_close"];
      const currentIdx = stageOrder.indexOf(currentStageKey);
      if (currentIdx < stageOrder.length - 1) {
        const nextKey = stageOrder[currentIdx + 1];
        const { error: nextErr } = await supabase
          .from("spv_deployment_stages" as any)
          .update({
            status: "in_progress",
            started_at: new Date().toISOString(),
          } as any)
          .eq("submission_id", submissionId)
          .eq("stage_key", nextKey);
        if (nextErr) throw nextErr;

        // If moving to facility_doc_creation, trigger AI generation
        if (nextKey === "facility_doc_creation") {
          await supabase.functions.invoke("generate-spv-documents", {
            body: { submission_id: submissionId, stage_key: "facility_doc_creation" },
          });
        }
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deployment-stages"] });
      queryClient.invalidateQueries({ queryKey: ["generated-documents"] });
      toast.success("Stage completed and next stage started.");
    },
    onError: (error) => {
      toast.error("Failed to advance stage", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    },
  });
}

// Fetch term sheet signatures for a submission (admin view)
export function useTermSheetSignatures(submissionId: string | undefined) {
  return useQuery({
    queryKey: ["term-sheet-signatures-admin", submissionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("term_sheet_signatures" as any)
        .select("*")
        .eq("submission_id", submissionId!);
      if (error) throw error;
      return data as any[];
    },
    enabled: !!submissionId,
  });
}
