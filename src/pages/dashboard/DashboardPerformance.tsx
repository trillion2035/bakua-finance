import {
  Activity,
  Droplets,
  Thermometer,
  CloudRain,
  Satellite,
  Weight,
  Wind,
  TrendingUp,
  Leaf,
  DollarSign,
  CircleCheck,
  AlertTriangle,
  Wifi,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis, Line, LineChart } from "recharts";
import {
  mockSensors,
  mockNDVI,
  mockHarvestData,
  mockFinancials,
  performanceSummary,
} from "@/data/mockPerformanceData";

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

const harvestConfig: ChartConfig = {
  cherryIntake: { label: "Cherry (kg)", color: "hsl(var(--primary))" },
  greenYield: { label: "Green (kg)", color: "hsl(142 76% 36%)" },
};

const revenueConfig: ChartConfig = {
  revenue: { label: "Revenue", color: "hsl(var(--primary))" },
  operatingCost: { label: "Costs", color: "hsl(var(--muted-foreground))" },
};

function SummaryKPI({ label, value, subtext, icon: Icon }: { label: string; value: string; subtext?: string; icon: React.ElementType }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-start gap-3">
        <div className="rounded-lg bg-primary/10 p-2">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div className="space-y-0.5">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-lg font-bold font-display text-foreground">{value}</p>
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

export default function DashboardPerformance() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-bold text-foreground">Performance</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Live IoT telemetry, harvest metrics &amp; financial performance for SPV-01
        </p>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryKPI icon={Leaf} label="Cherry Intake" value={performanceSummary.totalCherryIntake} subtext={`${performanceSummary.cherryPercent}% of ${performanceSummary.cherryTarget} target`} />
        <SummaryKPI icon={Satellite} label="NDVI (Canopy)" value={performanceSummary.ndviCurrent.toFixed(2)} subtext={`Threshold: ${performanceSummary.ndviThreshold}`} />
        <SummaryKPI icon={Wifi} label="Active Sensors" value={`${performanceSummary.activeSensors}/${performanceSummary.totalSensors}`} subtext="All online" />
        <SummaryKPI icon={TrendingUp} label="Projected IRR" value={performanceSummary.projectedIRR} subtext={`Revenue: ${performanceSummary.cumulativeRevenue}`} />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="sensors" className="space-y-4">
        <TabsList className="bg-secondary">
          <TabsTrigger value="sensors" className="text-xs">IoT Sensors</TabsTrigger>
          <TabsTrigger value="ndvi" className="text-xs">NDVI &amp; Canopy</TabsTrigger>
          <TabsTrigger value="harvest" className="text-xs">Harvest &amp; Yield</TabsTrigger>
          <TabsTrigger value="financial" className="text-xs">Financial</TabsTrigger>
        </TabsList>

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
                      <span className={`text-2xl font-bold font-display ${statusColor[sensor.status]}`}>
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
                    {/* Threshold line */}
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
                    <span className="font-bold text-green-400">{performanceSummary.ndviCurrent}</span>
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
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Harvest Tab */}
        <TabsContent value="harvest" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-sm">Monthly Cherry Intake vs Green Yield</CardTitle>
                <CardDescription className="text-xs">
                  Conversion rate: cherry → green bean (target ~20% for washed Arabica)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={harvestConfig} className="h-64 w-full aspect-auto">
                  <BarChart data={mockHarvestData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="cherryIntake" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="greenYield" fill="hsl(142 76% 36%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Harvest Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Cherry Intake</span>
                    <span className="font-bold text-foreground">{performanceSummary.totalCherryIntake}</span>
                  </div>
                  <Progress value={performanceSummary.cherryPercent} className="h-2" />
                  <p className="text-[10px] text-muted-foreground">{performanceSummary.cherryPercent}% of {performanceSummary.cherryTarget} target</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Green Export</span>
                    <span className="font-bold text-foreground">{performanceSummary.totalGreenExport}</span>
                  </div>
                  <Progress value={performanceSummary.greenPercent} className="h-2" />
                  <p className="text-[10px] text-muted-foreground">{performanceSummary.greenPercent}% of {performanceSummary.greenTarget} target</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Avg Grade A</span>
                    <span className="font-bold text-foreground">{performanceSummary.avgGradeA}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Monthly Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Month</TableHead>
                    <TableHead className="text-xs text-right">Cherry (kg)</TableHead>
                    <TableHead className="text-xs text-right">Green (kg)</TableHead>
                    <TableHead className="text-xs text-right">Conv. Rate</TableHead>
                    <TableHead className="text-xs text-right">Grade A %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockHarvestData.map((row) => (
                    <TableRow key={row.month}>
                      <TableCell className="text-xs font-medium">{row.month}</TableCell>
                      <TableCell className="text-xs text-right">{row.cherryIntake.toLocaleString()}</TableCell>
                      <TableCell className="text-xs text-right">{row.greenYield.toLocaleString()}</TableCell>
                      <TableCell className="text-xs text-right">{row.conversionRate}%</TableCell>
                      <TableCell className="text-xs text-right">{row.gradeAPercent}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financial Tab */}
        <TabsContent value="financial" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <SummaryKPI icon={DollarSign} label="Cumulative Revenue" value={performanceSummary.cumulativeRevenue} subtext="Q4 2024 + Q1 2025" />
            <SummaryKPI icon={TrendingUp} label="Projected IRR" value={performanceSummary.projectedIRR} subtext="vs 19.2% target" />
            <SummaryKPI icon={Activity} label="Next Repayment" value={performanceSummary.nextRepaymentAmount} subtext={performanceSummary.nextRepayment} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Revenue vs Operating Costs</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={revenueConfig} className="h-56 w-full aspect-auto">
                <BarChart data={mockFinancials} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                  <XAxis dataKey="quarter" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="operatingCost" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Quarterly Detail</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Quarter</TableHead>
                    <TableHead className="text-xs text-right">Revenue (FCFA)</TableHead>
                    <TableHead className="text-xs text-right">Costs (FCFA)</TableHead>
                    <TableHead className="text-xs text-right">Net Margin</TableHead>
                    <TableHead className="text-xs text-right">Loan Repayment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockFinancials.map((row) => (
                    <TableRow key={row.quarter}>
                      <TableCell className="text-xs font-medium">{row.quarter}</TableCell>
                      <TableCell className="text-xs text-right">{row.revenue.toLocaleString()}</TableCell>
                      <TableCell className="text-xs text-right">{row.operatingCost.toLocaleString()}</TableCell>
                      <TableCell className="text-xs text-right">{row.netMargin}%</TableCell>
                      <TableCell className="text-xs text-right">{row.loanRepayment.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
