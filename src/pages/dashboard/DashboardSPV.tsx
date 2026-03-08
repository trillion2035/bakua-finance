import { useSPVData } from "@/contexts/SPVDataContext";
import { Building2, Shield, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { SPVEntityInfo } from "@/components/dashboard/spv/SPVEntityInfo";
import { SPVAssetScore } from "@/components/dashboard/spv/SPVAssetScore";
import { SPVContracts } from "@/components/dashboard/spv/SPVContracts";
import { SPVLegalDocs } from "@/components/dashboard/spv/SPVLegalDocs";

export default function DashboardSPV() {
  const { spv } = useSPVData();
  const [open, setOpen] = useState(true);

  if (!spv) return <div className="p-8 text-muted-foreground">No SPV found.</div>;

  return (
    <div className="p-6 md:p-8 max-w-[1200px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">SPVs</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage and monitor your Special Purpose Vehicles</p>
      </div>

      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <button className="w-full border border-border rounded-lg p-4 bg-card flex items-center gap-3 hover:bg-secondary/50 transition-colors text-left">
            <Building2 className="h-5 w-5 text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-base font-bold text-foreground">{spv.spv_code} · {spv.name}</span>
            </div>
            <Badge variant="outline" className="text-xs shrink-0">
              <Shield className="h-3 w-3 mr-1" /> {spv.status}
            </Badge>
            <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform shrink-0", open && "rotate-180")} />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-6 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SPVEntityInfo />
            <SPVAssetScore />
          </div>
          <SPVContracts />
          <SPVLegalDocs />
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
