const assets = [
  { emoji: "☀️", name: "Energy", yields: "14–19% IRR" },
  { emoji: "🌾", name: "Agriculture", yields: "16–22% IRR" },
  { emoji: "🏢", name: "Real Estate", yields: "12–16% IRR" },
  { emoji: "🌿", name: "Land & Forestry", yields: "13–17% IRR" },
  { emoji: "⚡", name: "Mobility & EV", yields: "15–20% IRR" },
  { emoji: "🏨", name: "Hospitality", yields: "13–17% IRR" },
  { emoji: "✈️", name: "Aviation", yields: "17–21% IRR" },
  { emoji: "🏭", name: "Industrial", yields: "13–17% IRR" },
  { emoji: "♻️", name: "Waste & Energy", yields: "15–19% IRR" },
  { emoji: "💧", name: "Water Utilities", yields: "12–15% IRR" },
];

const AssetClasses = () => (
  <section id="assets" className="py-[120px] px-6 md:px-[60px] bg-foreground text-background">
    <div className="max-w-[1200px] mx-auto">
      <span className="text-[11px] tracking-[4px] font-semibold text-blue-light font-display mb-4 block">ASSET CLASSES</span>
      <h2 className="font-display text-[clamp(36px,4vw,52px)] font-extrabold tracking-[-1.5px] leading-[1.05] text-background mb-4">
        We fund real things<br />that power real economies.
      </h2>
      <p className="text-[17px] text-background/50 font-light max-w-[560px] leading-relaxed mb-16">
        Any productive infrastructure asset generating predictable cash flows can become a Bakua SPV. We've originated across ten sectors and counting.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {assets.map((a) => (
          <div key={a.name} className="p-5 rounded-xl border border-background/[0.08] bg-background/[0.03] hover:border-primary/40 hover:bg-primary/[0.08] hover:-translate-y-0.5 transition-all duration-250 cursor-default flex flex-col gap-3">
            <div className="text-2xl">{a.emoji}</div>
            <div className="font-display text-sm font-bold">{a.name}</div>
            <div className="text-[11px] text-green font-medium">{a.yields}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default AssetClasses;
