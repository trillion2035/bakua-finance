import {
  LayoutDashboard,
  FileText,
  Building2,
  Wallet,
  
  BarChart3,
  MessageSquare,
  Settings,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { mockCompany } from "@/data/mockDashboardData";

const menuItems = [
  { title: "Overview", url: "/dashboard", icon: LayoutDashboard },
  { title: "My Documents", url: "/dashboard/documents", icon: FileText },
  { title: "SPV Details", url: "/dashboard/spv", icon: Building2 },
  { title: "Capital & Fundraising", url: "/dashboard/capital", icon: Wallet },
  { title: "Performance", url: "/dashboard/performance", icon: BarChart3 },
  { title: "Messages", url: "/dashboard/messages", icon: MessageSquare },
  { title: "Settings", url: "/dashboard/settings", icon: Settings },
];

export function DashboardSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-border px-4 py-5">
        {!collapsed ? (
          <div>
            <div className="font-display text-sm font-bold text-foreground tracking-tight">
              {mockCompany.shortName}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5 truncate">
              {mockCompany.name}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <span className="font-display text-xs font-bold text-primary">
              {mockCompany.shortName.slice(0, 2)}
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
    </Sidebar>
  );
}
