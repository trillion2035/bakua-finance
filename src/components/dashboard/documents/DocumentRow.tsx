import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Download, Eye, ChevronDown, ChevronUp, PenLine } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBadge } from "./StatusBadge";
import type { ProjectDocument } from "@/data/mockDocumentsData";
import { categoryIcons } from "@/data/mockDocumentsData";

function SourceBadge({ source }: { source: "business" | "platform" }) {
  return source === "platform" ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-600 border border-blue-200">
      Platform
    </span>
  ) : null;
}

export function DocumentRow({ doc }: { doc: ProjectDocument }) {
  const [expanded, setExpanded] = useState(false);
  const isLocked = doc.status === "locked";

  return (
    <div className={cn(
      "border border-border rounded-lg transition-colors",
      isLocked ? "bg-muted/20 opacity-60" : "bg-background hover:bg-muted/30"
    )}>
      <button
        onClick={() => !isLocked && setExpanded(!expanded)}
        className={cn("w-full flex items-center gap-3 p-4 text-left", isLocked && "cursor-not-allowed")}
        disabled={isLocked}
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
        {!isLocked && (expanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        ))}
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-0 border-t border-border">
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{doc.description}</p>
          {doc.uploadedDate && (
            <p className="text-xs text-muted-foreground mt-2">Uploaded: {doc.uploadedDate}</p>
          )}
          <div className="flex gap-2 mt-3 flex-wrap">
            {doc.actions.includes("view") && (
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <Eye className="h-3.5 w-3.5" /> View
              </Button>
            )}
            {doc.actions.includes("download") && (
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <Download className="h-3.5 w-3.5" /> Download
              </Button>
            )}
            {doc.actions.includes("sign") && (
              <Button size="sm" className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white">
                <PenLine className="h-3.5 w-3.5" /> Sign
              </Button>
            )}
            {doc.actions.includes("upload") && (
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
