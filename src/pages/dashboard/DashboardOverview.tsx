import { KPICards } from "@/components/dashboard/KPICards";
import { ProcessPipeline } from "@/components/dashboard/ProcessPipeline";
import { mockCompany } from "@/data/mockDashboardData";

export default function DashboardOverview() {
  return (
    <div className="p-6 md:p-8 max-w-[1200px] mx-auto space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
          Welcome back, {mockCompany.contact}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {mockCompany.name} · {mockCompany.spvCount} active SPV{mockCompany.spvCount > 1 ? "s" : ""}
        </p>
      </div>

      {/* KPI summary cards */}
      <KPICards />

      {/* Process pipeline */}
      <ProcessPipeline />
    </div>
  );
}
