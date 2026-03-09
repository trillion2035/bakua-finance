import { useRef, useState } from "react";
import { Upload, FileText, FolderOpen, Download, Eye, Check, Clock, AlertCircle, ChevronUp, ChevronDown } from "lucide-react";
import { useOwnerSpvs, useSpvDocuments, useUserUploadedDocuments, useDocumentSubmission } from "@/hooks/useSpvData";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

// Stage configuration matching the process pipeline
const STAGE_CONFIG = [
  { key: "project", step: 1, label: "Document Submission", icon: "📋" },
  { key: "legal", step: 2, label: "Asset Standardization", icon: "⚖️" },
  { key: "financial", step: 3, label: "SPV Creation", icon: "💰" },
  { key: "contracts", step: 4, label: "Capital Raise", icon: "📝" },
  { key: "sector", step: 5, label: "Capital Deployment", icon: "🌱" },
  { key: "identity", step: 6, label: "Operations & Reporting", icon: "🪪" },
];

function UploadDropZone() {
  const fileRef = useRef<HTMLInputElement>(null);
  return (
    <div
      onClick={() => fileRef.current?.click()}
      className="border border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/40 hover:bg-muted/10 transition-colors"
    >
      <Upload className="h-5 w-5 text-muted-foreground mx-auto mb-2" />
      <p className="text-sm font-medium text-foreground">Drop files or click to upload</p>
      <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG, XLSX, KML — max 20MB</p>
      <input ref={fileRef} type="file" className="hidden" multiple accept=".pdf,.jpg,.jpeg,.png,.xlsx,.kml,.docx" />
    </div>
  );
}

function formatDocName(fileName: string): string {
  const withoutTimestamp = fileName.replace(/-\d{13,}/, "");
  const withoutExt = withoutTimestamp.replace(/\.(pdf|docx|jpg|jpeg|png|xlsx|kml)$/i, "");
  return withoutExt
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function getFileExtension(fileName: string): string {
  const ext = fileName.split(".").pop()?.toUpperCase() || "FILE";
  return ext;
}

type DocStatus = "verified" | "pending" | "action_required";

interface DocumentItemProps {
  doc: {
    name: string;
    path: string;
    created_at: string;
    size?: number;
  };
  status?: DocStatus;
}

function DocumentItem({ doc, status = "pending" }: DocumentItemProps) {
  const [expanded, setExpanded] = useState(false);
  const ext = getFileExtension(doc.name);
  const displayName = formatDocName(doc.name);

  const handleView = async () => {
    const { data } = await supabase.storage
      .from("project-documents")
      .createSignedUrl(doc.path, 3600);
    if (data?.signedUrl) {
      window.open(data.signedUrl, "_blank");
    }
  };

  const handleDownload = async () => {
    const { data } = await supabase.storage
      .from("project-documents")
      .download(doc.path);
    if (data) {
      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.name;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const statusConfig = {
    verified: { label: "Verified", className: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: Check },
    pending: { label: "Pending", className: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock },
    action_required: { label: "Action Required", className: "bg-red-50 text-red-700 border-red-200", icon: AlertCircle },
  };

  const StatusIcon = statusConfig[status].icon;

  return (
    <div className={cn(
      "border rounded-lg transition-all",
      expanded ? "border-primary bg-card shadow-sm" : "border-border bg-card hover:border-muted-foreground/30"
    )}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 text-left"
      >
        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
          <FileText className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{displayName}</p>
          <p className="text-xs text-muted-foreground truncate">
            {doc.name} · {doc.size ? formatFileSize(doc.size) : "—"}
          </p>
        </div>
        <span className={cn(
          "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border shrink-0",
          statusConfig[status].className
        )}>
          <StatusIcon className="h-3 w-3" />
          {statusConfig[status].label}
        </span>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-0 space-y-3">
          <p className="text-sm text-muted-foreground">
            Uploaded: {new Date(doc.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={handleView}>
              <Eye className="h-3.5 w-3.5" /> View
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={handleDownload}>
              <Download className="h-3.5 w-3.5" /> Download
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

interface StageSectionProps {
  stage: typeof STAGE_CONFIG[0];
  docs: DocumentItemProps["doc"][];
  defaultOpen?: boolean;
}

function StageSection({ stage, docs, defaultOpen = false }: StageSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const verifiedCount = docs.length; // For now, treat all as pending until we have status tracking

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 p-5 text-left hover:bg-muted/30 transition-colors"
      >
        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-xl shrink-0">
          {stage.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-muted-foreground tracking-wider">STEP {stage.step}</span>
            <span className="text-sm font-bold text-foreground">{stage.label}</span>
          </div>
          <span className="text-xs text-muted-foreground">
            {docs.length} document{docs.length !== 1 ? "s" : ""} · {verifiedCount} pending
          </span>
        </div>
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 shrink-0">
          <Clock className="h-3.5 w-3.5" /> Processing
        </span>
        {open ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
      </button>

      {open && docs.length > 0 && (
        <div className="p-4 pt-0 space-y-2">
          {docs.map((doc) => (
            <DocumentItem key={doc.path} doc={doc} status="pending" />
          ))}
        </div>
      )}
    </div>
  );
}

export default function DashboardDocuments() {
  const { data: spvs, isLoading: loadingSpvs } = useOwnerSpvs();
  const spv = spvs?.[0];
  const { data: spvDocs, isLoading: loadingSpvDocs } = useSpvDocuments(spv?.id);
  const { data: uploadedDocs, isLoading: loadingUploaded } = useUserUploadedDocuments();
  const { data: submission } = useDocumentSubmission();

  const isLoading = loadingSpvs || loadingSpvDocs || loadingUploaded;

  if (isLoading) {
    return <div className="p-6 text-muted-foreground">Loading...</div>;
  }

  // If user has SPV with documents, show those
  if (spv && spvDocs && spvDocs.length > 0) {
    return (
      <div className="p-6 md:p-8 max-w-[1200px] mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">My Documents</h1>
            <p className="text-sm text-muted-foreground mt-1">{spvDocs.length} documents across 6 stages</p>
          </div>
          <UploadDropZone />
        </div>

        <div className="space-y-3">
          {spvDocs.map((doc) => (
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

  // If user has uploaded documents (from wizard), show stage-based view
  if (uploadedDocs && uploadedDocs.length > 0) {
    // Group by category
    const grouped = uploadedDocs.reduce((acc, doc) => {
      const cat = doc.category;
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(doc);
      return acc;
    }, {} as Record<string, typeof uploadedDocs>);

    // Calculate totals
    const totalDocs = uploadedDocs.length;
    const verifiedCount = 0; // Will be tracked via database status later
    const pendingCount = totalDocs;
    const actionCount = 0;

    // Get stages that have documents
    const stagesWithDocs = STAGE_CONFIG.filter(s => grouped[s.key]?.length > 0);

    return (
      <div className="p-6 md:p-8 max-w-[1200px] mx-auto space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">My Documents</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {totalDocs} document{totalDocs !== 1 ? "s" : ""} across {stagesWithDocs.length} stage{stagesWithDocs.length !== 1 ? "s" : ""}
            </p>
            
            {/* Status summary */}
            <div className="flex items-center gap-4 mt-4">
              <span className="inline-flex items-center gap-1.5 text-sm text-emerald-600">
                <Check className="h-4 w-4" /> {verifiedCount} Verified
              </span>
              <span className="inline-flex items-center gap-1.5 text-sm text-amber-600">
                <Clock className="h-4 w-4" /> {pendingCount} Pending
              </span>
              <span className="inline-flex items-center gap-1.5 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" /> {actionCount} Action Required
              </span>
            </div>
          </div>
          
          <div className="w-full lg:w-auto lg:min-w-[280px]">
            <UploadDropZone />
          </div>
        </div>

        {/* Stage sections */}
        <div className="space-y-4">
          {STAGE_CONFIG.map((stage, idx) => {
            const docs = grouped[stage.key] || [];
            if (docs.length === 0) return null;
            return (
              <StageSection 
                key={stage.key} 
                stage={stage} 
                docs={docs} 
                defaultOpen={idx === 0}
              />
            );
          })}
        </div>
      </div>
    );
  }

  // Empty state
  return (
    <div className="p-6 md:p-8 max-w-[1200px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">My Documents</h1>
          <p className="text-sm text-muted-foreground mt-1">0 documents</p>
        </div>
      </div>
      <div className="bg-card border border-border rounded-lg p-12 text-center space-y-3">
        <FolderOpen className="h-10 w-10 text-muted-foreground mx-auto" />
        <h3 className="text-base font-bold text-foreground">No documents yet</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Documents will appear here once you submit your project documents through the Overview tab. Start by clicking "Submit Documents" on the Process Status pipeline.
        </p>
      </div>
    </div>
  );
}
