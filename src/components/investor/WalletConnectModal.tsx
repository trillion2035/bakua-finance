import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";

const wallets = [
  { id: "metamask", name: "MetaMask", desc: "Browser extension & mobile", icon: "🦊" },
  { id: "walletconnect", name: "WalletConnect", desc: "300+ compatible wallets", icon: "🔗" },
  { id: "coinbase", name: "Coinbase Wallet", desc: "Self-custody wallet", icon: "🔵" },
  { id: "ledger", name: "Ledger", desc: "Hardware wallet via bridge", icon: "🔒" },
];

type Step = "select" | "connecting" | "connected" | "error";

interface WalletConnectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnected: (wallet: string, address: string) => void;
}

export default function WalletConnectModal({ open, onOpenChange, onConnected }: WalletConnectModalProps) {
  const [step, setStep] = useState<Step>("select");
  const [selectedWallet, setSelectedWallet] = useState("");

  const handleSelect = (walletId: string) => {
    setSelectedWallet(walletId);
    setStep("connecting");

    // Simulate connection
    setTimeout(() => {
      setStep("connected");
      const mockAddress = "0x1a2b3c4d5e6f7890abcdef1234567890abcd9f3e";
      setTimeout(() => {
        onConnected(walletId, mockAddress);
        // Reset for next time
        setStep("select");
        setSelectedWallet("");
      }, 1200);
    }, 2000);
  };

  const handleClose = (val: boolean) => {
    if (step === "connecting") return; // prevent close during connection
    onOpenChange(val);
    if (!val) {
      setStep("select");
      setSelectedWallet("");
    }
  };

  const walletName = wallets.find((w) => w.id === selectedWallet)?.name ?? "";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="light-page sm:max-w-[420px] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="font-display text-xl font-extrabold tracking-tight">
            {step === "select" && "Connect Your Wallet"}
            {step === "connecting" && "Connecting..."}
            {step === "connected" && "Wallet Connected!"}
            {step === "error" && "Connection Failed"}
          </DialogTitle>
          <DialogDescription className="text-[13px] text-muted-foreground">
            {step === "select" && "Choose a wallet to sign in and start investing in infrastructure SPVs."}
            {step === "connecting" && `Please approve the connection in ${walletName}.`}
            {step === "connected" && "You're ready to invest in verified infrastructure SPVs."}
            {step === "error" && "Something went wrong. Please try again."}
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 pt-4">
          {step === "select" && (
            <div className="flex flex-col gap-2">
              {wallets.map((w) => (
                <button
                  key={w.id}
                  onClick={() => handleSelect(w.id)}
                  className="flex items-center gap-3.5 px-4 py-3.5 rounded-xl bg-secondary border border-border cursor-pointer hover:border-primary/40 transition-all text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-lg">
                    {w.icon}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">{w.name}</div>
                    <div className="text-[11px] text-muted-foreground">{w.desc}</div>
                  </div>
                </button>
              ))}
              <p className="text-[11px] text-muted-foreground/60 text-center mt-3 leading-relaxed">
                By connecting, you agree to our Terms of Service. Your assets remain in your custody.
              </p>
            </div>
          )}

          {step === "connecting" && (
            <div className="flex flex-col items-center py-8 gap-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
              <div className="text-center">
                <div className="font-display text-base font-bold mb-1">Awaiting approval</div>
                <p className="text-[13px] text-muted-foreground">Confirm the connection request in your {walletName} wallet.</p>
              </div>
            </div>
          )}

          {step === "connected" && (
            <div className="flex flex-col items-center py-8 gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--green))]/10 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-[hsl(var(--green))]" />
              </div>
              <div className="text-center">
                <div className="font-display text-base font-bold mb-1">Connected to {walletName}</div>
                <div className="text-[12px] text-muted-foreground font-mono bg-secondary px-3 py-1.5 rounded-lg mt-2">
                  0x1a2b...9f3e
                </div>
              </div>
            </div>
          )}

          {step === "error" && (
            <div className="flex flex-col items-center py-8 gap-4">
              <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
              <button
                onClick={() => setStep("select")}
                className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-[13px] font-semibold"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
