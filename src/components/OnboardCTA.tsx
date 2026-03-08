import { Check } from "lucide-react";

const OnboardCTA = ({ onOpenModal, onScrollTo }: { onOpenModal: (type: string) => void; onScrollTo: (id: string) => void }) => (
  <section id="onboard" className="py-28 px-6 md:px-10 lg:px-16">
    <div className="max-w-[1100px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Project Owners */}
      <div className="bg-secondary rounded-2xl p-10 md:p-12 border border-border relative overflow-hidden">
        <div className="absolute -bottom-12 -right-12 w-[200px] h-[200px] rounded-full bg-primary/5" />
        <span className="text-[10px] tracking-[3px] font-bold text-muted-foreground mb-5 block font-display uppercase">For Project Owners</span>
        <h3 className="font-display text-[28px] font-extrabold tracking-tight leading-[1.1] mb-4">
          Ready to fund your project?
        </h3>
        <p className="text-[14px] leading-relaxed text-muted-foreground mb-8 max-w-[380px]">
          Create your account in minutes. Upload documents and receive a term sheet within 72 hours.
        </p>
        <div className="flex flex-col gap-2.5 mb-8">
          {["No upfront fees — pay on funding", "AI-powered document standardization", "Capital in as little as 60 days", "Dedicated origination manager"].map((check) => (
            <div key={check} className="flex items-center gap-2.5 text-[13px] text-muted-foreground">
              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center min-w-[20px]">
                <Check className="w-3 h-3 text-primary" />
              </div>
              {check}
            </div>
          ))}
        </div>
        <button
          onClick={() => onOpenModal("register")}
          className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-primary text-primary-foreground text-[13px] font-semibold hover:brightness-110 hover:-translate-y-0.5 transition-all"
        >
          Create Account →
        </button>
      </div>

      {/* Investors */}
      <div className="bg-primary rounded-2xl p-10 md:p-12 relative overflow-hidden">
        <div className="absolute -bottom-12 -right-12 w-[200px] h-[200px] rounded-full bg-primary-foreground/5" />
        <span className="text-[10px] tracking-[3px] font-bold text-primary-foreground/50 mb-5 block font-display uppercase">For Investors</span>
        <h3 className="font-display text-[28px] font-extrabold tracking-tight leading-[1.1] text-primary-foreground mb-4">
          Start earning verified yield.
        </h3>
        <p className="text-[14px] leading-relaxed text-primary-foreground/60 mb-8 max-w-[380px]">
          Connect your wallet and access curated infrastructure SPVs generating 12–22% IRR across Africa.
        </p>
        <div className="flex flex-col gap-2.5 mb-8">
          {["Invest in USDC or USDT", "100% on-chain transparency", "Automated wallet distributions", "IoT-verified oracle data"].map((check) => (
            <div key={check} className="flex items-center gap-2.5 text-[13px] text-primary-foreground/70">
              <div className="w-5 h-5 rounded-full bg-primary-foreground/10 flex items-center justify-center min-w-[20px]">
                <Check className="w-3 h-3 text-primary-foreground" />
              </div>
              {check}
            </div>
          ))}
        </div>
        <button
onClick={() => onScrollTo("investors")}
          className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-primary-foreground text-primary text-[13px] font-semibold hover:-translate-y-0.5 transition-all"
        >
          Learn More →
        </button>
      </div>
    </div>
  </section>
);

export default OnboardCTA;
