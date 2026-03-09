import { useState } from "react";
import { Check, Loader2, ChevronDown, ChevronUp, Play, FileText, PenTool, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useDeploymentStages, useGeneratedDocuments, useApproveDeployment, useCompleteStage, useTermSheetSignatures, type DeploymentStage } from "@/hooks/useDeploymentData";

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

interface AdminDeploymentPanelProps {
  submission: any;
}

export function AdminDeploymentPanel({ submission }: AdminDeploymentPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const { data: stages } = useDeploymentStages(submission.id);
  const { data: generatedDocs } = useGeneratedDocuments(submission.id);
  const { data: signatures } = useTermSheetSignatures(submission.id);
  const approveDeployment = useApproveDeployment();
  const completeStage = useCompleteStage();

  const isDeploymentApproved = !!(submission as any).deployment_approved;
  const hasSignatures = signatures && signatures.length > 0;
  const report = submission.analysis_report;
  const isAnalysisComplete = report?.analysis_status === "completed" && report?.total_score >= 60;

  // Can approve deployment if: analysis passed, term sheet signed, not already approved
  const canApprove = isAnalysisComplete && hasSignatures && !isDeploymentApproved && submission.released_to_client;

  if (!isAnalysisComplete) return null;

  return (
    <div className="border-t border-border pt-4 space-y-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-2">
          <h4 className="text-xs font-bold uppercase tracking-wide text-foreground">SPV Deployment</h4>
          {isDeploymentApproved ? (
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
              <Check className="h-2.5 w-2.5 mr-0.5" /> Approved
            </Badge>
          ) : hasSignatures ? (
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">
              Ready for Approval
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[10px]">
              Awaiting Term Sheet Signature
            </Badge>
          )}
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
                    <span className="text-muted-foreground">
                      signed {new Date(sig.signed_at).toLocaleDateString()}
                    </span>
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

          {/* Deployment Stages */}
          {stages && stages.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Deployment Stages</p>
              {stages.map((stage) => {
                const stageDocs = generatedDocs?.filter(d => d.stage_key === stage.stage_key) || [];
                return (
                  <div key={stage.id} className="bg-muted/30 rounded-lg p-3 space-y-2">
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
                          })}
                          disabled={completeStage.isPending}
                          className="gap-1.5 text-xs"
                        >
                          {completeStage.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                          Mark Complete
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{stage.description}</p>
                    
                    {/* Show generated docs for this stage */}
                    {stageDocs.length > 0 && (
                      <div className="space-y-1 pt-1">
                        {stageDocs.map((doc) => (
                          <div key={doc.id} className="flex items-center gap-2 text-xs bg-background rounded p-2">
                            <FileText className="h-3 w-3 text-muted-foreground" />
                            <span className="text-foreground font-medium flex-1">{doc.document_name}</span>
                            <Badge variant="secondary" className="text-[10px]">{doc.status}</Badge>
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
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
