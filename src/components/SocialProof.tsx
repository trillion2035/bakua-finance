const stats = [
  { val: "$9.9", suffix: "M", label: "Capital deployed" },
  { val: "10", suffix: "+", label: "Active SPVs" },
  { val: "$3.2", suffix: "M", label: "Returns distributed" },
  { val: "100", suffix: "%", label: "On-time repayment" },
];

const SocialProof = () => (
  <section id="proof" className="py-28 px-6 md:px-10 lg:px-16 bg-secondary">
    <div className="max-w-[1100px] mx-auto text-center">
      <span className="text-[11px] tracking-[4px] font-semibold text-primary font-display mb-4 block uppercase">Track Record</span>
      <h2 className="font-display text-[clamp(32px,4vw,48px)] font-extrabold tracking-[-1.5px] leading-[1.05] text-foreground mb-16">
        Numbers that speak for themselves.
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
        {stats.map((s) => (
          <div key={s.label}>
            <div className="font-display text-[44px] font-extrabold tracking-[-2px] text-foreground leading-none">
              {s.val}<span className="text-primary">{s.suffix}</span>
            </div>
            <div className="text-[12px] text-muted-foreground mt-2">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default SocialProof;
