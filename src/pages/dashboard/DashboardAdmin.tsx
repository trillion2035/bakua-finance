import { useState } from "react";
import { FileSearch, Play, CheckCircle, XCircle, Clock, AlertTriangle, ChevronDown, ChevronUp, Loader2, Download, FileText, FileSpreadsheet, Send } from "lucide-react";
import { useAllSubmissionsWithAnalysis, useTriggerAnalysis, useTermSheet, useReleaseToClient } from "@/hooks/useAnalysisData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { generateAssetScorePDF, generateProjectDossierPDF, generateTermSheetPDF } from "@/lib/pdfGenerators";
import { toast } from "sonner";
import { AdminDeploymentPanel } from "@/components/dashboard/admin/AdminDeploymentPanel";

const INDUSTRIES = [
  { value: "agriculture", label: "Agriculture" },
  { value: "real_estate", label: "Real Estate" },
  { value: "trade_finance", label: "Trade Finance" },
  { value: "infrastructure", label: "Infrastructure" },
  { value: "renewable_energy", label: "Renewable Energy" },
];

function SubmissionRow({ submission }: { submission: any }) {
  const [expanded, setExpanded] = useState(false);
  const [selectedIndustry, setSelectedIndustry] = useState("agriculture");
  const triggerAnalysis = useTriggerAnalysis();
  const releaseToClient = useReleaseToClient();

  const report = submission.analysis_report;
  const profile = submission.profiles;

  // Fetch term sheet if report exists and passed
  const { data: termSheet } = useTermSheet(report?.id);

  const handleRunAnalysis = () => {
    triggerAnalysis.mutate({
      submissionId: submission.id,
      industry: selectedIndustry,
    });
  };

  const profileName = profile?.company_name || profile?.full_name || "Unknown";

  const handleDownloadAssetScore = () => {
    if (!report) return;
    try {
      const pdf = generateAssetScorePDF(report, profileName);
      pdf.save(`Asset-Score-${report.grade}-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success("Asset Score PDF downloaded");
    } catch (error) {
      toast.error("Failed to generate PDF");
    }
  };

  const handleDownloadDossier = () => {
    if (!report) return;
    try {
      const pdf = generateProjectDossierPDF(report, submission, profileName);
      pdf.save(`Project-Dossier-${profileName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success("Project Dossier PDF downloaded");
    } catch (error) {
      toast.error("Failed to generate PDF");
    }
  };

  const handleDownloadTermSheet = () => {
    if (!report || !termSheet) return;
    try {
      const pdf = generateTermSheetPDF(termSheet, report, profileName);
      pdf.save(`Term-Sheet-${termSheet.reference_code}.pdf`);
      toast.success("Term Sheet PDF downloaded");
    } catch (error) {
      toast.error("Failed to generate PDF");
    }
  };

  const getStatusBadge = () => {
    if (!report) {
      return (
        <Badge variant="outline" className="bg-muted text-muted-foreground">
          <Clock className="h-3 w-3 mr-1" /> Awaiting Analysis
        </Badge>
      );
    }

    switch (report.analysis_status) {
      case "processing":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" /> Processing
          </Badge>
        );
      case "completed":
        if (report.total_score >= 60) {
          return (
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
              <CheckCircle className="h-3 w-3 mr-1" /> {report.grade}
            </Badge>
          );
        }
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <XCircle className="h-3 w-3 mr-1" /> {report.grade} (Failed)
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <AlertTriangle className="h-3 w-3 mr-1" /> Analysis Failed
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-muted text-muted-foreground">
            <Clock className="h-3 w-3 mr-1" /> Pending
          </Badge>
        );
    }
  };

  return (
    <div className="border border-border rounded-lg bg-card overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 p-4 text-left hover:bg-muted/30 transition-colors"
      >
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <FileSearch className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">
            {profile?.company_name || profile?.full_name || "Unknown"}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            Submitted: {new Date(submission.submitted_at).toLocaleDateString()}
          </p>
        </div>
        {getStatusBadge()}
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-border pt-4">
          {/* PDF Download Buttons & Release - shown above tabs */}
          {report?.analysis_status === "completed" && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground mr-2">Download Reports:</span>
              <Button variant="outline" size="sm" onClick={handleDownloadAssetScore} className="gap-2">
                <Download className="h-3 w-3" /> Asset Score
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadDossier} className="gap-2">
                <FileText className="h-3 w-3" /> Project Dossier
              </Button>
              {termSheet && (
                <Button variant="outline" size="sm" onClick={handleDownloadTermSheet} className="gap-2">
                  <FileSpreadsheet className="h-3 w-3" /> Term Sheet
                </Button>
              )}
              {/* Release to client button */}
              {!submission.released_to_client ? (
                <Button
                  size="sm"
                  onClick={() => releaseToClient.mutate(submission.id)}
                  disabled={releaseToClient.isPending}
                  className="gap-2 ml-auto"
                >
                  {releaseToClient.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                  Release to Client
                </Button>
              ) : (
                <Badge variant="outline" className="ml-auto bg-emerald-50 text-emerald-700 border-emerald-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Released {submission.released_at ? new Date(submission.released_at).toLocaleDateString() : ""}
                </Badge>
              )}
            </div>
          )}

          {/* Action Buttons for analysis */}
          {(!report || report.analysis_status === "failed" || report.analysis_status === "pending") && (
            <div className="flex items-center gap-3">
              <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map((ind) => (
                    <SelectItem key={ind.value} value={ind.value}>{ind.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleRunAnalysis} disabled={triggerAnalysis.isPending} className="gap-2">
                {triggerAnalysis.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                Run AI Analysis
              </Button>
            </div>
          )}

          {report?.analysis_status === "processing" && (
            <div className="flex items-center gap-2 text-amber-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Analysis in progress...</span>
            </div>
          )}

          {/* Tabbed Panel (Asset Standardization / SPV Deployment / Listing) */}
          <AdminDeploymentPanel submission={submission} />
        </div>
      )}
    </div>
  );
}

export default function DashboardAdmin() {
  const { data: submissions, isLoading } = useAllSubmissionsWithAnalysis();

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 max-w-[1200px] mx-auto">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-[1200px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
          Admin: Document Analysis
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review submissions and trigger AI-powered asset standardization analysis
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Submissions</p>
          <p className="text-2xl font-bold text-foreground">{submissions?.length || 0}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Awaiting Analysis</p>
          <p className="text-2xl font-bold text-amber-600">
            {submissions?.filter(s => !s.analysis_report).length || 0}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Approved</p>
          <p className="text-2xl font-bold text-emerald-600">
            {submissions?.filter(s => s.analysis_report?.total_score >= 60).length || 0}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Rejected</p>
          <p className="text-2xl font-bold text-red-600">
            {submissions?.filter(s => s.analysis_report?.analysis_status === "completed" && s.analysis_report?.total_score < 60).length || 0}
          </p>
        </div>
      </div>

      {/* Submissions List */}
      <div className="space-y-3">
        {submissions?.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <FileSearch className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-base font-bold text-foreground">No submissions yet</h3>
            <p className="text-sm text-muted-foreground">
              Submissions will appear here when project owners submit their documents.
            </p>
          </div>
        ) : (
          submissions?.map((submission) => (
            <SubmissionRow key={submission.id} submission={submission} />
          ))
        )}
      </div>
    </div>
  );
}
