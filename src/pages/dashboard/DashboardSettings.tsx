import { useState } from "react";
import { Building2, Users, Bell, Shield, Save, UserPlus, LogOut, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface NotifItem { key: string; label: string; desc: string; defaultOn: boolean }

function getNotificationItems(assetType: string): NotifItem[] {
  const common: NotifItem[] = [
    { key: "milestoneAlerts", label: "Milestone Disbursement Alerts", desc: "Get notified when oracle triggers are met and funds are released", defaultOn: true },
    { key: "investorMessages", label: "Investor Messages", desc: "Notifications for new messages from investors", defaultOn: true },
    { key: "weeklyReport", label: "Weekly Performance Report", desc: "Automated summary of key metrics", defaultOn: true },
    { key: "marketingEmails", label: "Marketing & Updates", desc: "Platform news and events", defaultOn: false },
  ];

  const lower = assetType.toLowerCase();

  if (lower.includes("energy") || lower.includes("solar")) {
    return [
      ...common.slice(0, 1),
      { key: "sensorAlerts", label: "Energy Sensor Alerts", desc: "Alerts when panel output, irradiance, or battery levels breach thresholds", defaultOn: true },
      ...common.slice(1, 3),
      { key: "irradianceUpdates", label: "Irradiance & Output Updates", desc: "Notifications when new solar irradiance or generation data is processed", defaultOn: false },
      common[3],
    ];
  }

  if (lower.includes("agri") || lower.includes("coffee") || lower.includes("farm")) {
    return [
      ...common.slice(0, 1),
      { key: "sensorAlerts", label: "IoT Sensor Alerts", desc: "Alerts when soil moisture, rainfall, or temperature breach thresholds", defaultOn: true },
      ...common.slice(1, 3),
      { key: "ndviUpdates", label: "NDVI Satellite Updates", desc: "Notifications when new satellite canopy data is processed", defaultOn: false },
      common[3],
    ];
  }

  if (lower.includes("real estate") || lower.includes("property")) {
    return [
      ...common.slice(0, 1),
      { key: "sensorAlerts", label: "Property Sensor Alerts", desc: "Alerts for occupancy, utility metering, or environmental sensors", defaultOn: true },
      ...common.slice(1, 3),
      { key: "valuationUpdates", label: "Valuation Updates", desc: "Notifications when property appraisals or rent roll data is updated", defaultOn: false },
      common[3],
    ];
  }

  // Generic fallback
  return [
    ...common.slice(0, 1),
    { key: "sensorAlerts", label: "IoT Sensor Alerts", desc: "Alerts when sensor readings breach thresholds", defaultOn: true },
    ...common.slice(1),
  ];
}

export default function DashboardSettings() {
  const { toast } = useToast();
  const { user, profile, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [companyName, setCompanyName] = useState(profile?.company_name || "");
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteText, setDeleteText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const assetType = user?.user_metadata?.asset_type || "";

  const notificationItems = getNotificationItems(assetType);

  const [notifications, setNotifications] = useState<Record<string, boolean>>(() => {
    const defaults: Record<string, boolean> = {};
    notificationItems.forEach((item) => { defaults[item.key] = item.defaultOn; });
    return defaults;
  });

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, company_name: companyName })
      .eq("user_id", user.id);
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      await refreshProfile();
      toast({ title: "Settings saved", description: "Your changes have been saved successfully." });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/signin");
  };

  const handleDeleteAccount = async () => {
    // Not yet functional
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your company profile and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="bg-secondary">
          <TabsTrigger value="profile" className="text-xs">Company Profile</TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs">Notifications</TabsTrigger>
          <TabsTrigger value="security" className="text-xs">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm">Company Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Full Name</Label>
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="text-sm" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Company Name</Label>
                  <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="text-sm" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Email</Label>
                  <Input value={user?.email || ""} disabled className="text-sm" />
                </div>
              </div>
              <Separator />
              <div className="flex justify-end">
                <Button size="sm" onClick={handleSave} disabled={saving}>
                  <Save className="h-4 w-4 mr-1" />{saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm">Notification Preferences</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: "milestoneAlerts" as const, label: "Milestone Disbursement Alerts", desc: "Get notified when oracle triggers are met" },
                { key: "sensorAlerts" as const, label: "IoT Sensor Alerts", desc: "Alerts when sensor readings breach thresholds" },
                { key: "investorMessages" as const, label: "Investor Messages", desc: "Notifications for new messages from investors" },
                { key: "weeklyReport" as const, label: "Weekly Performance Report", desc: "Automated summary of metrics" },
                { key: "ndviUpdates" as const, label: "NDVI Satellite Updates", desc: "Notifications when new satellite data is processed" },
                { key: "marketingEmails" as const, label: "Marketing & Updates", desc: "Platform news and events" },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between py-2">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch
                    checked={notifications[item.key]}
                    onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, [item.key]: checked }))}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm">Security</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-foreground">Active Sessions</p>
                  <p className="text-xs text-muted-foreground">1 active session — this device</p>
                </div>
                <Badge variant="outline" className="text-[10px]">Current</Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between py-2">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-foreground">Log Out</p>
                  <p className="text-xs text-muted-foreground">Sign out of your account</p>
                </div>
                <Button size="sm" variant="outline" className="gap-1.5" onClick={handleSignOut}>
                  <LogOut className="h-3.5 w-3.5" /> Log Out
                </Button>
              </div>
              <Separator />
              <div className="py-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium text-destructive">Delete Account</p>
                    <p className="text-xs text-muted-foreground">Permanently delete your account and all associated data. This action cannot be undone.</p>
                  </div>
                  {!showDeleteConfirm && (
                    <Button size="sm" variant="destructive" className="gap-1.5" onClick={() => setShowDeleteConfirm(true)}>
                      <Trash2 className="h-3.5 w-3.5" /> Delete Account
                    </Button>
                  )}
                </div>
                {showDeleteConfirm && (
                  <div className="mt-3 p-3 bg-destructive/5 border border-destructive/20 rounded-lg space-y-3">
                    <p className="text-xs text-muted-foreground">Type <span className="font-mono font-bold text-foreground">DELETE</span> to confirm account deletion.</p>
                    <Input
                      value={deleteText}
                      onChange={(e) => setDeleteText(e.target.value)}
                      placeholder="Type DELETE"
                      className="text-sm max-w-[200px]"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" variant="destructive" disabled={deleteText !== "DELETE" || deleting} onClick={handleDeleteAccount}>
                        {deleting ? "Deleting..." : "Permanently Delete"}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => { setShowDeleteConfirm(false); setDeleteText(""); }}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
