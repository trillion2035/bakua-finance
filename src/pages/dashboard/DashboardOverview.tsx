import { KPICards } from "@/components/dashboard/KPICards";
import { ProcessPipeline } from "@/components/dashboard/ProcessPipeline";
import { DocumentNotifications } from "@/components/dashboard/documents/DocumentNotifications";
import { mockCompany, mockSPV } from "@/data/mockDashboardData";
import { stepIdToStage } from "@/data/mockDocumentsData";

export default function DashboardOverview() {
  const stages = mockSPV.processSteps.map((step) => ({
    stage: stepIdToStage[step.id],
    stepId: step.id,
    status: step.status,
  }));

  return (
    <div className="p-6 md:p-8 max-w-[1200px] mx-auto space-y-8">
      <DocumentNotifications stages={stages} />

      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
          Welcome back, {mockCompany.contact}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {mockCompany.name} · {mockCompany.spvCount} active SPV{mockCompany.spvCount > 1 ? "s" : ""}
        </p>
      </div>

      <KPICards />
      <ProcessPipeline />
    </div>
  );
}
