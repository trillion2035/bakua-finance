import { Clock, Landmark, Brain, Cpu } from "lucide-react";

const reasons = [
  { icon: Clock, title: "60-Day Capital Access", desc: "Traditional project finance takes 18–36 months. Our standardized origination compresses this to 60 days." },
  { icon: Landmark, title: "No Bank Required", desc: "Access global stablecoin liquidity directly. No correspondent banking, no SWIFT delays, no gatekeepers." },
  { icon: Brain, title: "AI-Powered Origination", desc: "Our AI converts informal project data — local contracts, surveys, verbal agreements — into investor-grade documentation." },
  { icon: Cpu, title: "Automated Cash Flows", desc: "Smart contracts handle collection and distribution. Investors receive repayments on time, every time." },
];

const metrics = [
  { value: "$15T", label: "Global infrastructure gap by 2040" },
  { value: "$340B+", label: "On-chain stablecoin liquidity seeking yield" },
  { value: "12–22%", label: "Typical infrastructure yield on Bakua" },
];

const WhyBakua = () => (
  <section id="why" className="py-28 px-6 md:px-10 lg:px-16">
    <div className="max-w-[1100px] mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
        <div>
          <span className="text-[11px] tracking-[4px] font-semibold text-primary font-display mb-4 block uppercase">Why Bakua</span>
          <h2 className="font-display text-[clamp(32px,4vw,48px)] font-extrabold tracking-[-1.5px] leading-[1.05] text-foreground mb-4">
            The infrastructure finance gap ends here.
          </h2>
          <p className="text-[16px] text-muted-foreground font-light max-w-[460px] leading-relaxed mb-10">
            Sub-Saharan Africa alone needs $130B+ in annual infrastructure investment. Traditional financing takes years and excludes most projects.
          </p>
          <div className="flex flex-col gap-1">
            {reasons.map((r, i) => (
              <div key={r.title} className={`py-5 flex gap-4 items-start border-b border-border ${i === 0 ? "border-t" : ""}`}>
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center min-w-[36px] mt-0.5">
                  <r.icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="font-display text-[15px] font-bold mb-1 tracking-tight">{r.title}</div>
                  <p className="text-[13px] leading-relaxed text-muted-foreground">{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:pt-16">
          {metrics.map((m, i) => (
            <div
              key={m.label}
              className={`rounded-2xl p-8 ${
                i === 0 ? "bg-secondary" :
                i === 1 ? "bg-primary/10 border border-primary/20" :
                "bg-secondary"
              }`}
            >
              <div className={`font-display text-[36px] font-extrabold tracking-[-1px] leading-none ${
                i === 1 ? "text-primary" : "text-foreground"
              }`}>
                {m.value}
              </div>
              <div className="text-[13px] text-muted-foreground mt-2">{m.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default WhyBakua;
