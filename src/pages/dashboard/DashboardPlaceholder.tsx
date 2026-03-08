import { useLocation } from "react-router-dom";
import { Construction } from "lucide-react";

export default function DashboardPlaceholder() {
  const location = useLocation();
  const segment = location.pathname.split("/").pop() || "";
  const title = segment.charAt(0).toUpperCase() + segment.slice(1);

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center space-y-3">
        <Construction className="h-10 w-10 text-muted-foreground mx-auto" />
        <h2 className="font-display text-xl font-bold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          This section is coming soon. We're building it out step by step.
        </p>
      </div>
    </div>
  );
}
