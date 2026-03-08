import {
  mockFundingSummary,
  mockMilestones,
  mockInvestorSegments,
} from "@/data/mockSPVData";
import { mockSPV } from "@/data/mockDashboardData";
import { Progress } from "@/components/ui/progress";
import {
  Wallet,
  Users,
  Clock,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardCapital() {
  const disbursedMilestones = mockMilestones.filter((m) => m.status === "disbursed").length;

  return (
    <div className="p-6 md:p-8 max-w-[1200px] mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
          Capital & Fundraising
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {mockSPV.id} · {mockSPV.name}
        </p>
      </div>

      {/* Funding KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Raised", value: mockFundingSummary.totalTargetUSD, sub: mockFundingSummary.totalTarget, icon: Wallet, color: "text-primary" },
          { label: "Funded", value: `${mockFundingSummary.fundedPercent}%`, sub: `in ${mockFundingSummary.fundingDuration}`, icon: TrendingUp, color: "text-emerald-600" },
          { label: "Total Investors", value: String(mockFundingSummary.totalInvestors), sub: "across 3 continents", icon: Users, color: "text-primary" },
          { label: "Disbursed", value: `${disbursedMilestones}/${mockMilestones.length}`, sub: mockFundingSummary.totalDisbursed, icon: ArrowRight, color: "text-amber-600" },
        ].map((kpi) => (
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

      {/* Funding Progress */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4">
          Funding Progress
        </h2>
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Capital Raised</span>
            <span className="font-semibold text-foreground">{mockFundingSummary.totalTargetUSD}</span>
          </div>
          <Progress value={mockFundingSummary.fundedPercent} className="h-3" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Listed: {mockFundingSummary.listingDate}</span>
            <span>Fully funded: {mockFundingSummary.fullyFundedDate}</span>
          </div>
        </div>

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
              {mockInvestorSegments.map((seg) => (
                <tr key={seg.name} className="border-b border-border last:border-0">
                  <td className="py-2.5 pr-3 font-medium text-foreground">{seg.name}</td>
                  <td className="py-2.5 pr-3 text-right text-muted-foreground">{seg.usdcRaised}</td>
                  <td className="py-2.5 pr-3 text-right text-muted-foreground hidden sm:table-cell">{seg.fcfaEquivalent}</td>
                  <td className="py-2.5 pr-3 text-right font-medium text-foreground">{seg.percentOfSPV}</td>
                  <td className="py-2.5 text-right text-muted-foreground">{seg.investorCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Milestone Disbursements */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
            Milestone Disbursements
          </h2>
          <div className="flex gap-1">
            {mockMilestones.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "h-2 w-10 rounded-full",
                  m.status === "disbursed" ? "bg-emerald-500" : "bg-amber-400"
                )}
              />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {mockMilestones.map((m) => (
            <div key={m.id} className="border border-border rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                  m.status === "disbursed" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                )}>
                  {m.status === "disbursed" ? <CheckCircle2 className="h-4 w-4" /> : <Loader2 className="h-4 w-4 animate-spin" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-sm font-bold text-foreground">{m.id} — {m.name}</span>
                    <span className="text-sm font-bold text-foreground">{m.amount}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{m.recipients}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className={cn(
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border",
                      m.status === "disbursed"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    )}>
                      {m.status === "disbursed" ? "Disbursed" : "Pending"}
                    </span>
                    <span className="text-[11px] text-muted-foreground">{m.dateDisbursed}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-2 bg-muted/50 rounded px-2 py-1.5">
                    <strong className="text-foreground">Oracle trigger:</strong> {m.oracleTrigger}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Remaining balance */}
        <div className="mt-4 p-3 bg-muted/50 border border-border rounded-lg flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Remaining in vault (M5 + DSRA reserve)</span>
          <span className="font-bold text-foreground">
            {mockFundingSummary.remainingInVault} + {mockFundingSummary.dsraReserve}
          </span>
        </div>
      </div>
    </div>
  );
}