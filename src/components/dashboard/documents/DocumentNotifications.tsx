import { useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { mockDocuments, stageLabels, type ProcessStage } from "@/data/mockDocumentsData";
import type { ProcessStepStatus } from "@/data/mockDashboardData";

interface StageNotification {
  stage: ProcessStage;
  stepId: number;
  status: ProcessStepStatus;
}

/**
 * Shows toast notifications for newly available platform-generated documents
 * when a process stage transitions to "completed".
 * Place this component once inside the dashboard layout.
 */
export function DocumentNotifications({ stages }: { stages: StageNotification[] }) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const notifiedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Small delay so it doesn't fire on initial mount alongside other UI renders
    const timer = setTimeout(() => {
      stages.forEach(({ stage, status }) => {
        if (status !== "completed") return;
        if (notifiedRef.current.has(stage)) return;

        const platformDocs = mockDocuments.filter(
          (d) => d.stage === stage && d.source === "platform"
        );
        if (platformDocs.length === 0) return;

        notifiedRef.current.add(stage);

        toast({
          title: `📄 New documents available`,
          description: `${platformDocs.length} document${platformDocs.length > 1 ? "s" : ""} generated in ${stageLabels[stage]}`,
          action: (
            <button
              onClick={() => navigate("/dashboard/documents")}
              className="text-xs font-semibold text-primary hover:underline whitespace-nowrap"
            >
              View →
            </button>
          ),
        });
      });
    }, 1500);

    return () => clearTimeout(timer);
  }, [stages, toast, navigate]);

  return null;
}
