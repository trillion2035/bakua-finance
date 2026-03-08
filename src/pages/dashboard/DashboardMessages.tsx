import { useState } from "react";
import {
  Mail,
  MailOpen,
  ArrowLeft,
  Circle,
  Building2,
  Users,
  Bot,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { mockMessages, type Message } from "@/data/mockMessagesSettingsData";

const channelMeta: Record<string, { label: string; icon: React.ElementType; variant: "default" | "secondary" | "outline" }> = {
  platform: { label: "Platform", icon: Bot, variant: "secondary" },
  investor: { label: "Investor", icon: Users, variant: "default" },
  bakua: { label: "Internal", icon: Building2, variant: "outline" },
};

export default function DashboardMessages() {
  const [selected, setSelected] = useState<Message | null>(null);
  const [messages, setMessages] = useState(mockMessages);

  const unreadCount = messages.filter((m) => !m.read).length;

  const handleSelect = (msg: Message) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === msg.id ? { ...m, read: true } : m))
    );
    setSelected({ ...msg, read: true });
  };

  if (selected) {
    const ch = channelMeta[selected.channel];
    return (
      <div className="space-y-6">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelected(null)}
            className="mb-2 -ml-2 text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to inbox
          </Button>
          <h1 className="font-display text-xl font-bold text-foreground">
            {selected.subject}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
              {selected.avatar}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{selected.from}</p>
              <p className="text-[11px] text-muted-foreground">{selected.role} · {selected.date}</p>
            </div>
            <Badge variant={ch.variant} className="text-[10px] ml-auto">
              <ch.icon className="h-3 w-3 mr-1" />
              {ch.label}
            </Badge>
          </div>
        </div>
        <Separator />
        <Card>
          <CardContent className="p-6">
            <div className="whitespace-pre-wrap text-sm text-foreground leading-relaxed">
              {selected.body}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-foreground">Messages</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {unreadCount > 0
              ? `${unreadCount} unread message${unreadCount > 1 ? "s" : ""}`
              : "All caught up"}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {messages.map((msg) => {
          const ch = channelMeta[msg.channel];
          return (
            <Card
              key={msg.id}
              className={`cursor-pointer transition-colors hover:bg-secondary/50 ${
                !msg.read ? "border-primary/30 bg-primary/5" : ""
              }`}
              onClick={() => handleSelect(msg)}
            >
              <CardContent className="p-4 flex items-start gap-3">
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0 mt-0.5">
                  {msg.avatar}
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground truncate">
                      {msg.from}
                    </span>
                    <Badge variant={ch.variant} className="text-[9px] shrink-0">
                      {ch.label}
                    </Badge>
                    {!msg.read && (
                      <Circle className="h-2 w-2 fill-primary text-primary shrink-0" />
                    )}
                    <span className="text-[11px] text-muted-foreground ml-auto shrink-0">
                      {msg.date}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-foreground truncate">
                    {msg.subject}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {msg.preview}
                  </p>
                </div>
                {msg.read ? (
                  <MailOpen className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                ) : (
                  <Mail className="h-4 w-4 text-primary shrink-0 mt-1" />
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
