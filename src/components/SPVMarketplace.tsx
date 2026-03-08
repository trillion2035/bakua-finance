import { useState } from "react";

const SPV_DATA = [
  { id: "SPV-01", name: "Nairobi Solar Power Plant", sector: "energy", country: "Kenya", emoji: "☀️", headerGradient: "from-[#0A1628] to-[#1a3055]", capital: "$1.2M", irr: "16.4%", term: "7 yrs", status: "Active", funded: 78, minInvest: "$5,000" },
  { id: "SPV-02", name: "Accra Smart Irrigation Network", sector: "agri", country: "Ghana", emoji: "🌾", headerGradient: "from-[#0d2b1a] to-[#1a4d2e]", capital: "$480K", irr: "18.2%", term: "5 yrs", status: "Active", funded: 91, minInvest: "$2,500" },
  { id: "SPV-03", name: "Lagos Residential Complex", sector: "realty", country: "Nigeria", emoji: "🏢", headerGradient: "from-[#1a1a2e] to-[#2d2d5e]", capital: "$2.1M", irr: "13.8%", term: "10 yrs", status: "Active", funded: 55, minInvest: "$10,000" },
  { id: "SPV-05", name: "EkoAtlantic EV Fleet", sector: "mobility", country: "Nigeria", emoji: "⚡", headerGradient: "from-[#1a1208] to-[#3d2c10]", capital: "$750K", irr: "17.1%", term: "6 yrs", status: "Active", funded: 67, minInvest: "$3,000" },
  { id: "SPV-06", name: "Abidjan Boutique Hotel", sector: "hotel", country: "Côte d'Ivoire", emoji: "🏨", headerGradient: "from-[#1a0a0a] to-[#3d1515]", capital: "$1.8M", irr: "15.3%", term: "8 yrs", status: "Funding", funded: 38, minInvest: "$7,500" },
  { id: "SPV-10", name: "Lusaka Water Utility", sector: "water", country: "Zambia", emoji: "💧", headerGradient: "from-[#0a1a2e] to-[#0d3a5e]", capital: "$1.1M", irr: "13.2%", term: "12 yrs", status: "Active", funded: 82, minInvest: "$5,000" },
];

const tabs = [
  { label: "All Sectors", filter: "all" },
  { label: "Energy", filter: "energy" },
  { label: "Agriculture", filter: "agri" },
  { label: "Real Estate", filter: "realty" },
  { label: "Mobility", filter: "mobility" },
];

const SPVMarketplace = () => {
  const [activeFilter, setActiveFilter] = useState("all");
  const filtered = activeFilter === "all" ? SPV_DATA : SPV_DATA.filter((s) => s.sector === activeFilter);

  return (
    <section id="spvs" className="py-[120px] px-6 md:px-[60px] bg-background">
      <div className="max-w-[1200px] mx-auto">
        <span className="text-[11px] tracking-[4px] font-semibold text-primary font-display mb-4 block">INVESTMENT OPPORTUNITIES</span>
        <h2 className="font-display text-[clamp(36px,4vw,52px)] font-extrabold tracking-[-1.5px] leading-[1.05] text-foreground mb-4">
          Verified infrastructure.<br />Real yield.
        </h2>
        <p className="text-[17px] text-muted-foreground font-light max-w-[560px] leading-relaxed mb-10">
          Browse our active SPVs — every asset independently verified, every cash flow tracked on-chain. Connect your wallet and invest in minutes.
        </p>

        <div className="flex gap-1 mb-10 bg-cream p-1 rounded-[10px] w-fit flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.filter}
              onClick={() => setActiveFilter(tab.filter)}
              className={`px-5 py-2 rounded-[7px] text-[13px] font-medium transition-all ${activeFilter === tab.filter ? "bg-card text-foreground shadow-md" : "text-muted-foreground hover:text-foreground"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((spv) => (
            <div key={spv.id} className="rounded-2xl border border-border overflow-hidden hover:border-primary hover:-translate-y-1 hover:shadow-[0_20px_60px_hsl(var(--primary)/0.12)] transition-all duration-250 cursor-pointer group">
              <div className={`h-[140px] bg-gradient-to-br ${spv.headerGradient} flex items-end p-5 relative overflow-hidden`}>
                <span className="absolute top-4 right-5 text-[40px] opacity-60">{spv.emoji}</span>
                <div>
                  <div className="text-[10px] tracking-[2px] text-background/40 font-semibold">{spv.id}</div>
                  <div className="font-display text-lg font-extrabold text-background leading-tight mt-1">{spv.name}</div>
                </div>
              </div>
              <div className="p-5">
                <div className="flex gap-2 flex-wrap mb-4">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary">{spv.sector.charAt(0).toUpperCase() + spv.sector.slice(1)}</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-foreground/[0.06] text-muted-foreground">{spv.country}</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-green/10 text-green">{spv.status}</span>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div>
                    <div className="font-display text-lg font-extrabold tracking-tight text-green">{spv.irr}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">Target IRR</div>
                  </div>
                  <div>
                    <div className="font-display text-lg font-extrabold tracking-tight">{spv.capital}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">Raise size</div>
                  </div>
                  <div>
                    <div className="font-display text-lg font-extrabold tracking-tight">{spv.term}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">Duration</div>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="flex justify-between text-[11px] text-muted-foreground mb-1.5">
                    <span>Funded</span><span>{spv.funded}%</span>
                  </div>
                  <div className="h-1 bg-border rounded-sm overflow-hidden">
                    <div className="spv-progress-fill" style={{ width: `${spv.funded}%` }} />
                  </div>
                </div>
                <button className="w-full py-3 rounded-lg border border-foreground text-[13px] font-semibold hover:bg-foreground hover:text-background transition-all">
                  View & Invest →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SPVMarketplace;
