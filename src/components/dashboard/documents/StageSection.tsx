import { useState } from "react";
import { ChevronDown, ChevronUp, Check, Loader2, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { DocumentRow } from "./DocumentRow";
import type { ProjectDocument, ProcessStage } from "@/data/mockDocumentsData";
import { stageLabels, stageIcons, getDocsBySubPhase } from "@/data/mockDocumentsData";
import type { ProcessStepStatus } from "@/data/mockDashboardData";

function StageStatusIndicator({ status }: { status: ProcessStepStatus }) {
  if (status === "completed") return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
      <Check className="h-3.5 w-3.5" /> Completed
    </span>
  );
  if (status === "in_progress") return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600">
      <Loader2 className="h-3.5 w-3.5 animate-spin" /> In Progress
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
      <Lock className="h-3.5 w-3.5" /> Pending
    </span>
  );
}

interface StageSectionProps {
  stage: ProcessStage;
  stepNumber: number;
  status: ProcessStepStatus;
  docs: ProjectDocument[];
  defaultOpen?: boolean;
}

export function StageSection({ stage, stepNumber, status, docs, defaultOpen = false }: StageSectionProps) {
  const [open, setOpen] = useState(defaultOpen || status === "in_progress");
  const subPhaseGroups = getDocsBySubPhase(stage);
  const isLocked = status === "pending";

  return (
    <div className={cn(
      "border border-border rounded-xl overflow-hidden transition-colors",
      status === "in_progress" && "border-amber-300/50",
      status === "completed" && "border-emerald-300/30",
      isLocked && "opacity-70"
    )}>
      {/* Stage header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 p-5 text-left bg-card hover:bg-muted/30 transition-colors"
      >
        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-xl shrink-0">
          {stageIcons[stage]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold text-muted-foreground tracking-wider">STEP {stepNumber}</span>
            <span className="text-sm font-bold text-foreground">{stageLabels[stage]}</span>
          </div>
          <span className="text-xs text-muted-foreground">
            {docs.length} document{docs.length !== 1 ? "s" : ""}
            {status === "completed" && ` · ${docs.filter(d => d.status === "verified").length} verified`}
          </span>
        </div>
        <StageStatusIndicator status={status} />
        {open ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
      </button>

      {/* Stage content */}
      {open && (
        <div className="p-4 pt-0 space-y-4">
          {subPhaseGroups.map(({ subPhase, docs: phaseDocs }) => (
            <div key={subPhase} className="space-y-2 pt-4">
              {subPhaseGroups.length > 1 && (
                <h4 className="text-xs font-semibold tracking-wider uppercase text-muted-foreground px-1">
                  {subPhase}
                  <span className="text-[10px] font-normal ml-1.5">({phaseDocs.length})</span>
                </h4>
              )}
              <div className="space-y-2">
                {phaseDocs.map((doc) => (
                  <DocumentRow key={doc.id} doc={doc} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
