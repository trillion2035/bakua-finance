import { TrendingUp, Leaf, DollarSign, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { useOwnerSpvs, useHarvestData, useMonthlyFinancials } from "@/hooks/useSpvData";

const harvestConfig: ChartConfig = {
  cherry_intake: { label: "Cherry (kg)", color: "hsl(var(--primary))" },
  green_yield: { label: "Green (kg)", color: "hsl(142 76% 36%)" },
};

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
  const spv = spvs?.[0];
  const { data: harvestData } = useHarvestData(spv?.id);
  const { data: financials } = useMonthlyFinancials(spv?.id);

  const totalCherry = harvestData?.reduce((sum, r) => sum + (r.cherry_intake || 0), 0) || 0;
  const totalGreen = harvestData?.reduce((sum, r) => sum + (r.green_yield || 0), 0) || 0;
  const avgGradeA = harvestData?.length ? (harvestData.reduce((sum, r) => sum + (r.grade_a_percent || 0), 0) / harvestData.length).toFixed(1) : "—";
  const totalRevenue = financials?.reduce((sum, r) => sum + (r.revenue || 0), 0) || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Performance</h1>
        <p className="text-sm text-muted-foreground mt-1">Harvest metrics & financial performance for {spv?.spv_code || "—"}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryKPI icon={Leaf} label="Cherry Intake" value={`${(totalCherry / 1000).toFixed(1)} MT`} subtext="Total this season" />
        <SummaryKPI icon={DollarSign} label="Cumulative Revenue" value={`${(totalRevenue / 1000000).toFixed(1)}M FCFA`} />
        <SummaryKPI icon={TrendingUp} label="Projected IRR" value={spv?.projected_irr || "—"} subtext={`vs ${spv?.target_irr || "—"} target`} />
        <SummaryKPI icon={Activity} label="Avg Grade A" value={`${avgGradeA}%`} subtext="Specialty grade" />
      </div>

      <Tabs defaultValue="harvest" className="space-y-4">
        <TabsList className="bg-secondary">
          <TabsTrigger value="harvest" className="text-xs">Harvest & Yield</TabsTrigger>
          <TabsTrigger value="financial" className="text-xs">Financial</TabsTrigger>
        </TabsList>

        <TabsContent value="harvest" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-sm">Monthly Cherry Intake vs Green Yield</CardTitle>
              </CardHeader>
              <CardContent>
                {harvestData && harvestData.length > 0 ? (
                  <ChartContainer config={harvestConfig} className="h-64 w-full aspect-auto">
                    <BarChart data={harvestData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="cherry_intake" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="green_yield" fill="hsl(142 76% 36%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ChartContainer>
                ) : <p className="text-sm text-muted-foreground">No harvest data yet.</p>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm">Harvest Progress</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Cherry Intake</span>
                    <span className="font-bold text-foreground">{(totalCherry / 1000).toFixed(1)} MT</span>
                  </div>
                  <Progress value={Math.min((totalCherry / 90000) * 100, 100)} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Green Export</span>
                    <span className="font-bold text-foreground">{(totalGreen / 1000).toFixed(1)} MT</span>
                  </div>
                  <Progress value={Math.min((totalGreen / 18000) * 100, 100)} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle className="text-sm">Monthly Breakdown</CardTitle></CardHeader>
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
                  {harvestData?.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="text-xs font-medium">{row.month}</TableCell>
                      <TableCell className="text-xs text-right">{(row.cherry_intake || 0).toLocaleString()}</TableCell>
                      <TableCell className="text-xs text-right">{(row.green_yield || 0).toLocaleString()}</TableCell>
                      <TableCell className="text-xs text-right">{row.conversion_rate}%</TableCell>
                      <TableCell className="text-xs text-right">{row.grade_a_percent}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Monthly Revenue vs Operating Costs</CardTitle>
            </CardHeader>
            <CardContent>
              {financials && financials.length > 0 ? (
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
              ) : <p className="text-sm text-muted-foreground">No financial data yet.</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm">Monthly Detail</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Month</TableHead>
                    <TableHead className="text-xs text-right">Revenue</TableHead>
                    <TableHead className="text-xs text-right">Collections</TableHead>
                    <TableHead className="text-xs text-right">Coll. Rate</TableHead>
                    <TableHead className="text-xs text-right">Costs</TableHead>
                    <TableHead className="text-xs text-right">Net Margin</TableHead>
                    <TableHead className="text-xs text-right">Repayment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {financials?.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="text-xs font-medium">{row.month}</TableCell>
                      <TableCell className="text-xs text-right">{(row.revenue || 0).toLocaleString()}</TableCell>
                      <TableCell className="text-xs text-right">{(row.collections || 0).toLocaleString()}</TableCell>
                      <TableCell className="text-xs text-right">{row.collection_rate}%</TableCell>
                      <TableCell className="text-xs text-right">{(row.operating_cost || 0).toLocaleString()}</TableCell>
                      <TableCell className="text-xs text-right">{row.net_margin}%</TableCell>
                      <TableCell className="text-xs text-right">{(row.loan_repayment || 0) > 0 ? (row.loan_repayment || 0).toLocaleString() : "—"}</TableCell>
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
