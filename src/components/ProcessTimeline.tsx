import { UserPlus, Bot, Link, Globe, Banknote } from "lucide-react";

const timeline = [
  { icon: UserPlus, time: "Day 1–3", title: "Submit Your Project", desc: "Register on Bakua, upload project documents — feasibility studies, title deeds, off-take agreements. We accept 40+ document types.", tags: ["Registration", "Document upload", "KYB"] },
  { icon: Bot, time: "Day 3–14", title: "AI Origination", desc: "Our AI engine extracts key data — project economics, cash flows, risk factors. We generate a standardized term sheet and transparent origination quote.", tags: ["AI extraction", "Term sheet", "Fee quote"] },
  { icon: Link, time: "Day 14–30", title: "SPV Deployment", desc: "IoT monitoring and oracles are deployed on your asset. Your project is structured into a smart-contract SPV with automated controls.", tags: ["Smart contracts", "Oracles", "Legal structure"] },
  { icon: Globe, time: "Day 30–45", title: "Marketplace Live", desc: "Your SPV is published to our investor network — on-chain institutions, DeFi protocols, and liquidity pools. Real-time funding.", tags: ["Listed", "Investor matching", "Live funding"] },
  { icon: Banknote, time: "Day 45–60", title: "Capital Deployed", desc: "Once funded, capital is released from escrow. Repayments are automated by smart contracts — oracle-verified cash flows trigger distributions.", tags: ["Capital release", "Auto-repay", "Monitoring"] },
];

const ProcessTimeline = () => (
  <section id="process" className="py-28 px-6 md:px-10 lg:px-16">
    <div className="max-w-[1100px] mx-auto">
      <span className="text-[11px] tracking-[4px] font-semibold text-primary font-display mb-4 block uppercase">For Project Owners</span>
      <h2 className="font-display text-[clamp(32px,4vw,48px)] font-extrabold tracking-[-1.5px] leading-[1.05] text-foreground mb-4">
        Your capital raise, step by step.
      </h2>
      <p className="text-[16px] text-muted-foreground font-light max-w-[480px] leading-relaxed mb-16">
        From account creation to capital landing in your project — here's exactly what happens.
      </p>
      <div className="relative timeline-line">
        {timeline.map((item) => (
          <div key={item.time} className="flex gap-8 py-7 relative">
            <div className="w-14 h-14 min-w-[56px] rounded-xl bg-card border border-border flex items-center justify-center relative z-10">
              <item.icon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="text-[11px] tracking-[2px] text-primary font-semibold mb-1.5 font-display uppercase">{item.time}</div>
              <div className="font-display text-lg font-extrabold tracking-tight mb-2">{item.title}</div>
              <p className="text-[13px] leading-relaxed text-muted-foreground max-w-[500px]">{item.desc}</p>
              <div className="flex gap-2 flex-wrap mt-3">
                {item.tags.map((tag) => (
                  <span key={tag} className="px-2.5 py-1 rounded-md text-[10px] font-medium bg-primary/10 text-primary">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default ProcessTimeline;
