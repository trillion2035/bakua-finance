import { Building2, Shield, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useOwnerSpvs, useSpvScoreDimensions, useSpvDocuments, useSpvContracts } from "@/hooks/useSpvData";
import { ScoreBar } from "@/components/dashboard/spv/ScoreBar";
import { CopyButton } from "@/components/dashboard/spv/CopyButton";

export default function DashboardSPV() {
  const { data: spvs, isLoading } = useOwnerSpvs();
  const spv = spvs?.[0];
  const [openSPV, setOpenSPV] = useState<string | null>(null);

  const { data: scoreDimensions } = useSpvScoreDimensions(spv?.id);
  const { data: legalDocs } = useSpvDocuments(spv?.id);
  const { data: contracts } = useSpvContracts(spv?.id);

  // Auto-open first SPV
  if (spv && openSPV === null) {
    setOpenSPV(spv.id);
  }

  if (isLoading) {
    return <div className="p-6 md:p-8 text-muted-foreground">Loading SPVs...</div>;
  }

  if (!spv) {
    return (
      <div className="p-6 md:p-8 max-w-[1200px] mx-auto">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground mb-2">SPVs</h1>
        <p className="text-sm text-muted-foreground">No SPVs created yet. Complete the document submission process to get started.</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-[1200px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">SPVs</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage and monitor your Special Purpose Vehicles</p>
      </div>

      <Collapsible open={openSPV === spv.id} onOpenChange={(open) => setOpenSPV(open ? spv.id : null)}>
        <CollapsibleTrigger asChild>
          <button className="w-full border border-border rounded-lg p-4 bg-card flex items-center gap-3 hover:bg-secondary/50 transition-colors text-left">
            <Building2 className="h-5 w-5 text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-base font-bold text-foreground">{spv.spv_code} · {spv.name}</span>
            </div>
            <Badge variant="outline" className="text-xs shrink-0">
              <Shield className="h-3 w-3 mr-1" /> {spv.status}
            </Badge>
            <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform shrink-0", openSPV === spv.id && "rotate-180")} />
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent className="space-y-6 mt-4">
          {/* Entity Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-lg p-6 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Entity Information</h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                {[
                  ["Full Legal Name", spv.full_legal_name],
                  ["Registration No.", spv.registration_no],
                  ["Jurisdiction", spv.jurisdiction],
                  ["Company Type", spv.company_type],
                  ["Registered Office", spv.registered_office],
                  ["Incorporation Date", spv.incorporation_date],
                  ["Capital Social", spv.capital_social],
                  ["Shareholder", spv.shareholder],
                  ["Network", spv.network],
                  ["Auditor", spv.auditor],
                ].map(([label, value]) => (
                  <div key={label as string}>
                    <div className="text-muted-foreground">{label}</div>
                    <div className="font-medium text-foreground mt-0.5">{value || "—"}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Asset Score */}
            <div className="bg-card border border-border rounded-lg p-6 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Asset Score™</h3>
              {scoreDimensions?.map((dim) => (
                <ScoreBar key={dim.id} label={dim.name} score={dim.score} weight={dim.weight || ""} />
              ))}
            </div>
          </div>

          {/* Contracts */}
          {contracts && contracts.length > 0 && (
            <div className="bg-card border border-border rounded-lg p-6 space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Smart Contracts</h3>
              {contracts.map((c) => (
                <div key={c.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <div className="text-sm font-medium text-foreground">{c.name}</div>
                    <div className="text-[11px] text-muted-foreground">Deployed: {c.deployed_date}</div>
                  </div>
                  <CopyButton text={c.address} />
                </div>
              ))}
            </div>
          )}

          {/* Legal Docs */}
          {legalDocs && legalDocs.length > 0 && (
            <div className="bg-card border border-border rounded-lg p-6 space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Legal Documents</h3>
              {legalDocs.map((doc) => (
                <div key={doc.id} className="py-2 border-b border-border last:border-0">
                  <div className="text-sm font-medium text-foreground">{doc.name}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{doc.purpose}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{doc.parties} · {doc.signed_date}</div>
                </div>
              ))}
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
