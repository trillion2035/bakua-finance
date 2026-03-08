import {
  Activity, Droplets, Thermometer, CloudRain, Satellite, Weight, Wind, Sun, Zap, BatteryCharging,
  CircleCheck, AlertTriangle, Wifi, ArrowDownLeft, ShieldCheck, Landmark, Smartphone, ExternalLink, BarChart3,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Progress } from "@/components/ui/progress";
import { useOwnerSpvs, useSensorReadings, useNdviReadings, useOracleEvents } from "@/hooks/useSpvData";
import { useAuth } from "@/hooks/useAuth";

// Industry-specific oracle config
const ORACLE_CONFIG: Record<string, {
  sensorTab: string;
  satelliteTab: string;
  satelliteLabel: string;
  satelliteMetric: string;
  satelliteThreshold: string;
  thresholdValue: number;
  sensorIcons: Record<string, React.ElementType>;
}> = {
  "Agriculture": {
    sensorTab: "IoT Sensors",
    satelliteTab: "NDVI & Canopy",
    satelliteLabel: "NDVI Trend — Sentinel-2 Satellite",
    satelliteMetric: "NDVI (Canopy)",
    satelliteThreshold: "≥ 0.55",
    thresholdValue: 0.55,
    sensorIcons: { "Soil Moisture": Droplets, Temperature: Thermometer, "Relative Humidity": Wind, "Rainfall (7-day)": CloudRain, "Cherry Intake (today)": Weight },
  },
  "Energy & Solar": {
    sensorTab: "IoT Sensors",
    satelliteTab: "Irradiance & Output",
    satelliteLabel: "Solar Irradiance Trend",
    satelliteMetric: "Solar Irradiance",
    satelliteThreshold: "≥ 4.5 kWh/m²",
    thresholdValue: 4.5,
    sensorIcons: { "Panel Temperature": Thermometer, "Solar Irradiance": Sun, "Power Output": Zap, "Battery Level": BatteryCharging, "Grid Feed-in": Activity },
  },
};

function getOracleConfig(assetType: string | undefined) {
  if (!assetType) return ORACLE_CONFIG["Agriculture"];
  for (const key of Object.keys(ORACLE_CONFIG)) {
    if (assetType.toLowerCase().includes(key.toLowerCase())) return ORACLE_CONFIG[key];
  }
  return {
    sensorTab: "IoT Sensors",
    satelliteTab: "Remote Sensing",
    satelliteLabel: "Remote Monitoring",
    satelliteMetric: "Monitoring Index",
    satelliteThreshold: "—",
    thresholdValue: 0,
    sensorIcons: {},
  };
}

const statusColor: Record<string, string> = { normal: "text-green-400", warning: "text-yellow-400", critical: "text-red-400" };
const statusBadgeVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = { normal: "default", warning: "secondary", critical: "destructive" };
const ndviConfig: ChartConfig = { value: { label: "Value", color: "hsl(var(--primary))" } };

const eventTypeIcons: Record<string, React.ElementType> = {
  payment_received: ArrowDownLeft, payment_confirmed: CircleCheck, milestone_verified: Satellite,
  sensor_alert: AlertTriangle, threshold_breach: AlertTriangle, disbursement_triggered: Zap, compliance_check: ShieldCheck,
};
const eventTypeColors: Record<string, string> = {
  payment_received: "text-green-400", payment_confirmed: "text-green-400", milestone_verified: "text-primary",
  sensor_alert: "text-yellow-400", threshold_breach: "text-red-400", disbursement_triggered: "text-primary", compliance_check: "text-muted-foreground",
};

function SummaryKPI({ label, value, subtext, icon: Icon }: { label: string; value: string; subtext?: string; icon: React.ElementType }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-start gap-3">
        <div className="rounded-lg bg-primary/10 p-2"><Icon className="h-4 w-4 text-primary" /></div>
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
      <div className="flex justify-between text-[10px] text-muted-foreground"><span>{min}{unit}</span><span>{max}{unit}</span></div>
      <div className="relative h-2 w-full rounded-full bg-secondary overflow-hidden">
        <div className="absolute top-0 left-0 h-full rounded-full bg-primary transition-all" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function formatDate(iso: string) { return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }); }
function formatTime(iso: string) { return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }); }

function getPaymentChannelBadge(ch: any) {
  if (!ch) return null;
  if (ch.type === "corporate") return <Badge variant="outline" className="text-[10px] gap-1"><Landmark className="h-3 w-3" />{ch.method === "bank_transfer" ? "Bank Transfer" : ch.method === "wire" ? "Wire" : "Check"}</Badge>;
  if (ch.type === "retail") return <Badge variant="outline" className="text-[10px] gap-1"><Smartphone className="h-3 w-3" />{ch.provider || "Mobile Money"}</Badge>;
  return <Badge variant="outline" className="text-[10px] gap-1"><Zap className="h-3 w-3" />{ch.method === "escrow_release" ? "Escrow" : "Smart Contract"}</Badge>;
}

export default function DashboardOracle() {
  const { data: spvs } = useOwnerSpvs();
  const { user } = useAuth();
  const spv = spvs?.[0];
  const { data: sensors } = useSensorReadings(spv?.id);
  const { data: ndviData } = useNdviReadings(spv?.id);
  const { data: oracleEvents } = useOracleEvents(spv?.id);

  const assetType = spv?.asset_type || user?.user_metadata?.asset_type;
  const config = getOracleConfig(assetType);

  const totalPayments = oracleEvents?.filter((e) => e.event_type === "payment_received" || e.event_type === "payment_confirmed").length || 0;
  const activeSensors = sensors?.length || 0;
  const currentNdvi = ndviData?.length ? ndviData[ndviData.length - 1]?.value : 0;

  if (!spv) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Oracle</h1>
          <p className="text-sm text-muted-foreground mt-1">Live telemetry & on-chain events</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <SummaryKPI icon={Wifi} label="Active Sensors" value="0" subtext="No sensors connected" />
          <SummaryKPI icon={Satellite} label={config.satelliteMetric} value="—" subtext="Awaiting data" />
          <SummaryKPI icon={Activity} label="Oracle Status" value="Inactive" subtext="Awaiting SPV" />
          <SummaryKPI icon={ArrowDownLeft} label="Payment Events" value="0" subtext="No events" />
        </div>
        <Card>
          <CardContent className="p-12 text-center space-y-3">
            <BarChart3 className="h-10 w-10 text-muted-foreground mx-auto" />
            <h3 className="text-base font-bold text-foreground">No oracle data yet</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Oracle telemetry, IoT sensor data, and on-chain events for your {assetType || "project"} will appear here once your SPV is active.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Oracle</h1>
        <p className="text-sm text-muted-foreground mt-1">Live telemetry & on-chain events for {spv.spv_code}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryKPI icon={Wifi} label="Active Sensors" value={`${activeSensors}`} subtext={activeSensors > 0 ? "All online" : "None connected"} />
        <SummaryKPI icon={Satellite} label={config.satelliteMetric} value={ndviData?.length ? Number(currentNdvi).toFixed(2) : "—"} subtext={`Threshold: ${config.satelliteThreshold}`} />
        <SummaryKPI icon={Activity} label="Oracle Status" value={oracleEvents?.length ? "Active" : "Awaiting"} subtext="On-chain adapter" />
        <SummaryKPI icon={ArrowDownLeft} label="Payment Events" value={`${totalPayments}`} subtext="This period" />
      </div>

      <Tabs defaultValue="events" className="space-y-4">
        <TabsList className="bg-secondary">
          <TabsTrigger value="events" className="text-xs">Oracle Events</TabsTrigger>
          <TabsTrigger value="sensors" className="text-xs">{config.sensorTab}</TabsTrigger>
          <TabsTrigger value="satellite" className="text-xs">{config.satelliteTab}</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Trigger Event Log</CardTitle>
              <CardDescription className="text-xs">On-chain oracle events including payments, milestones, sensor alerts, and disbursements.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {oracleEvents?.map((event) => {
                const EIcon = eventTypeIcons[event.event_type] || Activity;
                const colorClass = eventTypeColors[event.event_type] || "text-muted-foreground";
                return (
                  <div key={event.id} className="flex gap-3 p-3 rounded-lg border border-border bg-card hover:bg-accent/5 transition-colors">
                    <div className={`mt-0.5 rounded-lg bg-secondary p-2 shrink-0 ${colorClass}`}><EIcon className="h-4 w-4" /></div>
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-foreground leading-tight">{event.title}</p>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">{formatDate(event.event_timestamp)} · {formatTime(event.event_timestamp)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{event.description}</p>
                      <div className="flex flex-wrap items-center gap-2">
                        {event.amount && <span className="text-xs font-bold text-foreground">{Number(event.amount).toLocaleString()} {event.currency}</span>}
                        {getPaymentChannelBadge(event.payment_channel)}
                        <Badge variant={event.status === "confirmed" ? "default" : event.status === "pending" ? "secondary" : "destructive"} className="text-[10px]">
                          {event.status === "confirmed" && <CircleCheck className="h-3 w-3 mr-1" />}{event.status}
                        </Badge>
                        {event.tx_hash && <span className="text-[10px] text-muted-foreground font-mono flex items-center gap-1"><ExternalLink className="h-3 w-3" />{event.tx_hash}</span>}
                      </div>
                      {event.source && <p className="text-[10px] text-muted-foreground">Source: {event.source}</p>}
                    </div>
                  </div>
                );
              })}
              {(!oracleEvents || oracleEvents.length === 0) && <p className="text-sm text-muted-foreground">No oracle events yet.</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sensors" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sensors?.map((sensor) => {
              const SIcon = config.sensorIcons[sensor.metric] || Activity;
              return (
                <Card key={sensor.id}>
                  <CardHeader className="pb-2 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <SIcon className="h-4 w-4 text-muted-foreground" />
                        <CardTitle className="text-sm">{sensor.metric}</CardTitle>
                      </div>
                      <Badge variant={statusBadgeVariant[sensor.status] || "default"} className="text-[10px]">
                        {sensor.status === "normal" ? <CircleCheck className="h-3 w-3 mr-1" /> : <AlertTriangle className="h-3 w-3 mr-1" />}{sensor.status}
                      </Badge>
                    </div>
                    <CardDescription className="text-[11px]">{sensor.device_name} · {sensor.location}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-baseline gap-1">
                      <span className={`text-2xl font-bold ${statusColor[sensor.status] || ""}`}>{Number(sensor.value)}</span>
                      <span className="text-xs text-muted-foreground">{sensor.unit}</span>
                    </div>
                    <SensorGauge current={Number(sensor.value)} min={Number(sensor.threshold_min) || 0} max={Number(sensor.threshold_max) || 100} unit={sensor.unit || ""} />
                  </CardContent>
                </Card>
              );
            })}
            {(!sensors || sensors.length === 0) && <p className="text-sm text-muted-foreground col-span-full">No sensor data yet.</p>}
          </div>
        </TabsContent>

        <TabsContent value="satellite" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-sm">{config.satelliteLabel}</CardTitle>
                <CardDescription className="text-xs">Oracle threshold: {config.satelliteThreshold}</CardDescription>
              </CardHeader>
              <CardContent>
                {ndviData && ndviData.length > 0 ? (
                  <ChartContainer config={ndviConfig} className="h-64 w-full aspect-auto">
                    <LineChart data={ndviData.map(d => ({ ...d, value: Number(d.value) }))} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                      <XAxis dataKey="reading_date" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4, fill: "hsl(var(--primary))" }} />
                    </LineChart>
                  </ChartContainer>
                ) : <p className="text-sm text-muted-foreground">No monitoring data yet.</p>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm">Status Summary</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Current Value</span>
                    <span className="font-bold text-primary">{ndviData?.length ? Number(currentNdvi).toFixed(2) : "—"}</span>
                  </div>
                  {ndviData?.length ? <Progress value={(Number(currentNdvi) / 1) * 100} className="h-2" /> : null}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Threshold</span>
                    <span className="font-medium text-foreground">{config.satelliteThreshold}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
