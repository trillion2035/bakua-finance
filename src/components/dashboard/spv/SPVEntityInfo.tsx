import { mockSPVEntity } from "@/data/mockSPVData";
import { mockSPV } from "@/data/mockDashboardData";
import { Building2, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function SPVEntityInfo() {
  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Building2 className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
          Entity Information
        </h2>
      </div>
      <div className="space-y-3 text-sm">
        {[
          ["Legal Name", mockSPVEntity.fullName],
          ["Registration No.", mockSPVEntity.registrationNo],
          ["Jurisdiction", mockSPVEntity.jurisdiction],
          ["Company Type", mockSPVEntity.companyType],
          ["Registered Office", mockSPVEntity.registeredOffice],
          ["Incorporation Date", mockSPVEntity.incorporationDate],
          ["Capital Social", mockSPVEntity.capitalSocial],
          ["Shareholder", mockSPVEntity.shareholder],
        ].map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4">
            <span className="text-muted-foreground shrink-0">{label}</span>
            <span className="text-foreground font-medium text-right">{value}</span>
          </div>
        ))}
      </div>
      <div className="pt-3 border-t border-border">
        <Badge variant="outline" className="text-xs">
          <Shield className="h-3 w-3 mr-1" /> {mockSPV.status}
        </Badge>
      </div>
    </div>
  );
}
