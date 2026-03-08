import { useSPVData } from "@/contexts/SPVDataContext";
import { ExternalLink } from "lucide-react";
import { CopyButton } from "./CopyButton";

export function SPVContracts() {
  const { spv, contracts } = useSPVData();
  if (!spv) return null;

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <ExternalLink className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Smart Contracts — {spv.network}</h2>
      </div>
      <div className="space-y-3">
        {contracts.map((c) => (
          <div key={c.id} className="flex items-center justify-between gap-3 py-2 border-b border-border last:border-0">
            <div className="min-w-0">
              <span className="text-sm font-medium text-foreground block">{c.name}</span>
              <span className="text-xs text-muted-foreground">{c.deployed_date}</span>
            </div>
            <div className="flex items-center gap-2">
              <code className="text-xs text-muted-foreground font-mono hidden sm:block">
                {c.address.slice(0, 6)}...{c.address.slice(-4)}
              </code>
              <CopyButton text={c.address} />
            </div>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-muted-foreground mt-3">Audited by {spv.auditor}</p>
    </div>
  );
}
