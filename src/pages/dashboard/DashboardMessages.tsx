import { useState } from "react";
import {
  Mail,
  MailOpen,
  ArrowLeft,
  Circle,
  Building2,
  Users,
  Bot,
  MessageSquare,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: string;
  title: string;
  description: string | null;
  type: string;
  read: boolean | null;
  created_at: string;
}

const channelMeta: Record<string, { label: string; icon: React.ElementType; variant: "default" | "secondary" | "outline" }> = {
  platform: { label: "Platform", icon: Bot, variant: "secondary" },
  investor: { label: "Investor", icon: Users, variant: "default" },
  internal: { label: "Internal", icon: Building2, variant: "outline" },
};

export default function DashboardMessages() {
  const [selected, setSelected] = useState<Message | null>(null);
  const { user } = useAuth();

  const { data: messages = [], refetch } = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Message[];
    },
    enabled: !!user,
  });

  const unreadCount = messages.filter((m) => !m.read).length;

  const handleSelect = async (msg: Message) => {
    if (!msg.read) {
      await supabase.from("notifications").update({ read: true }).eq("id", msg.id);
      refetch();
    }
    setSelected({ ...msg, read: true });
  };

  if (selected) {
    const ch = channelMeta[selected.type] || channelMeta.platform;
    return (
      <div className="space-y-6">
        <div>
          <Button variant="ghost" size="sm" onClick={() => setSelected(null)} className="mb-2 -ml-2 text-muted-foreground">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to inbox
          </Button>
          <h1 className="text-xl font-bold text-foreground">{selected.title}</h1>
          <div className="flex items-center gap-3 mt-2">
            <Badge variant={ch.variant} className="text-[10px]">
              <ch.icon className="h-3 w-3 mr-1" /> {ch.label}
            </Badge>
            <span className="text-[11px] text-muted-foreground">
              {new Date(selected.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
          </div>
        </div>
        <Separator />
        <Card>
          <CardContent className="p-6">
            <div className="whitespace-pre-wrap text-sm text-foreground leading-relaxed">
              {selected.description || "No content."}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Messages</h1>
          <p className="text-sm text-muted-foreground mt-1">All caught up</p>
        </div>
        <Card>
          <CardContent className="p-12 text-center space-y-3">
            <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto" />
            <h3 className="text-base font-bold text-foreground">No messages yet</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Messages and notifications will appear here as your project progresses through the pipeline.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Messages</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {unreadCount > 0 ? `${unreadCount} unread message${unreadCount > 1 ? "s" : ""}` : "All caught up"}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {messages.map((msg) => {
          const ch = channelMeta[msg.type] || channelMeta.platform;
          return (
            <Card
              key={msg.id}
              className={`cursor-pointer transition-colors hover:bg-secondary/50 ${!msg.read ? "border-primary/30 bg-primary/5" : ""}`}
              onClick={() => handleSelect(msg)}
            >
              <CardContent className="p-4 flex items-start gap-3">
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground truncate">{msg.title}</span>
                    <Badge variant={ch.variant} className="text-[9px] shrink-0">{ch.label}</Badge>
                    {!msg.read && <Circle className="h-2 w-2 fill-primary text-primary shrink-0" />}
                    <span className="text-[11px] text-muted-foreground ml-auto shrink-0">
                      {new Date(msg.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                  {msg.description && <p className="text-xs text-muted-foreground truncate">{msg.description}</p>}
                </div>
                {msg.read ? <MailOpen className="h-4 w-4 text-muted-foreground shrink-0 mt-1" /> : <Mail className="h-4 w-4 text-primary shrink-0 mt-1" />}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
