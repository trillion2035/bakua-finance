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

export function useApproveDeployment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ submissionId, userId }: { submissionId: string; userId: string }) => {
      const { error: updateErr } = await supabase
        .from("document_submissions")
        .update({
          deployment_approved: true,
          deployment_approved_at: new Date().toISOString(),
        } as any)
        .eq("id", submissionId);
      if (updateErr) throw updateErr;

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

      const response = await supabase.functions.invoke("generate-spv-documents", {
        body: { submission_id: submissionId, stage_key: "spv_doc_creation" },
      });
      if (response.error) {
        console.error("AI doc generation error:", response.error);
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

export function useCompleteStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ stageId, submissionId, currentStageKey }: { stageId: string; submissionId: string; currentStageKey: string }) => {
      const { error } = await supabase
        .from("spv_deployment_stages" as any)
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
        } as any)
        .eq("id", stageId);
      if (error) throw error;

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

// Sign a generated facility document
export function useSignGeneratedDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ documentId, signerName, signatureData, signatureType }: {
      documentId: string;
      signerName: string;
      signatureData: string;
      signatureType: string;
    }) => {
      const { error } = await supabase
        .from("generated_documents" as any)
        .update({
          status: "signed",
          signed_at: new Date().toISOString(),
          signed_by: signerName,
          signature_data: signatureData,
        } as any)
        .eq("id", documentId);
      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["generated-documents"] });
      toast.success("Document signed successfully.");
    },
    onError: (error) => {
      toast.error("Failed to sign document", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    },
  });
}

// Upload incorporation certificate (stores as a generated_document)
export function useUploadIncorporationCert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ submissionId, userId, file }: {
      submissionId: string;
      userId: string;
      file: File;
    }) => {
      // Upload file to storage
      const filePath = `${userId}/${submissionId}/incorporation-certificate-${Date.now()}.${file.name.split('.').pop()}`;
      const { error: uploadErr } = await supabase.storage
        .from("project-documents")
        .upload(filePath, file);
      if (uploadErr) throw uploadErr;

      const { data: urlData } = supabase.storage
        .from("project-documents")
        .getPublicUrl(filePath);

      // Insert as generated document
      const { error: insertErr } = await supabase
        .from("generated_documents" as any)
        .insert({
          submission_id: submissionId,
          user_id: userId,
          stage_key: "spv_incorporation",
          document_name: "SPV Incorporation Certificate",
          document_type: "incorporation_certificate",
          file_url: filePath,
          status: "verified",
        } as any);
      if (insertErr) throw insertErr;

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["generated-documents"] });
      queryClient.invalidateQueries({ queryKey: ["deployment-stages"] });
      toast.success("Incorporation certificate uploaded.");
    },
    onError: (error) => {
      toast.error("Failed to upload certificate", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    },
  });
}

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

// Check if all deployment stages are completed
export function useIsDeploymentComplete(stages: DeploymentStage[] | undefined) {
  if (!stages || stages.length === 0) return false;
  return stages.every(s => s.status === "completed");
}
