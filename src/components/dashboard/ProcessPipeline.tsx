import { useSPVData } from "@/contexts/SPVDataContext";
import { Check, Loader2, Clock, ChevronDown, ChevronUp, FileText } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

type ProcessStepStatus = "completed" | "in_progress" | "pending";

interface ProcessStep {
  id: number;
  title: string;
  description: string;
  status: ProcessStepStatus;
  dateRange: string;
  details?: string;
}

// Static process steps for SPV-01 (these represent the pipeline stages)
const defaultSteps: ProcessStep[] = [
  { id: 1, title: "Document Submission", description: "Register and upload all required project documents for review.", status: "completed", dateRange: "Sep 3–12, 2024", details: "18 documents submitted. Document Completeness Score: 97/100." },
  { id: 2, title: "Asset Standardization", description: "AI engine processes documents, generates Asset Score™ and financial model.", status: "completed", dateRange: "Sep 13–15, 2024", details: "Asset Score™ AS-88 (Standard Grade). 6 dimensions analysed. AI Engine v2.1." },
  { id: 3, title: "SPV Deployment", description: "Legal entity incorporated, contracts executed, smart contract deployed on-chain.", status: "completed", dateRange: "Sep 16 – Oct 8, 2024", details: "Bakua SPV-01 Ltd incorporated (RC/YDE/2024/B/4417). 8 legal docs executed. Smart contract on Base Network." },
  { id: 4, title: "Listing", description: "Smart contract deployed, audited, and SPV listed on the investor marketplace.", status: "completed", dateRange: "Oct 2–8, 2024", details: "Smart contract audited by CertiK. Documents anchored to IPFS. Marketplace listing published." },
  { id: 5, title: "Funding", description: "Investors deposit capital until the SPV target is fully met.", status: "completed", dateRange: "Oct 8–18, 2024", details: "Fully funded in 10 days. 51 investors across 3 continents. $78,250 USDC raised." },
  { id: 6, title: "Capital Disbursement", description: "Funds released in milestones, verified by IoT oracles and smart contracts.", status: "in_progress", dateRange: "Oct 21, 2024 – ongoing", details: "4 of 5 milestones disbursed (42.1M FCFA). Milestone 5 pending: 4.9M FCFA." },
];

function StatusIcon({ status }: { status: ProcessStepStatus }) {
  if (status === "completed")
    return <div className="w-8 h-8 rounded-full bg-green/20 flex items-center justify-center shrink-0"><Check className="w-4 h-4 text-green" /></div>;
  if (status === "in_progress")
    return <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center shrink-0"><Loader2 className="w-4 h-4 text-gold animate-spin" /></div>;
  return <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0"><Clock className="w-4 h-4 text-muted-foreground" /></div>;
}

function statusLabel(status: ProcessStepStatus) {
  if (status === "completed") return "Completed";
  if (status === "in_progress") return "In Progress";
  return "Pending";
}

function statusColorFn(status: ProcessStepStatus) {
  if (status === "completed") return "text-green";
  if (status === "in_progress") return "text-gold";
  return "text-muted-foreground";
}

function StepCard({ step, isLast }: { step: ProcessStep; isLast: boolean }) {
  const [expanded, setExpanded] = useState(step.status === "in_progress");
  const navigate = useNavigate();

  return (
    <div className="relative flex gap-4">
      {!isLast && <div className="absolute left-4 top-10 w-px bg-border" style={{ bottom: "-8px" }} />}
      <StatusIcon status={step.status} />
      <div className="flex-1 min-w-0 pb-6">
        <button onClick={() => setExpanded(!expanded)} className="w-full text-left flex items-center gap-2 group">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-foreground">{step.title}</span>
              <span className={cn("text-[10px] font-semibold tracking-wider uppercase", statusColorFn(step.status))}>{statusLabel(step.status)}</span>
            </div>
            <span className="text-xs text-muted-foreground">{step.dateRange}</span>
          </div>
          {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
        </button>
        {expanded && (
          <div className="mt-3 bg-secondary/50 border border-border rounded-lg p-4 space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
            {step.details && <p className="text-sm text-foreground leading-relaxed">{step.details}</p>}
            {step.status === "in_progress" && (
              <div className="flex items-center gap-2 text-xs text-gold">
                <Loader2 className="h-3 w-3 animate-spin" /> Awaiting next milestone confirmation
              </div>
            )}
            <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={(e) => { e.stopPropagation(); navigate("/dashboard/documents"); }}>
              <FileText className="h-3.5 w-3.5" /> View Documents
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export function ProcessPipeline() {
  const { spv } = useSPVData();
  const steps = defaultSteps;

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-bold text-foreground tracking-tight">Process Status</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{spv?.spv_code || "—"} · {spv?.name || "—"}</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">{steps.filter((s) => s.status === "completed").length} of {steps.length} complete</div>
          <div className="flex gap-1 mt-1.5">
            {steps.map((s) => (
              <div key={s.id} className={cn("h-1.5 w-8 rounded-full", s.status === "completed" && "bg-green", s.status === "in_progress" && "bg-gold", s.status === "pending" && "bg-secondary")} />
            ))}
          </div>
        </div>
      </div>
      <div className="space-y-0">
        {steps.map((step, i) => <StepCard key={step.id} step={step} isLast={i === steps.length - 1} />)}
      </div>
    </div>
  );
}
