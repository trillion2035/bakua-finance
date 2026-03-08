const stats = [
  { val: "$9.9", suffix: "M", label: "Total capital deployed" },
  { val: "10", suffix: "+", label: "Active SPVs funded" },
  { val: "$3.2", suffix: "M", label: "Returns distributed" },
  { val: "100", suffix: "%", label: "On-time repayment" },
  { val: "8", suffix: "+", label: "African markets" },
];

const logos = ["Centrifuge", "Goldfinch", "Maple Finance", "Ondo Finance", "Credix", "Circle USDC"];

const SocialProof = () => (
  <section id="proof" className="py-[100px] px-6 md:px-[60px] bg-background">
    <div className="max-w-[1200px] mx-auto text-center">
      <span className="text-[11px] tracking-[4px] font-semibold text-primary font-display mb-4 block">TRACK RECORD</span>
      <h2 className="font-display text-[clamp(36px,4vw,52px)] font-extrabold tracking-[-1.5px] leading-[1.05] text-foreground mb-4">
        Numbers that speak<br />for themselves.
      </h2>
      <div className="flex justify-center gap-10 md:gap-20 my-16 flex-wrap">
        {stats.map((s) => (
          <div key={s.label}>
            <div className="font-display text-[52px] font-extrabold tracking-[-2px] text-foreground">
              {s.val}<span className="text-primary">{s.suffix}</span>
            </div>
            <div className="text-[13px] text-muted-foreground mt-1.5">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="flex justify-center items-center gap-6 md:gap-10 pt-8 border-t border-border flex-wrap">
        {logos.map((logo) => (
          <div key={logo} className="px-6 py-2.5 rounded-lg bg-cream text-[13px] font-semibold text-muted-foreground font-display tracking-wide">
            {logo}
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default SocialProof;
