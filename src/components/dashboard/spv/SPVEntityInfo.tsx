import { useSPVData } from "@/contexts/SPVDataContext";
import { Building2, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function SPVEntityInfo() {
  const { spv } = useSPVData();
  if (!spv) return null;

  const fields = [
    ["Legal Name", spv.full_legal_name],
    ["Registration No.", spv.registration_no],
    ["Jurisdiction", spv.jurisdiction],
    ["Company Type", spv.company_type],
    ["Registered Office", spv.registered_office],
    ["Incorporation Date", spv.incorporation_date],
    ["Capital Social", spv.capital_social],
    ["Shareholder", spv.shareholder],
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Building2 className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Entity Information</h2>
      </div>
      <div className="space-y-3 text-sm">
        {fields.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4">
            <span className="text-muted-foreground shrink-0">{label}</span>
            <span className="text-foreground font-medium text-right">{value || "—"}</span>
          </div>
        ))}
      </div>
      <div className="pt-3 border-t border-border">
        <Badge variant="outline" className="text-xs">
          <Shield className="h-3 w-3 mr-1" /> {spv.status}
        </Badge>
      </div>
    </div>
  );
}
