import { useState } from "react";
import { FileText, ArrowRight, Clock, CheckCircle2, Upload, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { requiredDocsByAssetType, type DocumentCategory, categoryLabels, categoryIcons } from "@/data/mockDocumentsData";
import { toast } from "sonner";

const processSteps = [
  {
    id: 1,
    title: "Document Submission",
    description: "Upload all required project documents for verification.",
    actionable: true,
  },
  {
    id: 2,
    title: "Asset Standardization",
    description: "Our AI engine analyses your documents, generates your Harvest Score™ and financial model.",
    actionable: false,
  },
  {
    id: 3,
    title: "SPV Deployment",
    description: "Legal entity is incorporated, contracts executed, and smart contract deployed on-chain.",
    actionable: false,
  },
  {
    id: 4,
    title: "Listing & Funding",
    description: "Your SPV is listed on our marketplace for investors to fund.",
    actionable: false,
  },
  {
    id: 5,
    title: "Capital Deployment",
    description: "Funds released in milestones, verified by IoT oracles and smart contracts.",
    actionable: false,
  },
];

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
    <div className="p-6 md:p-8 max-w-[900px] mx-auto space-y-6">
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
            <div
              key={doc.name}
              className="flex items-center gap-4 px-4 py-4"
            >
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
    <div className="p-6 md:p-8 max-w-[1000px] mx-auto space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
          Welcome to Bakua
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Let's get your infrastructure project ready for on-chain capital. Follow the steps below to get started.
        </p>
      </div>

      {/* Empty state card */}
      <div className="bg-card border border-border rounded-lg p-8 text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-lg font-bold text-foreground mb-2">
          No data yet
        </h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
          Your dashboard will come alive once you submit your project documents. Start by uploading the required files — our AI engine will take it from there.
        </p>
        <Button onClick={() => setShowWizard(true)} className="gap-2">
          <Upload className="h-4 w-4" />
          Start Document Submission
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Process roadmap */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-base font-bold text-foreground tracking-tight mb-1">
          Your Journey
        </h3>
        <p className="text-xs text-muted-foreground mb-6">
          5 steps from project submission to capital deployment
        </p>

        <div className="space-y-0">
          {processSteps.map((step, i) => (
            <div key={step.id} className="relative flex gap-4">
              {/* Connector line */}
              {i < processSteps.length - 1 && (
                <div className="absolute left-4 top-10 w-px bg-border" style={{ bottom: "-8px" }} />
              )}

              {/* Step icon */}
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                step.id === 1 ? "bg-primary/15" : "bg-secondary"
              )}>
                {step.id === 1 ? (
                  <ArrowRight className="w-4 h-4 text-primary" />
                ) : (
                  <Clock className="w-4 h-4 text-muted-foreground" />
                )}
              </div>

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
                <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>

                {step.actionable && (
                  <Button
                    size="sm"
                    className="mt-3 gap-1.5"
                    onClick={() => setShowWizard(true)}
                  >
                    <Upload className="h-3.5 w-3.5" /> Begin Upload
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick stats (all zero) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Documents", value: "0 / 18" },
          { label: "Harvest Score™", value: "—" },
          { label: "Capital Raised", value: "$0" },
          { label: "SPV Status", value: "Not Started" },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-lg p-4 text-center">
            <div className="text-lg font-extrabold text-foreground">{s.value}</div>
            <div className="text-[11px] text-muted-foreground mt-1 uppercase tracking-wide">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
