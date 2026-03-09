import { Building2, Shield, ChevronDown, ExternalLink, TrendingUp, Users, Landmark, Calendar, DollarSign, FileText, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useOwnerSpvs, useSpvScoreDimensions, useSpvDocuments, useSpvContracts, useDocumentSubmission, useSpvMilestones, useInvestorSegments } from "@/hooks/useSpvData";
import { useGeneratedDocuments } from "@/hooks/useDeploymentData";
import { useAnalysisReport, useTermSheet } from "@/hooks/useAnalysisData";
import { ScoreBar } from "@/components/dashboard/spv/ScoreBar";
import { CopyButton } from "@/components/dashboard/spv/CopyButton";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardSPV() {
  const { user } = useAuth();
  const { data: spvs, isLoading: spvsLoading } = useOwnerSpvs();
  const spv = spvs?.[0];
  const [openSPV, setOpenSPV] = useState<string | null>(null);
  const [showAllDocs, setShowAllDocs] = useState(false);

  // Always fetch submission data (works even without SPV)
  const { data: submission, isLoading: subLoading } = useDocumentSubmission();
  const { data: analysisReport } = useAnalysisReport(submission?.id);
  const { data: termSheet } = useTermSheet(analysisReport?.id);
  const { data: generatedDocs } = useGeneratedDocuments(submission?.id);

  // SPV-specific queries (only when SPV exists)
  const { data: scoreDimensions } = useSpvScoreDimensions(spv?.id);
  const { data: legalDocs } = useSpvDocuments(spv?.id);
  const { data: contracts } = useSpvContracts(spv?.id);
  const { data: milestones } = useSpvMilestones(spv?.id);
  const { data: investorSegments } = useInvestorSegments(spv?.id);

  const isLoading = spvsLoading || subLoading;

  // Facility documents from generated_documents
  const facilityDocs = generatedDocs?.filter(d =>
    d.stage_key === "facility_doc_creation" && d.status === "signed"
  ) || [];

  // SPV docs from generated_documents
  const spvDocs = generatedDocs?.filter(d =>
    d.stage_key === "spv_doc_creation"
  ) || [];

  // SC deployment records
  const scDeploymentDocs = generatedDocs?.filter(d =>
    d.document_type === "sc_deployment_record" && d.status === "verified"
  ) || [];

  // Extract contract addresses from deployment records
  const deployedContracts = scDeploymentDocs.map(doc => {
    const content = doc.content || "";
    const addressMatch = content.match(/\*\*Contract Address:\*\*\s*`?(0x[a-fA-F0-9]{40})`?/);
    const networkMatch = content.match(/\*\*Network:\*\*\s*(.+)/);
    const nameMatch = content.match(/\*\*Contract Name:\*\*\s*(.+)/);
    const dateMatch = content.match(/\*\*Deployed At:\*\*\s*(.+)/);
    const network = networkMatch?.[1]?.trim().toLowerCase().includes("mainnet") ? "mainnet" : "testnet";
    return {
      id: doc.id,
      address: addressMatch?.[1] || "",
      network,
      name: nameMatch?.[1]?.trim() || "SPV Contract",
      deployed_date: dateMatch?.[1]?.trim() || new Date(doc.created_at).toLocaleDateString(),
    };
  }).filter(c => c.address);

  // Determine if we have anything to show
  const hasSpv = !!spv;
  const hasSubmission = !!submission && submission.status === "approved";
  const hasAnalysis = !!analysisReport && analysisReport.analysis_status === "completed";

  // Auto-open
  const itemId = spv?.id || submission?.id || null;
  if (itemId && openSPV === null) {
    setOpenSPV(itemId);
  }

  if (isLoading) {
    return <div className="p-6 md:p-8 text-muted-foreground">Loading SPVs...</div>;
  }

  if (!hasSpv && !hasSubmission) {
    return (
      <div className="p-6 md:p-8 max-w-[1200px] mx-auto">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground mb-2">SPVs</h1>
        <p className="text-sm text-muted-foreground">No SPVs created yet. Complete the document submission process to get started.</p>
      </div>
    );
  }

  // Build display data from SPV or fallback to submission/analysis
  const displayName = hasSpv
    ? `${spv.spv_code} · ${spv.name}`
    : submission?.project_description?.slice(0, 60) || "SPV in Progress";

  const displayStatus = hasSpv ? spv.status : (submission?.deployment_approved ? "deploying" : "approved");
  const displayGrade = hasAnalysis ? analysisReport.grade : null;
  const displayScore = hasAnalysis ? analysisReport.total_score : null;

  // Score dimensions from SPV or analysis report
  const displayScoreDimensions = (scoreDimensions && scoreDimensions.length > 0)
    ? scoreDimensions.map(d => ({ name: d.name, score: d.score, weight: d.weight || "" }))
    : (hasAnalysis && analysisReport.score_dimensions)
      ? (analysisReport.score_dimensions as any[]).map((d: any) => ({ name: d.name, score: d.score, weight: d.weight || "" }))
      : [];

  // Contracts from SPV or deployment records
  const displayContracts = (contracts && contracts.length > 0)
    ? contracts.map(c => ({ id: c.id, address: c.address, network: c.network || "testnet", name: c.name, deployed_date: c.deployed_date || "" }))
    : deployedContracts;

  // All legal documents
  const allLegalDocs = [
    ...(legalDocs || []).map((d, i) => ({ id: d.id, name: d.name, purpose: d.purpose || "", parties: d.parties || "", signedDate: d.signed_date || "", sortOrder: d.sort_order || i })),
    ...spvDocs.map((d, i) => ({ id: d.id, name: d.document_name, purpose: d.document_type.replace(/_/g, " "), parties: "", signedDate: d.signed_at ? new Date(d.signed_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "", sortOrder: 50 + i })),
    ...facilityDocs.map((d, i) => ({ id: d.id, name: d.document_name, purpose: d.document_type.replace(/_/g, " "), parties: "", signedDate: d.signed_at ? new Date(d.signed_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "", sortOrder: 100 + i })),
  ];
  // Deduplicate by name
  const seenNames = new Set<string>();
  const uniqueLegalDocs = allLegalDocs.filter(d => {
    if (seenNames.has(d.name)) return false;
    seenNames.add(d.name);
    return true;
  });
  const visibleDocs = showAllDocs ? uniqueLegalDocs : uniqueLegalDocs.slice(0, 4);

  const fundedPercent = hasSpv ? (spv.funded_percent || 0) : 0;
  const targetAmount = hasSpv ? (spv.target_amount || 0) : 0;
  const fundedAmount = hasSpv ? (spv.funded_amount || 0) : 0;

  return (
    <div className="p-6 md:p-8 max-w-[1200px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">SPVs</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage and monitor your Special Purpose Vehicles</p>
      </div>

      <Collapsible open={openSPV === itemId} onOpenChange={(open) => setOpenSPV(open ? itemId : null)}>
        <CollapsibleTrigger asChild>
          <button className="w-full border border-border rounded-lg p-4 bg-card flex items-center gap-3 hover:bg-secondary/50 transition-colors text-left">
            <Building2 className="h-5 w-5 text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-base font-bold text-foreground">{displayName}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {displayGrade && (
                <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                  <Award className="h-3 w-3 mr-1" /> {displayGrade}
                </Badge>
              )}
              <Badge variant="outline" className="text-xs">
                <Shield className="h-3 w-3 mr-1" /> {displayStatus}
              </Badge>
            </div>
            <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform shrink-0", openSPV === itemId && "rotate-180")} />
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent className="space-y-6 mt-4">
          {/* Overview KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-xs text-muted-foreground">Status</p>
              <p className="text-lg font-bold text-foreground capitalize">{displayStatus}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-xs text-muted-foreground">Asset Score</p>
              <p className="text-lg font-bold text-foreground">{displayScore ?? "—"}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-xs text-muted-foreground">Target IRR</p>
              <p className="text-lg font-bold text-foreground">{hasSpv ? (spv.target_irr || spv.projected_irr || "—") : (termSheet?.target_irr || "—")}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-xs text-muted-foreground">{hasSpv ? "Total Investors" : "Tenor"}</p>
              <p className="text-lg font-bold text-foreground">
                {hasSpv ? (spv.total_investors || 0) : (termSheet ? `${termSheet.tenor_months} months` : "—")}
              </p>
            </div>
          </div>

          {/* Entity Info + Asset Score */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Entity Info */}
            {hasSpv ? (
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
                    ["Asset Type", spv.asset_type],
                    ["Currency", spv.currency],
                  ].map(([label, value]) => (
                    <div key={label as string} className="flex justify-between gap-4">
                      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
                      <span className="text-xs font-medium text-foreground text-right">{value || "—"}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : hasAnalysis ? (
              <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Project Summary</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {analysisReport.project_summary?.slice(0, 500)}{analysisReport.project_summary && analysisReport.project_summary.length > 500 ? "..." : ""}
                </p>
                <div className="space-y-3 pt-2 border-t border-border">
                  {[
                    ["Industry", analysisReport.industry?.replace(/_/g, " ")],
                    ["Grade", `${analysisReport.grade} — ${analysisReport.grade_label}`],
                    ["Completeness", `${analysisReport.document_completeness_score}%`],
                    ["AI Engine", analysisReport.ai_model_version],
                  ].map(([label, value]) => (
                    <div key={label as string} className="flex justify-between gap-4">
                      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
                      <span className="text-xs font-medium text-foreground text-right capitalize">{value || "—"}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Asset Score Dimensions */}
            {displayScoreDimensions.length > 0 && (
              <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Asset Score™</h3>
                {displayScoreDimensions.map((dim, i) => (
                  <ScoreBar key={i} label={dim.name} score={dim.score} weight={dim.weight} />
                ))}
              </div>
            )}
          </div>

          {/* Term Sheet Key Terms (when no SPV) */}
          {!hasSpv && termSheet && (
            <div className="bg-card border border-border rounded-lg p-6 space-y-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Term Sheet — {termSheet.reference_code}</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Target IRR</p>
                  <p className="text-sm font-bold text-foreground">{termSheet.target_irr || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Effective Rate</p>
                  <p className="text-sm font-bold text-foreground">{termSheet.effective_rate || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Tenor</p>
                  <p className="text-sm font-bold text-foreground">{termSheet.tenor_months} months</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Valid Until</p>
                  <p className="text-sm font-bold text-foreground">{termSheet.valid_until || "—"}</p>
                </div>
              </div>
              {termSheet.conditions_precedent && (termSheet.conditions_precedent as any[]).length > 0 && (
                <div className="pt-2 border-t border-border">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Conditions Precedent</p>
                  <ul className="space-y-1">
                    {(termSheet.conditions_precedent as string[]).map((cp, i) => (
                      <li key={i} className="text-xs text-foreground flex items-start gap-2">
                        <span className="text-muted-foreground shrink-0">{i + 1}.</span>
                        {cp}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Capital & Fundraising (SPV only) */}
          {hasSpv && (targetAmount > 0 || (investorSegments && investorSegments.length > 0)) && (
            <div className="bg-card border border-border rounded-lg p-6 space-y-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Capital & Fundraising</h3>
              </div>
              {targetAmount > 0 && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Target Amount</p>
                      <p className="text-sm font-bold text-foreground">{spv.target_amount_usd || `${spv.currency} ${targetAmount.toLocaleString()}`}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Funded Amount</p>
                      <p className="text-sm font-bold text-foreground">{spv.currency} {fundedAmount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Disbursed</p>
                      <p className="text-sm font-bold text-foreground">{spv.disbursed_percent || 0}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">DSRA Reserve</p>
                      <p className="text-sm font-bold text-foreground">{spv.dsra_reserve || "—"}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Funding Progress</span>
                      <span className="font-medium text-foreground">{fundedPercent}%</span>
                    </div>
                    <Progress value={fundedPercent} className="h-2" />
                  </div>
                </div>
              )}
              {investorSegments && investorSegments.length > 0 && (
                <div className="space-y-2 pt-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Investor Segments</p>
                  <div className="space-y-2">
                    {investorSegments.map((seg) => (
                      <div key={seg.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <div>
                          <span className="text-sm font-medium text-foreground">{seg.name}</span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Users className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{seg.investor_count || 0} investors</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-foreground">{seg.usdc_raised || "—"}</span>
                          <p className="text-xs text-muted-foreground">{seg.percent_of_spv || "—"}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Milestones (SPV only) */}
          {milestones && milestones.length > 0 && (
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                  Disbursement Milestones ({milestones.filter(m => m.status === "disbursed").length}/{milestones.length})
                </h3>
              </div>
              <div className="space-y-2">
                {milestones.map((m) => (
                  <div key={m.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                    <div className={cn("h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                      m.status === "disbursed" ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"
                    )}>
                      {m.milestone_code?.replace("M", "") || "·"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-foreground">{m.name}</span>
                      {m.oracle_trigger && (
                        <p className="text-xs text-muted-foreground mt-0.5">Trigger: {m.oracle_trigger}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-sm font-bold text-foreground">{m.amount || "—"}</span>
                      {m.date_disbursed ? (
                        <p className="text-xs text-emerald-600">✓ {m.date_disbursed}</p>
                      ) : (
                        <p className="text-xs text-muted-foreground">Pending</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Smart Contracts */}
          {displayContracts.length > 0 && (
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <ExternalLink className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                  Smart Contracts — Base (Coinbase L2)
                </h3>
              </div>
              <div className="space-y-3">
                {displayContracts.map((c) => (
                  <div key={c.id} className="flex items-center justify-between gap-3 py-2 border-b border-border last:border-0">
                    <div className="min-w-0">
                      <span className="text-sm font-medium text-foreground block">{c.name}</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">{c.deployed_date}</span>
                        <Badge variant="outline" className="text-[10px]">
                          {c.network === "mainnet" ? "Mainnet" : "Testnet"}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="text-xs text-muted-foreground font-mono hidden sm:block">
                        {c.address.slice(0, 6)}...{c.address.slice(-4)}
                      </code>
                      <CopyButton text={c.address} />
                      <a
                        href={`https://${c.network === "mainnet" ? "basescan.org" : "sepolia.basescan.org"}/address/${c.address}`}
                        target="_blank" rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Legal Documents */}
          {uniqueLegalDocs.length > 0 && (
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Landmark className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                  Legal Documents ({uniqueLegalDocs.length})
                </h3>
              </div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-muted-foreground font-medium w-8">#</th>
                    <th className="text-left py-2 text-muted-foreground font-medium">Document</th>
                    <th className="text-left py-2 text-muted-foreground font-medium hidden md:table-cell">Type</th>
                    <th className="text-left py-2 text-muted-foreground font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleDocs.map((doc, idx) => (
                    <tr key={doc.id} className="border-b border-border last:border-0">
                      <td className="py-3 text-muted-foreground">{idx + 1}</td>
                      <td className="py-3 font-medium text-foreground">{doc.name}</td>
                      <td className="py-3 text-muted-foreground hidden md:table-cell capitalize">{doc.purpose}</td>
                      <td className="py-3">
                        {doc.signedDate ? (
                          <span className="text-emerald-600 font-medium">✓ {doc.signedDate}</span>
                        ) : (
                          <span className="text-muted-foreground">Draft</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {uniqueLegalDocs.length > 4 && (
                <button onClick={() => setShowAllDocs(!showAllDocs)} className="text-xs text-muted-foreground hover:text-foreground mt-3 flex items-center gap-1">
                  <ChevronDown className={cn("h-3 w-3 transition-transform", showAllDocs && "rotate-180")} />
                  {showAllDocs ? "Show fewer" : `Show all ${uniqueLegalDocs.length} documents`}
                </button>
              )}
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
