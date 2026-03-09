import { useState, useRef } from "react";
import { Check, Loader2, ChevronDown, ChevronUp, Play, FileText, Clock, CheckCircle, Upload, Eye, Download, PenTool } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  useDeploymentStages,
  useListingStages,
  useGeneratedDocuments,
  useApproveDeployment,
  useCompleteStage,
  useTermSheetSignatures,
  useSignGeneratedDocument,
  useUploadIncorporationCert,
  useIsDeploymentComplete,
  useIsListingComplete,
  type DeploymentStage,
  type GeneratedDocument,
} from "@/hooks/useDeploymentData";

function StageStatusBadge({ status }: { status: DeploymentStage["status"] }) {
  if (status === "completed") {
    return (
      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
        <CheckCircle className="h-3 w-3 mr-1" /> Completed
      </Badge>
    );
  }
  if (status === "in_progress") {
    return (
      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
        <Loader2 className="h-3 w-3 mr-1 animate-spin" /> In Progress
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="bg-muted text-muted-foreground">
      <Clock className="h-3 w-3 mr-1" /> Pending
    </Badge>
  );
}

// View document content modal
function ViewDocumentModal({ doc, open, onOpenChange }: { doc: GeneratedDocument | null; open: boolean; onOpenChange: (v: boolean) => void }) {
  if (!doc) return null;

  const handleDownload = () => {
    if (doc.content) {
      const blob = new Blob([doc.content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${doc.document_name}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            {doc.document_name}
          </DialogTitle>
          <DialogDescription>
            {doc.document_type} · Status: {doc.status}
          </DialogDescription>
        </DialogHeader>
        <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap text-sm leading-relaxed border border-border rounded-lg p-4 bg-muted/20">
          {doc.content || "No content available."}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleDownload} className="gap-2">
            <Download className="h-4 w-4" /> Download
          </Button>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Sign facility document modal
function SignFacilityDocModal({ doc, open, onOpenChange }: { doc: GeneratedDocument | null; open: boolean; onOpenChange: (v: boolean) => void }) {
  const signDoc = useSignGeneratedDocument();
  const [signerName, setSignerName] = useState("");
  const [signatureData, setSignatureData] = useState<string | null>(null);

  if (!doc) return null;

  const handleTypedSig = (typed: string) => {
    setSignerName(typed);
    if (typed.trim()) {
      const canvas = document.createElement("canvas");
      canvas.width = 400; canvas.height = 100;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, 400, 100);
        ctx.font = "italic 32px 'Georgia', serif"; ctx.fillStyle = "#1a1a1a";
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(typed, 200, 50);
        setSignatureData(canvas.toDataURL("image/png"));
      }
    } else {
      setSignatureData(null);
    }
  };

  const handleSign = () => {
    if (!signatureData || !signerName.trim()) {
      toast.error("Please provide your name and signature");
      return;
    }
    signDoc.mutate({
      documentId: doc.id,
      signerName: signerName.trim(),
      signatureData,
      signatureType: "typed",
    }, {
      onSuccess: () => onOpenChange(false),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" style={{ background: "#fff", color: "#1a1a1a" }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2" style={{ color: "#1a1a1a" }}>
            <PenTool className="h-5 w-5" style={{ color: "#2563eb" }} />
            Sign: {doc.document_name}
          </DialogTitle>
          <DialogDescription style={{ color: "#6b7280" }}>
            By signing, you confirm this document has been reviewed and is legally binding.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" style={{ color: "#374151" }}>Full Legal Name</label>
            <input
              value={signerName}
              onChange={(e) => handleTypedSig(e.target.value)}
              placeholder="Enter your full legal name"
              className="w-full px-3 py-2 rounded-md border-2 border-gray-300 focus:border-blue-500 focus:outline-none text-base"
              style={{ background: "#fff", color: "#1a1a1a" }}
            />
          </div>

          {signerName.trim() && (
            <div className="rounded-lg p-4 flex items-center justify-center h-20 border-2 border-gray-300" style={{ background: "#fff" }}>
              <span className="text-2xl italic font-serif" style={{ color: "#1a1a1a" }}>{signerName}</span>
            </div>
          )}

          <div className="rounded-lg p-3 text-xs space-y-1" style={{ background: "#f9fafb", color: "#6b7280" }}>
            <p className="font-medium" style={{ color: "#374151" }}>By signing you confirm:</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>You have reviewed this document</li>
              <li>You are authorized to sign on behalf of your organization</li>
              <li>This digital signature is legally binding</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} style={{ borderColor: "#d1d5db", color: "#374151" }}>Cancel</Button>
          <Button
            onClick={handleSign}
            disabled={!signatureData || !signerName.trim() || signDoc.isPending}
            className="gap-2"
          >
            {signDoc.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <PenTool className="h-4 w-4" />}
            Sign Document
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Shared stage rendering component
function StageRow({ stage, stageDocs, completeStage, canComplete, blocker, onViewDoc, onDownloadDoc, onSignDoc, submission }: {
  stage: DeploymentStage;
  stageDocs: GeneratedDocument[];
  completeStage: any;
  canComplete: boolean;
  blocker: string | null;
  onViewDoc: (doc: GeneratedDocument) => void;
  onDownloadDoc: (doc: GeneratedDocument) => void;
  onSignDoc: (doc: GeneratedDocument) => void;
  submission: any;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadingCert, setUploadingCert] = useState(false);
  const uploadCert = useUploadIncorporationCert();
  const incorpCertUploaded = stageDocs.some(d => d.document_type === "incorporation_certificate");

  const handleCertUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCert(true);
    uploadCert.mutate({
      submissionId: submission.id,
      userId: submission.user_id,
      file,
    }, {
      onSettled: () => setUploadingCert(false),
    });
  };

  return (
    <div className="bg-muted/30 rounded-lg p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">{stage.stage_label}</span>
          <StageStatusBadge status={stage.status} />
        </div>
        {stage.status === "in_progress" && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => completeStage.mutate({
              stageId: stage.id,
              submissionId: submission.id,
              currentStageKey: stage.stage_key,
              userId: submission.user_id,
            })}
            disabled={completeStage.isPending || !canComplete}
            className="gap-1.5 text-xs"
          >
            {completeStage.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
            Mark Complete
          </Button>
        )}
      </div>
      <p className="text-xs text-muted-foreground">{stage.description}</p>

      {blocker && (
        <p className="text-xs text-amber-600 bg-amber-50 rounded p-2 border border-amber-200">
          ⚠️ {blocker}
        </p>
      )}

      {/* SPV Incorporation: upload certificate */}
      {stage.stage_key === "spv_incorporation" && stage.status === "in_progress" && !incorpCertUploaded && (
        <div className="space-y-2 pt-1">
          <p className="text-xs font-medium text-foreground">Upload Incorporation Certificate</p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => fileRef.current?.click()}
            disabled={uploadingCert}
            className="gap-1.5 text-xs"
          >
            {uploadingCert ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
            Upload Certificate
          </Button>
          <input
            ref={fileRef}
            type="file"
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png,.docx"
            onChange={handleCertUpload}
          />
        </div>
      )}

      {/* Show generated docs for this stage */}
      {stageDocs.length > 0 && (
        <div className="space-y-1 pt-1">
          {stageDocs.map((doc) => (
            <div key={doc.id} className="flex items-center gap-2 text-xs bg-background rounded p-2">
              <FileText className="h-3 w-3 text-muted-foreground" />
              <span className="text-foreground font-medium flex-1">{doc.document_name}</span>
              <Badge variant="secondary" className="text-[10px]">{doc.status}</Badge>
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => onViewDoc(doc)} title="View">
                <Eye className="h-3 w-3 text-muted-foreground" />
              </Button>
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => onDownloadDoc(doc)} title="Download">
                <Download className="h-3 w-3 text-muted-foreground" />
              </Button>
              {doc.stage_key === "facility_doc_creation" && doc.status !== "signed" && (
                <Button size="sm" variant="outline" className="h-6 px-2 text-[10px] gap-1" onClick={() => onSignDoc(doc)}>
                  <PenTool className="h-2.5 w-2.5" /> Sign
                </Button>
              )}
              {doc.status === "signed" && (
                <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-0.5">
                  <Check className="h-2.5 w-2.5" /> Signed
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {stage.completed_at && (
        <p className="text-[10px] text-muted-foreground">
          Completed {new Date(stage.completed_at).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}

interface AdminDeploymentPanelProps {
  submission: any;
}

export function AdminDeploymentPanel({ submission }: AdminDeploymentPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const [viewDoc, setViewDoc] = useState<GeneratedDocument | null>(null);
  const [signDoc, setSignDoc] = useState<GeneratedDocument | null>(null);

  const { data: stages } = useDeploymentStages(submission.id);
  const { data: listingStages } = useListingStages(submission.id);
  const { data: generatedDocs } = useGeneratedDocuments(submission.id);
  const { data: signatures } = useTermSheetSignatures(submission.id);
  const approveDeployment = useApproveDeployment();
  const completeStage = useCompleteStage();

  const isDeploymentApproved = !!(submission as any).deployment_approved;
  const isDeploymentComplete = useIsDeploymentComplete(stages);
  const isListingComplete = useIsListingComplete(listingStages);
  const hasSignatures = signatures && signatures.length > 0;
  const report = submission.analysis_report;
  const isAnalysisComplete = report?.analysis_status === "completed" && report?.total_score >= 60;

  const canApprove = isAnalysisComplete && hasSignatures && !isDeploymentApproved && submission.released_to_client;

  if (!isAnalysisComplete) return null;

  // Check gating conditions for deployment stages
  const facilityDocs = generatedDocs?.filter(d => d.stage_key === "facility_doc_creation") || [];
  const allFacilityDocsSigned = facilityDocs.length > 0 && facilityDocs.every(d => d.status === "signed");
  const incorpCertUploaded = generatedDocs?.some(d => d.stage_key === "spv_incorporation" && d.document_type === "incorporation_certificate");

  const getDeploymentBlocker = (stage: DeploymentStage): string | null => {
    if (stage.stage_key === "spv_incorporation" && !incorpCertUploaded) {
      return "Upload the incorporation certificate before completing this stage.";
    }
    if (stage.stage_key === "legal_close" && !allFacilityDocsSigned) {
      const unsigned = facilityDocs.filter(d => d.status !== "signed").length;
      return `${unsigned} facility document${unsigned !== 1 ? "s" : ""} still need to be signed.`;
    }
    return null;
  };

  const canCompleteDeploymentStage = (stage: DeploymentStage) => {
    if (stage.stage_key === "spv_incorporation") return !!incorpCertUploaded;
    if (stage.stage_key === "legal_close") return allFacilityDocsSigned;
    return true;
  };

  const handleViewDoc = async (doc: GeneratedDocument) => {
    if (doc.file_url && !doc.content) {
      const { data } = await supabase.storage
        .from("project-documents")
        .createSignedUrl(doc.file_url, 3600);
      if (data?.signedUrl) window.open(data.signedUrl, "_blank");
    } else {
      setViewDoc(doc);
    }
  };

  const handleDownloadDoc = async (doc: GeneratedDocument) => {
    if (doc.file_url) {
      const { data } = await supabase.storage.from("project-documents").download(doc.file_url);
      if (data) {
        const url = URL.createObjectURL(data);
        const a = document.createElement("a"); a.href = url; a.download = doc.document_name; a.click();
        URL.revokeObjectURL(url);
      }
    } else if (doc.content) {
      const blob = new Blob([doc.content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `${doc.document_name}.txt`; a.click();
      URL.revokeObjectURL(url);
    }
  };

  // Overall status badge for deployment section
  const deploymentStatusBadge = () => {
    if (isDeploymentComplete) {
      return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]"><Check className="h-2.5 w-2.5 mr-0.5" /> Completed</Badge>;
    }
    if (isDeploymentApproved) {
      return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]"><Check className="h-2.5 w-2.5 mr-0.5" /> Approved</Badge>;
    }
    if (hasSignatures) {
      return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">Ready for Approval</Badge>;
    }
    return <Badge variant="outline" className="text-[10px]">Awaiting Term Sheet Signature</Badge>;
  };

  const listingStatusBadge = () => {
    if (isListingComplete) {
      return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]"><Check className="h-2.5 w-2.5 mr-0.5" /> Completed</Badge>;
    }
    if (listingStages && listingStages.length > 0) {
      return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]"><Loader2 className="h-2.5 w-2.5 mr-0.5 animate-spin" /> In Progress</Badge>;
    }
    return <Badge variant="outline" className="text-[10px]">Awaiting Deployment</Badge>;
  };

  return (
    <>
      <div className="border-t border-border pt-4 space-y-3">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-bold uppercase tracking-wide text-foreground">SPV Deployment & Listing</h4>
            {deploymentStatusBadge()}
          </div>
          {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </button>

        {expanded && (
          <div className="space-y-4">
            {/* Term Sheet Signature Status */}
            <div className="bg-muted/30 rounded-lg p-3 space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Term Sheet Signature</p>
              {hasSignatures ? (
                <div className="space-y-1">
                  {signatures.map((sig: any) => (
                    <div key={sig.id} className="flex items-center gap-2 text-xs">
                      <CheckCircle className="h-3 w-3 text-emerald-600" />
                      <span className="text-foreground font-medium">{sig.signer_name}</span>
                      <span className="text-muted-foreground">signed {new Date(sig.signed_at).toLocaleDateString()}</span>
                      <Badge variant="secondary" className="text-[10px]">{sig.signature_type}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No signatures yet. Client must sign the term sheet before deployment can proceed.</p>
              )}
            </div>

            {/* Approve Button */}
            {canApprove && (
              <Button
                onClick={() => approveDeployment.mutate({ submissionId: submission.id, userId: submission.user_id })}
                disabled={approveDeployment.isPending}
                className="gap-2"
              >
                {approveDeployment.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                Approve SPV Deployment
              </Button>
            )}

            {/* ===== DEPLOYMENT STAGES ===== */}
            {stages && stages.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Deployment Stages</p>
                {stages.map((stage) => {
                  const stageDocs = generatedDocs?.filter(d => d.stage_key === stage.stage_key) || [];
                  const blocker = stage.status === "in_progress" ? getDeploymentBlocker(stage) : null;
                  return (
                    <StageRow
                      key={stage.id}
                      stage={stage}
                      stageDocs={stageDocs}
                      completeStage={completeStage}
                      canComplete={canCompleteDeploymentStage(stage)}
                      blocker={blocker}
                      onViewDoc={handleViewDoc}
                      onDownloadDoc={handleDownloadDoc}
                      onSignDoc={(doc) => setSignDoc(doc)}
                      submission={submission}
                    />
                  );
                })}
              </div>
            )}

            {/* ===== LISTING STAGES ===== */}
            {isDeploymentComplete && (
              <div className="space-y-2 border-t border-border pt-3">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Listing Stages</p>
                  {listingStatusBadge()}
                </div>
                {listingStages && listingStages.length > 0 ? (
                  listingStages.map((stage) => {
                    const stageDocs = generatedDocs?.filter(d => d.stage_key === stage.stage_key || (stage.stage_key === "sc_auditing" && (d.stage_key === "sc_deployment_record" || d.stage_key === "ipfs_anchoring"))) || [];
                    return (
                      <StageRow
                        key={stage.id}
                        stage={stage}
                        stageDocs={stageDocs}
                        completeStage={completeStage}
                        canComplete={true}
                        blocker={null}
                        onViewDoc={handleViewDoc}
                        onDownloadDoc={handleDownloadDoc}
                        onSignDoc={(doc) => setSignDoc(doc)}
                        submission={submission}
                      />
                    );
                  })
                ) : (
                  <div className="flex items-center gap-2 text-xs text-gold">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Setting up listing stages...
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* View Document Modal */}
      <ViewDocumentModal doc={viewDoc} open={!!viewDoc} onOpenChange={(v) => !v && setViewDoc(null)} />

      {/* Sign Document Modal */}
      <SignFacilityDocModal doc={signDoc} open={!!signDoc} onOpenChange={(v) => !v && setSignDoc(null)} />
    </>
  );
}
