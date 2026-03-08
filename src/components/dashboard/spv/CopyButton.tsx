import { useState } from "react";
import { Copy } from "lucide-react";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="text-muted-foreground hover:text-foreground transition-colors"
    >
      {copied ? <span className="text-[10px] text-emerald-600">Copied</span> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}
