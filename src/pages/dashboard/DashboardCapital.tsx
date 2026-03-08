import { Progress } from "@/components/ui/progress";
import { Wallet, Users, TrendingUp, ArrowRight, CheckCircle2, Loader2, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { useOwnerSpvs, useSpvMilestones, useInvestorSegments } from "@/hooks/useSpvData";
import { useAuth } from "@/hooks/useAuth";

function formatCapitalTarget(raw: string): string {
  if (!raw) return "—";
  const match = raw.match(/^([^\d]*)([\d,.\s]+)(.*)$/);
  if (!match) return raw;
  const prefix = match[1].trim();
  const numStr = match[2].replace(/[,\s]/g, "");
  const suffix = match[3].trim();
  const num = Number(numStr);
  if (isNaN(num)) return raw;
  return [prefix, new Intl.NumberFormat("en-US").format(num), suffix].filter(Boolean).join(" ");
}

  export default function DashboardCapital() {
  const { user } = useAuth();
  const spv = spvs?.[0];
  const { data: milestones } = useSpvMilestones(spv?.id);
  const { data: segments } = useInvestorSegments(spv?.id);

  if (isLoading) return <div className="p-6 text-muted-foreground">Loading...</div>;

  const capitalTarget = user?.user_metadata?.capital_target || "";
  const disbursedCount = milestones?.filter((m) => m.status === "disbursed").length || 0;
  const totalMilestones = milestones?.length || 0;

  // KPI cards always shown, with data or placeholders
  const kpis = spv
    ? [
        { label: "Total Raised", value: spv.target_amount_usd || "—", sub: spv.target_amount ? `${spv.target_amount.toLocaleString()} ${spv.currency}` : "", icon: Wallet, color: "text-primary" },
        { label: "Funded", value: `${spv.funded_percent || 0}%`, sub: spv.fully_funded_date ? `Fully funded ${spv.fully_funded_date}` : "In progress", icon: TrendingUp, color: "text-emerald-600" },
        { label: "Total Investors", value: String(spv.total_investors || 0), sub: "Across all segments", icon: Users, color: "text-primary" },
        { label: "Disbursed", value: `${disbursedCount}/${totalMilestones}`, sub: spv.total_disbursed ? `${spv.total_disbursed.toLocaleString()} ${spv.currency}` : "—", icon: ArrowRight, color: "text-amber-600" },
      ]
    : [
        { label: "Total Capital Target", value: formatCapitalTarget(capitalTarget), sub: "As submitted", icon: DollarSign, color: "text-primary" },
        { label: "Funded", value: "—", sub: "Awaiting SPV setup", icon: TrendingUp, color: "text-muted-foreground" },
        { label: "Total Investors", value: "0", sub: "No investors yet", icon: Users, color: "text-muted-foreground" },
        { label: "Disbursed", value: "—", sub: "Awaiting funding", icon: ArrowRight, color: "text-muted-foreground" },
      ];

  return (
    <div className="p-6 md:p-8 max-w-[1200px] mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Capital & Fundraising</h1>
        <p className="text-sm text-muted-foreground mt-1">{spv ? `${spv.spv_code} · ${spv.name}` : "No active SPV"}</p>
      </div>

      {/* KPI Cards - always visible */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-card border border-border rounded-lg p-5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] tracking-[2px] text-muted-foreground font-semibold uppercase">{kpi.label}</span>
              <kpi.icon className={cn("h-4 w-4", kpi.color)} />
            </div>
            <div className={cn("text-2xl font-extrabold tracking-tight", kpi.color)}>{kpi.value}</div>
            <span className="text-xs text-muted-foreground">{kpi.sub}</span>
          </div>
        ))}
      </div>

      {/* Only show detailed sections when SPV exists */}
      {spv && (
        <>
          {/* Funding Progress */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4">Funding Progress</h2>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Capital Raised</span>
                <span className="font-semibold text-foreground">{spv.target_amount_usd}</span>
              </div>
              <Progress value={spv.funded_percent || 0} className="h-3" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Listed: {spv.listing_date || "—"}</span>
                <span>Fully funded: {spv.fully_funded_date || "—"}</span>
              </div>
            </div>

            {segments && segments.length > 0 && (
              <>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-6 mb-3">Investor Breakdown</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 pr-3 text-xs text-muted-foreground font-semibold">Segment</th>
                        <th className="text-right py-2 pr-3 text-xs text-muted-foreground font-semibold">USDC</th>
                        <th className="text-right py-2 pr-3 text-xs text-muted-foreground font-semibold hidden sm:table-cell">FCFA</th>
                        <th className="text-right py-2 pr-3 text-xs text-muted-foreground font-semibold">Share</th>
                        <th className="text-right py-2 text-xs text-muted-foreground font-semibold">Investors</th>
                      </tr>
                    </thead>
                    <tbody>
                      {segments.map((seg) => (
                        <tr key={seg.id} className="border-b border-border last:border-0">
                          <td className="py-2.5 pr-3 font-medium text-foreground">{seg.name}</td>
                          <td className="py-2.5 pr-3 text-right text-muted-foreground">{seg.usdc_raised}</td>
                          <td className="py-2.5 pr-3 text-right text-muted-foreground hidden sm:table-cell">{seg.fcfa_equivalent}</td>
                          <td className="py-2.5 pr-3 text-right font-medium text-foreground">{seg.percent_of_spv}</td>
                          <td className="py-2.5 text-right text-muted-foreground">{seg.investor_count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>

          {/* Milestones */}
          {milestones && milestones.length > 0 && (
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Milestone Disbursements</h2>
                <div className="flex gap-1">
                  {milestones.map((m) => (
                    <div key={m.id} className={cn("h-2 w-10 rounded-full", m.status === "disbursed" ? "bg-emerald-500" : "bg-amber-400")} />
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                {milestones.map((m) => (
                  <div key={m.id} className="border border-border rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5", m.status === "disbursed" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600")}>
                        {m.status === "disbursed" ? <CheckCircle2 className="h-4 w-4" /> : <Loader2 className="h-4 w-4 animate-spin" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="text-sm font-bold text-foreground">{m.milestone_code} — {m.name}</span>
                          <span className="text-sm font-bold text-foreground">{m.amount}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{m.recipients}</p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border", m.status === "disbursed" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200")}>
                            {m.status === "disbursed" ? "Disbursed" : "Pending"}
                          </span>
                          <span className="text-[11px] text-muted-foreground">{m.date_disbursed}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-2 bg-muted/50 rounded px-2 py-1.5">
                          <strong className="text-foreground">Oracle trigger:</strong> {m.oracle_trigger}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-muted/50 border border-border rounded-lg flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Remaining in vault + DSRA reserve</span>
                <span className="font-bold text-foreground">
                  {spv.remaining_in_vault?.toLocaleString()} + {spv.dsra_reserve}
                </span>
              </div>
            </div>
          )}
        </>
      )}

      {!spv && (
        <div className="bg-card border border-border rounded-lg p-12 text-center space-y-3">
          <Wallet className="h-10 w-10 text-muted-foreground mx-auto" />
          <h3 className="text-base font-bold text-foreground">No SPV active yet</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Capital & fundraising data will appear here once your SPV is deployed. Start by submitting your project documents from the Overview tab.
          </p>
        </div>
      )}
    </div>
  );
}
