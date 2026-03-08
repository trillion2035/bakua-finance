import {
  Activity,
  Droplets,
  Thermometer,
  CloudRain,
  Satellite,
  Weight,
  Wind,
  CircleCheck,
  AlertTriangle,
  Wifi,
  ArrowDownLeft,
  ShieldCheck,
  Zap,
  Landmark,
  Smartphone,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Area, AreaChart, Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Progress } from "@/components/ui/progress";
import {
  mockSensors,
  mockNDVI,
  performanceSummary,
} from "@/data/mockPerformanceData";
import { mockOracleEvents, type OracleEvent } from "@/data/mockOracleData";

// ── Sensor helpers ──────────────────────────────────────────────

const sensorIcons: Record<string, React.ElementType> = {
  "Soil Moisture": Droplets,
  Temperature: Thermometer,
  "Relative Humidity": Wind,
  "Rainfall (7-day)": CloudRain,
  "Cherry Intake (today)": Weight,
};

const statusColor: Record<string, string> = {
  normal: "text-green-400",
  warning: "text-yellow-400",
  critical: "text-red-400",
};

const statusBadgeVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  normal: "default",
  warning: "secondary",
  critical: "destructive",
};

const ndviConfig: ChartConfig = {
  value: { label: "NDVI", color: "hsl(var(--primary))" },
};

// ── Oracle event helpers ────────────────────────────────────────

const eventTypeIcons: Record<string, React.ElementType> = {
  payment_received: ArrowDownLeft,
  payment_confirmed: CircleCheck,
  milestone_verified: Satellite,
  sensor_alert: AlertTriangle,
  threshold_breach: AlertTriangle,
  disbursement_triggered: Zap,
  compliance_check: ShieldCheck,
};

const eventTypeColors: Record<string, string> = {
  payment_received: "text-green-400",
  payment_confirmed: "text-green-400",
  milestone_verified: "text-primary",
  sensor_alert: "text-yellow-400",
  threshold_breach: "text-red-400",
  disbursement_triggered: "text-primary",
  compliance_check: "text-muted-foreground",
};

function getPaymentChannelBadge(event: OracleEvent) {
  if (!event.paymentChannel) return null;
  const ch = event.paymentChannel;
  if (ch.type === "corporate") {
    return (
      <Badge variant="outline" className="text-[10px] gap-1">
        <Landmark className="h-3 w-3" />
        {ch.method === "bank_transfer" ? "Bank Transfer" : ch.method === "wire" ? "Wire" : "Check"}
      </Badge>
    );
  }
  if (ch.type === "retail") {
    return (
      <Badge variant="outline" className="text-[10px] gap-1">
        <Smartphone className="h-3 w-3" />
        {ch.provider || "Mobile Money"}
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-[10px] gap-1">
      <Zap className="h-3 w-3" />
      {ch.method === "escrow_release" ? "Escrow" : "Smart Contract"}
    </Badge>
  );
}

// ── Sub-components ──────────────────────────────────────────────

function SummaryKPI({ label, value, subtext, icon: Icon }: { label: string; value: string; subtext?: string; icon: React.ElementType }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-start gap-3">
        <div className="rounded-lg bg-primary/10 p-2">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div className="space-y-0.5">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-lg font-bold text-foreground">{value}</p>
          {subtext && <p className="text-[11px] text-muted-foreground">{subtext}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

function SensorGauge({ current, min, max, unit }: { current: number; min: number; max: number; unit: string }) {
  const range = max - min;
  const percent = Math.max(0, Math.min(100, ((current - min) / range) * 100));
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
      <div className="relative h-2 w-full rounded-full bg-secondary overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full rounded-full bg-primary transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function OracleEventCard({ event }: { event: OracleEvent }) {
  const EIcon = eventTypeIcons[event.type] || Activity;
  const colorClass = eventTypeColors[event.type] || "text-muted-foreground";

  return (
    <div className="flex gap-3 p-3 rounded-lg border border-border bg-card hover:bg-accent/5 transition-colors">
      <div className={`mt-0.5 rounded-lg bg-secondary p-2 shrink-0 ${colorClass}`}>
        <EIcon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-foreground leading-tight">{event.title}</p>
          <span className="text-[10px] text-muted-foreground whitespace-nowrap">
            {formatDate(event.timestamp)} · {formatTime(event.timestamp)}
          </span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">{event.description}</p>
        <div className="flex flex-wrap items-center gap-2">
          {event.amount && (
            <span className="text-xs font-bold text-foreground">
              {event.amount.toLocaleString()} {event.currency}
            </span>
          )}
          {getPaymentChannelBadge(event)}
          <Badge
            variant={event.status === "confirmed" ? "default" : event.status === "pending" ? "secondary" : "destructive"}
            className="text-[10px]"
          >
            {event.status === "confirmed" && <CircleCheck className="h-3 w-3 mr-1" />}
            {event.status}
          </Badge>
          {event.txHash && (
            <span className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
              <ExternalLink className="h-3 w-3" />
              {event.txHash}
            </span>
          )}
        </div>
        {event.source && (
          <p className="text-[10px] text-muted-foreground">Source: {event.source}</p>
        )}
      </div>
    </div>
  );
}

// ── Main page ───────────────────────────────────────────────────

export default function DashboardOracle() {
  const totalPayments = mockOracleEvents
    .filter((e) => e.type === "payment_received" || e.type === "payment_confirmed")
    .length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Oracle</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Live IoT telemetry, satellite data &amp; on-chain trigger events for SPV-01
        </p>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryKPI icon={Wifi} label="Active Sensors" value={`${performanceSummary.activeSensors}/${performanceSummary.totalSensors}`} subtext="All online" />
        <SummaryKPI icon={Satellite} label="NDVI (Canopy)" value={performanceSummary.ndviCurrent.toFixed(2)} subtext={`Threshold: ≥ ${performanceSummary.ndviThreshold}`} />
        <SummaryKPI icon={Activity} label="Oracle Status" value="Active" subtext="Chainlink adapter connected" />
        <SummaryKPI icon={ArrowDownLeft} label="Payment Events" value={`${totalPayments}`} subtext="This period" />
      </div>

      <Tabs defaultValue="events" className="space-y-4">
        <TabsList className="bg-secondary">
          <TabsTrigger value="events" className="text-xs">Oracle Events</TabsTrigger>
          <TabsTrigger value="sensors" className="text-xs">IoT Sensors</TabsTrigger>
          <TabsTrigger value="ndvi" className="text-xs">NDVI &amp; Canopy</TabsTrigger>
        </TabsList>

        {/* Oracle Events Tab */}
        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Trigger Event Log</CardTitle>
              <CardDescription className="text-xs">
                On-chain oracle events including payments, milestone verifications, sensor alerts, and disbursements.
                Payment channels are dynamically detected — corporate (bank/wire), retail (MoMo/card), or platform (escrow/smart contract).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockOracleEvents.map((event) => (
                <OracleEventCard key={event.id} event={event} />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* IoT Sensors Tab */}
        <TabsContent value="sensors" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockSensors.map((sensor) => {
              const SIcon = sensorIcons[sensor.metric] || Activity;
              return (
                <Card key={sensor.id}>
                  <CardHeader className="pb-2 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <SIcon className="h-4 w-4 text-muted-foreground" />
                        <CardTitle className="text-sm">{sensor.metric}</CardTitle>
                      </div>
                      <Badge variant={statusBadgeVariant[sensor.status]} className="text-[10px]">
                        {sensor.status === "normal" ? (
                          <CircleCheck className="h-3 w-3 mr-1" />
                        ) : (
                          <AlertTriangle className="h-3 w-3 mr-1" />
                        )}
                        {sensor.status}
                      </Badge>
                    </div>
                    <CardDescription className="text-[11px]">
                      {sensor.deviceName} · {sensor.location}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-baseline gap-1">
                      <span className={`text-2xl font-bold ${statusColor[sensor.status]}`}>
                        {sensor.current}
                      </span>
                      <span className="text-xs text-muted-foreground">{sensor.unit}</span>
                    </div>
                    <SensorGauge
                      current={sensor.current}
                      min={sensor.threshold.min}
                      max={sensor.threshold.max}
                      unit={sensor.unit}
                    />
                    <div className="h-16">
                      <ChartContainer config={{ value: { label: sensor.metric, color: "hsl(var(--primary))" } }} className="h-full w-full aspect-auto">
                        <AreaChart data={sensor.history} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id={`fill-${sensor.id}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <Area
                            type="monotone"
                            dataKey="value"
                            stroke="hsl(var(--primary))"
                            fill={`url(#fill-${sensor.id})`}
                            strokeWidth={1.5}
                          />
                        </AreaChart>
                      </ChartContainer>
                    </div>
                    <p className="text-[10px] text-muted-foreground text-right">Updated {sensor.lastUpdated}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* NDVI Tab */}
        <TabsContent value="ndvi" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-sm">NDVI Trend — Sentinel-2 Satellite</CardTitle>
                <CardDescription className="text-xs">
                  Normalized Difference Vegetation Index. Oracle threshold: ≥ 0.55 for Milestone 3 disbursement.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={ndviConfig} className="h-64 w-full aspect-auto">
                  <LineChart data={mockNDVI} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                    <YAxis domain={[0.3, 0.8]} tick={{ fontSize: 11 }} className="text-muted-foreground" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ r: 4, fill: "hsl(var(--primary))" }}
                    />
                    <Line
                      type="monotone"
                      dataKey={() => 0.55}
                      stroke="hsl(var(--destructive))"
                      strokeDasharray="6 3"
                      strokeWidth={1}
                      dot={false}
                      name="Threshold"
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Canopy Health Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Current NDVI</span>
                    <span className="font-bold text-primary">{performanceSummary.ndviCurrent}</span>
                  </div>
                  <Progress value={(performanceSummary.ndviCurrent / 0.8) * 100} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Oracle Threshold</span>
                    <span className="font-medium text-foreground">≥ 0.55</span>
                  </div>
                  <Badge variant="default" className="text-[10px]">
                    <CircleCheck className="h-3 w-3 mr-1" />
                    Threshold met — M3 disbursed
                  </Badge>
                </div>
                <div className="pt-2 border-t border-border space-y-1">
                  <p className="text-[11px] text-muted-foreground">Coverage area: 480 ha</p>
                  <p className="text-[11px] text-muted-foreground">Data source: Sentinel-2 (ESA)</p>
                  <p className="text-[11px] text-muted-foreground">Revisit: every 5 days</p>
                  <p className="text-[11px] text-muted-foreground">Oracle: Chainlink Adapter on Base</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
