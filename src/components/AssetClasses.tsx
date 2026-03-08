import { Sun, Wheat, Building2, TreePine, Zap, Hotel, Plane, Factory, Recycle, Droplets } from "lucide-react";

const assets = [
  { icon: Sun, name: "Energy & Solar", yields: "14–19%" },
  { icon: Wheat, name: "Agriculture", yields: "16–22%" },
  { icon: Building2, name: "Real Estate", yields: "12–16%" },
  { icon: TreePine, name: "Land & Forestry", yields: "13–17%" },
  { icon: Zap, name: "Mobility & EV", yields: "15–20%" },
  { icon: Hotel, name: "Hospitality", yields: "13–17%" },
  { icon: Plane, name: "Aviation", yields: "17–21%" },
  { icon: Factory, name: "Industrial", yields: "13–17%" },
  { icon: Recycle, name: "Waste & Energy", yields: "15–19%" },
  { icon: Droplets, name: "Water Utilities", yields: "12–15%" },
];

const AssetClasses = () => (
  <section id="assets" className="py-28 px-6 md:px-10 lg:px-16 bg-secondary">
    <div className="max-w-[1100px] mx-auto">
      <span className="text-[11px] tracking-[4px] font-semibold text-primary font-display mb-4 block uppercase">Asset Classes</span>
      <h2 className="font-display text-[clamp(32px,4vw,48px)] font-extrabold tracking-[-1.5px] leading-[1.05] text-foreground mb-4">
        Real assets. Real yield.
      </h2>
      <p className="text-[16px] text-muted-foreground font-light max-w-[480px] leading-relaxed mb-14">
        Any productive infrastructure asset generating predictable cash flows can become a Bakua SPV. Ten sectors and counting.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {assets.map((a) => (
          <div key={a.name} className="p-5 rounded-xl border border-border bg-card/50 hover:border-primary/30 hover:-translate-y-0.5 transition-all duration-200 cursor-default group">
            <a.icon className="w-6 h-6 text-primary/70 group-hover:text-primary mb-3 transition-colors" />
            <div className="font-display text-[13px] font-bold mb-1">{a.name}</div>
            <div className="text-[11px] text-green font-medium">{a.yields} IRR</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default AssetClasses;
