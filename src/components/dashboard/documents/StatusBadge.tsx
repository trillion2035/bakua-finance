import { CheckCircle2, Clock, AlertCircle, CircleDashed, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DocStatus } from "@/data/mockDocumentsData";

const config: Record<DocStatus, { label: string; className: string; icon: React.ReactNode }> = {
  verified: {
    label: "Verified",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  pending: {
    label: "Pending Review",
    className: "bg-amber-50 text-amber-700 border-amber-200",
    icon: <Clock className="h-3 w-3" />,
  },
  action_required: {
    label: "Action Required",
    className: "bg-red-50 text-red-700 border-red-200",
    icon: <AlertCircle className="h-3 w-3" />,
  },
  not_uploaded: {
    label: "Not Uploaded",
    className: "bg-slate-50 text-slate-500 border-slate-200",
    icon: <CircleDashed className="h-3 w-3" />,
  },
  locked: {
    label: "Locked",
    className: "bg-slate-100 text-slate-400 border-slate-200",
    icon: <Lock className="h-3 w-3" />,
  },
};

export function StatusBadge({ status, note }: { status: DocStatus; note?: string }) {
  const c = config[status];
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border", c.className)}>
      {c.icon}
      {note || c.label}
    </span>
  );
}
