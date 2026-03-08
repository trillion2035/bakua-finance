const reasons = [
  { num: "01", title: "60-Day Capital Access", desc: "Traditional project finance takes 18–36 months. Our standardized origination and on-chain settlement compresses this to 60 days from application to funded." },
  { num: "02", title: "No Bank Required", desc: "Access global stablecoin liquidity directly. No correspondent banking, no SWIFT delays, no relationship banking gatekeepers. Capital flows where it's needed." },
  { num: "03", title: "AI-Powered Standardization", desc: "Our AI engine converts informal project data — local contracts, physical surveys, verbal agreements — into investor-grade standardized documentation automatically." },
  { num: "04", title: "Automated Cash Flow Controls", desc: "Smart contracts handle collection and distribution. Investors receive repayments on time, every time — backed by real-world oracle data, not promises." },
];

const metrics = [
  { value: "$15", suffix: "T", label: "Global infrastructure gap by 2040", icon: "🏗️", variant: "dark" as const },
  { value: "$340", suffix: "B+", label: "On-chain stablecoin liquidity seeking yield", icon: "🔗", variant: "blue" as const },
  { value: "12–22", suffix: "%", label: "Typical infrastructure yield range on Bakua", icon: "📈", variant: "light" as const },
];

const WhyBakua = () => (
  <section id="why" className="py-[120px] px-6 md:px-[60px] bg-background">
    <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-[100px] items-center">
      <div>
        <span className="text-[11px] tracking-[4px] font-semibold text-primary font-display mb-4 block">WHY BAKUA</span>
        <h2 className="font-display text-[clamp(36px,4vw,52px)] font-extrabold tracking-[-1.5px] leading-[1.05] text-foreground mb-4">
          The infrastructure<br />finance gap ends here.
        </h2>
        <p className="text-[17px] text-muted-foreground font-light max-w-[560px] leading-relaxed mb-10">
          Sub-Saharan Africa alone needs $130B+ in annual infrastructure investment. Traditional financing takes years and excludes most projects. We fix that.
        </p>
        <div className="flex flex-col">
          {reasons.map((r, i) => (
            <div key={r.num} className={`py-7 flex gap-5 items-start border-b border-border ${i === 0 ? "border-t" : ""}`}>
              <div className="font-display text-[13px] font-extrabold text-primary min-w-[32px] pt-0.5">{r.num}</div>
              <div>
                <div className="font-display text-lg font-bold mb-1.5 tracking-tight">{r.title}</div>
                <p className="text-sm leading-relaxed text-muted-foreground">{r.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-4">
        {metrics.map((m) => (
          <div
            key={m.label}
            className={`rounded-2xl p-7 flex justify-between items-end ${
              m.variant === "dark" ? "bg-foreground text-background" :
              m.variant === "blue" ? "bg-primary text-primary-foreground" :
              "bg-cream text-foreground"
            }`}
          >
            <div>
              <div className="font-display text-[42px] font-extrabold tracking-[-1px] leading-none">
                {m.value}<span className="text-2xl">{m.suffix}</span>
              </div>
              <div className={`text-[13px] mt-1.5 ${m.variant === "light" ? "text-muted-foreground" : "opacity-60"}`}>{m.label}</div>
            </div>
            <div className={`text-4xl ${m.variant === "light" ? "opacity-40" : "opacity-60"}`}>{m.icon}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default WhyBakua;
