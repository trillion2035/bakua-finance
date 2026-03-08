import { useState } from "react";
import {
  ArrowRight, Clock, Check, Loader2, FileUp,
  DollarSign, TrendingUp, Shield, Percent,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useOwnerSpvs } from "@/hooks/useSpvData";
import { DocumentWizard } from "@/components/dashboard/DocumentWizard";
import { ProcessPipeline } from "@/components/dashboard/ProcessPipeline";
import type { ProcessStepStatus } from "@/data/mockDashboardData";

function EmptyKPICards({ capitalTarget, spv }: { capitalTarget: string; spv: any }) {
  const kpis = spv
    ? [
        { label: "Total Capital Target", value: spv.target_amount ? `${(spv.target_amount / 1000000).toFixed(0)}M ${spv.currency}` : "—", subtext: spv.target_amount_usd || "Not set", icon: DollarSign },
        { label: "Funded", value: spv.funded_percent ? `${spv.funded_percent}%` : "—", subtext: spv.funded_percent === 100 ? "Fully funded" : "In progress", icon: TrendingUp },
        { label: "Asset Score™", value: "AS-88", subtext: "Standard Grade", icon: Shield },
        { label: "IRR Target", value: spv.target_irr || "—", subtext: "36-month term", icon: Percent },
      ]
    : [
        { label: "Total Capital Target", value: capitalTarget || "—", subtext: capitalTarget ? "As submitted" : "Not yet determined", icon: DollarSign },
        { label: "Funded", value: "—", subtext: "Awaiting documents", icon: TrendingUp },
        { label: "Asset Score™", value: "—", subtext: "Pending analysis", icon: Shield },
        { label: "IRR Target", value: "—", subtext: "Pending model", icon: Percent },
      ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi) => (
        <div key={kpi.label} className="bg-card border border-border rounded-lg p-5 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] tracking-[2px] text-muted-foreground font-semibold uppercase">{kpi.label}</span>
            <kpi.icon className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-extrabold tracking-tight text-foreground">{kpi.value}</div>
          <span className="text-xs text-muted-foreground">{kpi.subtext}</span>
        </div>
      ))}
    </div>
  );
}

const processSteps: { id: number; title: string; description: string; status: ProcessStepStatus; dateRange: string; actionable: boolean }[] = [
  { id: 1, title: "Document Submission", description: "Register and upload all required project documents for review.", status: "pending", dateRange: "Not started", actionable: true },
  { id: 2, title: "Asset Standardization", description: "AI engine processes documents, generates Asset Score™ and financial model.", status: "pending", dateRange: "Awaiting documents", actionable: false },
  { id: 3, title: "SPV Deployment", description: "Legal entity incorporated, contracts executed, smart contract deployed on-chain.", status: "pending", dateRange: "Awaiting standardization", actionable: false },
  { id: 4, title: "Listing", description: "Smart contract deployed, audited, and SPV listed on the investor marketplace.", status: "pending", dateRange: "Awaiting deployment", actionable: false },
  { id: 5, title: "Funding", description: "Investors deposit capital until the SPV target is fully met.", status: "pending", dateRange: "Awaiting listing", actionable: false },
  { id: 6, title: "Capital Disbursement", description: "Funds released in milestones, verified by IoT oracles and smart contracts.", status: "pending", dateRange: "Awaiting funding", actionable: false },
];

function StatusIcon({ status, isFirst }: { status: ProcessStepStatus; isFirst?: boolean }) {
  if (status === "completed")
    return <div className="w-8 h-8 rounded-full bg-green/20 flex items-center justify-center shrink-0"><Check className="w-4 h-4 text-green" /></div>;
  if (status === "in_progress")
    return <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center shrink-0"><Loader2 className="w-4 h-4 text-gold animate-spin" /></div>;
  if (isFirst)
    return <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0"><ArrowRight className="w-4 h-4 text-primary" /></div>;
  return <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0"><Clock className="w-4 h-4 text-muted-foreground" /></div>;
}

function EmptyProcessPipeline({ onStartUpload }: { onStartUpload: () => void }) {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-bold text-foreground tracking-tight">Process Status</h3>
          <p className="text-xs text-muted-foreground mt-0.5">0 of {processSteps.length} complete</p>
        </div>
      </div>
      <div className="space-y-0">
        {processSteps.map((step, i) => (
          <div key={step.id} className="relative flex gap-4">
            {i < processSteps.length - 1 && <div className="absolute left-4 top-10 w-px bg-border" style={{ bottom: "-8px" }} />}
            <StatusIcon status={step.status} isFirst={step.id === 1} />
            <div className="flex-1 min-w-0 pb-6">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-foreground">{step.title}</span>
                {step.id === 1 ? (
                  <span className="text-[10px] font-semibold tracking-wider uppercase text-primary">Start Here</span>
                ) : (
                  <span className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">Pending</span>
                )}
              </div>
              <span className="text-xs text-muted-foreground">{step.dateRange}</span>
              {step.actionable && (
                <div className="mt-3 bg-secondary/50 border border-border rounded-lg p-4 space-y-3">
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                  <Button size="sm" className="gap-2" onClick={onStartUpload}>
                    <FileUp className="h-3.5 w-3.5" /> Submit Documents
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardNewOverview() {
  const [showWizard, setShowWizard] = useState(false);
  const { profile, user } = useAuth();
  const { data: spvs } = useOwnerSpvs();

  const spv = spvs?.[0];
  const firstName = profile?.full_name?.split(" ")[0] || "there";
  const companyName = profile?.company_name || "";
  const capitalTarget = user?.user_metadata?.capital_target || "";

  if (showWizard) {
    return <DocumentWizard sector={user?.user_metadata?.asset_type || "default"} onBack={() => setShowWizard(false)} />;
  }

  return (
    <div className="p-6 md:p-8 max-w-[1200px] mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
          Welcome back, {firstName}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {companyName} · {spvs?.length || 0} active SPV{(spvs?.length || 0) !== 1 ? "s" : ""}
        </p>
      </div>

      <EmptyKPICards capitalTarget={capitalTarget} spv={spv} />
      {spv ? <ProcessPipeline /> : <EmptyProcessPipeline onStartUpload={() => setShowWizard(true)} />}
    </div>
  );
}
