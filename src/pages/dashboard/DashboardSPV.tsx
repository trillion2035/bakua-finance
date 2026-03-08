import {
  mockSPVEntity,
  mockScoreDimensions,
  mockLegalDocs,
  mockContractAddresses,
} from "@/data/mockSPVData";
import { mockSPV } from "@/data/mockDashboardData";
import {
  Building2,
  ExternalLink,
  FileCheck,
  Shield,
  Copy,
  ChevronDown,
  Eye,
  Download,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScoreBar } from "@/components/dashboard/spv/ScoreBar";
import { CopyButton } from "@/components/dashboard/spv/CopyButton";
import { SPVEntityInfo } from "@/components/dashboard/spv/SPVEntityInfo";
import { SPVAssetScore } from "@/components/dashboard/spv/SPVAssetScore";
import { SPVContracts } from "@/components/dashboard/spv/SPVContracts";
import { SPVLegalDocs } from "@/components/dashboard/spv/SPVLegalDocs";

export default function DashboardSPV() {
  const [openSPV, setOpenSPV] = useState<string | null>(mockSPV.id);

  return (
    <div className="p-6 md:p-8 max-w-[1200px] mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
          SPVs
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage and monitor your Special Purpose Vehicles
        </p>
      </div>

      {/* SPV-01 Accordion */}
      <Collapsible
        open={openSPV === mockSPV.id}
        onOpenChange={(open) => setOpenSPV(open ? mockSPV.id : null)}
      >
        <CollapsibleTrigger asChild>
          <button className="w-full border border-border rounded-lg p-4 bg-card flex items-center gap-3 hover:bg-secondary/50 transition-colors text-left">
            <Building2 className="h-5 w-5 text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-base font-bold text-foreground">{mockSPV.id} · {mockSPV.name}</span>
            </div>
            <Badge variant="outline" className="text-xs shrink-0">
              <Shield className="h-3 w-3 mr-1" /> {mockSPV.status}
            </Badge>
            <ChevronDown className={cn(
              "h-4 w-4 text-muted-foreground transition-transform shrink-0",
              openSPV === mockSPV.id && "rotate-180"
            )} />
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent className="space-y-6 mt-4">
          {/* Entity + Score */}
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
