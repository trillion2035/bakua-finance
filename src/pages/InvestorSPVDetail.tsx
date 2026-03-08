import { useParams, Link, useNavigate } from "react-router-dom";
import bakuaLogo from "@/assets/bakua-logo.png";
import { useState } from "react";
import {
  ArrowLeft, LogOut, Shield, TrendingUp, Activity, FileText, AlertTriangle,
  CheckCircle2, ExternalLink, Droplets, Thermometer, CloudRain, Weight, Leaf, ChevronDown
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockInvestments } from "@/data/mockInvestorData";
import { mockSensors, mockNDVI, mockHarvestData, performanceSummary } from "@/data/mockPerformanceData";
import { mockOracleEvents } from "@/data/mockOracleData";
import { mockMonthlyFinancials } from "@/data/mockOracleData";
import { mockMilestones, mockScoreDimensions } from "@/data/mockSPVData";
import { toast } from "sonner";

const sensorIcons: Record<string, React.ElementType> = {
  "Soil Moisture": Droplets,
  "Temperature": Thermometer,
  "Relative Humidity": Droplets,
  "Rainfall (7-day)": CloudRain,
  "Cherry Intake (today)": Weight,
};

const statusBg: Record<string, string> = {
  normal: "bg-[hsl(var(--green))]/10 text-[hsl(var(--green))]",
  warning: "bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent))]",
  critical: "bg-destructive/10 text-destructive",
};

const oracleStatusColors: Record<string, string> = {
  confirmed: "bg-[hsl(var(--green))]/10 text-[hsl(var(--green))] border-[hsl(var(--green))]/20",
  pending: "bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent))] border-[hsl(var(--accent))]/20",
  failed: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function InvestorSPVDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const investment = mockInvestments.find((inv) => inv.id === id);
  const [showAllMilestones, setShowAllMilestones] = useState(false);

  if (!investment) {
    return (
      <div className="light-page min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold mb-2">SPV not found</h1>
          <Link to="/investor" className="text-primary text-sm hover:underline">Back to dashboard</Link>
        </div>
      </div>
    );
  }

  const milestones = showAllMilestones ? mockMilestones : mockMilestones.slice(0, 3);

  return (
    <div className="light-page min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border px-6 md:px-10 lg:px-16 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <img src={bakuaLogo} alt="Bakua Finance" className="h-7 md:h-8" />
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[hsl(var(--green))]/10 border border-[hsl(var(--green))]/20 text-[13px] font-medium text-[hsl(var(--green))]">
            <div className="w-2 h-2 rounded-full bg-[hsl(var(--green))]" />
            0x1a2b...9f3e
          </div>
          <button
            onClick={() => { toast.info("Wallet disconnected"); window.location.href = "/earn"; }}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </nav>

      <div className="px-6 md:px-10 lg:px-16 py-8 max-w-[1200px] mx-auto">
        {/* Back + Header */}
        <button
          onClick={() => navigate("/investor")}
          className="flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Portfolio
        </button>

        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="font-display text-[clamp(22px,3vw,32px)] font-extrabold tracking-[-0.5px]">
                {investment.spvName}
              </h1>
              <Badge variant="outline" className={`text-[10px] ${
                investment.status === "Active" ? "bg-primary/10 text-primary border-primary/20"
                : "bg-[hsl(var(--green))]/10 text-[hsl(var(--green))] border-[hsl(var(--green))]/20"
              }`}>
                {investment.status}
              </Badge>
            </div>
            <p className="text-[13px] text-muted-foreground">{investment.asset} · {investment.id} · Invested {investment.investedDate}</p>
          </div>
          <div className="flex gap-3">
            <div className="bg-card rounded-xl px-5 py-3 border border-border text-center">
              <div className="text-[10px] text-muted-foreground">Your Investment</div>
              <div className="font-display text-[18px] font-bold">{investment.amountInvested}</div>
            </div>
            <div className="bg-[hsl(var(--green))]/5 rounded-xl px-5 py-3 border border-[hsl(var(--green))]/10 text-center">
              <div className="text-[10px] text-muted-foreground">Current Value</div>
              <div className="font-display text-[18px] font-bold text-[hsl(var(--green))]">{investment.currentValue}</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview">
          <TabsList className="mb-6 bg-secondary/50 border border-border flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="overview" className="text-[12px] font-semibold gap-1 data-[state=active]:bg-card">
              <Shield className="w-3.5 h-3.5" /> Overview
            </TabsTrigger>
            <TabsTrigger value="performance" className="text-[12px] font-semibold gap-1 data-[state=active]:bg-card">
              <TrendingUp className="w-3.5 h-3.5" /> Performance
            </TabsTrigger>
            <TabsTrigger value="oracle" className="text-[12px] font-semibold gap-1 data-[state=active]:bg-card">
              <Activity className="w-3.5 h-3.5" /> Oracle Feed
            </TabsTrigger>
            <TabsTrigger value="financials" className="text-[12px] font-semibold gap-1 data-[state=active]:bg-card">
              <FileText className="w-3.5 h-3.5" /> Financials
            </TabsTrigger>
          </TabsList>

          {/* === Overview === */}
          <TabsContent value="overview" className="space-y-6">
            {/* Risk Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card rounded-xl p-5 border border-border">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-[hsl(var(--green))]/10 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-[hsl(var(--green))]" />
                  </div>
                  <span className="text-[13px] font-bold">Payment Status</span>
                </div>
                <div className="text-[hsl(var(--green))] font-display text-[15px] font-bold">On Track</div>
                <p className="text-[11px] text-muted-foreground mt-1">All off-taker payments received on schedule. No defaults detected.</p>
              </div>
              <div className="bg-card rounded-xl p-5 border border-border">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-[hsl(var(--green))]/10 flex items-center justify-center">
                    <Leaf className="w-4 h-4 text-[hsl(var(--green))]" />
                  </div>
                  <span className="text-[13px] font-bold">Crop Health</span>
                </div>
                <div className="text-[hsl(var(--green))] font-display text-[15px] font-bold">NDVI {performanceSummary.ndviCurrent}</div>
                <p className="text-[11px] text-muted-foreground mt-1">Above {performanceSummary.ndviThreshold} threshold. Vegetation healthy across all plots.</p>
              </div>
              <div className="bg-card rounded-xl p-5 border border-border">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-[13px] font-bold">Projected IRR</span>
                </div>
                <div className="text-primary font-display text-[15px] font-bold">{performanceSummary.projectedIRR}</div>
                <p className="text-[11px] text-muted-foreground mt-1">Next repayment: {performanceSummary.nextRepayment}</p>
              </div>
            </div>

            {/* Asset Score */}
            <div className="bg-card rounded-xl p-6 border border-border">
              <h3 className="font-display text-[15px] font-bold mb-4">Asset Score™ Breakdown</h3>
              <div className="space-y-3">
                {mockScoreDimensions.map((dim) => (
                  <div key={dim.name} className="flex items-center gap-4">
                    <span className="text-[12px] font-medium w-[180px] flex-shrink-0 truncate">{dim.name}</span>
                    <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${dim.score}%` }}
                      />
                    </div>
                    <span className="text-[12px] font-bold w-10 text-right">{dim.score}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Milestones */}
            <div className="bg-card rounded-xl p-6 border border-border">
              <h3 className="font-display text-[15px] font-bold mb-4">Disbursement Milestones</h3>
              <div className="space-y-3">
                {milestones.map((m) => (
                  <div key={m.id} className="flex items-start gap-3 py-3 border-b border-border last:border-0">
                    <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      m.status === "disbursed"
                        ? "bg-[hsl(var(--green))]/10 text-[hsl(var(--green))]"
                        : "bg-secondary text-muted-foreground"
                    }`}>
                      {m.status === "disbursed" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <span className="text-[10px] font-bold">{m.id}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[13px] font-bold">{m.name}</span>
                        <Badge variant="outline" className={`text-[9px] ${
                          m.status === "disbursed"
                            ? "bg-[hsl(var(--green))]/10 text-[hsl(var(--green))] border-[hsl(var(--green))]/20"
                            : "bg-secondary text-muted-foreground border-border"
                        }`}>
                          {m.status === "disbursed" ? "Disbursed" : "Pending"}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground">{m.amount} · {m.dateDisbursed}</p>
                      <p className="text-[10px] text-muted-foreground/70 mt-0.5">Trigger: {m.oracleTrigger}</p>
                    </div>
                  </div>
                ))}
              </div>
              {mockMilestones.length > 3 && (
                <button
                  onClick={() => setShowAllMilestones(!showAllMilestones)}
                  className="mt-3 text-[12px] text-primary font-medium hover:underline flex items-center gap-1"
                >
                  {showAllMilestones ? "Show less" : `Show all ${mockMilestones.length} milestones`}
                  <ChevronDown className={`w-3 h-3 transition-transform ${showAllMilestones ? "rotate-180" : ""}`} />
                </button>
              )}
            </div>
          </TabsContent>

          {/* === Performance === */}
          <TabsContent value="performance" className="space-y-6">
            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Cherry Intake", value: performanceSummary.totalCherryIntake, sub: `of ${performanceSummary.cherryTarget} target` },
                { label: "Green Export", value: performanceSummary.totalGreenExport, sub: `of ${performanceSummary.greenTarget} target` },
                { label: "Avg Grade A", value: performanceSummary.avgGradeA, sub: "specialty grade" },
                { label: "Active Sensors", value: `${performanceSummary.activeSensors}/${performanceSummary.totalSensors}`, sub: "all operational" },
              ].map((kpi) => (
                <div key={kpi.label} className="bg-card rounded-xl p-4 border border-border">
                  <div className="text-[10px] text-muted-foreground mb-1">{kpi.label}</div>
                  <div className="font-display text-[18px] font-bold">{kpi.value}</div>
                  <div className="text-[10px] text-muted-foreground">{kpi.sub}</div>
                </div>
              ))}
            </div>

            {/* NDVI Trend */}
            <div className="bg-card rounded-xl p-6 border border-border">
              <h3 className="font-display text-[15px] font-bold mb-4">NDVI Vegetation Index</h3>
              <div className="flex items-end gap-3 h-[120px]">
                {mockNDVI.map((reading) => {
                  const height = ((reading.value - 0.3) / 0.4) * 100;
                  const isAboveThreshold = reading.value >= performanceSummary.ndviThreshold;
                  return (
                    <div key={reading.date} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[10px] font-bold">{reading.value}</span>
                      <div
                        className={`w-full rounded-t-md transition-all ${isAboveThreshold ? "bg-[hsl(var(--green))]" : "bg-[hsl(var(--accent))]"}`}
                        style={{ height: `${Math.max(height, 10)}%` }}
                      />
                      <span className="text-[9px] text-muted-foreground">{reading.date.replace(" 20", " '")}</span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
                <div className="w-3 h-1 bg-[hsl(var(--green))] rounded" /> Above threshold ({performanceSummary.ndviThreshold})
                <div className="w-3 h-1 bg-[hsl(var(--accent))] rounded ml-3" /> Below threshold
              </div>
            </div>

            {/* IoT Sensors */}
            <div className="bg-card rounded-xl p-6 border border-border">
              <h3 className="font-display text-[15px] font-bold mb-4">IoT Sensor Readings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {mockSensors.map((sensor) => {
                  const Icon = sensorIcons[sensor.metric] || Activity;
                  const range = sensor.threshold.max - sensor.threshold.min;
                  const position = ((sensor.current - sensor.threshold.min) / range) * 100;
                  return (
                    <div key={sensor.id} className="bg-secondary/30 rounded-lg p-4 border border-border/50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-muted-foreground" />
                          <span className="text-[12px] font-bold">{sensor.metric}</span>
                        </div>
                        <Badge variant="outline" className={`text-[9px] border-0 ${statusBg[sensor.status]}`}>
                          {sensor.status}
                        </Badge>
                      </div>
                      <div className="font-display text-[20px] font-bold mb-1">
                        {sensor.current}{sensor.unit}
                      </div>
                      <div className="text-[10px] text-muted-foreground mb-2">{sensor.deviceName} · {sensor.location}</div>
                      {/* Range bar */}
                      <div className="relative h-1.5 bg-secondary rounded-full">
                        <div
                          className={`absolute top-0 h-full rounded-full ${
                            sensor.status === "normal" ? "bg-[hsl(var(--green))]" : "bg-[hsl(var(--accent))]"
                          }`}
                          style={{ width: `${Math.min(Math.max(position, 2), 98)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[9px] text-muted-foreground/60 mt-1">
                        <span>{sensor.threshold.min}{sensor.unit}</span>
                        <span>{sensor.threshold.max}{sensor.unit}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Harvest Data */}
            <div className="bg-card rounded-xl p-6 border border-border">
              <h3 className="font-display text-[15px] font-bold mb-4">Harvest & Processing</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 pr-4 text-[10px] font-semibold text-muted-foreground">Month</th>
                      <th className="text-right py-2 px-3 text-[10px] font-semibold text-muted-foreground">Cherry (kg)</th>
                      <th className="text-right py-2 px-3 text-[10px] font-semibold text-muted-foreground">Green (kg)</th>
                      <th className="text-right py-2 px-3 text-[10px] font-semibold text-muted-foreground">Conv. %</th>
                      <th className="text-right py-2 pl-3 text-[10px] font-semibold text-muted-foreground">Grade A %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockHarvestData.map((row) => (
                      <tr key={row.month} className="border-b border-border/50 last:border-0">
                        <td className="py-2.5 pr-4 font-medium">{row.month}</td>
                        <td className="py-2.5 px-3 text-right">{row.cherryIntake.toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-right">{row.greenYield.toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-right">{row.conversionRate}%</td>
                        <td className="py-2.5 pl-3 text-right font-semibold">{row.gradeAPercent}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* === Oracle Feed === */}
          <TabsContent value="oracle" className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-display text-lg font-bold">On-Chain Oracle Events</h2>
              <span className="text-[11px] text-muted-foreground">{mockOracleEvents.length} events</span>
            </div>
            {mockOracleEvents.map((event) => (
              <div key={event.id} className="bg-card rounded-xl p-5 border border-border">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      event.type === "sensor_alert" || event.type === "threshold_breach"
                        ? "bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent))]"
                        : "bg-[hsl(var(--green))]/10 text-[hsl(var(--green))]"
                    }`}>
                      {event.type === "sensor_alert" || event.type === "threshold_breach"
                        ? <AlertTriangle className="w-3.5 h-3.5" />
                        : <CheckCircle2 className="w-3.5 h-3.5" />
                      }
                    </div>
                    <div>
                      <div className="font-display text-[13px] font-bold">{event.title}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {new Date(event.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        {" · "}{event.source}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className={`text-[9px] ${oracleStatusColors[event.status]}`}>
                    {event.status}
                  </Badge>
                </div>
                <p className="text-[12px] text-muted-foreground leading-relaxed ml-9">{event.description}</p>
                {(event.amount || event.txHash) && (
                  <div className="flex items-center gap-4 ml-9 mt-2">
                    {event.amount && (
                      <span className="text-[11px] font-semibold">
                        {event.amount.toLocaleString()} {event.currency}
                      </span>
                    )}
                    {event.txHash && (
                      <span className="font-mono text-[10px] text-muted-foreground flex items-center gap-1">
                        {event.txHash} <ExternalLink className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>
                )}
                {event.metadata && (
                  <div className="flex flex-wrap gap-2 ml-9 mt-2">
                    {Object.entries(event.metadata).map(([key, value]) => (
                      <span key={key} className="text-[10px] bg-secondary/50 px-2 py-0.5 rounded text-muted-foreground">
                        {key}: {value}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </TabsContent>

          {/* === Financials === */}
          <TabsContent value="financials" className="space-y-6">
            {/* Summary KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { label: "Cumulative Revenue", value: performanceSummary.cumulativeRevenue },
                { label: "Next Repayment", value: performanceSummary.nextRepaymentAmount, sub: performanceSummary.nextRepayment },
                { label: "Projected IRR", value: performanceSummary.projectedIRR, accent: true },
              ].map((kpi) => (
                <div key={kpi.label} className="bg-card rounded-xl p-4 border border-border">
                  <div className="text-[10px] text-muted-foreground mb-1">{kpi.label}</div>
                  <div className={`font-display text-[18px] font-bold ${kpi.accent ? "text-[hsl(var(--green))]" : ""}`}>{kpi.value}</div>
                  {kpi.sub && <div className="text-[10px] text-muted-foreground">{kpi.sub}</div>}
                </div>
              ))}
            </div>

            {/* Monthly Table */}
            <div className="bg-card rounded-xl p-6 border border-border">
              <h3 className="font-display text-[15px] font-bold mb-4">Monthly Financial Summary</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 pr-3 text-[10px] font-semibold text-muted-foreground">Month</th>
                      <th className="text-right py-2 px-3 text-[10px] font-semibold text-muted-foreground">Revenue</th>
                      <th className="text-right py-2 px-3 text-[10px] font-semibold text-muted-foreground">Op. Cost</th>
                      <th className="text-right py-2 px-3 text-[10px] font-semibold text-muted-foreground">Margin</th>
                      <th className="text-right py-2 px-3 text-[10px] font-semibold text-muted-foreground">Collection %</th>
                      <th className="text-right py-2 pl-3 text-[10px] font-semibold text-muted-foreground">Loan Repay.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockMonthlyFinancials.map((row) => (
                      <tr key={row.month} className="border-b border-border/50 last:border-0">
                        <td className="py-2.5 pr-3 font-medium">{row.month}</td>
                        <td className="py-2.5 px-3 text-right">{(row.revenue / 1_000_000).toFixed(1)}M</td>
                        <td className="py-2.5 px-3 text-right">{(row.operatingCost / 1_000_000).toFixed(1)}M</td>
                        <td className="py-2.5 px-3 text-right font-semibold">{row.netMargin}%</td>
                        <td className={`py-2.5 px-3 text-right ${row.collectionRate >= 95 ? "text-[hsl(var(--green))]" : "text-[hsl(var(--accent))]"}`}>
                          {row.collectionRate}%
                        </td>
                        <td className="py-2.5 pl-3 text-right">
                          {row.loanRepayment > 0 ? `${(row.loanRepayment / 1_000_000).toFixed(1)}M` : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Risk Indicators */}
            <div className="bg-card rounded-xl p-6 border border-border">
              <h3 className="font-display text-[15px] font-bold mb-4">Risk & Covenant Status</h3>
              <div className="space-y-3">
                {[
                  { label: "Off-taker Payment Default", status: "clear", detail: "No missed payments. All receivables current." },
                  { label: "Collection Rate Covenant (≥85%)", status: "pass", detail: "Current weighted average: 95.3%" },
                  { label: "Debt Service Coverage Ratio", status: "pass", detail: "DSCR 1.8x (covenant minimum: 1.2x)" },
                  { label: "Crop Insurance", status: "active", detail: "SAAR policy active. Coverage: 35M FCFA." },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
                    <CheckCircle2 className="w-4 h-4 text-[hsl(var(--green))] flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-[12px] font-bold">{item.label}</div>
                      <div className="text-[11px] text-muted-foreground">{item.detail}</div>
                    </div>
                    <Badge variant="outline" className="text-[9px] bg-[hsl(var(--green))]/10 text-[hsl(var(--green))] border-[hsl(var(--green))]/20">
                      {item.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
