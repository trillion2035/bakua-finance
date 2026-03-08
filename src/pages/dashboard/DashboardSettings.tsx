import { useState } from "react";
import {
  Building2,
  Users,
  Bell,
  Shield,
  Save,
  UserPlus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { mockCompanyProfile, mockTeamMembers } from "@/data/mockMessagesSettingsData";

export default function DashboardSettings() {
  const { toast } = useToast();
  const [profile, setProfile] = useState(mockCompanyProfile);
  const [notifications, setNotifications] = useState({
    milestoneAlerts: true,
    sensorAlerts: true,
    investorMessages: true,
    weeklyReport: true,
    ndviUpdates: false,
    marketingEmails: false,
  });

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your changes have been saved successfully.",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your company profile, team, and notification preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="bg-secondary">
          <TabsTrigger value="profile" className="text-xs">Company Profile</TabsTrigger>
          <TabsTrigger value="team" className="text-xs">Team</TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs">Notifications</TabsTrigger>
          <TabsTrigger value="security" className="text-xs">Security</TabsTrigger>
        </TabsList>

        {/* Company Profile */}
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm">Company Information</CardTitle>
              </div>
              <CardDescription className="text-xs">
                This information is displayed to investors and on your SPV listing.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Company Name</Label>
                  <Input
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Short Name</Label>
                  <Input
                    value={profile.shortName}
                    onChange={(e) => setProfile({ ...profile, shortName: e.target.value })}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Registration No.</Label>
                  <Input value={profile.registrationNo} disabled className="text-sm" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Tax ID</Label>
                  <Input value={profile.taxId} disabled className="text-sm" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Country</Label>
                  <Input value={profile.country} disabled className="text-sm" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Region</Label>
                  <Input
                    value={profile.region}
                    onChange={(e) => setProfile({ ...profile, region: e.target.value })}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-xs">Address</Label>
                  <Input
                    value={profile.address}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Phone</Label>
                  <Input
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Email</Label>
                  <Input
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="text-sm"
                  />
                </div>
              </div>
              <Separator />
              <div className="flex justify-end">
                <Button size="sm" onClick={handleSave}>
                  <Save className="h-4 w-4 mr-1" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team */}
        <TabsContent value="team" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-sm">Team Members</CardTitle>
                </div>
                <Button size="sm" variant="outline" onClick={() => toast({ title: "Coming soon", description: "Team invitations will be available once backend is connected." })}>
                  <UserPlus className="h-4 w-4 mr-1" />
                  Invite
                </Button>
              </div>
              <CardDescription className="text-xs">
                Manage who has access to this dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Name</TableHead>
                    <TableHead className="text-xs">Email</TableHead>
                    <TableHead className="text-xs">Role</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockTeamMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="text-xs font-medium">{member.name}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{member.email}</TableCell>
                      <TableCell>
                        <Badge variant={member.role === "Admin" ? "default" : "secondary"} className="text-[10px]">
                          {member.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={member.status === "active" ? "outline" : "secondary"} className="text-[10px]">
                          {member.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm">Notification Preferences</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Choose which notifications you want to receive.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: "milestoneAlerts" as const, label: "Milestone Disbursement Alerts", desc: "Get notified when oracle triggers are met and funds are released" },
                { key: "sensorAlerts" as const, label: "IoT Sensor Alerts", desc: "Alerts when sensor readings breach thresholds or devices go offline" },
                { key: "investorMessages" as const, label: "Investor Messages", desc: "Notifications for new messages from investors" },
                { key: "weeklyReport" as const, label: "Weekly Performance Report", desc: "Automated summary of harvest, sensor, and financial metrics" },
                { key: "ndviUpdates" as const, label: "NDVI Satellite Updates", desc: "Notifications when new Sentinel-2 satellite data is processed" },
                { key: "marketingEmails" as const, label: "Marketing & Updates", desc: "Bakua platform news, feature updates, and events" },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between py-2">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch
                    checked={notifications[item.key]}
                    onCheckedChange={(checked) =>
                      setNotifications((prev) => ({ ...prev, [item.key]: checked }))
                    }
                  />
                </div>
              ))}
              <Separator />
              <div className="flex justify-end">
                <Button size="sm" onClick={handleSave}>
                  <Save className="h-4 w-4 mr-1" />
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm">Security</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Manage your account security and authentication.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-foreground">Two-Factor Authentication</p>
                  <p className="text-xs text-muted-foreground">Add an extra layer of security to your account</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => toast({ title: "Coming soon", description: "2FA will be available once authentication is connected." })}>
                  Enable
                </Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between py-2">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-foreground">Change Password</p>
                  <p className="text-xs text-muted-foreground">Update your account password</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => toast({ title: "Coming soon", description: "Password management will be available once authentication is connected." })}>
                  Update
                </Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between py-2">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-foreground">Active Sessions</p>
                  <p className="text-xs text-muted-foreground">1 active session — this device</p>
                </div>
                <Badge variant="outline" className="text-[10px]">Current</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
