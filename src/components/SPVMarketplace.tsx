import { useState } from "react";

const SPV_DATA = [
  { id: "SPV-01", name: "Nairobi Solar Power Plant", sector: "energy", country: "Kenya", capital: "$1.2M", irr: "16.4%", term: "7 yrs", status: "Active", funded: 78, minInvest: "$5,000" },
  { id: "SPV-02", name: "Accra Smart Irrigation", sector: "agri", country: "Ghana", capital: "$480K", irr: "18.2%", term: "5 yrs", status: "Active", funded: 91, minInvest: "$2,500" },
  { id: "SPV-03", name: "Lagos Residential Complex", sector: "realty", country: "Nigeria", capital: "$2.1M", irr: "13.8%", term: "10 yrs", status: "Active", funded: 55, minInvest: "$10,000" },
  { id: "SPV-05", name: "EkoAtlantic EV Fleet", sector: "mobility", country: "Nigeria", capital: "$750K", irr: "17.1%", term: "6 yrs", status: "Active", funded: 67, minInvest: "$3,000" },
  { id: "SPV-06", name: "Abidjan Boutique Hotel", sector: "hotel", country: "Côte d'Ivoire", capital: "$1.8M", irr: "15.3%", term: "8 yrs", status: "Funding", funded: 38, minInvest: "$7,500" },
  { id: "SPV-10", name: "Lusaka Water Utility", sector: "water", country: "Zambia", capital: "$1.1M", irr: "13.2%", term: "12 yrs", status: "Active", funded: 82, minInvest: "$5,000" },
];

const tabs = [
  { label: "All", filter: "all" },
  { label: "Energy", filter: "energy" },
  { label: "Agriculture", filter: "agri" },
  { label: "Real Estate", filter: "realty" },
  { label: "Mobility", filter: "mobility" },
];

const SPVMarketplace = () => {
  const [activeFilter, setActiveFilter] = useState("all");
  const filtered = activeFilter === "all" ? SPV_DATA : SPV_DATA.filter((s) => s.sector === activeFilter);

  return (
    <section id="spvs" className="py-28 px-6 md:px-10 lg:px-16 bg-secondary">
      <div className="max-w-[1100px] mx-auto">
        <span className="text-[11px] tracking-[4px] font-semibold text-primary font-display mb-4 block uppercase">Live Opportunities</span>
        <h2 className="font-display text-[clamp(32px,4vw,48px)] font-extrabold tracking-[-1.5px] leading-[1.05] text-foreground mb-4">
          Verified infrastructure. Real yield.
        </h2>
        <p className="text-[16px] text-muted-foreground font-light max-w-[480px] leading-relaxed mb-10">
          Every asset independently verified. Every cash flow tracked on-chain. Connect your wallet and invest in minutes.
        </p>

        <div className="flex gap-1 mb-10 bg-card p-1 rounded-lg w-fit flex-wrap border border-border">
          {tabs.map((tab) => (
            <button
              key={tab.filter}
              onClick={() => setActiveFilter(tab.filter)}
              className={`px-4 py-2 rounded-md text-[12px] font-medium transition-all ${activeFilter === tab.filter ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((spv) => (
            <div key={spv.id} className="rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/40 hover:-translate-y-1 transition-all duration-200 cursor-pointer group">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] tracking-[2px] text-muted-foreground/60 font-semibold font-display">{spv.id}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${spv.status === "Active" ? "bg-green/10 text-green" : "bg-primary/10 text-primary"}`}>{spv.status}</span>
                </div>
                <div className="font-display text-base font-bold leading-tight mb-1">{spv.name}</div>
                <span className="text-[11px] text-muted-foreground">{spv.country}</span>

                <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-border">
                  <div>
                    <div className="font-display text-lg font-extrabold tracking-tight text-green">{spv.irr}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">Target IRR</div>
                  </div>
                  <div>
                    <div className="font-display text-lg font-extrabold tracking-tight">{spv.capital}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">Raise</div>
                  </div>
                  <div>
                    <div className="font-display text-lg font-extrabold tracking-tight">{spv.term}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">Duration</div>
                  </div>
                </div>

                <div className="mt-5">
                  <div className="flex justify-between text-[10px] text-muted-foreground mb-1.5">
                    <span>Funded</span><span>{spv.funded}%</span>
                  </div>
                  <div className="h-1 bg-border rounded-sm overflow-hidden">
                    <div className="spv-progress-fill" style={{ width: `${spv.funded}%` }} />
                  </div>
                </div>

                <button className="w-full mt-5 py-3 rounded-lg text-[13px] font-semibold border border-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all">
                  View Details →
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
