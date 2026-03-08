import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Loader2, ArrowRight, Shield } from "lucide-react";

interface SPV {
  id: number;
  name: string;
  irr: string;
  term: string;
  minInvest: string;
}

type Step = "amount" | "confirm" | "processing" | "success";

interface InvestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  spv: SPV | null;
  onInvested: (spvId: number, amount: string, currency: string) => void;
}

export default function InvestModal({ open, onOpenChange, spv, onInvested }: InvestModalProps) {
  const [step, setStep] = useState<Step>("amount");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USDC");

  const minAmount = spv ? parseInt(spv.minInvest.replace(/[^0-9]/g, "")) : 0;
  const isValid = amount && parseInt(amount.replace(/[^0-9]/g, "")) >= minAmount;

  const handleConfirm = () => {
    setStep("processing");
    setTimeout(() => {
      setStep("success");
      setTimeout(() => {
        onInvested(spv!.id, amount, currency);
        handleClose(false);
      }, 2000);
    }, 2500);
  };

  const handleClose = (val: boolean) => {
    if (step === "processing") return;
    onOpenChange(val);
    if (!val) {
      setStep("amount");
      setAmount("");
      setCurrency("USDC");
    }
  };

  if (!spv) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="light-page sm:max-w-[440px] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="font-display text-xl font-extrabold tracking-tight">
            {step === "amount" && "Invest in SPV"}
            {step === "confirm" && "Confirm Investment"}
            {step === "processing" && "Processing..."}
            {step === "success" && "Investment Complete!"}
          </DialogTitle>
          <DialogDescription className="text-[13px] text-muted-foreground">
            {step === "amount" && spv.name}
            {step === "confirm" && "Review the details below and confirm."}
            {step === "processing" && "Your transaction is being processed on-chain."}
            {step === "success" && "Your investment has been recorded."}
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 pt-4">
          {step === "amount" && (
            <div className="flex flex-col gap-4">
              {/* SPV Summary */}
              <div className="bg-secondary rounded-xl p-4 border border-border">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <div className="text-[10px] text-muted-foreground mb-0.5">Target IRR</div>
                    <div className="font-display text-[15px] font-bold text-primary">{spv.irr}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground mb-0.5">Term</div>
                    <div className="font-display text-[14px] font-bold">{spv.term}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground mb-0.5">Min. Invest</div>
                    <div className="font-display text-[14px] font-bold">{spv.minInvest}</div>
                  </div>
                </div>
              </div>

              {/* Currency selector */}
              <div>
                <label className="text-[12px] font-medium text-muted-foreground mb-1.5 block">Currency</label>
                <div className="flex gap-2">
                  {["USDC", "USDT"].map((c) => (
                    <button
                      key={c}
                      onClick={() => setCurrency(c)}
                      className={`flex-1 py-2.5 rounded-lg text-[13px] font-semibold border transition-all ${
                        currency === c
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-secondary text-foreground border-border hover:border-primary/40"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="text-[12px] font-medium text-muted-foreground mb-1.5 block">
                  Investment Amount (min. {spv.minInvest})
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                  <Input
                    type="text"
                    placeholder={minAmount.toLocaleString()}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value.replace(/[^0-9,]/g, ""))}
                    className="bg-secondary border-border pl-7 text-lg font-semibold"
                  />
                </div>
              </div>

              <button
                onClick={() => setStep("confirm")}
                disabled={!isValid}
                className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground text-[13px] font-semibold hover:brightness-110 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
              >
                Review Investment <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {step === "confirm" && (
            <div className="flex flex-col gap-4">
              <div className="bg-secondary rounded-xl p-5 border border-border space-y-3">
                {[
                  ["SPV", spv.name],
                  ["Amount", `$${amount} ${currency}`],
                  ["Target IRR", spv.irr],
                  ["Term", spv.term],
                  ["Network", "Base (L2)"],
                  ["Gas Fee", "~$0.02"],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between text-[13px]">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-semibold text-foreground">{value}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-primary/5 border border-primary/10">
                <Shield className="w-4 h-4 text-primary mt-0.5 min-w-[16px]" />
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Your investment is secured by smart contract. Funds are held in the SPV escrow until deployment conditions are met.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setStep("amount")}
                  className="py-3 rounded-xl bg-secondary text-foreground text-[13px] font-semibold border border-border hover:border-primary/40 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleConfirm}
                  className="py-3 rounded-xl bg-primary text-primary-foreground text-[13px] font-semibold hover:brightness-110 transition-all"
                >
                  Confirm & Sign
                </button>
              </div>
            </div>
          )}

          {step === "processing" && (
            <div className="flex flex-col items-center py-10 gap-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
              <div className="text-center">
                <div className="font-display text-base font-bold mb-1">Confirming on-chain</div>
                <p className="text-[13px] text-muted-foreground">Please approve the transaction in your wallet.</p>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[11px] text-muted-foreground">Broadcasting to Base L2...</span>
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="flex flex-col items-center py-10 gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--green))]/10 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-[hsl(var(--green))]" />
              </div>
              <div className="text-center">
                <div className="font-display text-base font-bold mb-1">Investment Successful</div>
                <p className="text-[13px] text-muted-foreground">
                  ${amount} {currency} invested in {spv.name}
                </p>
                <div className="text-[11px] text-muted-foreground/60 font-mono bg-secondary px-3 py-1.5 rounded-lg mt-3">
                  Tx: 0xabc1...ef42
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
