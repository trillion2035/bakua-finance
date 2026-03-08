import { mockSPV, type ProcessStep, type ProcessStepStatus } from "@/data/mockDashboardData";
import { Check, Loader2, Clock, ChevronDown, ChevronUp, FileUp } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

function StatusIcon({ status }: { status: ProcessStepStatus }) {
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
  return (
    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
      <Clock className="w-4 h-4 text-muted-foreground" />
    </div>
  );
}

function statusLabel(status: ProcessStepStatus) {
  if (status === "completed") return "Completed";
  if (status === "in_progress") return "In Progress";
  return "Pending";
}

function statusColor(status: ProcessStepStatus) {
  if (status === "completed") return "text-green";
  if (status === "in_progress") return "text-gold";
  return "text-muted-foreground";
}

function StepCard({ step, isLast }: { step: ProcessStep; isLast: boolean }) {
  const [expanded, setExpanded] = useState(step.status === "in_progress");

  return (
    <div className="relative flex gap-4">
      {/* Vertical connector line */}
      {!isLast && (
        <div className="absolute left-4 top-10 w-px bg-border" style={{ bottom: "-8px" }} />
      )}

      <StatusIcon status={step.status} />

      <div className="flex-1 min-w-0 pb-6">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full text-left flex items-center gap-2 group"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-display text-sm font-bold text-foreground">
                {step.title}
              </span>
              <span className={cn("text-[10px] font-semibold tracking-wider uppercase", statusColor(step.status))}>
                {statusLabel(step.status)}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">{step.dateRange}</span>
          </div>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
          )}
        </button>

        {expanded && (
          <div className="mt-3 bg-secondary/50 border border-border rounded-lg p-4 space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
            {step.details && (
              <p className="text-sm text-foreground leading-relaxed">{step.details}</p>
            )}
            {step.status === "pending" && step.id === 1 && (
              <Button size="sm" className="gap-2 mt-2">
                <FileUp className="h-3.5 w-3.5" />
                Submit Documents
              </Button>
            )}
            {step.status === "in_progress" && (
              <div className="flex items-center gap-2 text-xs text-gold">
                <Loader2 className="h-3 w-3 animate-spin" />
                Awaiting next milestone confirmation
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function ProcessPipeline() {
  const steps = mockSPV.processSteps;

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-display text-base font-bold text-foreground tracking-tight">
            Process Status
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {mockSPV.id} · {mockSPV.name}
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">
            {steps.filter((s) => s.status === "completed").length} of {steps.length} complete
          </div>
          {/* Mini progress bar */}
          <div className="flex gap-1 mt-1.5">
            {steps.map((s) => (
              <div
                key={s.id}
                className={cn(
                  "h-1.5 w-8 rounded-full",
                  s.status === "completed" && "bg-green",
                  s.status === "in_progress" && "bg-gold",
                  s.status === "pending" && "bg-secondary"
                )}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-0">
        {steps.map((step, i) => (
          <StepCard key={step.id} step={step} isLast={i === steps.length - 1} />
        ))}
      </div>
    </div>
  );
}
