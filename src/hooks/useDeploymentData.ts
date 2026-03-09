import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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

// Deployment stage keys
const DEPLOYMENT_STAGE_KEYS = ["spv_doc_creation", "spv_incorporation", "facility_doc_creation", "legal_close"];
// Listing stage keys
const LISTING_STAGE_KEYS = ["sc_specifications", "sc_development", "sc_deployment", "sc_auditing"];

export function useDeploymentStages(submissionId: string | undefined) {
  return useQuery({
    queryKey: ["deployment-stages", submissionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("spv_deployment_stages" as any)
        .select("*")
        .eq("submission_id", submissionId!)
        .in("stage_key", DEPLOYMENT_STAGE_KEYS)
        .order("stage_order", { ascending: true });
      if (error) throw error;
      return (data as any[]) as DeploymentStage[];
    },
    enabled: !!submissionId,
  });
}

export function useListingStages(submissionId: string | undefined) {
  return useQuery({
    queryKey: ["listing-stages", submissionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("spv_deployment_stages" as any)
        .select("*")
        .eq("submission_id", submissionId!)
        .in("stage_key", LISTING_STAGE_KEYS)
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
    mutationFn: async ({ stageId, submissionId, currentStageKey, userId }: { stageId: string; submissionId: string; currentStageKey: string; userId?: string }) => {
      const { error } = await supabase
        .from("spv_deployment_stages" as any)
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
        } as any)
        .eq("id", stageId);
      if (error) throw error;

      // Handle deployment stage transitions
      const deploymentOrder = ["spv_doc_creation", "spv_incorporation", "facility_doc_creation", "legal_close"];
      const deployIdx = deploymentOrder.indexOf(currentStageKey);
      
      if (deployIdx >= 0 && deployIdx < deploymentOrder.length - 1) {
        // Advance to next deployment stage
        const nextKey = deploymentOrder[deployIdx + 1];
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

      // When legal_close completes → insert listing stages and trigger SC spec generation
      if (currentStageKey === "legal_close") {
        const listingStages = [
          { stage_order: 1, stage_key: "sc_specifications", stage_label: "Smart Contract Specifications", description: "AI agent generates the smart contract specification document based on all project and legal data." },
          { stage_order: 2, stage_key: "sc_development", stage_label: "Smart Contract Development", description: "Smart contract is developed based on the approved specification document." },
          { stage_order: 3, stage_key: "sc_deployment", stage_label: "Smart Contract Deployment", description: "Smart contract is deployed to the blockchain network." },
          { stage_order: 4, stage_key: "sc_auditing", stage_label: "Smart Contract Auditing", description: "Independent audit of the smart contract, followed by any required modifications." },
        ];

        // Get user_id from submission
        const effectiveUserId = userId || (await supabase.from("document_submissions").select("user_id").eq("id", submissionId).single()).data?.user_id;

        const { error: listErr } = await supabase
          .from("spv_deployment_stages" as any)
          .insert(listingStages.map(s => ({
            ...s,
            submission_id: submissionId,
            user_id: effectiveUserId,
            status: s.stage_key === "sc_specifications" ? "in_progress" : "pending",
            started_at: s.stage_key === "sc_specifications" ? new Date().toISOString() : null,
          })));
        if (listErr) throw listErr;

        // Trigger AI to generate SC specifications
        await supabase.functions.invoke("generate-spv-documents", {
          body: { submission_id: submissionId, stage_key: "sc_specifications" },
        });
      }

      // Handle listing stage transitions
      const listingOrder = ["sc_specifications", "sc_development", "sc_deployment", "sc_auditing"];
      const listIdx = listingOrder.indexOf(currentStageKey);
      
      if (listIdx >= 0 && listIdx < listingOrder.length - 1) {
        const nextKey = listingOrder[listIdx + 1];
        const { error: nextErr } = await supabase
          .from("spv_deployment_stages" as any)
          .update({
            status: "in_progress",
            started_at: new Date().toISOString(),
          } as any)
          .eq("submission_id", submissionId)
          .eq("stage_key", nextKey);
        if (nextErr) throw nextErr;
      }

      // When sc_auditing completes → generate final documents (Deployment Record + IPFS Certificate)
      if (currentStageKey === "sc_auditing") {
        await supabase.functions.invoke("generate-spv-documents", {
          body: { submission_id: submissionId, stage_key: "sc_auditing_complete" },
        });
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deployment-stages"] });
      queryClient.invalidateQueries({ queryKey: ["listing-stages"] });
      queryClient.invalidateQueries({ queryKey: ["generated-documents"] });
      queryClient.invalidateQueries({ queryKey: ["all-submissions-analysis"] });
      toast.success("Stage completed and next stage started.");
    },
    onError: (error) => {
      toast.error("Failed to advance stage", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    },
  });
}

// Launch SC Development AI Agent (also used for regeneration)
export function useLaunchSCDevelopment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ submissionId }: { submissionId: string }) => {
      const response = await supabase.functions.invoke("generate-spv-documents", {
        body: { submission_id: submissionId, stage_key: "sc_development" },
      });
      if (response.error) throw new Error(response.error.message || "Failed to launch AI agent");
      const data = response.data as any;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["generated-documents"] });
      queryClient.invalidateQueries({ queryKey: ["listing-stages"] });
      toast.success("AI Agent completed!", { description: "Smart contract development plan has been generated." });
    },
    onError: (error) => {
      toast.error("AI Agent failed", { description: error instanceof Error ? error.message : "Please try again." });
    },
  });
}

// Execute a specific step from the development plan
export function useExecuteStep() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ submissionId, phaseNumber, stepNumber }: { submissionId: string; phaseNumber: number; stepNumber: number }) => {
      const response = await supabase.functions.invoke("generate-spv-documents", {
        body: { submission_id: submissionId, stage_key: "sc_execute_step", phase_number: phaseNumber, step_number: stepNumber },
      });
      if (response.error) throw new Error(response.error.message || "Failed to execute step");
      const data = response.data as any;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["generated-documents"] });
      toast.success(`Step ${variables.phaseNumber}.${variables.stepNumber} completed!`);
    },
    onError: (error) => {
      toast.error("Step execution failed", { description: error instanceof Error ? error.message : "Please try again." });
    },
  });
}

// Pre-flight deployment check
export function usePreflightCheck() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ submissionId, network = "testnet", mode = "check" }: { submissionId: string; network?: "testnet" | "mainnet"; mode?: "check" | "fix" }) => {
      const response = await supabase.functions.invoke("preflight-check", {
        body: { submission_id: submissionId, network, mode },
      });
      if (response.error) throw new Error(response.error.message || "Pre-flight check failed");
      const data = response.data as any;
      if (!data?.success) throw new Error(data?.error || "Pre-flight check failed");
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["generated-documents"] });
      if (data.ready) {
        toast.success("All pre-flight checks passed!", { description: "Ready to deploy." });
      } else {
        toast.warning("Pre-flight issues found", { description: data.summary });
      }
    },
    onError: (error) => {
      toast.error("Pre-flight check failed", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    },
  });
}

// Deploy smart contract to Base network
export function useDeployContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ submissionId, network = "testnet" }: { submissionId: string; network?: "testnet" | "mainnet" }) => {
      const response = await supabase.functions.invoke("deploy-smart-contract", {
        body: { submission_id: submissionId, network },
      });
      if (response.error) throw new Error(response.error.message || "Deployment failed");
      const data = response.data as any;
      if (!data?.success) throw new Error(data?.error || "Deployment failed");
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["generated-documents"] });
      queryClient.invalidateQueries({ queryKey: ["listing-stages"] });
      toast.success("Smart contract deployed!", {
        description: `Contract: ${data.contract_address?.slice(0, 10)}... on ${data.network}`,
      });
    },
    onError: (error) => {
      toast.error("Deployment failed", {
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

// Upload incorporation certificate
export function useUploadIncorporationCert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ submissionId, userId, file }: {
      submissionId: string;
      userId: string;
      file: File;
    }) => {
      const filePath = `${userId}/${submissionId}/incorporation-certificate-${Date.now()}.${file.name.split('.').pop()}`;
      const { error: uploadErr } = await supabase.storage
        .from("project-documents")
        .upload(filePath, file);
      if (uploadErr) throw uploadErr;

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

// Check if all listing stages are completed
export function useIsListingComplete(stages: DeploymentStage[] | undefined) {
  if (!stages || stages.length === 0) return false;
  return stages.every(s => s.status === "completed");
}
