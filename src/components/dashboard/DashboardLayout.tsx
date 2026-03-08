import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "./DashboardSidebar";
import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { SPVDataProvider, useSPVData } from "@/contexts/SPVDataContext";

function DashboardInner() {
  const { user, loading } = useAuth();
  const { profile } = useSPVData();
  const profileName = profile?.full_name || profile?.company_name || user?.email || "";

  if (loading) {
    return (
      <div className="light-page min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground text-sm">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full light-page">
        <DashboardSidebar />

        <div className="flex-1 flex flex-col min-w-0">
          {/* Top bar */}
          <header className="h-14 flex items-center gap-3 border-b border-border px-4 bg-background sticky top-0 z-30">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
            <div className="h-5 w-px bg-border" />
            <span className="text-[10px] tracking-[2px] text-muted-foreground font-semibold uppercase">
              Business Portal
            </span>
            <div className="ml-auto flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green" />
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  {profileName || user.email}
                </span>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
