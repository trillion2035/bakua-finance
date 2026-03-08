import {
  LayoutDashboard,
  FileText,
  Building2,
  Wallet,
  BarChart3,
  Radio,
  MessageSquare,
  Settings,
  LogOut,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";

const menuItems = [
  { title: "Overview", url: "/dashboard", icon: LayoutDashboard },
  { title: "Documents", url: "/dashboard/documents", icon: FileText },
  { title: "SPVs", url: "/dashboard/spvs", icon: Building2 },
  { title: "Capital", url: "/dashboard/capital", icon: Wallet },
  { title: "Performance", url: "/dashboard/performance", icon: BarChart3 },
  { title: "Oracle", url: "/dashboard/oracle", icon: Radio },
  { title: "Messages", url: "/dashboard/messages", icon: MessageSquare },
  { title: "Settings", url: "/dashboard/settings", icon: Settings },
];

export function DashboardSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();

  const companyName = profile?.company_name || "My Company";
  const shortName = companyName.split(" ").map(w => w[0]).join("").slice(0, 4).toUpperCase();

  const handleSignOut = async () => {
    await signOut();
    navigate("/signin");
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-border px-4 py-5">
        {!collapsed ? (
          <div>
            <div className="text-sm font-bold text-foreground tracking-tight">
              {shortName}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5 truncate">
              {companyName}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <span className="text-xs font-bold text-primary">
              {shortName.slice(0, 2)}
            </span>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="pt-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive =
                  item.url === "/dashboard"
                    ? location.pathname === "/dashboard"
                    : location.pathname.startsWith(item.url);

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <NavLink
                        to={item.url}
                        end={item.url === "/dashboard"}
                        className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground transition-colors hover:text-foreground hover:bg-secondary"
                        activeClassName="bg-secondary text-foreground font-medium"
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Sign Out"
              onClick={handleSignOut}
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              {!collapsed && <span>Sign Out</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
