import { useState, useRef } from "react";
import { Check, Loader2, ChevronDown, Play, FileText, Clock, CheckCircle, Upload, Eye, Download, PenTool, Trash2, Bot, Zap, RefreshCw, AlertTriangle, Info, ChevronRight, Rocket, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
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
  useLaunchSCDevelopment,
  useExecuteStep,
  useDeployContract,
  type DeploymentStage,
  type GeneratedDocument,
} from "@/hooks/useDeploymentData";

/* ── Status Badge ── */
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

/* ── Phase-level badge (for accordion headers) ── */
function PhaseBadge({ status }: { status: "completed" | "in_progress" | "pending" | "awaiting" }) {
  if (status === "completed") {
    return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] ml-auto shrink-0"><Check className="h-2.5 w-2.5 mr-0.5" /> Completed</Badge>;
  }
  if (status === "in_progress") {
    return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] ml-auto shrink-0"><Loader2 className="h-2.5 w-2.5 mr-0.5 animate-spin" /> In Progress</Badge>;
  }
  if (status === "awaiting") {
    return <Badge variant="outline" className="text-[10px] ml-auto shrink-0">Awaiting</Badge>;
  }
  return <Badge variant="outline" className="text-[10px] ml-auto shrink-0">Pending</Badge>;
}

/* ── View Document Modal ── */
function ViewDocumentModal({ doc, open, onOpenChange }: { doc: GeneratedDocument | null; open: boolean; onOpenChange: (v: boolean) => void }) {
  if (!doc) return null;
  const handleDownload = () => {
    if (doc.content) {
      const blob = new Blob([doc.content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `${doc.document_name}.txt`; a.click();
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
          <DialogDescription>{doc.document_type} · Status: {doc.status}</DialogDescription>
        </DialogHeader>
        <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap text-sm leading-relaxed border border-border rounded-lg p-4 bg-muted/20">
          {doc.content || "No content available."}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleDownload} className="gap-2"><Download className="h-4 w-4" /> Download</Button>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ── Sign Facility Document Modal ── */
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
    if (!signatureData || !signerName.trim()) { toast.error("Please provide your name and signature"); return; }
    signDoc.mutate({ documentId: doc.id, signerName: signerName.trim(), signatureData, signatureType: "typed" }, {
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
            <input value={signerName} onChange={(e) => handleTypedSig(e.target.value)} placeholder="Enter your full legal name"
              className="w-full px-3 py-2 rounded-md border-2 border-gray-300 focus:border-blue-500 focus:outline-none text-base"
              style={{ background: "#fff", color: "#1a1a1a" }} />
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
          <Button onClick={handleSign} disabled={!signatureData || !signerName.trim() || signDoc.isPending} className="gap-2">
            {signDoc.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <PenTool className="h-4 w-4" />}
            Sign Document
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ── Stage Row ── */
function StageRow({ stage, stageDocs, completeStage, canComplete, blocker, onViewDoc, onDownloadDoc, onSignDoc, onDeleteDoc, onUploadDoc, submission, showDocActions, onLaunchAgent, agentLoading, onRegeneratePlan, onExecuteStep, executingStep, onDeployContract, deployingContract, deployResult }: {
  stage: DeploymentStage;
  stageDocs: GeneratedDocument[];
  completeStage: any;
  canComplete: boolean;
  blocker: string | null;
  onViewDoc: (doc: GeneratedDocument) => void;
  onDownloadDoc: (doc: GeneratedDocument) => void;
  onSignDoc: (doc: GeneratedDocument) => void;
  onDeleteDoc?: (doc: GeneratedDocument) => void;
  onUploadDoc?: (stageKey: string) => void;
  submission: any;
  showDocActions?: boolean;
  onLaunchAgent?: () => void;
  agentLoading?: boolean;
  onRegeneratePlan?: () => void;
  onExecuteStep?: (phaseNumber: number, stepNumber: number) => void;
  executingStep?: string | null;
  onDeployContract?: (network: "testnet" | "mainnet") => void;
  deployingContract?: boolean;
  deployResult?: any;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadingCert, setUploadingCert] = useState(false);
  const uploadCert = useUploadIncorporationCert();
  const incorpCertUploaded = stageDocs.some(d => d.document_type === "incorporation_certificate");

  const handleCertUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCert(true);
    uploadCert.mutate({ submissionId: submission.id, userId: submission.user_id, file }, {
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
        <div className="flex items-center gap-2">
          {onUploadDoc && stage.status === "in_progress" && (
            <Button size="sm" variant="outline" onClick={() => onUploadDoc(stage.stage_key)} className="gap-1.5 text-xs">
              <Upload className="h-3 w-3" /> Upload
            </Button>
          )}
          {stage.status === "in_progress" && (
            <Button size="sm" variant="outline"
              onClick={() => completeStage.mutate({ stageId: stage.id, submissionId: submission.id, currentStageKey: stage.stage_key, userId: submission.user_id })}
              disabled={completeStage.isPending || !canComplete} className="gap-1.5 text-xs">
              {completeStage.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
              Mark Complete
            </Button>
          )}
        </div>
      </div>
      <p className="text-xs text-muted-foreground">{stage.description}</p>

      {blocker && (
        <p className="text-xs text-amber-600 bg-amber-50 rounded p-2 border border-amber-200">⚠️ {blocker}</p>
      )}

      {/* SC Development: Launch AI Agent button */}
      {stage.stage_key === "sc_development" && stage.status === "in_progress" && !stageDocs.some(d => d.document_type === "sc_development_plan") && (
        <div className="space-y-2 pt-1">
          <Button size="sm" onClick={onLaunchAgent} disabled={agentLoading} className="gap-2">
            {agentLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bot className="h-4 w-4" />}
            {agentLoading ? "AI Agent Working..." : "Launch AI Development Agent"}
          </Button>
          {agentLoading && (
            <p className="text-xs text-muted-foreground animate-pulse">Reading specification and generating development plan...</p>
          )}
        </div>
      )}

      {/* SC Development Plan display */}
      {stage.stage_key === "sc_development" && stageDocs.some(d => d.document_type === "sc_development_plan") && (() => {
        const planDoc = stageDocs.find(d => d.document_type === "sc_development_plan");
        const stepOutputs = stageDocs.filter(d => d.document_type === "sc_step_output");
        const completedStepRefs = new Set(stepOutputs.map(d => {
          const match = d.document_name.match(/^Step (\d+\.\d+)/);
          return match ? match[1] : null;
        }).filter(Boolean));

        let plan: any = null;
        try { plan = planDoc?.content ? JSON.parse(planDoc.content) : null; } catch {}
        if (!plan) return null;
        return (
          <div className="space-y-3 pt-2">
            {/* Header with regenerate button */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <span className="text-sm font-bold text-foreground">Development Plan</span>
                <Badge variant="secondary" className="text-[10px]">{plan.estimated_duration}</Badge>
                {onRegeneratePlan && (
                  <Button size="sm" variant="ghost" onClick={onRegeneratePlan} disabled={agentLoading} className="ml-auto gap-1.5 text-xs h-7">
                    {agentLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                    Regenerate
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{plan.summary}</p>
              {plan.tech_stack && (
                <div className="flex flex-wrap gap-1">
                  {plan.tech_stack.map((t: string, i: number) => (
                    <Badge key={i} variant="outline" className="text-[10px]">{t}</Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Spec Evaluation */}
            {plan.spec_evaluation && (
              <div className={cn("rounded-lg p-3 border", 
                plan.spec_evaluation.overall_quality === "excellent" || plan.spec_evaluation.overall_quality === "good" 
                  ? "bg-emerald-50 border-emerald-200" 
                  : "bg-amber-50 border-amber-200"
              )}>
                <div className="flex items-center gap-2 mb-2">
                  {plan.spec_evaluation.overall_quality === "excellent" || plan.spec_evaluation.overall_quality === "good" 
                    ? <CheckCircle className="h-4 w-4 text-emerald-600" />
                    : <AlertTriangle className="h-4 w-4 text-amber-600" />
                  }
                  <span className="text-xs font-semibold text-foreground">Specification Evaluation: <span className="capitalize">{plan.spec_evaluation.overall_quality}</span></span>
                </div>
                {plan.spec_evaluation.issues_found?.length > 0 && (
                  <div className="space-y-1 mb-2">
                    {plan.spec_evaluation.issues_found.map((issue: any, i: number) => (
                      <div key={i} className="flex gap-2 text-xs">
                        <Badge variant={issue.severity === "critical" ? "destructive" : issue.severity === "warning" ? "default" : "secondary"} className="text-[9px] shrink-0">{issue.severity}</Badge>
                        <div>
                          <span className="font-medium text-foreground">{issue.area}:</span>{" "}
                          <span className="text-muted-foreground">{issue.description}</span>
                          <p className="text-primary/80 mt-0.5">→ {issue.recommendation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {plan.spec_evaluation.corrections_applied?.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-foreground mb-1">Corrections Applied:</p>
                    <ul className="text-xs text-muted-foreground space-y-0.5 list-disc list-inside">
                      {plan.spec_evaluation.corrections_applied.map((c: string, i: number) => <li key={i}>{c}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Phases with executable steps */}
            {plan.phases?.map((phase: any) => (
              <div key={phase.phase_number} className="border border-border rounded-lg overflow-hidden">
                <div className="bg-muted/30 px-3 py-2 flex items-center gap-2">
                  <span className="text-[10px] font-bold text-muted-foreground">PHASE {phase.phase_number}</span>
                  <span className="text-xs font-semibold text-foreground">{phase.phase_name}</span>
                  <Badge variant="outline" className="text-[10px] ml-auto">{phase.duration}</Badge>
                </div>
                <div className="p-3 space-y-2">
                  <p className="text-xs text-muted-foreground">{phase.description}</p>
                  {phase.steps?.map((step: any) => {
                    const stepRef = `${phase.phase_number}.${step.step_number}`;
                    const isCompleted = completedStepRefs.has(stepRef);
                    const isExecuting = executingStep === stepRef;
                    const stepOutputDoc = stepOutputs.find(d => d.document_name.startsWith(`Step ${stepRef}:`));

                    return (
                      <div key={step.step_number} className="space-y-0">
                        <div className={cn("flex gap-2 text-xs rounded p-2 border", isCompleted ? "bg-emerald-50/50 border-emerald-200" : "bg-background border-border")}>
                          {/* Execute button */}
                          <div className="shrink-0 flex flex-col items-center gap-1">
                            <span className="text-muted-foreground font-mono">{stepRef}</span>
                            {isCompleted ? (
                              <CheckCircle className="h-4 w-4 text-emerald-600" />
                            ) : onExecuteStep ? (
                              <button
                                onClick={() => onExecuteStep(phase.phase_number, step.step_number)}
                                disabled={!!executingStep}
                                className={cn(
                                  "h-6 w-6 rounded-full flex items-center justify-center transition-colors",
                                  executingStep ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
                                )}
                                title={`Execute step ${stepRef}`}
                              >
                                {isExecuting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
                              </button>
                            ) : null}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground">{step.title}</span>
                              <Badge variant={step.priority === "critical" ? "destructive" : step.priority === "high" ? "default" : "secondary"} className="text-[9px]">{step.priority}</Badge>
                              {isCompleted && <Badge variant="outline" className="text-[9px] bg-emerald-50 text-emerald-700 border-emerald-200">Done</Badge>}
                            </div>
                            <p className="text-muted-foreground mt-0.5">{step.description}</p>
                            {step.deliverables?.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {step.deliverables.map((d: string, i: number) => (
                                  <span key={i} className="text-[10px] text-primary/80 bg-primary/5 rounded px-1.5 py-0.5">{d}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Step output display */}
                        {isExecuting && (
                          <div className="ml-8 mt-1 flex items-center gap-2 text-xs text-amber-600 bg-amber-50 rounded p-2 border border-amber-200">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            <span>AI agent executing step {stepRef}...</span>
                          </div>
                        )}
                        {stepOutputDoc && !isExecuting && (
                          <div className="ml-8 mt-1">
                            <button
                              onClick={() => onViewDoc(stepOutputDoc)}
                              className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors"
                            >
                              <Eye className="h-3 w-3" />
                              <span className="font-medium">View Output</span>
                              <ChevronRight className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {plan.security_considerations && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-xs font-semibold text-amber-800 mb-1">Security Considerations</p>
                <ul className="text-xs text-amber-700 space-y-0.5 list-disc list-inside">
                  {plan.security_considerations.map((s: string, i: number) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            )}

            {plan.testing_strategy && (
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-xs font-semibold text-foreground mb-1">Testing Strategy</p>
                <p className="text-xs text-muted-foreground">{plan.testing_strategy}</p>
              </div>
            )}
          </div>
        );
      })()}

      {/* SC Deployment: Deploy to blockchain button */}
      {stage.stage_key === "sc_deployment" && stage.status === "in_progress" && onDeployContract && (
        <div className="space-y-3 pt-1">
          {!deployResult && (
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={() => onDeployContract("testnet")} disabled={deployingContract} className="gap-2">
                {deployingContract ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
                {deployingContract ? "Deploying to Base Sepolia..." : "Deploy to Base Sepolia (Testnet)"}
              </Button>
            </div>
          )}
          {deployingContract && (
            <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 rounded p-2 border border-amber-200">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>AI is consolidating code, compiling Solidity, and deploying to Base Sepolia...</span>
            </div>
          )}
          {deployResult && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-bold text-emerald-700">Contract Deployed!</span>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground font-medium w-28">Contract:</span>
                  <code className="bg-background px-2 py-0.5 rounded text-foreground font-mono text-[11px]">{deployResult.contract_address}</code>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground font-medium w-28">Network:</span>
                  <span className="text-foreground">{deployResult.network}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground font-medium w-28">Tx Hash:</span>
                  <code className="bg-background px-2 py-0.5 rounded text-foreground font-mono text-[11px] truncate max-w-[200px]">{deployResult.tx_hash}</code>
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <a href={deployResult.explorer_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium">
                  <ExternalLink className="h-3 w-3" /> View Contract
                </a>
                <a href={deployResult.tx_explorer_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium">
                  <ExternalLink className="h-3 w-3" /> View Transaction
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      {stage.stage_key === "spv_incorporation" && stage.status === "in_progress" && !incorpCertUploaded && (
        <div className="space-y-2 pt-1">
          <p className="text-xs font-medium text-foreground">Upload Incorporation Certificate</p>
          <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()} disabled={uploadingCert} className="gap-1.5 text-xs">
            {uploadingCert ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
            Upload Certificate
          </Button>
          <input ref={fileRef} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png,.docx" onChange={handleCertUpload} />
        </div>
      )}

      {stageDocs.length > 0 && (
        <div className="space-y-1 pt-1">
          {stageDocs.map((doc) => (
            <div key={doc.id} className="flex items-center gap-2 text-xs bg-background rounded p-2">
              <FileText className="h-3 w-3 text-muted-foreground" />
              <span className="text-foreground font-medium flex-1">{doc.document_name}</span>
              <Badge variant="secondary" className="text-[10px]">{doc.status}</Badge>
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => onViewDoc(doc)} title="View"><Eye className="h-3 w-3 text-muted-foreground" /></Button>
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => onDownloadDoc(doc)} title="Download"><Download className="h-3 w-3 text-muted-foreground" /></Button>
              {doc.stage_key === "facility_doc_creation" && doc.status !== "signed" && (
                <Button size="sm" variant="outline" className="h-6 px-2 text-[10px] gap-1" onClick={() => onSignDoc(doc)}><PenTool className="h-2.5 w-2.5" /> Sign</Button>
              )}
              {doc.status === "signed" && (
                <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-0.5"><Check className="h-2.5 w-2.5" /> Signed</span>
              )}
              {showDocActions && onDeleteDoc && (
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-destructive hover:text-destructive" onClick={() => onDeleteDoc(doc)} title="Delete"><Trash2 className="h-3 w-3" /></Button>
              )}
            </div>
          ))}
        </div>
      )}

      {stage.completed_at && (
        <p className="text-[10px] text-muted-foreground">Completed {new Date(stage.completed_at).toLocaleDateString()}</p>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   Main Panel — Accordion Layout
   ══════════════════════════════════════════════ */
interface AdminDeploymentPanelProps {
  submission: any;
}

export function AdminDeploymentPanel({ submission }: AdminDeploymentPanelProps) {
  const [viewDoc, setViewDoc] = useState<GeneratedDocument | null>(null);
  const [signDoc, setSignDoc] = useState<GeneratedDocument | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<GeneratedDocument | null>(null);
  const [deleting, setDeleting] = useState(false);
  const uploadFileRef = useRef<HTMLInputElement>(null);
  const [uploadStageKey, setUploadStageKey] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  const { data: stages } = useDeploymentStages(submission.id);
  const { data: listingStages } = useListingStages(submission.id);
  const { data: generatedDocs } = useGeneratedDocuments(submission.id);
  const { data: signatures } = useTermSheetSignatures(submission.id);
  const approveDeployment = useApproveDeployment();
  const completeStage = useCompleteStage();
  const launchSCDev = useLaunchSCDevelopment();
  const executeStep = useExecuteStep();
  const deployContract = useDeployContract();
  const [executingStepRef, setExecutingStepRef] = useState<string | null>(null);
  const [deployResult, setDeployResult] = useState<any>(null);

  const handleExecuteStep = (phaseNumber: number, stepNumber: number) => {
    const ref = `${phaseNumber}.${stepNumber}`;
    setExecutingStepRef(ref);
    executeStep.mutate(
      { submissionId: submission.id, phaseNumber, stepNumber },
      { onSettled: () => setExecutingStepRef(null) }
    );
  };

  const handleDeployContract = (network: "testnet" | "mainnet") => {
    deployContract.mutate(
      { submissionId: submission.id, network },
      { onSuccess: (data) => setDeployResult(data) }
    );
  };

  const isDeploymentApproved = !!(submission as any).deployment_approved;
  const isDeploymentComplete = useIsDeploymentComplete(stages);
  const isListingComplete = useIsListingComplete(listingStages);
  const hasSignatures = signatures && signatures.length > 0;
  const report = submission.analysis_report;
  const isAnalysisComplete = report?.analysis_status === "completed" && report?.total_score >= 60;

  const canApprove = isAnalysisComplete && hasSignatures && !isDeploymentApproved && submission.released_to_client;

  if (!isAnalysisComplete) return null;

  // Gating
  const facilityDocs = generatedDocs?.filter(d => d.stage_key === "facility_doc_creation") || [];
  const allFacilityDocsSigned = facilityDocs.length > 0 && facilityDocs.every(d => d.status === "signed");
  const incorpCertUploaded = generatedDocs?.some(d => d.stage_key === "spv_incorporation" && d.document_type === "incorporation_certificate");

  const getDeploymentBlocker = (stage: DeploymentStage): string | null => {
    if (stage.stage_key === "spv_incorporation" && !incorpCertUploaded) return "Upload the incorporation certificate before completing this stage.";
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

  // Doc handlers
  const handleViewDoc = async (doc: GeneratedDocument) => {
    if (doc.file_url && !doc.content) {
      const { data } = await supabase.storage.from("project-documents").createSignedUrl(doc.file_url, 3600);
      if (data?.signedUrl) window.open(data.signedUrl, "_blank");
    } else { setViewDoc(doc); }
  };
  const handleDownloadDoc = async (doc: GeneratedDocument) => {
    if (doc.file_url) {
      const { data } = await supabase.storage.from("project-documents").download(doc.file_url);
      if (data) { const url = URL.createObjectURL(data); const a = document.createElement("a"); a.href = url; a.download = doc.document_name; a.click(); URL.revokeObjectURL(url); }
    } else if (doc.content) {
      const blob = new Blob([doc.content], { type: "text/plain" }); const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `${doc.document_name}.txt`; a.click(); URL.revokeObjectURL(url);
    }
  };
  const handleDeleteDoc = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      const { error } = await supabase.from("generated_documents" as any).delete().eq("id", deleteConfirm.id);
      if (error) throw error;
      if (deleteConfirm.file_url) await supabase.storage.from("project-documents").remove([deleteConfirm.file_url]);
      queryClient.invalidateQueries({ queryKey: ["generated-documents"] });
      toast.success("Document deleted");
    } catch { toast.error("Failed to delete document"); }
    finally { setDeleting(false); setDeleteConfirm(null); }
  };
  const handleUploadReplacement = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadStageKey) return;
    setUploading(true);
    try {
      const filePath = `${submission.user_id}/${submission.id}/${uploadStageKey}-${Date.now()}.${file.name.split('.').pop()}`;
      const { error: uploadErr } = await supabase.storage.from("project-documents").upload(filePath, file);
      if (uploadErr) throw uploadErr;
      const { error: insertErr } = await supabase.from("generated_documents" as any).insert({
        submission_id: submission.id, user_id: submission.user_id, stage_key: uploadStageKey,
        document_name: file.name.replace(/\.[^/.]+$/, ""), document_type: "uploaded_replacement", file_url: filePath, status: "draft",
      } as any);
      if (insertErr) throw insertErr;
      queryClient.invalidateQueries({ queryKey: ["generated-documents"] });
      toast.success("Document uploaded");
    } catch { toast.error("Failed to upload document"); }
    finally { setUploading(false); setUploadStageKey(null); }
  };

  // Phase statuses
  const standardizationStatus: "completed" | "in_progress" | "pending" = isAnalysisComplete ? "completed" : "in_progress";
  const deploymentStatus: "completed" | "in_progress" | "pending" | "awaiting" = isDeploymentComplete ? "completed" : isDeploymentApproved ? "in_progress" : hasSignatures ? "pending" : "awaiting";
  const listingStatus: "completed" | "in_progress" | "pending" | "awaiting" = isListingComplete ? "completed" : (listingStages && listingStages.length > 0) ? "in_progress" : "awaiting";

  const isListingStarted = listingStages && listingStages.length > 0;

  // Determine which accordion items to open by default
  const defaultOpen: string[] = [];
  if (standardizationStatus !== "completed") defaultOpen.push("standardization");
  if (deploymentStatus === "in_progress") defaultOpen.push("deployment");
  if (listingStatus === "in_progress") defaultOpen.push("listing");
  if (defaultOpen.length === 0) defaultOpen.push("standardization");

  return (
    <>
      <div className="border-t border-border pt-4">
        <Accordion type="multiple" defaultValue={defaultOpen} className="space-y-2">

          {/* ═══ 1. ASSET STANDARDIZATION ═══ */}
          <AccordionItem value="standardization" className="border border-border rounded-lg overflow-hidden">
            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/30 [&[data-state=open]]:bg-muted/20">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-sm font-bold text-foreground">⚖️ Asset Standardization</span>
                <PhaseBadge status={standardizationStatus} />
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-4">
              {/* Project Description */}
              {submission.project_description && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Project Description</p>
                  <p className="text-sm text-foreground">{submission.project_description}</p>
                </div>
              )}

              {/* KYC Signatories */}
              {submission.kyc_signatories && submission.kyc_signatories.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">KYC Signatories</p>
                  <div className="flex flex-wrap gap-2">
                    {submission.kyc_signatories.map((sig: any, idx: number) => (
                      <Badge key={idx} variant="secondary" className="text-xs">{sig.name} ({sig.role})</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Analysis Results */}
              {report && report.analysis_status === "completed" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">Score</p>
                      <p className={cn("text-2xl font-bold",
                        report.total_score >= 90 ? "text-emerald-600" :
                        report.total_score >= 75 ? "text-green-600" :
                        report.total_score >= 60 ? "text-amber-600" : "text-red-600"
                      )}>{report.total_score}</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">Grade</p>
                      <p className="text-lg font-bold text-foreground">{report.grade}</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">Classification</p>
                      <p className="text-sm font-medium text-foreground">{report.grade_label}</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">Doc Completeness</p>
                      <p className="text-lg font-bold text-foreground">{report.document_completeness_score}%</p>
                    </div>
                  </div>

                  {/* Score Dimensions */}
                  {report.score_dimensions && report.score_dimensions.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Score Dimensions</p>
                      <div className="space-y-2">
                        {report.score_dimensions.map((dim: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-3">
                            <span className="text-xs text-muted-foreground w-[140px] shrink-0 truncate">{dim.name}</span>
                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                              <div className={cn("h-full rounded-full transition-all",
                                dim.score >= 90 ? "bg-emerald-500" : dim.score >= 80 ? "bg-green-500" : dim.score >= 70 ? "bg-amber-500" : "bg-red-500"
                              )} style={{ width: `${dim.score}%` }} />
                            </div>
                            <span className="text-xs font-bold w-8 text-right">{dim.score}</span>
                            <span className="text-[10px] text-muted-foreground w-10 text-right">{dim.weight}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Project Summary */}
                  {report.project_summary && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">AI Summary</p>
                      <p className="text-sm text-foreground line-clamp-3">{report.project_summary}</p>
                    </div>
                  )}
                </div>
              )}

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
            </AccordionContent>
          </AccordionItem>

          {/* ═══ 2. SPV DEPLOYMENT ═══ */}
          <AccordionItem value="deployment" className="border border-border rounded-lg overflow-hidden">
            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/30 [&[data-state=open]]:bg-muted/20">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-sm font-bold text-foreground">🏛️ SPV Deployment</span>
                <PhaseBadge status={deploymentStatus} />
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-4">
              {/* Approve Button */}
              {canApprove && (
                <Button onClick={() => approveDeployment.mutate({ submissionId: submission.id, userId: submission.user_id })}
                  disabled={approveDeployment.isPending} className="gap-2">
                  {approveDeployment.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                  Approve SPV Deployment
                </Button>
              )}

              {!isDeploymentApproved && !canApprove && (
                <div className="bg-muted/30 rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    {!hasSignatures ? "Awaiting term sheet signature from the client before deployment can be approved."
                      : !submission.released_to_client ? "Release the analysis to the client first, then approve deployment."
                      : "Deployment conditions not yet met."}
                  </p>
                </div>
              )}

              {stages && stages.length > 0 && (
                <div className="space-y-2">
                  {stages.map((stage) => {
                    const stageDocs = generatedDocs?.filter(d => d.stage_key === stage.stage_key) || [];
                    const blocker = stage.status === "in_progress" ? getDeploymentBlocker(stage) : null;
                    return (
                      <StageRow key={stage.id} stage={stage} stageDocs={stageDocs} completeStage={completeStage}
                        canComplete={canCompleteDeploymentStage(stage)} blocker={blocker}
                        onViewDoc={handleViewDoc} onDownloadDoc={handleDownloadDoc} onSignDoc={(doc) => setSignDoc(doc)} submission={submission} />
                    );
                  })}
                </div>
              )}

              {isDeploymentComplete && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-medium text-emerald-700">SPV Deployment completed. Listing stage is now active.</span>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* ═══ 3. LISTING ═══ */}
          <AccordionItem value="listing" className="border border-border rounded-lg overflow-hidden">
            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/30 [&[data-state=open]]:bg-muted/20">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-sm font-bold text-foreground">📋 Listing</span>
                <PhaseBadge status={listingStatus} />
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-4">
              {!isListingStarted ? (
                <div className="bg-muted/30 rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    Listing stages will become available once SPV Deployment is completed.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {listingStages!.map((stage) => {
                    const stageDocs = generatedDocs?.filter(d =>
                      d.stage_key === stage.stage_key || (stage.stage_key === "sc_auditing" && (d.stage_key === "sc_deployment_record" || d.stage_key === "ipfs_anchoring"))
                    ) || [];
                    return (
                      <StageRow key={stage.id} stage={stage} stageDocs={stageDocs} completeStage={completeStage}
                        canComplete={true} blocker={null} onViewDoc={handleViewDoc} onDownloadDoc={handleDownloadDoc}
                        onSignDoc={(doc) => setSignDoc(doc)} onDeleteDoc={(doc) => setDeleteConfirm(doc)}
                        onUploadDoc={(key) => { setUploadStageKey(key); uploadFileRef.current?.click(); }}
                        submission={submission} showDocActions={true}
                        onLaunchAgent={stage.stage_key === "sc_development" ? () => launchSCDev.mutate({ submissionId: submission.id }) : undefined}
                        agentLoading={stage.stage_key === "sc_development" ? launchSCDev.isPending : false}
                        onRegeneratePlan={stage.stage_key === "sc_development" ? () => launchSCDev.mutate({ submissionId: submission.id }) : undefined}
                        onExecuteStep={stage.stage_key === "sc_development" ? handleExecuteStep : undefined}
                        executingStep={stage.stage_key === "sc_development" ? executingStepRef : null} />
                    );
                  })}

                  {isListingComplete && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                      <span className="text-sm font-medium text-emerald-700">Listing completed. Funding stage is now active.</span>
                    </div>
                  )}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Hidden file input */}
      <input ref={uploadFileRef} type="file" className="hidden" accept=".pdf,.docx,.txt,.json" onChange={handleUploadReplacement} />

      {/* Modals */}
      <ViewDocumentModal doc={viewDoc} open={!!viewDoc} onOpenChange={(v) => !v && setViewDoc(null)} />
      <SignFacilityDocModal doc={signDoc} open={!!signDoc} onOpenChange={(v) => !v && setSignDoc(null)} />
      <Dialog open={!!deleteConfirm} onOpenChange={(v) => !v && setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Trash2 className="h-5 w-5 text-destructive" /> Delete Document</DialogTitle>
            <DialogDescription>Are you sure you want to delete "{deleteConfirm?.document_name}"? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteDoc} disabled={deleting} className="gap-2">
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />} Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
