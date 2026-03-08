import { useState, useRef } from "react";
import {
  mockDocuments,
  stageLabels,
  type ProcessStage,
  getDocsByStage,
  stepIdToStage,
} from "@/data/mockDocumentsData";
import { mockSPV } from "@/data/mockDashboardData";
import { Upload, CheckCircle2, Clock, AlertCircle, FileText } from "lucide-react";
import { StageSection } from "@/components/dashboard/documents/StageSection";

function UploadDropZone() {
  const fileRef = useRef<HTMLInputElement>(null);
  return (
    <div
      onClick={() => fileRef.current?.click()}
      className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/40 hover:bg-muted/30 transition-colors"
    >
      <Upload className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
      <p className="text-sm font-medium text-foreground">Drop files or click to upload</p>
      <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG, XLSX, KML — max 20MB</p>
      <input ref={fileRef} type="file" className="hidden" multiple accept=".pdf,.jpg,.jpeg,.png,.xlsx,.xls,.kml" />
    </div>
  );
}

export default function DashboardDocuments() {
  const allDocs = mockDocuments;
  const processSteps = mockSPV.processSteps;

  const stats = {
    total: allDocs.length,
    verified: allDocs.filter((d) => d.status === "verified").length,
    pending: allDocs.filter((d) => d.status === "pending").length,
    action: allDocs.filter((d) => d.status === "action_required").length,
  };

  const stages: { stage: ProcessStage; stepId: number }[] = [
    { stage: "document_submission", stepId: 1 },
    { stage: "asset_standardization", stepId: 2 },
    { stage: "spv_deployment", stepId: 3 },
    { stage: "listing_funding", stepId: 4 },
    { stage: "capital_deployment", stepId: 5 },
  ];

  return (
    <div className="p-6 md:p-8 max-w-[1200px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            My Documents
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {stats.total} documents across {stages.length} stages
          </p>
        </div>
        <UploadDropZone />
      </div>

      {/* Stats bar */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs text-emerald-600">
          <CheckCircle2 className="h-3.5 w-3.5" /> {stats.verified} Verified
        </div>
        <div className="flex items-center gap-1.5 text-xs text-amber-600">
          <Clock className="h-3.5 w-3.5" /> {stats.pending} Pending
        </div>
        <div className="flex items-center gap-1.5 text-xs text-red-600">
          <AlertCircle className="h-3.5 w-3.5" /> {stats.action} Action Required
        </div>
      </div>

      {/* Stage-grouped document sections */}
      <div className="space-y-4">
        {stages.map(({ stage, stepId }) => {
          const step = processSteps.find((s) => s.id === stepId);
          const status = (step?.status as "completed" | "in_progress" | "pending") || "pending";
          const docs = getDocsByStage(stage);

          return (
            <StageSection
              key={stage}
              stage={stage}
              stepNumber={stepId}
              status={status}
              docs={docs}
              defaultOpen={status === "completed" || status === "in_progress"}
            />
          );
        })}
      </div>
    </div>
  );
}
