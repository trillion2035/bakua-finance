import {
  TrendingUp,
  Leaf,
  DollarSign,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  mockHarvestData,
  performanceSummary,
} from "@/data/mockPerformanceData";
import { mockMonthlyFinancials } from "@/data/mockOracleData";

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
          <p className="text-lg font-bold text-foreground">{value}</p>
          {subtext && <p className="text-[11px] text-muted-foreground">{subtext}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPerformance() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Performance</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Harvest metrics &amp; financial performance for SPV-01
        </p>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryKPI icon={Leaf} label="Cherry Intake" value={performanceSummary.totalCherryIntake} subtext={`${performanceSummary.cherryPercent}% of ${performanceSummary.cherryTarget} target`} />
        <SummaryKPI icon={DollarSign} label="Cumulative Revenue" value={performanceSummary.cumulativeRevenue} subtext="Nov 2024 – Mar 2025" />
        <SummaryKPI icon={TrendingUp} label="Projected IRR" value={performanceSummary.projectedIRR} subtext="vs 19.2% target" />
        <SummaryKPI icon={Activity} label="Next Repayment" value={performanceSummary.nextRepaymentAmount} subtext={performanceSummary.nextRepayment} />
      </div>

      <Tabs defaultValue="harvest" className="space-y-4">
        <TabsList className="bg-secondary">
          <TabsTrigger value="harvest" className="text-xs">Harvest &amp; Yield</TabsTrigger>
          <TabsTrigger value="financial" className="text-xs">Financial</TabsTrigger>
        </TabsList>

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

        {/* Financial Tab — now monthly with collections */}
        <TabsContent value="financial" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Monthly Revenue vs Operating Costs</CardTitle>
              <CardDescription className="text-xs">
                Revenue includes all confirmed payments. Collection rate shows % of invoiced revenue received.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={revenueConfig} className="h-56 w-full aspect-auto">
                <BarChart data={mockMonthlyFinancials} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="operatingCost" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Monthly Detail</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Month</TableHead>
                    <TableHead className="text-xs text-right">Revenue (FCFA)</TableHead>
                    <TableHead className="text-xs text-right">Collections</TableHead>
                    <TableHead className="text-xs text-right">Coll. Rate</TableHead>
                    <TableHead className="text-xs text-right">Txns</TableHead>
                    <TableHead className="text-xs text-right">Costs (FCFA)</TableHead>
                    <TableHead className="text-xs text-right">Net Margin</TableHead>
                    <TableHead className="text-xs text-right">Repayment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockMonthlyFinancials.map((row) => (
                    <TableRow key={row.month}>
                      <TableCell className="text-xs font-medium">{row.month}</TableCell>
                      <TableCell className="text-xs text-right">{row.revenue.toLocaleString()}</TableCell>
                      <TableCell className="text-xs text-right">{row.collections.toLocaleString()}</TableCell>
                      <TableCell className="text-xs text-right">{row.collectionRate}%</TableCell>
                      <TableCell className="text-xs text-right">{row.txCount}</TableCell>
                      <TableCell className="text-xs text-right">{row.operatingCost.toLocaleString()}</TableCell>
                      <TableCell className="text-xs text-right">{row.netMargin}%</TableCell>
                      <TableCell className="text-xs text-right">{row.loanRepayment > 0 ? row.loanRepayment.toLocaleString() : "—"}</TableCell>
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
