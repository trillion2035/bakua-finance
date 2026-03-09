import { useRef } from "react";
import { Upload, FileText, FolderOpen, Download, Eye } from "lucide-react";
import { useOwnerSpvs, useSpvDocuments, useUserUploadedDocuments, useDocumentSubmission } from "@/hooks/useSpvData";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

function UploadDropZone() {
  const fileRef = useRef<HTMLInputElement>(null);
  return (
    <div
      onClick={() => fileRef.current?.click()}
      className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/40 hover:bg-muted/30 transition-colors"
    >
      <Upload className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
      <p className="text-sm font-medium text-foreground">Drop files or click to upload</p>
      <p className="text-xs text-muted-foreground mt-1">PDF, DOCX — max 10MB</p>
      <input ref={fileRef} type="file" className="hidden" multiple accept=".pdf,.docx" />
    </div>
  );
}

function formatDocName(fileName: string): string {
  // Remove timestamp and extension, format nicely
  // e.g. "business-plan-1773015683298.docx" -> "Business Plan"
  const withoutTimestamp = fileName.replace(/-\d{13,}/, "");
  const withoutExt = withoutTimestamp.replace(/\.(pdf|docx)$/i, "");
  return withoutExt
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatCategory(category: string): string {
  return category.charAt(0).toUpperCase() + category.slice(1);
}

function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    project: "📋",
    legal: "⚖️",
    financial: "💰",
    contracts: "📝",
    sector: "🌱",
    identity: "🪪",
  };
  return icons[category.toLowerCase()] || "📄";
}

export default function DashboardDocuments() {
  const { data: spvs, isLoading: loadingSpvs } = useOwnerSpvs();
  const spv = spvs?.[0];
  const { data: spvDocs, isLoading: loadingSpvDocs } = useSpvDocuments(spv?.id);
  const { data: uploadedDocs, isLoading: loadingUploaded } = useUserUploadedDocuments();
  const { data: submission } = useDocumentSubmission();

  const isLoading = loadingSpvs || loadingSpvDocs || loadingUploaded;

  if (isLoading) {
    return <div className="p-6 text-muted-foreground">Loading...</div>;
  }

  // If user has SPV, show SPV documents
  if (spv && spvDocs && spvDocs.length > 0) {
    return (
      <div className="p-6 md:p-8 max-w-[1200px] mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">My Documents</h1>
            <p className="text-sm text-muted-foreground mt-1">{spvDocs.length} document{spvDocs.length !== 1 ? "s" : ""}</p>
          </div>
          <UploadDropZone />
        </div>

        <div className="space-y-3">
          {spvDocs.map((doc) => (
            <div key={doc.id} className="bg-card border border-border rounded-lg p-4 flex items-center gap-3">
              <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
                {doc.purpose && <p className="text-xs text-muted-foreground truncate">{doc.purpose}</p>}
              </div>
              {doc.signed_date && <span className="text-xs text-muted-foreground shrink-0">{doc.signed_date}</span>}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // If user has uploaded documents (from wizard), show those
  if (uploadedDocs && uploadedDocs.length > 0) {
    // Group by category
    const grouped = uploadedDocs.reduce((acc, doc) => {
      const cat = doc.category;
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(doc);
      return acc;
    }, {} as Record<string, typeof uploadedDocs>);

    const handleDownload = async (path: string, fileName: string) => {
      const { data } = await supabase.storage
        .from("project-documents")
        .download(path);
      if (data) {
        const url = URL.createObjectURL(data);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
      }
    };

    return (
      <div className="p-6 md:p-8 max-w-[1200px] mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">My Documents</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {uploadedDocs.length} document{uploadedDocs.length !== 1 ? "s" : ""} uploaded
              {submission && " · Processing"}
            </p>
          </div>
        </div>

        {submission && (
          <div className="bg-gold/5 border border-gold/20 rounded-lg p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center shrink-0">
              <FileText className="h-4 w-4 text-gold" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Documents Under Review</p>
              <p className="text-xs text-muted-foreground">
                Your documents are currently being processed. We'll notify you when the review is complete.
              </p>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {Object.entries(grouped).map(([category, docs]) => (
            <div key={category} className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">{getCategoryIcon(category)}</span>
                <h3 className="text-sm font-semibold text-foreground">{formatCategory(category)}</h3>
                <span className="text-xs text-muted-foreground">({docs.length})</span>
              </div>
              <div className="space-y-2">
                {docs.map((doc) => (
                  <div key={doc.path} className="bg-card border border-border rounded-lg p-4 flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{formatDocName(doc.name)}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {new Date(doc.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-1.5 text-xs shrink-0"
                      onClick={() => handleDownload(doc.path, doc.name)}
                    >
                      <Download className="h-3.5 w-3.5" /> Download
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  return (
    <div className="p-6 md:p-8 max-w-[1200px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">My Documents</h1>
          <p className="text-sm text-muted-foreground mt-1">0 documents</p>
        </div>
      </div>
      <div className="bg-card border border-border rounded-lg p-12 text-center space-y-3">
        <FolderOpen className="h-10 w-10 text-muted-foreground mx-auto" />
        <h3 className="text-base font-bold text-foreground">No documents yet</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Documents will appear here once you submit your project documents through the Overview tab. Start by clicking "Submit Documents" on the Process Status pipeline.
        </p>
      </div>
    </div>
  );
}