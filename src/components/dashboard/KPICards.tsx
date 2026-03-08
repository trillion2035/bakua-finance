import { useSPVData } from "@/contexts/SPVDataContext";
import { DollarSign, TrendingUp, Shield, Percent } from "lucide-react";

const icons = [DollarSign, TrendingUp, Shield, Percent];
const accentColors = ["text-gold", "text-green", "text-gold", "text-gold"];

export function KPICards() {
  const { spv } = useSPVData();

  const kpis = [
    { label: "Total Capital Target", value: spv ? `${(spv.target_amount! / 1_000_000).toFixed(0)}M ${spv.currency}` : "—", subtext: spv?.target_amount_usd ? `~${spv.target_amount_usd}` : "" },
    { label: "Funded", value: spv ? `${spv.funded_percent}%` : "—", subtext: spv?.funded_percent === 100 ? "Fully funded" : "" },
    { label: "Asset Score™", value: spv ? "AS-88" : "—", subtext: "Standard Grade" },
    { label: "IRR Target", value: spv?.target_irr || "—", subtext: "36-month term" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, i) => {
        const Icon = icons[i];
        return (
          <div key={kpi.label} className="bg-card border border-border rounded-lg p-5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] tracking-[2px] text-muted-foreground font-semibold uppercase">{kpi.label}</span>
              <Icon className={`h-4 w-4 ${accentColors[i]}`} />
            </div>
            <div className={`text-2xl font-extrabold tracking-tight ${accentColors[i]}`}>{kpi.value}</div>
            {kpi.subtext && <span className="text-xs text-muted-foreground">{kpi.subtext}</span>}
          </div>
        );
      })}
    </div>
  );
}
