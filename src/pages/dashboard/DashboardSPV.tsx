import { Building2, Shield, ChevronDown, ExternalLink, Eye, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useOwnerSpvs, useSpvScoreDimensions, useSpvDocuments, useSpvContracts, useDocumentSubmission } from "@/hooks/useSpvData";
import { useGeneratedDocuments } from "@/hooks/useDeploymentData";
import { ScoreBar } from "@/components/dashboard/spv/ScoreBar";
import { CopyButton } from "@/components/dashboard/spv/CopyButton";

export default function DashboardSPV() {
  const { data: spvs, isLoading } = useOwnerSpvs();
  const spv = spvs?.[0];
  const [openSPV, setOpenSPV] = useState<string | null>(null);
  const [showAllDocs, setShowAllDocs] = useState(false);

  const { data: scoreDimensions } = useSpvScoreDimensions(spv?.id);
  const { data: legalDocs } = useSpvDocuments(spv?.id);
  const { data: contracts } = useSpvContracts(spv?.id);
  const { data: submission } = useDocumentSubmission();
  const { data: generatedDocs } = useGeneratedDocuments(submission?.id);

  // Facility documents from generated_documents
  const facilityDocs = generatedDocs?.filter(d =>
    d.stage_key === "facility_doc_creation" && d.status === "signed"
  ) || [];

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

  // Combine spv_documents + facility generated docs for the legal docs section
  const allLegalDocs = [
    ...(legalDocs || []).map((d, i) => ({ id: d.id, name: d.name, purpose: d.purpose || "", parties: d.parties || "", signedDate: d.signed_date || "", sortOrder: d.sort_order || i })),
    ...facilityDocs.map((d, i) => ({ id: d.id, name: d.document_name, purpose: d.document_type, parties: "", signedDate: d.signed_at ? new Date(d.signed_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "", sortOrder: 100 + i })),
  ];
  const visibleDocs = showAllDocs ? allLegalDocs : allLegalDocs.slice(0, 4);

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
          {/* Entity Info + Asset Score */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-lg p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Entity Information</h3>
              </div>
              <div className="space-y-3">
                {[
                  ["Legal Name", spv.full_legal_name],
                  ["Registration No.", spv.registration_no],
                  ["Jurisdiction", spv.jurisdiction],
                  ["Company Type", spv.company_type],
                  ["Registered Office", spv.registered_office],
                  ["Incorporation Date", spv.incorporation_date],
                  ["Capital Social", spv.capital_social],
                  ["Shareholder", spv.shareholder],
                ].map(([label, value]) => (
                  <div key={label as string} className="flex justify-between gap-4">
                    <span className="text-xs text-muted-foreground shrink-0">{label}</span>
                    <span className="text-xs font-medium text-foreground text-right">{value || "—"}</span>
                  </div>
                ))}
              </div>
              <Badge variant="outline" className="text-xs mt-2">
                <Shield className="h-3 w-3 mr-1" /> {spv.status}
              </Badge>
            </div>

            {/* Asset Score */}
            {scoreDimensions && scoreDimensions.length > 0 && (
              <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Asset Score™</h3>
                {scoreDimensions.map((dim) => (
                  <ScoreBar key={dim.id} label={dim.name} score={dim.score} weight={dim.weight || ""} />
                ))}
              </div>
            )}
          </div>

          {/* Smart Contracts */}
          {contracts && contracts.length > 0 && (
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <ExternalLink className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                  Smart Contracts — {spv.network || "Base (Coinbase L2)"}
                </h3>
              </div>
              <div className="space-y-3">
                {contracts.map((c) => (
                  <div key={c.id} className="flex items-center justify-between gap-3 py-2 border-b border-border last:border-0">
                    <div className="min-w-0">
                      <span className="text-sm font-medium text-foreground block">{c.name}</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">{c.deployed_date}</span>
                        {(c as any).network && (
                          <Badge variant="outline" className="text-[10px]">
                            {(c as any).network === "mainnet" ? "Mainnet" : "Testnet"}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="text-xs text-muted-foreground font-mono hidden sm:block">
                        {c.address.slice(0, 6)}...{c.address.slice(-4)}
                      </code>
                      <CopyButton text={c.address} />
                      <a
                        href={`https://${(c as any).network === "mainnet" ? "basescan.org" : "sepolia.basescan.org"}/address/${c.address}`}
                        target="_blank" rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
              {spv.auditor && (
                <p className="text-[11px] text-muted-foreground mt-3">Audited by {spv.auditor}</p>
              )}
            </div>
          )}

          {/* Legal Documents */}
          {allLegalDocs.length > 0 && (
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <ExternalLink className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                  Legal Documents ({allLegalDocs.length})
                </h3>
              </div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-muted-foreground font-medium w-8">#</th>
                    <th className="text-left py-2 text-muted-foreground font-medium">Document</th>
                    <th className="text-left py-2 text-muted-foreground font-medium hidden md:table-cell">Purpose</th>
                    <th className="text-left py-2 text-muted-foreground font-medium hidden lg:table-cell">Parties</th>
                    <th className="text-left py-2 text-muted-foreground font-medium">Signed</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleDocs.map((doc, idx) => (
                    <tr key={doc.id} className="border-b border-border last:border-0">
                      <td className="py-3 text-muted-foreground">{idx + 1}</td>
                      <td className="py-3 font-medium text-foreground">{doc.name}</td>
                      <td className="py-3 text-muted-foreground hidden md:table-cell">{doc.purpose}</td>
                      <td className="py-3 text-muted-foreground hidden lg:table-cell">{doc.parties}</td>
                      <td className="py-3">
                        {doc.signedDate && (
                          <span className="text-emerald-600 font-medium">✓ {doc.signedDate}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {allLegalDocs.length > 4 && (
                <button onClick={() => setShowAllDocs(!showAllDocs)} className="text-xs text-muted-foreground hover:text-foreground mt-3 flex items-center gap-1">
                  <ChevronDown className={cn("h-3 w-3 transition-transform", showAllDocs && "rotate-180")} />
                  {showAllDocs ? "Show fewer" : `Show all ${allLegalDocs.length} documents`}
                </button>
              )}
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
