import { useState, useRef } from "react";
import {
  mockDocuments,
  categoryLabels,
  categoryIcons,
  type ProjectDocument,
  type DocumentCategory,
  type DocStatus,
  type DocSource,
} from "@/data/mockDocumentsData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  FileText,
  Upload,
  CheckCircle2,
  Clock,
  AlertCircle,
  CircleDashed,
  Download,
  Eye,
  ChevronDown,
  ChevronUp,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";

function StatusBadge({ status, note }: { status: DocStatus; note?: string }) {
  const config: Record<DocStatus, { label: string; className: string; icon: React.ReactNode }> = {
    verified: {
      label: note || "Verified",
      className: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: <CheckCircle2 className="h-3 w-3" />,
    },
    pending: {
      label: "Pending Review",
      className: "bg-amber-50 text-amber-700 border-amber-200",
      icon: <Clock className="h-3 w-3" />,
    },
    action_required: {
      label: "Action Required",
      className: "bg-red-50 text-red-700 border-red-200",
      icon: <AlertCircle className="h-3 w-3" />,
    },
    not_uploaded: {
      label: "Not Uploaded",
      className: "bg-slate-50 text-slate-500 border-slate-200",
      icon: <CircleDashed className="h-3 w-3" />,
    },
  };
  const c = config[status];
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border", c.className)}>
      {c.icon}
      {c.label}
    </span>
  );
}

function SourceBadge({ source }: { source: DocSource }) {
  return source === "platform" ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-600 border border-blue-200">
      Platform
    </span>
  ) : null;
}

function DocumentRow({ doc }: { doc: ProjectDocument }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-border rounded-lg bg-background hover:bg-muted/30 transition-colors">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 text-left"
      >
        <div className="w-9 h-10 rounded bg-muted flex items-center justify-center text-lg shrink-0">
          {categoryIcons[doc.category]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-foreground truncate">{doc.name}</span>
            <SourceBadge source={doc.source} />
          </div>
          {doc.fileName && (
            <span className="text-xs text-muted-foreground">{doc.fileName} · {doc.fileSize}</span>
          )}
        </div>
        <StatusBadge status={doc.status} note={doc.statusNote} />
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-0 border-t border-border">
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{doc.description}</p>
          {doc.uploadedDate && (
            <p className="text-xs text-muted-foreground mt-2">Uploaded: {doc.uploadedDate}</p>
          )}
          <div className="flex gap-2 mt-3">
            {doc.status !== "not_uploaded" && (
              <>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                  <Eye className="h-3.5 w-3.5" /> View
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                  <Download className="h-3.5 w-3.5" /> Download
                </Button>
              </>
            )}
            {(doc.status === "not_uploaded" || doc.status === "action_required") && (
              <Button size="sm" className="gap-1.5 text-xs">
                <Upload className="h-3.5 w-3.5" /> Upload
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function CategorySection({ category, docs }: { category: DocumentCategory; docs: ProjectDocument[] }) {
  if (docs.length === 0) return null;
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold tracking-wider uppercase text-muted-foreground flex items-center gap-2 px-1 pt-2">
        <span>{categoryIcons[category]}</span>
        {categoryLabels[category]}
        <span className="text-[10px] font-normal">({docs.length})</span>
      </h3>
      <div className="space-y-2">
        {docs.map((doc) => (
          <DocumentRow key={doc.id} doc={doc} />
        ))}
      </div>
    </div>
  );
}

function UploadDropZone() {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div
      onClick={() => fileRef.current?.click()}
      className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/40 hover:bg-muted/30 transition-colors"
    >
      <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
      <p className="text-sm font-medium text-foreground">Drop files here or click to upload</p>
      <p className="text-xs text-muted-foreground mt-1">
        PDF, JPG, PNG, XLSX, KML — max 20MB per file
      </p>
      <input ref={fileRef} type="file" className="hidden" multiple accept=".pdf,.jpg,.jpeg,.png,.xlsx,.xls,.kml" />
    </div>
  );
}

export default function DashboardDocuments() {
  const [activeTab, setActiveTab] = useState<"all" | "business" | "platform">("all");
  const [filterCategory, setFilterCategory] = useState<DocumentCategory | "all">("all");

  const filteredDocs = mockDocuments.filter((doc) => {
    if (activeTab === "business" && doc.source !== "business") return false;
    if (activeTab === "platform" && doc.source !== "platform") return false;
    if (filterCategory !== "all" && doc.category !== filterCategory) return false;
    return true;
  });

  const categories = Object.keys(categoryLabels) as DocumentCategory[];
  const groupedDocs = categories
    .map((cat) => ({ category: cat, docs: filteredDocs.filter((d) => d.category === cat) }))
    .filter((g) => g.docs.length > 0);

  const stats = {
    total: mockDocuments.length,
    verified: mockDocuments.filter((d) => d.status === "verified").length,
    pending: mockDocuments.filter((d) => d.status === "pending").length,
    action: mockDocuments.filter((d) => d.status === "action_required").length,
  };

  return (
    <div className="p-6 md:p-8 max-w-[1200px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-foreground">
            My Documents
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {stats.total} documents · {stats.verified} verified
          </p>
        </div>
        <UploadDropZone />
      </div>

      {/* Stats bar */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs text-emerald-600">
          <CheckCircle2 className="h-3.5 w-3.5" /> {stats.verified} Verified
        </div>
        <div className="flex items-center gap-1.5 text-xs text-amber-600">
          <Clock className="h-3.5 w-3.5" /> {stats.pending} Pending
        </div>
        <div className="flex items-center gap-1.5 text-xs text-red-600">
          <AlertCircle className="h-3.5 w-3.5" /> {stats.action} Action Required
        </div>
      </div>

      {/* Source tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList>
          <TabsTrigger value="all">All Documents</TabsTrigger>
          <TabsTrigger value="business">Submitted by You</TabsTrigger>
          <TabsTrigger value="platform">Generated</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Category filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="h-3.5 w-3.5 text-muted-foreground" />
        <button
          onClick={() => setFilterCategory("all")}
          className={cn(
            "text-xs px-2.5 py-1 rounded-full border transition-colors",
            filterCategory === "all"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-background text-muted-foreground border-border hover:border-primary/40"
          )}
        >
          All
        </button>
        {categories.filter((c) => c !== "platform").map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={cn(
              "text-xs px-2.5 py-1 rounded-full border transition-colors",
              filterCategory === cat
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-muted-foreground border-border hover:border-primary/40"
            )}
          >
            {categoryLabels[cat]}
          </button>
        ))}
      </div>

      {/* Document list grouped by category */}
      <div className="space-y-6">
        {groupedDocs.map((g) => (
          <CategorySection key={g.category} category={g.category} docs={g.docs} />
        ))}
        {groupedDocs.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No documents match your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
