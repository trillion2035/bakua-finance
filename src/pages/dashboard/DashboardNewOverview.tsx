import { useState } from "react";
import {
  FileText, ArrowRight, Clock, CheckCircle2, Upload, ChevronRight,
  DollarSign, TrendingUp, Shield, Percent, FileUp, Loader2, Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { requiredDocsByAssetType, type DocumentCategory, categoryLabels, categoryIcons } from "@/data/mockDocumentsData";
import { toast } from "sonner";
import type { ProcessStepStatus } from "@/data/mockDashboardData";

// ───── Empty KPI Cards (same layout as KPICards.tsx) ─────

const emptyKPIs = [
  { label: "Total Capital Target", value: "—", subtext: "Not yet determined" },
  { label: "Funded", value: "—", subtext: "Awaiting documents" },
  { label: "Credit Score", value: "—", subtext: "Pending analysis" },
  { label: "IRR Target", value: "—", subtext: "Pending model" },
];

const kpiIcons = [DollarSign, TrendingUp, Shield, Percent];
const kpiAccents = ["text-muted-foreground", "text-muted-foreground", "text-muted-foreground", "text-muted-foreground"];

function EmptyKPICards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {emptyKPIs.map((kpi, i) => {
        const Icon = kpiIcons[i];
        return (
          <div
            key={kpi.label}
            className="bg-card border border-border rounded-lg p-5 flex flex-col gap-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] tracking-[2px] text-muted-foreground font-semibold uppercase">
                {kpi.label}
              </span>
              <Icon className={`h-4 w-4 ${kpiAccents[i]}`} />
            </div>
            <div className="text-2xl font-extrabold tracking-tight text-muted-foreground/50">
              {kpi.value}
            </div>
            {kpi.subtext && (
              <span className="text-xs text-muted-foreground">{kpi.subtext}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ───── Process Pipeline (all pending, step 1 actionable) ─────

const processSteps = [
  {
    id: 1,
    title: "Document Submission",
    description: "Register and upload all required project documents for review.",
    status: "pending" as ProcessStepStatus,
    dateRange: "Not started",
    actionable: true,
  },
  {
    id: 2,
    title: "Asset Standardization",
    description: "AI engine processes documents, generates credit score and financial model.",
    status: "pending" as ProcessStepStatus,
    dateRange: "Awaiting documents",
    actionable: false,
  },
  {
    id: 3,
    title: "SPV Deployment",
    description: "Legal entity incorporated, contracts executed, smart contract deployed on-chain.",
    status: "pending" as ProcessStepStatus,
    dateRange: "Awaiting standardization",
    actionable: false,
  },
  {
    id: 4,
    title: "Listing & Funding",
    description: "SPV listed on marketplace. Investors deposit capital until target is met.",
    status: "pending" as ProcessStepStatus,
    dateRange: "Awaiting deployment",
    actionable: false,
  },
  {
    id: 5,
    title: "Capital Deployment",
    description: "Funds released in milestones, verified by IoT oracles and smart contracts.",
    status: "pending" as ProcessStepStatus,
    dateRange: "Awaiting funding",
    actionable: false,
  },
];

function StatusIcon({ status, isFirst }: { status: ProcessStepStatus; isFirst?: boolean }) {
  if (status === "completed")
    return (
      <div className="w-8 h-8 rounded-full bg-green/20 flex items-center justify-center shrink-0">
        <Check className="w-4 h-4 text-green" />
      </div>
    );
  if (status === "in_progress")
    return (
      <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center shrink-0">
        <Loader2 className="w-4 h-4 text-gold animate-spin" />
      </div>
    );
  if (isFirst)
    return (
      <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
        <ArrowRight className="w-4 h-4 text-primary" />
      </div>
    );
  return (
    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
      <Clock className="w-4 h-4 text-muted-foreground" />
    </div>
  );
}

function EmptyProcessPipeline({ onStartUpload }: { onStartUpload: () => void }) {
  const steps = processSteps;

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-bold text-foreground tracking-tight">
            Process Status
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            0 of {steps.length} complete
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">
            0 of {steps.length} complete
          </div>
          <div className="flex gap-1 mt-1.5">
            {steps.map((s) => (
              <div
                key={s.id}
                className="h-1.5 w-8 rounded-full bg-secondary"
              />
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-0">
        {steps.map((step, i) => (
          <div key={step.id} className="relative flex gap-4">
            {i < steps.length - 1 && (
              <div className="absolute left-4 top-10 w-px bg-border" style={{ bottom: "-8px" }} />
            )}

            <StatusIcon status={step.status} isFirst={step.id === 1} />

            <div className="flex-1 min-w-0 pb-6">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-foreground">
                  {step.title}
                </span>
                {step.id === 1 ? (
                  <span className="text-[10px] font-semibold tracking-wider uppercase text-primary">
                    Start Here
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">
                    Pending
                  </span>
                )}
              </div>
              <span className="text-xs text-muted-foreground">{step.dateRange}</span>

              {step.actionable && (
                <div className="mt-3 bg-secondary/50 border border-border rounded-lg p-4 space-y-3">
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                  <Button size="sm" className="gap-2" onClick={onStartUpload}>
                    <FileUp className="h-3.5 w-3.5" />
                    Submit Documents
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

// ───── Document Submission Wizard ─────

interface UploadedFile {
  docName: string;
  fileName: string;
}

function DocumentSubmissionWizard({ onBack }: { onBack: () => void }) {
  const docs = requiredDocsByAssetType["Agriculture"];
  const categories = Array.from(new Set(docs.map((d) => d.category))) as DocumentCategory[];
  const [currentCategoryIdx, setCurrentCategoryIdx] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const currentCategory = categories[currentCategoryIdx];
  const categoryDocs = docs.filter((d) => d.category === currentCategory);
  const isLast = currentCategoryIdx === categories.length - 1;
  const totalDocs = docs.length;
  const uploadedCount = uploadedFiles.length;

  const isDocUploaded = (name: string) => uploadedFiles.some((u) => u.docName === name);

  const handleFakeUpload = (docName: string) => {
    if (isDocUploaded(docName)) return;
    setUploadedFiles((prev) => [...prev, { docName, fileName: `${docName.replace(/\s/g, "_")}.pdf` }]);
    toast.success(`Uploaded: ${docName}`);
  };

  const handleNext = () => {
    if (isLast) {
      toast.success("All documents submitted! Your application is now under review.");
      onBack();
    } else {
      setCurrentCategoryIdx((i) => i + 1);
    }
  };

  const handlePrev = () => {
    if (currentCategoryIdx > 0) setCurrentCategoryIdx((i) => i - 1);
  };

  return (
    <div className="p-6 md:p-8 max-w-[1200px] mx-auto space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={onBack}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors mb-3 flex items-center gap-1"
        >
          ← Back to Overview
        </button>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
          Document Submission
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Upload the required documents for your agriculture project. {uploadedCount} of {totalDocs} uploaded.
        </p>
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Progress</span>
          <span>{Math.round((uploadedCount / totalDocs) * 100)}%</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${(uploadedCount / totalDocs) * 100}%` }}
          />
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((cat, idx) => {
          const catDocs = docs.filter((d) => d.category === cat);
          const catUploaded = catDocs.filter((d) => isDocUploaded(d.name)).length;
          const allDone = catUploaded === catDocs.length;

          return (
            <button
              key={cat}
              onClick={() => setCurrentCategoryIdx(idx)}
              className={cn(
                "text-xs px-3 py-1.5 rounded-full border transition-colors flex items-center gap-1.5",
                idx === currentCategoryIdx
                  ? "bg-primary text-primary-foreground border-primary"
                  : allDone
                  ? "bg-green/10 text-green border-green/30"
                  : "bg-background text-muted-foreground border-border hover:border-primary/40"
              )}
            >
              <span>{categoryIcons[cat]}</span>
              {categoryLabels[cat]}
              {allDone && <CheckCircle2 className="h-3 w-3" />}
            </button>
          );
        })}
      </div>

      {/* Document list for current category */}
      <div className="bg-card border border-border rounded-lg divide-y divide-border">
        {categoryDocs.map((doc) => {
          const uploaded = isDocUploaded(doc.name);
          return (
            <div key={doc.name} className="flex items-center gap-4 px-4 py-4">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                uploaded ? "bg-green/15" : "bg-secondary"
              )}>
                {uploaded ? (
                  <CheckCircle2 className="h-4 w-4 text-green" />
                ) : (
                  <FileText className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{doc.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{doc.description}</p>
              </div>
              {uploaded ? (
                <span className="text-xs text-green font-medium">Uploaded</span>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 text-xs shrink-0"
                  onClick={() => handleFakeUpload(doc.name)}
                >
                  <Upload className="h-3.5 w-3.5" /> Upload
                </Button>
              )}
            </div>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrev}
          disabled={currentCategoryIdx === 0}
        >
          Previous
        </Button>
        <Button size="sm" onClick={handleNext} className="gap-1.5">
          {isLast ? "Submit All Documents" : "Next Category"}
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

// ───── Main New User Overview ─────

export default function DashboardNewOverview() {
  const [showWizard, setShowWizard] = useState(false);

  if (showWizard) {
    return <DocumentSubmissionWizard onBack={() => setShowWizard(false)} />;
  }

  return (
    <div className="p-6 md:p-8 max-w-[1200px] mx-auto space-y-8">
      {/* Page header — same as DashboardOverview */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
          Welcome back, Emmanuel Nkweti
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Menoua Highlands Coffee Cooperative · 0 active SPVs
        </p>
      </div>

      {/* KPI cards — empty state */}
      <EmptyKPICards />

      {/* Process pipeline — all pending, step 1 actionable */}
      <EmptyProcessPipeline onStartUpload={() => setShowWizard(true)} />
    </div>
  );
}
