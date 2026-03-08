import { useState, useRef } from "react";
import {
  stageLabels,
  type ProcessStage,
} from "@/data/mockDocumentsData";
import { Upload, CheckCircle2, Clock, AlertCircle, FileText } from "lucide-react";
import { useOwnerSpvs, useSpvDocuments } from "@/hooks/useSpvData";

function UploadDropZone() {
  const fileRef = useRef<HTMLInputElement>(null);
  return (
    <div
      onClick={() => fileRef.current?.click()}
      className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/40 hover:bg-muted/30 transition-colors"
    >
      <Upload className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
      <p className="text-sm font-medium text-foreground">Drop files or click to upload</p>
      <p className="text-xs text-muted-foreground mt-1">PDF, DOCX — max 10MB</p>
      <input ref={fileRef} type="file" className="hidden" multiple accept=".pdf,.docx" />
    </div>
  );
}

export default function DashboardDocuments() {
  const { data: spvs, isLoading } = useOwnerSpvs();
  const spv = spvs?.[0];
  const { data: docs } = useSpvDocuments(spv?.id);

  if (isLoading) return <div className="p-6 text-muted-foreground">Loading...</div>;

  if (!docs || docs.length === 0) {
    return (
      <div className="p-6 md:p-8 max-w-[1200px] mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">My Documents</h1>
            <p className="text-sm text-muted-foreground mt-1">0 documents</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-12 text-center space-y-3">
          <FileText className="h-10 w-10 text-muted-foreground mx-auto" />
          <h3 className="text-base font-bold text-foreground">No documents yet</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Documents will appear here once you submit your project documents through the Overview tab. Start by clicking "Submit Documents" on the Process Status pipeline.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-[1200px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">My Documents</h1>
          <p className="text-sm text-muted-foreground mt-1">{docs.length} document{docs.length !== 1 ? "s" : ""}</p>
        </div>
        <UploadDropZone />
      </div>

      <div className="space-y-3">
        {docs.map((doc) => (
          <div key={doc.id} className="bg-card border border-border rounded-lg p-4 flex items-center gap-3">
            <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
              {doc.purpose && <p className="text-xs text-muted-foreground truncate">{doc.purpose}</p>}
            </div>
            {doc.signed_date && <span className="text-xs text-muted-foreground shrink-0">{doc.signed_date}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
