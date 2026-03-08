import { useSPVData } from "@/contexts/SPVDataContext";
import { KPICards } from "@/components/dashboard/KPICards";
import { ProcessPipeline } from "@/components/dashboard/ProcessPipeline";

export default function DashboardOverview() {
  const { profile, spv } = useSPVData();

  return (
    <div className="p-6 md:p-8 max-w-[1200px] mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
          Welcome back, {profile?.full_name || "User"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {profile?.company_name || ""} · {spv ? "1" : "0"} active SPV{spv ? "" : "s"}
        </p>
      </div>

      <KPICards />
      <ProcessPipeline />
    </div>
  );
}
