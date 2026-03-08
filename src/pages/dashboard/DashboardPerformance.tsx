import { TrendingUp, Leaf, DollarSign, Activity, Sun, Zap, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { useOwnerSpvs, useHarvestData, useMonthlyFinancials } from "@/hooks/useSpvData";
import { useAuth } from "@/hooks/useAuth";

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
  // Default generic
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

export default function DashboardPerformance() {
  const { data: spvs } = useOwnerSpvs();
  const { user } = useAuth();
  const spv = spvs?.[0];
  const { data: harvestData } = useHarvestData(spv?.id);
  const { data: financials } = useMonthlyFinancials(spv?.id);

  const assetType = spv?.asset_type || user?.user_metadata?.asset_type;
  const config = getIndustryConfig(assetType);

  const hasOperationalData = harvestData && harvestData.length > 0;
  const hasFinancialData = financials && financials.length > 0;
  const totalRevenue = financials?.reduce((sum, r) => sum + (r.revenue || 0), 0) || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Performance</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {config.label} performance metrics{spv ? ` for ${spv.spv_code}` : ""}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {config.summaryKpis.map((kpi) => (
          <SummaryKPI key={kpi.label} icon={kpi.icon} label={kpi.label} value="—" subtext={spv ? undefined : "Awaiting data"} />
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
          </TabsList>

          <TabsContent value="operational" className="space-y-4">
            {hasOperationalData ? (
              <>
                <Card>
                  <CardHeader><CardTitle className="text-sm">Monthly {config.operationalTab}</CardTitle></CardHeader>
                  <CardContent>
                    <ChartContainer config={config.chartConfig} className="h-64 w-full aspect-auto">
                      <BarChart data={harvestData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        {config.operationalMetrics.map((m) => (
                          <Bar key={m.key} dataKey={m.key} fill={config.chartConfig[m.key]?.color || "hsl(var(--primary))"} radius={[4, 4, 0, 0]} />
                        ))}
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
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
            {hasFinancialData ? (
              <>
                <Card>
                  <CardHeader><CardTitle className="text-sm">Monthly Revenue vs Operating Costs</CardTitle></CardHeader>
                  <CardContent>
                    <ChartContainer config={revenueConfig} className="h-56 w-full aspect-auto">
                      <BarChart data={financials} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="operating_cost" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-sm text-muted-foreground">No financial data yet.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
