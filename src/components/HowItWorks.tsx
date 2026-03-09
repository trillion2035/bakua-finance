import { FileText, Search, Globe, Wallet } from "lucide-react";

const steps = [
  { icon: FileText, num: "01", title: "Submit", desc: "Upload project docs — feasibility studies, titles, contracts. Our AI extracts and standardizes everything investors need." },
  { icon: Search, num: "02", title: "Verify", desc: "IoT sensors and data oracles independently verify your asset. We structure it into a bankable SPV with smart contract controls." },
  { icon: Globe, num: "03", title: "List", desc: "Your SPV goes live on our marketplace, accessible to global on-chain investors and institutional DeFi protocols." },
  { icon: Wallet, num: "04", title: "Fund", desc: "Capital flows into your smart contract vault. Repayments are automated. You build — investors earn verified yield." },
];

const HowItWorks = () => (
  <section id="how" className="py-28 px-6 md:px-10 lg:px-16 relative">
    <div className="max-w-[1100px] mx-auto">
      <div className="mb-16">
        <span className="text-[11px] tracking-[4px] font-semibold text-primary font-display mb-4 block uppercase">How it works</span>
        <h2 className="font-display text-[clamp(32px,4vw,48px)] font-extrabold tracking-[-1.5px] leading-[1.05] text-foreground mb-4">
          From project to funded.<br />Four steps. Sixty days.
        </h2>
        <p className="text-[16px] text-muted-foreground font-light max-w-[480px] leading-relaxed">
          Every barrier between your infrastructure project and global capital — removed.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {steps.map((step, i) => (
          <div
            key={step.num}
            className="glass-card rounded-2xl p-7 group hover:-translate-y-1 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <step.icon className="w-5 h-5 text-primary" />
              </div>
              <span className="font-display text-[11px] font-bold text-muted-foreground/50 tracking-[2px]">{step.num}</span>
            </div>
            <div className="font-display text-lg font-bold mb-2 tracking-tight">{step.title}</div>
            <p className="text-[13px] leading-relaxed text-muted-foreground">{step.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorks;
