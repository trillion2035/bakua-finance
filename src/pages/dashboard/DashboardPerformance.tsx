import { TrendingUp, Leaf, DollarSign, Activity, Sun, Zap, BarChart3, Droplets, Thermometer, CloudRain } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Line, LineChart, Area, AreaChart } from "recharts";
import { useOwnerSpvs, useHarvestData, useMonthlyFinancials } from "@/hooks/useSpvData";
import { useAuth } from "@/hooks/useAuth";
import {
  mockSensors, mockNDVI, mockHarvestData, mockFinancials, performanceSummary,
} from "@/data/mockPerformanceData";

// Industry-specific config
const INDUSTRY_CONFIG: Record<string, {
  label: string;
  operationalTab: string;
  operationalMetrics: { key: string; label: string; unit: string; icon: React.ElementType }[];
  chartConfig: ChartConfig;
  summaryKpis: { label: string; icon: React.ElementType }[];
}> = {
  "Agriculture": {
    label: "Agriculture",
    operationalTab: "Harvest & Yield",
    operationalMetrics: [
      { key: "cherry_intake", label: "Cherry Intake", unit: "kg", icon: Leaf },
      { key: "green_yield", label: "Green Yield", unit: "kg", icon: Leaf },
    ],
    chartConfig: {
      cherry_intake: { label: "Cherry (kg)", color: "hsl(var(--primary))" },
      green_yield: { label: "Green (kg)", color: "hsl(142 76% 36%)" },
    },
    summaryKpis: [
      { label: "Cherry Intake", icon: Leaf },
      { label: "Cumulative Revenue", icon: DollarSign },
      { label: "Projected IRR", icon: TrendingUp },
      { label: "Avg Grade A", icon: Activity },
    ],
  },
  "Energy & Solar": {
    label: "Energy & Solar",
    operationalTab: "Energy Production",
    operationalMetrics: [
      { key: "cherry_intake", label: "Energy Generated", unit: "kWh", icon: Zap },
      { key: "green_yield", label: "Energy Sold", unit: "kWh", icon: Sun },
    ],
    chartConfig: {
      cherry_intake: { label: "Generated (kWh)", color: "hsl(var(--primary))" },
      green_yield: { label: "Sold (kWh)", color: "hsl(142 76% 36%)" },
    },
    summaryKpis: [
      { label: "Total Generation", icon: Zap },
      { label: "Cumulative Revenue", icon: DollarSign },
      { label: "Projected IRR", icon: TrendingUp },
      { label: "Capacity Factor", icon: Activity },
    ],
  },
};

function getIndustryConfig(assetType: string | undefined) {
  if (!assetType) return INDUSTRY_CONFIG["Agriculture"];
  for (const key of Object.keys(INDUSTRY_CONFIG)) {
    if (assetType.toLowerCase().includes(key.toLowerCase())) return INDUSTRY_CONFIG[key];
  }
  return {
    label: assetType,
    operationalTab: "Operational Metrics",
    operationalMetrics: [],
    chartConfig: {} as ChartConfig,
    summaryKpis: [
      { label: "Operational Output", icon: BarChart3 },
      { label: "Cumulative Revenue", icon: DollarSign },
      { label: "Projected IRR", icon: TrendingUp },
      { label: "Efficiency", icon: Activity },
    ],
  };
}

const revenueConfig: ChartConfig = {
  revenue: { label: "Revenue", color: "hsl(var(--primary))" },
  operating_cost: { label: "Costs", color: "hsl(var(--muted-foreground))" },
};

const harvestChartConfig: ChartConfig = {
  cherryIntake: { label: "Cherry Intake (kg)", color: "hsl(var(--primary))" },
  greenYield: { label: "Green Yield (kg)", color: "hsl(142 76% 36%)" },
};

const ndviConfig: ChartConfig = {
  value: { label: "NDVI", color: "hsl(142 76% 36%)" },
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

function SensorCard({ sensor }: { sensor: typeof mockSensors[0] }) {
  const pct = ((sensor.current - sensor.threshold.min) / (sensor.threshold.max - sensor.threshold.min)) * 100;
  return (
    <Card>
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-foreground">{sensor.metric}</p>
          <span className="text-[10px] text-muted-foreground">{sensor.lastUpdated}</span>
        </div>
        <div className="text-2xl font-extrabold text-foreground">{sensor.current}{sensor.unit}</div>
        <Progress value={Math.min(100, Math.max(0, pct))} className="h-1.5" />
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>{sensor.threshold.min}{sensor.unit}</span>
          <span>{sensor.threshold.max}{sensor.unit}</span>
        </div>
        <p className="text-[10px] text-muted-foreground">{sensor.deviceName} · {sensor.location}</p>
      </CardContent>
    </Card>
  );
}

export default function DashboardPerformance() {
  const { data: spvs } = useOwnerSpvs();
  const { user } = useAuth();
  const spv = spvs?.[0];
  const { data: harvestData } = useHarvestData(spv?.id);
  const { data: financials } = useMonthlyFinancials(spv?.id);

  const assetType = spv?.asset_type || user?.user_metadata?.asset_type;
  const config = getIndustryConfig(assetType);

  const hasOperationalData = (harvestData && harvestData.length > 0);
  const hasFinancialData = (financials && financials.length > 0);

  // Always show mock summary values for this SPV
  const summaryValues = [performanceSummary.totalCherryIntake, performanceSummary.cumulativeRevenue, performanceSummary.projectedIRR, performanceSummary.avgGradeA];
  const subtexts = [`Target: ${performanceSummary.cherryTarget} (${performanceSummary.cherryPercent}%)`, `Next repayment: ${performanceSummary.nextRepayment}`, "36-month term", `Green export: ${performanceSummary.totalGreenExport}`];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Performance</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {config.label} performance metrics{spv ? ` for ${spv.spv_code}` : ""}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {config.summaryKpis.map((kpi, i) => (
          <SummaryKPI
            key={kpi.label}
            icon={kpi.icon}
            label={kpi.label}
            value={summaryValues[i] || "—"}
            subtext={subtexts[i] || (spv ? undefined : "Awaiting data")}
          />
        ))}
      </div>

      {!spv && (
        <Card>
          <CardContent className="p-12 text-center space-y-3">
            <BarChart3 className="h-10 w-10 text-muted-foreground mx-auto" />
            <h3 className="text-base font-bold text-foreground">No performance data yet</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Performance metrics for your {config.label} project will appear here once your SPV is active and data starts flowing.
            </p>
          </CardContent>
        </Card>
      )}

      {spv && (
        <Tabs defaultValue="operational" className="space-y-4">
          <TabsList className="bg-secondary">
            <TabsTrigger value="operational" className="text-xs">{config.operationalTab}</TabsTrigger>
            <TabsTrigger value="financial" className="text-xs">Financial</TabsTrigger>
            <TabsTrigger value="sensors" className="text-xs">IoT Sensors</TabsTrigger>
            <TabsTrigger value="ndvi" className="text-xs">NDVI</TabsTrigger>
          </TabsList>

          <TabsContent value="operational" className="space-y-4">
            {(hasOperationalData || useMock) ? (
              <>
                <Card>
                  <CardHeader><CardTitle className="text-sm">Monthly {config.operationalTab}</CardTitle></CardHeader>
                  <CardContent>
                    <ChartContainer config={useMock ? harvestChartConfig : config.chartConfig} className="h-64 w-full aspect-auto">
                      <BarChart data={useMock ? mockHarvestData : harvestData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        {useMock ? (
                          <>
                            <Bar dataKey="cherryIntake" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="greenYield" fill="hsl(142 76% 36%)" radius={[4, 4, 0, 0]} />
                          </>
                        ) : (
                          config.operationalMetrics.map((m) => (
                            <Bar key={m.key} dataKey={m.key} fill={config.chartConfig[m.key]?.color || "hsl(var(--primary))"} radius={[4, 4, 0, 0]} />
                          ))
                        )}
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
                {useMock && (
                  <Card>
                    <CardHeader><CardTitle className="text-sm">Harvest Details</CardTitle></CardHeader>
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
                )}
              </>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-sm text-muted-foreground">No operational data yet.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="financial" className="space-y-4">
            {(hasFinancialData || useMock) ? (
              <>
                <Card>
                  <CardHeader><CardTitle className="text-sm">Revenue vs Operating Costs (FCFA)</CardTitle></CardHeader>
                  <CardContent>
                    <ChartContainer config={revenueConfig} className="h-56 w-full aspect-auto">
                      <BarChart data={useMock ? mockFinancials : financials} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                        <XAxis dataKey="quarter" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="operatingCost" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
                {useMock && (
                  <Card>
                    <CardHeader><CardTitle className="text-sm">Quarterly Summary</CardTitle></CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs">Quarter</TableHead>
                            <TableHead className="text-xs text-right">Revenue</TableHead>
                            <TableHead className="text-xs text-right">Costs</TableHead>
                            <TableHead className="text-xs text-right">Net Margin</TableHead>
                            <TableHead className="text-xs text-right">Repayment</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {mockFinancials.map((row) => (
                            <TableRow key={row.quarter}>
                              <TableCell className="text-xs font-medium">{row.quarter}</TableCell>
                              <TableCell className="text-xs text-right">{(row.revenue / 1000000).toFixed(1)}M</TableCell>
                              <TableCell className="text-xs text-right">{(row.operatingCost / 1000000).toFixed(1)}M</TableCell>
                              <TableCell className="text-xs text-right">{row.netMargin}%</TableCell>
                              <TableCell className="text-xs text-right">{row.loanRepayment > 0 ? `${(row.loanRepayment / 1000000).toFixed(1)}M` : "—"}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-sm text-muted-foreground">No financial data yet.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="sensors" className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {performanceSummary.activeSensors}/{performanceSummary.totalSensors} sensors active
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {mockSensors.map((sensor) => (
                <SensorCard key={sensor.id} sensor={sensor} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="ndvi" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">NDVI Vegetation Index</CardTitle>
                <p className="text-xs text-muted-foreground">Source: Sentinel-2 · Threshold: {performanceSummary.ndviThreshold}</p>
              </CardHeader>
              <CardContent>
                <ChartContainer config={ndviConfig} className="h-56 w-full aspect-auto">
                  <AreaChart data={mockNDVI} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} domain={[0.3, 0.8]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area type="monotone" dataKey="value" fill="hsl(142 76% 36% / 0.2)" stroke="hsl(142 76% 36%)" strokeWidth={2} />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>
            <div className="grid grid-cols-2 gap-3">
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-xs text-muted-foreground">Current NDVI</p>
                  <p className="text-2xl font-extrabold text-foreground">{performanceSummary.ndviCurrent}</p>
                  <p className="text-[10px] text-emerald-600">Above threshold ({performanceSummary.ndviThreshold})</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-xs text-muted-foreground">Next Repayment</p>
                  <p className="text-lg font-bold text-foreground">{performanceSummary.nextRepaymentAmount}</p>
                  <p className="text-[10px] text-muted-foreground">{performanceSummary.nextRepayment}</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}