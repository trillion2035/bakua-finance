import { useState } from "react";
import { mockLegalDocs } from "@/data/mockSPVData";
import { FileCheck, Eye, Download, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SPVLegalDocs() {
  const [showAllDocs, setShowAllDocs] = useState(false);
  const visibleDocs = showAllDocs ? mockLegalDocs : mockLegalDocs.slice(0, 4);

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <FileCheck className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
          Legal Documents ({mockLegalDocs.length})
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-3 text-xs text-muted-foreground font-semibold">#</th>
              <th className="text-left py-2 pr-3 text-xs text-muted-foreground font-semibold">Document</th>
              <th className="text-left py-2 pr-3 text-xs text-muted-foreground font-semibold hidden md:table-cell">Purpose</th>
              <th className="text-left py-2 pr-3 text-xs text-muted-foreground font-semibold hidden lg:table-cell">Parties</th>
              <th className="text-left py-2 pr-3 text-xs text-muted-foreground font-semibold">Signed</th>
              <th className="text-right py-2 text-xs text-muted-foreground font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visibleDocs.map((doc) => (
              <tr key={doc.id} className="border-b border-border last:border-0">
                <td className="py-2.5 pr-3 text-muted-foreground">{doc.id}</td>
                <td className="py-2.5 pr-3 font-medium text-foreground">{doc.name}</td>
                <td className="py-2.5 pr-3 text-muted-foreground text-xs hidden md:table-cell max-w-[280px]">{doc.purpose}</td>
                <td className="py-2.5 pr-3 text-muted-foreground text-xs hidden lg:table-cell">{doc.parties}</td>
                <td className="py-2.5 pr-3">
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                    ✓ {doc.signedDate}
                  </span>
                </td>
                <td className="py-2.5 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="View document">
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Download document">
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {mockLegalDocs.length > 4 && (
        <Button variant="ghost" size="sm" className="mt-2 gap-1 text-xs" onClick={() => setShowAllDocs(!showAllDocs)}>
          {showAllDocs ? <><ChevronUp className="h-3 w-3" /> Show less</> : <><ChevronDown className="h-3 w-3" /> Show all {mockLegalDocs.length} documents</>}
        </Button>
      )}
    </div>
  );
}
