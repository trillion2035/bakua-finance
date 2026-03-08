const timeline = [
  { icon: "📝", time: "DAY 1 — 3", title: "Create Account & Submit Project", desc: "Register your business on Bakua Finance. Upload your project documents — we accept feasibility studies, title deeds, off-take agreements, financial models, and local certifications. Our intake system supports 40+ document types.", tags: ["Project registration", "Document upload", "KYB verification"] },
  { icon: "🤖", time: "DAY 3 — 14", title: "AI Origination & Standardization", desc: "Our AI engine processes your documents and extracts key data points — project economics, cash flow projections, risk factors, and asset specifics. We calculate your origination fee automatically (2% of target capital) and present a transparent quote before you proceed.", tags: ["AI data extraction", "Origination fee calculated", "Term sheet generated"] },
  { icon: "🔗", time: "DAY 14 — 30", title: "On-Chain SPV Deployment", desc: "We deploy IoT monitoring and performance oracles on your asset. Your project is structured into a smart-contract SPV with automated cash flow controls, repayment waterfalls, and investor protections. You review and approve the final structure.", tags: ["Smart contract deployment", "Oracle installation", "Legal structure"] },
  { icon: "🌐", time: "DAY 30 — 45", title: "Live on the Marketplace", desc: "Your SPV is published on Bakua's investor marketplace and distributed to our network of on-chain institutional investors, DeFi protocols, and liquidity pools. Investors can review your verified project data and commit capital in real time.", tags: ["Marketplace listing", "Investor matching", "Real-time funding"] },
  { icon: "💰", time: "DAY 45 — 60", title: "Capital Disbursed to Your Project", desc: "Once your funding target is reached, capital is released from escrow into your project account. Repayments are managed automatically by smart contracts — oracle-verified cash flows trigger distributions to investors on schedule. You focus on building.", tags: ["Capital release", "Automated repayments", "Ongoing monitoring"] },
];

const ProcessTimeline = () => (
  <section id="process" className="py-[120px] px-6 md:px-[60px] bg-cream">
    <div className="max-w-[1200px] mx-auto">
      <span className="text-[11px] tracking-[4px] font-semibold text-primary font-display mb-4 block">FOR PROJECT OWNERS</span>
      <h2 className="font-display text-[clamp(36px,4vw,52px)] font-extrabold tracking-[-1.5px] leading-[1.05] text-foreground mb-4">
        Your capital raise,<br />step by step.
      </h2>
      <p className="text-[17px] text-muted-foreground font-light max-w-[560px] leading-relaxed mb-16">
        Here's exactly what happens from the moment you create your Bakua account to the moment capital lands in your project.
      </p>
      <div className="relative timeline-line">
        {timeline.map((item) => (
          <div key={item.time} className="flex gap-10 py-8 relative">
            <div className="w-[58px] h-[58px] min-w-[58px] rounded-full bg-card border-2 border-primary flex items-center justify-center text-[22px] relative z-10 shadow-[0_0_0_6px_hsl(var(--cream))]">
              {item.icon}
            </div>
            <div>
              <div className="text-[11px] tracking-[2px] text-primary font-semibold mb-2 font-display">{item.time}</div>
              <div className="font-display text-xl font-extrabold tracking-tight mb-2">{item.title}</div>
              <p className="text-sm leading-relaxed text-muted-foreground max-w-[560px]">{item.desc}</p>
              <div className="flex gap-2 flex-wrap mt-3">
                {item.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 rounded-full text-[11px] font-medium bg-primary/10 text-primary">{tag}</span>
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
