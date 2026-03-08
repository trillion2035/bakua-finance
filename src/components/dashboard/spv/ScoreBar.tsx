import { cn } from "@/lib/utils";

export function ScoreBar({ label, score, weight }: { label: string; score: number; weight: string }) {
  const color =
    score >= 90 ? "bg-emerald-500" : score >= 80 ? "bg-green-500" : score >= 70 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground w-[160px] shrink-0 truncate">{label}</span>
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs font-bold text-foreground w-8 text-right">{score}</span>
      <span className="text-[10px] text-muted-foreground w-10 text-right">{weight}</span>
    </div>
  );
}
