import { useRef, useState } from "react";
import { Upload, FileText, FolderOpen, Download, Eye, Check, Clock, AlertCircle, ChevronUp, ChevronDown, Lock, Shield, FileSpreadsheet, PenTool } from "lucide-react";
import { useOwnerSpvs, useSpvDocuments, useUserUploadedDocuments, useDocumentSubmission } from "@/hooks/useSpvData";
import { useGeneratedDocuments, useIsDeploymentComplete, useDeploymentStages, useListingStages, useIsListingComplete } from "@/hooks/useDeploymentData";
import { useUserAnalysisReports, useTermSheet } from "@/hooks/useAnalysisData";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { generateAssetScorePDF, generateProjectDossierPDF, generateTermSheetPDF } from "@/lib/pdfGenerators";
import { SignTermSheetModal } from "@/components/dashboard/documents/SignTermSheetModal";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

// Stage configuration matching the process pipeline
const STAGE_CONFIG = [
  { key: "submission", label: "Document Submission", icon: "📋" },
  { key: "standardization", label: "Asset Standardization", icon: "⚖️" },
  { key: "spv", label: "SPV Deployment", icon: "🏛️" },
  { key: "listing", label: "Listing", icon: "📋" },
  { key: "funding", label: "Funding", icon: "💰" },
  { key: "disbursement", label: "Capital Disbursement", icon: "💸" },
  { key: "operations", label: "Operations & Reporting", icon: "📊" },
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

type StageStatus = "processing" | "locked" | "completed";

interface StageSectionProps {
  stage: typeof STAGE_CONFIG[0];
  status: StageStatus;
  defaultOpen?: boolean;
  children?: React.ReactNode;
  docCount?: number;
  statusSummary?: string;
}

function StageSection({ stage, status, defaultOpen = false, children, docCount, statusSummary }: StageSectionProps) {
  const [open, setOpen] = useState(defaultOpen && status !== "locked");
  const isLocked = status === "locked";

  const statusDisplay = {
    processing: { label: "Processing", className: "text-amber-600", icon: Clock },
    completed: { label: "Completed", className: "text-emerald-600", icon: Check },
    locked: { label: "Locked", className: "text-muted-foreground", icon: Lock },
  };

  const StatusIcon = statusDisplay[status].icon;

  return (
    <div className={cn(
      "border border-border rounded-xl overflow-hidden bg-card",
      isLocked && "opacity-60"
    )}>
      <button
        onClick={() => !isLocked && setOpen(!open)}
        className={cn(
          "w-full flex items-center gap-4 p-5 text-left transition-colors",
          !isLocked && "hover:bg-muted/30",
          isLocked && "cursor-not-allowed"
        )}
        disabled={isLocked}
      >
        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-xl shrink-0">
          {stage.icon}
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-bold text-foreground">{stage.label}</span>
          <p className="text-xs text-muted-foreground">
            {statusSummary || (docCount != null && docCount > 0 
              ? `${docCount} document${docCount !== 1 ? "s" : ""}`
              : "No documents yet"
            )}
          </p>
        </div>
        <span className={cn(
          "inline-flex items-center gap-1 text-xs font-semibold shrink-0",
          statusDisplay[status].className
        )}>
          <StatusIcon className="h-3.5 w-3.5" /> {statusDisplay[status].label}
        </span>
        {!isLocked && (
          open ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
          )
        )}
      </button>

      {open && children && (
        <div className="p-4 pt-0 space-y-2">
          {children}
        </div>
      )}
    </div>
  );
}

// AI-generated document item
interface GeneratedDocItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onView: () => void;
  onDownload: () => void;
  actions?: React.ReactNode;
  signedStatus?: string | null;
}

function GeneratedDocItem({ icon, title, subtitle, onView, onDownload, actions, signedStatus }: GeneratedDocItemProps) {
  return (
    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {signedStatus === "signed" && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 px-2">
            <Check className="h-3.5 w-3.5" /> Signed
          </span>
        )}
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onView} title="View">
          <Eye className="h-4 w-4 text-muted-foreground" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onDownload} title="Download">
          <Download className="h-4 w-4 text-muted-foreground" />
        </Button>
        {actions}
      </div>
    </div>
  );
}

export default function DashboardDocuments() {
  const { data: spvs, isLoading: loadingSpvs } = useOwnerSpvs();
  const { user } = useAuth();
  const spv = spvs?.[0];
  const { data: spvDocs, isLoading: loadingSpvDocs } = useSpvDocuments(spv?.id);
  const { data: uploadedDocs, isLoading: loadingUploaded } = useUserUploadedDocuments();
  const { data: submission } = useDocumentSubmission();
  const { data: analysisReports } = useUserAnalysisReports();
  const { data: deploymentGeneratedDocs } = useGeneratedDocuments(submission?.id);
  const { data: deploymentStages } = useDeploymentStages(submission?.id);
  const { data: listingStages } = useListingStages(submission?.id);
  const isDeploymentComplete = useIsDeploymentComplete(deploymentStages);
  const isDeploymentApproved = !!(submission as any)?.deployment_approved;
  const isListingStarted = (listingStages && listingStages.length > 0) || false;
  const isListingComplete = useIsListingComplete(listingStages);
  const [showSignModal, setShowSignModal] = useState(false);

  const isReleased = !!(submission as any)?.released_to_client;
  const latestReport = analysisReports?.find(r => r.analysis_status === "completed") || null;
  const { data: termSheet } = useTermSheet(latestReport?.id);
  
  const { data: existingSignature } = useQuery({
    queryKey: ["term-sheet-signature", submission?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("term_sheet_signatures" as any)
        .select("*")
        .eq("user_id", user!.id)
        .eq("submission_id", submission!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user && !!submission?.id,
  });

  const isLoading = loadingSpvs || loadingSpvDocs || loadingUploaded;

  // PDF generation handlers
  const profileName = "";
  
  const handleViewAssetScore = () => {
    if (!latestReport) return;
    try {
      const pdf = generateAssetScorePDF(latestReport as any, profileName);
      const blob = pdf.output("blob");
      window.open(URL.createObjectURL(blob), "_blank");
    } catch { toast.error("Failed to generate PDF"); }
  };

  const handleDownloadAssetScore = () => {
    if (!latestReport) return;
    try {
      const pdf = generateAssetScorePDF(latestReport as any, profileName);
      pdf.save(`Asset-Score-${latestReport.grade}.pdf`);
    } catch { toast.error("Failed to generate PDF"); }
  };

  const handleViewDossier = () => {
    if (!latestReport) return;
    try {
      const pdf = generateProjectDossierPDF(latestReport as any, submission, profileName);
      const blob = pdf.output("blob");
      window.open(URL.createObjectURL(blob), "_blank");
    } catch { toast.error("Failed to generate PDF"); }
  };

  const handleDownloadDossier = () => {
    if (!latestReport) return;
    try {
      const pdf = generateProjectDossierPDF(latestReport as any, submission, profileName);
      pdf.save(`Project-Dossier.pdf`);
    } catch { toast.error("Failed to generate PDF"); }
  };

  const handleViewTermSheet = () => {
    if (!termSheet || !latestReport) return;
    try {
      const pdf = generateTermSheetPDF(termSheet, latestReport as any, profileName);
      const blob = pdf.output("blob");
      window.open(URL.createObjectURL(blob), "_blank");
    } catch { toast.error("Failed to generate PDF"); }
  };

  const handleDownloadTermSheet = () => {
    if (!termSheet || !latestReport) return;
    try {
      const pdf = generateTermSheetPDF(termSheet, latestReport as any, profileName);
      pdf.save(`Term-Sheet-${termSheet.reference_code}.pdf`);
    } catch { toast.error("Failed to generate PDF"); }
  };

  // Handlers for generated documents (deployment + listing)
  const handleViewGenDoc = (doc: any) => {
    if (doc.file_url) {
      supabase.storage
        .from("project-documents")
        .createSignedUrl(doc.file_url, 3600)
        .then(({ data }) => {
          if (data?.signedUrl) window.open(data.signedUrl, "_blank");
        });
    } else if (doc.content) {
      const blob = new Blob([doc.content], { type: "text/plain" });
      window.open(URL.createObjectURL(blob), "_blank");
    }
  };

  const handleDownloadGenDoc = (doc: any) => {
    if (doc.file_url) {
      supabase.storage.from("project-documents").download(doc.file_url).then(({ data }) => {
        if (data) {
          const url = URL.createObjectURL(data);
          const a = document.createElement("a"); a.href = url; a.download = doc.document_name; a.click();
          URL.revokeObjectURL(url);
        }
      });
    } else if (doc.content) {
      const blob = new Blob([doc.content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `${doc.document_name}.txt`; a.click();
      URL.revokeObjectURL(url);
    }
  };

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
    const totalDocs = uploadedDocs.length;
    const submissionCompleted = isReleased;
    const hasAnalysis = isReleased && latestReport;
    const analysisDocCount = hasAnalysis ? (termSheet ? 3 : 2) : 0;

    const verifiedCount = submissionCompleted ? totalDocs : 0;
    const pendingCount = submissionCompleted ? 0 : totalDocs;

    // Count deployment docs
    const deployDocCount = deploymentGeneratedDocs?.filter(d => ["spv_doc_creation", "spv_incorporation", "facility_doc_creation", "legal_close"].includes(d.stage_key)).length || 0;
    // Count listing docs
    const listingDocCount = deploymentGeneratedDocs?.filter(d => ["sc_specifications", "sc_development", "sc_deployment", "sc_auditing", "sc_deployment_record", "ipfs_anchoring"].includes(d.stage_key)).length || 0;

    return (
      <div className="p-6 md:p-8 max-w-[1200px] mx-auto space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">My Documents</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {totalDocs + analysisDocCount + deployDocCount + listingDocCount} document{(totalDocs + analysisDocCount + deployDocCount + listingDocCount) !== 1 ? "s" : ""} across {STAGE_CONFIG.length} stages
            </p>
            
            <div className="flex items-center gap-4 mt-4">
              <span className="inline-flex items-center gap-1.5 text-sm text-emerald-600">
                <Check className="h-4 w-4" /> {verifiedCount + analysisDocCount} Verified
              </span>
              <span className="inline-flex items-center gap-1.5 text-sm text-amber-600">
                <Clock className="h-4 w-4" /> {pendingCount} Pending
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
            const isFirstStage = idx === 0;
            const isStandardization = idx === 1;
            
            if (isFirstStage) {
              const stageStatus: StageStatus = submissionCompleted ? "completed" : "processing";
              return (
                <StageSection 
                  key={stage.key} 
                  stage={stage} 
                  status={stageStatus}
                  defaultOpen={!submissionCompleted}
                  docCount={totalDocs}
                  statusSummary={`${totalDocs} document${totalDocs !== 1 ? "s" : ""} · ${submissionCompleted ? "All verified" : `${totalDocs} pending`}`}
                >
                  {uploadedDocs.map((doc) => (
                    <DocumentItem 
                      key={doc.path} 
                      doc={doc} 
                      status={submissionCompleted ? "verified" : "pending"} 
                    />
                  ))}
                </StageSection>
              );
            }
            
            if (isStandardization) {
              if (!hasAnalysis) {
                return (
                  <StageSection 
                    key={stage.key} 
                    stage={stage} 
                    status={submissionCompleted ? "processing" : "locked"}
                    docCount={0}
                  />
                );
              }
              
              return (
                <StageSection 
                  key={stage.key} 
                  stage={stage} 
                  status="completed"
                  defaultOpen
                  docCount={analysisDocCount}
                  statusSummary={`${analysisDocCount} documents · Score: ${latestReport!.grade}`}
                >
                  <GeneratedDocItem
                    icon={<Shield className="h-5 w-5 text-primary" />}
                    title="Asset Standardization Score"
                    subtitle={`Score: ${latestReport!.total_score} · Grade: ${latestReport!.grade} · ${latestReport!.grade_label}`}
                    onView={handleViewAssetScore}
                    onDownload={handleDownloadAssetScore}
                  />
                  <GeneratedDocItem
                    icon={<FileText className="h-5 w-5 text-primary" />}
                    title="Project Dossier"
                    subtitle="Executive summary, verification log, recommendations"
                    onView={handleViewDossier}
                    onDownload={handleDownloadDossier}
                  />
                  {termSheet && (
                    <GeneratedDocItem
                      icon={<FileSpreadsheet className="h-5 w-5 text-primary" />}
                      title="Term Sheet"
                      subtitle={`Ref: ${termSheet.reference_code} · Valid until ${new Date(termSheet.valid_until).toLocaleDateString()}`}
                      onView={handleViewTermSheet}
                      onDownload={handleDownloadTermSheet}
                      signedStatus={existingSignature ? "signed" : null}
                      actions={
                        !existingSignature ? (
                          <Button size="sm" className="gap-1.5 h-8" onClick={() => setShowSignModal(true)}>
                            <PenTool className="h-3.5 w-3.5" /> Sign
                          </Button>
                        ) : undefined
                      }
                    />
                  )}
                </StageSection>
              );
            }
            
            // SPV Deployment stage
            if (stage.key === "spv") {
              if (!isDeploymentApproved) {
                return (
                  <StageSection 
                    key={stage.key} 
                    stage={stage} 
                    status="locked"
                    docCount={0}
                  />
                );
              }

              const stageStatus: StageStatus = isDeploymentComplete ? "completed" : "processing";
              const deployDocs = deploymentGeneratedDocs?.filter(d => ["spv_doc_creation", "spv_incorporation", "facility_doc_creation", "legal_close"].includes(d.stage_key)) || [];

              return (
                <StageSection
                  key={stage.key}
                  stage={stage}
                  status={stageStatus}
                  defaultOpen={!isDeploymentComplete}
                  docCount={deployDocs.length}
                  statusSummary={`${deployDocs.length} document${deployDocs.length !== 1 ? "s" : ""} · ${isDeploymentComplete ? "All stages completed" : "In progress"}`}
                >
                  {deployDocs.map((doc) => (
                    <GeneratedDocItem
                      key={doc.id}
                      icon={<FileText className="h-5 w-5 text-primary" />}
                      title={doc.document_name}
                      subtitle={`${doc.document_type} · ${doc.stage_key === "facility_doc_creation" ? (doc.status === "signed" ? "Signed" : "Awaiting signature") : doc.status}`}
                      onView={() => handleViewGenDoc(doc)}
                      onDownload={() => handleDownloadGenDoc(doc)}
                      signedStatus={doc.status === "signed" ? "signed" : null}
                      actions={
                        doc.stage_key === "facility_doc_creation" && doc.status !== "signed" ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 px-2">
                            <Clock className="h-3.5 w-3.5" /> Unsigned
                          </span>
                        ) : undefined
                      }
                    />
                  ))}
                </StageSection>
              );
            }

            // Listing stage
            if (stage.key === "listing") {
              if (!isListingStarted) {
                return (
                  <StageSection
                    key={stage.key}
                    stage={stage}
                    status="locked"
                    docCount={0}
                  />
                );
              }

              const listDocs = deploymentGeneratedDocs?.filter(d => ["sc_specifications", "sc_development", "sc_deployment", "sc_auditing", "sc_deployment_record", "ipfs_anchoring"].includes(d.stage_key)) || [];
              const listStatus: StageStatus = isListingComplete ? "completed" : "processing";

              return (
                <StageSection
                  key={stage.key}
                  stage={stage}
                  status={listStatus}
                  defaultOpen={!isListingComplete}
                  docCount={listDocs.length}
                  statusSummary={`${listDocs.length} document${listDocs.length !== 1 ? "s" : ""} · ${isListingComplete ? "All stages completed" : "In progress"}`}
                >
                  {listDocs.map((doc) => (
                    <GeneratedDocItem
                      key={doc.id}
                      icon={<FileText className="h-5 w-5 text-primary" />}
                      title={doc.document_name}
                      subtitle={`${doc.document_type} · ${doc.status}`}
                      onView={() => handleViewGenDoc(doc)}
                      onDownload={() => handleDownloadGenDoc(doc)}
                      signedStatus={doc.status === "signed" ? "signed" : null}
                    />
                  ))}
                </StageSection>
              );
            }

            // All other stages are locked
            return (
              <StageSection 
                key={stage.key} 
                stage={stage} 
                status="locked"
                docCount={0}
              />
            );
          })}
        </div>

        {/* Sign Term Sheet Modal */}
        {submission && latestReport && (
          <SignTermSheetModal
            open={showSignModal}
            onOpenChange={setShowSignModal}
            submissionId={submission.id}
            analysisReportId={latestReport.id}
          />
        )}
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
