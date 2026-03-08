const steps = [
  { num: "01", icon: "📋", title: "Submit Your Project", desc: "Upload your project documents — feasibility studies, land titles, contracts, financial projections. Our AI-powered origination engine extracts and standardizes the key data points investors need." },
  { num: "02", icon: "🔍", title: "Verification & Structuring", desc: "We deploy on-the-ground IoT sensors and data oracles to independently verify your asset's performance. Your project is structured into a bankable Special Purpose Vehicle (SPV) with smart contracts." },
  { num: "03", icon: "🌐", title: "Listed On-Chain", desc: "Your SPV goes live on Bakua's marketplace, accessible to global on-chain investors and institutional DeFi protocols. Full transparency — every data point is verifiable on the blockchain." },
  { num: "04", icon: "💰", title: "Capital Deployed", desc: "Funding flows directly into your project's smart contract vault. Cash flows are automatically collected and distributed to investors on schedule. You receive the capital you need — they receive verified yield." },
];

const HowItWorks = () => (
  <section id="how" className="py-[120px] px-6 md:px-[60px] bg-cream relative overflow-hidden">
    <div className="max-w-[1200px] mx-auto">
      <span className="text-[11px] tracking-[4px] font-semibold text-primary font-display mb-4 block">THE PROCESS</span>
      <h2 className="font-display text-[clamp(36px,4vw,52px)] font-extrabold tracking-[-1.5px] leading-[1.05] text-foreground mb-4">
        From project to funded<br />in four steps.
      </h2>
      <p className="text-[17px] text-muted-foreground font-light max-w-[560px] leading-relaxed mb-16">
        We've removed every barrier between your infrastructure project and global capital. Our platform handles origination, verification, and settlement — you focus on execution.
      </p>
    </div>
    <div className="max-w-[1200px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0.5">
      {steps.map((step, i) => (
        <div
          key={step.num}
          className={`bg-card p-9 transition-transform duration-250 hover:-translate-y-1 hover:z-10 hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] ${i === 0 ? "rounded-l-2xl" : ""} ${i === steps.length - 1 ? "rounded-r-2xl" : ""} max-lg:rounded-xl`}
        >
          <span className="font-display text-[11px] font-bold text-primary tracking-[2px] mb-5 block">{step.num}</span>
          <div className="w-12 h-12 rounded-[10px] bg-primary/10 flex items-center justify-center text-[22px] mb-5">{step.icon}</div>
          <div className="font-display text-lg font-bold mb-2.5 tracking-tight">{step.title}</div>
          <p className="text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
        </div>
      ))}
    </div>
  </section>
);

export default HowItWorks;
