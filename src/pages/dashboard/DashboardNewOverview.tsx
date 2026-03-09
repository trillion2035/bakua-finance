import { useState } from "react";
import {
  ArrowRight, Clock, Check, Loader2, FileUp, Eye,
  DollarSign, TrendingUp, Shield, Percent,
  PenTool, ChevronDown, ChevronUp, FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useOwnerSpvs, useDocumentSubmission, useUserUploadedDocuments } from "@/hooks/useSpvData";
import { useUserAnalysisReports, useTermSheet } from "@/hooks/useAnalysisData";
import { useDeploymentStages, useGeneratedDocuments } from "@/hooks/useDeploymentData";
import { DocumentWizard } from "@/components/dashboard/DocumentWizard";
import { ProcessPipeline } from "@/components/dashboard/ProcessPipeline";
import { SignTermSheetModal } from "@/components/dashboard/documents/SignTermSheetModal";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import type { ProcessStepStatus } from "@/data/mockDashboardData";

function formatCurrency(amount: number | string | null, currency?: string | null): string {
  if (amount == null) return "—";
  const num = Number(amount);
  if (isNaN(num)) return String(amount);
  const formatted = new Intl.NumberFormat("en-US").format(num);
  return currency ? `${currency} ${formatted}` : formatted;
}

function formatCapitalTarget(raw: string): string {
  if (!raw) return "—";
  const match = raw.match(/^([^\d]*)([\d,.\s]+)(.*)$/);
  if (!match) return raw;
  const prefix = match[1].trim();
  const numStr = match[2].replace(/[,\s]/g, "");
  const suffix = match[3].trim();
  const num = Number(numStr);
  if (isNaN(num)) return raw;
  const formatted = new Intl.NumberFormat("en-US").format(num);
  return [prefix, formatted, suffix].filter(Boolean).join(" ");
}

function EmptyKPICards({ capitalTarget, spv, analysisReport }: { capitalTarget: string; spv: any; analysisReport: any }) {
  const hasScore = analysisReport?.analysis_status === "completed";

  const kpis = spv
    ? [
        { label: "Total Capital Target", value: spv.target_amount ? formatCurrency(spv.target_amount, spv.currency) : "—", subtext: spv.target_amount_usd || "Not set", icon: DollarSign },
        { label: "Funded", value: spv.funded_percent ? `${spv.funded_percent}%` : "—", subtext: spv.funded_percent === 100 ? "Fully funded" : "In progress", icon: TrendingUp },
        { label: "Asset Score™", value: hasScore ? analysisReport.grade : "—", subtext: hasScore ? analysisReport.grade_label : "Pending analysis", icon: Shield },
        { label: "IRR Target", value: spv.target_irr || "—", subtext: "36-month term", icon: Percent },
      ]
    : [
        { label: "Total Capital Target", value: formatCapitalTarget(capitalTarget), subtext: capitalTarget ? "As submitted" : "Not yet determined", icon: DollarSign },
        { label: "Funded", value: "—", subtext: "Awaiting documents", icon: TrendingUp },
        { label: "Asset Score™", value: hasScore ? analysisReport.grade : "—", subtext: hasScore ? analysisReport.grade_label : "Pending analysis", icon: Shield },
        { label: "IRR Target", value: "—", subtext: "Pending model", icon: Percent },
      ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi) => (
        <div key={kpi.label} className="bg-card border border-border rounded-lg p-5 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] tracking-[2px] text-muted-foreground font-semibold uppercase">{kpi.label}</span>
            <kpi.icon className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-extrabold tracking-tight text-foreground">{kpi.value}</div>
          <span className="text-xs text-muted-foreground">{kpi.subtext}</span>
        </div>
      ))}
    </div>
  );
}

function StatusIcon({ status, isFirst }: { status: ProcessStepStatus; isFirst?: boolean }) {
  if (status === "completed")
    return <div className="w-8 h-8 rounded-full bg-green/20 flex items-center justify-center shrink-0"><Check className="w-4 h-4 text-green" /></div>;
  if (status === "in_progress")
    return <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center shrink-0"><Loader2 className="w-4 h-4 text-gold animate-spin" /></div>;
  if (isFirst)
    return <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0"><ArrowRight className="w-4 h-4 text-primary" /></div>;
  return <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0"><Clock className="w-4 h-4 text-muted-foreground" /></div>;
}

interface ProcessStep {
  id: number;
  title: string;
  description: string;
  status: ProcessStepStatus;
  dateRange: string;
  actionable: boolean;
}

function getProcessSteps(hasSubmission: boolean, isReleased: boolean, isSigned: boolean, isDeploymentApproved: boolean, submissionDate?: string, releasedDate?: string): ProcessStep[] {
  const spvDeploymentStatus: ProcessStepStatus = isDeploymentApproved ? "in_progress" : isSigned ? "in_progress" : isReleased ? "in_progress" : "pending";
  const spvDeploymentDesc = isDeploymentApproved
    ? "SPV incorporation and legal close in progress."
    : isSigned
    ? "Term sheet signed. Awaiting admin approval to begin SPV deployment."
    : "Sign the term sheet to begin the SPV incorporation and legal close process.";
  const spvDeploymentDate = isDeploymentApproved
    ? "In progress"
    : isSigned
    ? "Awaiting admin approval"
    : isReleased
    ? "Awaiting term sheet signing"
    : "Awaiting standardization";

  if (hasSubmission && isReleased) {
    const formattedDate = submissionDate 
      ? new Date(submissionDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : "Recently";
    const formattedRelease = releasedDate
      ? new Date(releasedDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : "Recently";
    return [
      { id: 1, title: "Document Submission", description: "Your documents have been submitted and processed.", status: "completed", dateRange: `Submitted ${formattedDate}`, actionable: false },
      { id: 2, title: "Asset Standardization", description: "AI analysis complete. Your Asset Score™ and project documents are ready.", status: "completed", dateRange: `Completed ${formattedRelease}`, actionable: false },
      { id: 3, title: "SPV Deployment", description: spvDeploymentDesc, status: spvDeploymentStatus, dateRange: spvDeploymentDate, actionable: false },
      { id: 4, title: "Listing", description: "SPV listed on the investor marketplace for funding.", status: "pending", dateRange: "Awaiting deployment", actionable: false },
      { id: 5, title: "Funding", description: "Investors deposit capital until the SPV target is fully met.", status: "pending", dateRange: "Awaiting listing", actionable: false },
      { id: 6, title: "Capital Disbursement", description: "Funds released in milestones, verified by IoT oracles and smart contracts.", status: "pending", dateRange: "Awaiting funding", actionable: false },
    ];
  }

  if (hasSubmission) {
    const formattedDate = submissionDate 
      ? new Date(submissionDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : "Recently";
    return [
      { id: 1, title: "Document Submission", description: "Your documents have been submitted and are currently being processed by our team.", status: "completed", dateRange: `Submitted ${formattedDate}`, actionable: false },
      { id: 2, title: "Asset Standardization", description: "AI engine processes documents, generates Asset Score™ and financial model.", status: "in_progress", dateRange: "Processing documents", actionable: false },
      { id: 3, title: "SPV Deployment", description: "Legal entity incorporated, contracts executed, smart contract deployed on-chain.", status: "pending", dateRange: "Awaiting standardization", actionable: false },
      { id: 4, title: "Listing", description: "Smart contract deployed, audited, and SPV listed on the investor marketplace.", status: "pending", dateRange: "Awaiting deployment", actionable: false },
      { id: 5, title: "Funding", description: "Investors deposit capital until the SPV target is fully met.", status: "pending", dateRange: "Awaiting listing", actionable: false },
      { id: 6, title: "Capital Disbursement", description: "Funds released in milestones, verified by IoT oracles and smart contracts.", status: "pending", dateRange: "Awaiting funding", actionable: false },
    ];
  }
  
  return [
    { id: 1, title: "Document Submission", description: "Register and upload all required project documents for review.", status: "pending", dateRange: "Not started", actionable: true },
    { id: 2, title: "Asset Standardization", description: "AI engine processes documents, generates Asset Score™ and financial model.", status: "pending", dateRange: "Awaiting documents", actionable: false },
    { id: 3, title: "SPV Deployment", description: "Legal entity incorporated, contracts executed, smart contract deployed on-chain.", status: "pending", dateRange: "Awaiting standardization", actionable: false },
    { id: 4, title: "Listing", description: "Smart contract deployed, audited, and SPV listed on the investor marketplace.", status: "pending", dateRange: "Awaiting deployment", actionable: false },
    { id: 5, title: "Funding", description: "Investors deposit capital until the SPV target is fully met.", status: "pending", dateRange: "Awaiting listing", actionable: false },
    { id: 6, title: "Capital Disbursement", description: "Funds released in milestones, verified by IoT oracles and smart contracts.", status: "pending", dateRange: "Awaiting funding", actionable: false },
  ];
}

function useExistingSignature(submissionId: string | undefined) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["term-sheet-signature", submissionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("term_sheet_signatures" as any)
        .select("*")
        .eq("user_id", user!.id)
        .eq("submission_id", submissionId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user && !!submissionId,
  });
}

interface AssetStandardizationSummaryProps {
  report: any;
  termSheet: any;
  submission: any;
  onSignTermSheet: () => void;
  isSigned: boolean;
}

function AssetStandardizationSummary({ report, termSheet, onSignTermSheet, isSigned }: AssetStandardizationSummaryProps) {
  const navigate = useNavigate();

  return (
    <div className="space-y-3">
      {/* Score summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-muted/50 rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground">Score</p>
          <p className="text-xl font-extrabold text-foreground">{report.total_score}</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground">Grade</p>
          <p className="text-xl font-extrabold text-foreground">{report.grade}</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground">Classification</p>
          <p className="text-sm font-bold text-foreground">{report.grade_label}</p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button size="sm" variant="outline" className="gap-2" onClick={() => navigate("/dashboard/documents")}>
          <Eye className="h-3.5 w-3.5" /> View Documents
        </Button>
        {termSheet && !isSigned && (
          <Button size="sm" className="gap-2" onClick={onSignTermSheet}>
            <PenTool className="h-3.5 w-3.5" /> Sign Term Sheet
          </Button>
        )}
        {isSigned && (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green">
            <Check className="h-3.5 w-3.5" /> Term Sheet Signed
          </span>
        )}
      </div>
    </div>
  );
}

function EmptyProcessPipeline({ 
  onStartUpload, 
  hasSubmission, 
  isReleased,
  submissionDate,
  releasedDate,
  uploadedDocsCount,
  analysisReport,
  termSheet,
  submission,
  profileName,
  onSignTermSheet,
  isSigned,
}: { 
  onStartUpload: () => void; 
  hasSubmission: boolean;
  isReleased: boolean;
  submissionDate?: string;
  releasedDate?: string;
  uploadedDocsCount: number;
  analysisReport: any;
  termSheet: any;
  submission: any;
  profileName: string;
  onSignTermSheet: () => void;
  isSigned: boolean;
}) {
  const navigate = useNavigate();
  const processSteps = getProcessSteps(hasSubmission, isReleased, submissionDate, releasedDate);
  const completedCount = processSteps.filter(s => s.status === "completed").length;

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-bold text-foreground tracking-tight">Process Status</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{completedCount} of {processSteps.length} complete</p>
        </div>
        {hasSubmission && (
          <div className="flex gap-1 mt-1.5">
            {processSteps.map((s) => (
              <div
                key={s.id}
                className={`h-1.5 w-8 rounded-full ${
                  s.status === "completed" ? "bg-green" :
                  s.status === "in_progress" ? "bg-gold" : "bg-secondary"
                }`}
              />
            ))}
          </div>
        )}
      </div>
      <div className="space-y-0">
        {processSteps.map((step, i) => (
          <div key={step.id} className="relative flex gap-4">
            {i < processSteps.length - 1 && <div className="absolute left-4 top-10 w-px bg-border" style={{ bottom: "-8px" }} />}
            <StatusIcon 
              status={step.status} 
              isFirst={!hasSubmission && step.id === 1} 
            />
            <div className="flex-1 min-w-0 pb-6">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-foreground">{step.title}</span>
                {step.status === "completed" ? (
                  <span className="text-[10px] font-semibold tracking-wider uppercase text-green">Completed</span>
                ) : step.status === "in_progress" ? (
                  <span className="text-[10px] font-semibold tracking-wider uppercase text-gold">In Progress</span>
                ) : !hasSubmission && step.id === 1 ? (
                  <span className="text-[10px] font-semibold tracking-wider uppercase text-primary">Start Here</span>
                ) : (
                  <span className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">Pending</span>
                )}
              </div>
              <span className="text-xs text-muted-foreground">{step.dateRange}</span>
              
              {/* Document Submission completed */}
              {step.status === "completed" && step.id === 1 && (
                <div className="mt-3 bg-green/5 border border-green/20 rounded-lg p-4 space-y-3">
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                  <div className="flex items-center gap-3 text-xs text-green">
                    <Check className="h-3.5 w-3.5" />
                    <span>{uploadedDocsCount} document{uploadedDocsCount !== 1 ? "s" : ""} submitted</span>
                  </div>
                  <Button size="sm" variant="outline" className="gap-2" onClick={() => navigate("/dashboard/documents")}>
                    <Eye className="h-3.5 w-3.5" /> View Documents
                  </Button>
                </div>
              )}
              
              {/* Asset Standardization completed - show score + View Documents + Sign Term Sheet */}
              {step.status === "completed" && step.id === 2 && isReleased && analysisReport && (
                <div className="mt-3 bg-green/5 border border-green/20 rounded-lg p-4">
                  <AssetStandardizationSummary 
                    report={analysisReport} 
                    termSheet={termSheet} 
                    submission={submission}
                    onSignTermSheet={onSignTermSheet}
                    isSigned={isSigned}
                  />
                </div>
              )}

              {/* Asset Standardization in progress */}
              {step.status === "in_progress" && step.id === 2 && (
                <div className="mt-3 bg-gold/5 border border-gold/20 rounded-lg p-4 space-y-3">
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                  <div className="flex items-center gap-2 text-xs text-gold">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Documents are currently being processed
                  </div>
                </div>
              )}

              {/* SPV Deployment in progress */}
              {step.status === "in_progress" && step.id === 3 && (
                <div className="mt-3 bg-gold/5 border border-gold/20 rounded-lg p-4 space-y-3">
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                  <div className="flex items-center gap-2 text-xs text-gold">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Awaiting term sheet signing to begin deployment
                  </div>
                </div>
              )}
              
              {/* Start upload action */}
              {step.actionable && !hasSubmission && (
                <div className="mt-3 bg-secondary/50 border border-border rounded-lg p-4 space-y-3">
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                  <Button size="sm" className="gap-2" onClick={onStartUpload}>
                    <FileUp className="h-3.5 w-3.5" /> Submit Documents
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardNewOverview() {
  const [showWizard, setShowWizard] = useState(false);
  const [showSignModal, setShowSignModal] = useState(false);
  const { profile, user } = useAuth();
  const { data: spvs } = useOwnerSpvs();
  const { data: submission } = useDocumentSubmission();
  const { data: uploadedDocs } = useUserUploadedDocuments();
  const { data: analysisReports } = useUserAnalysisReports();

  const spv = spvs?.[0];
  const firstName = profile?.full_name?.split(" ")[0] || "there";
  const companyName = profile?.company_name || "";
  const capitalTarget = user?.user_metadata?.capital_target || "";
  const profileName = profile?.company_name || profile?.full_name || "Project";
  
  const hasSubmission = !!submission;
  const uploadedDocsCount = uploadedDocs?.length || 0;
  
  const isReleased = !!(submission as any)?.released_to_client;
  const releasedDate = (submission as any)?.released_at;
  
  const latestReport = analysisReports?.find(r => r.analysis_status === "completed") || null;
  const { data: termSheet } = useTermSheet(latestReport?.id);
  const { data: existingSignature } = useExistingSignature(submission?.id);

  if (showWizard) {
    return <DocumentWizard sector={user?.user_metadata?.asset_type || "default"} onBack={() => setShowWizard(false)} />;
  }

  return (
    <div className="p-6 md:p-8 max-w-[1200px] mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
          Welcome back, {firstName}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {companyName} · {spvs?.length || 0} active SPV{(spvs?.length || 0) !== 1 ? "s" : ""}
        </p>
      </div>

      <EmptyKPICards capitalTarget={capitalTarget} spv={spv} analysisReport={latestReport} />
      {spv ? (
        <ProcessPipeline />
      ) : (
        <EmptyProcessPipeline 
          onStartUpload={() => setShowWizard(true)} 
          hasSubmission={hasSubmission}
          isReleased={isReleased}
          submissionDate={submission?.submitted_at}
          releasedDate={releasedDate}
          uploadedDocsCount={uploadedDocsCount}
          analysisReport={latestReport}
          termSheet={termSheet}
          submission={submission}
          profileName={profileName}
          onSignTermSheet={() => setShowSignModal(true)}
          isSigned={!!existingSignature}
        />
      )}

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
