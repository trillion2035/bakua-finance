import { useState } from "react";
import { Link } from "react-router-dom";
import bakuaLogo from "@/assets/bakua-logo-white.png";
import { Zap, TrendingUp, Droplets, Wallet, ExternalLink } from "lucide-react";
import { toast } from "sonner";

const spvs = [
  {
    id: 1,
    name: "Kenya Solar Grid SPV",
    asset: "Solar Energy",
    icon: Zap,
    irr: "18.5%",
    term: "5 Years",
    minInvest: "$5,000",
    raised: "$2.1M",
    target: "$4.0M",
    progress: 52,
    status: "Active",
    desc: "20MW solar farm powering industrial parks in Nairobi County. Revenue backed by 15-year PPA with Kenya Power.",
    highlights: ["IoT-verified output", "15-year PPA", "Government-backed offtaker"],
  },
  {
    id: 2,
    name: "Lagos Water Treatment SPV",
    asset: "Water Infrastructure",
    icon: Droplets,
    irr: "14.2%",
    term: "7 Years",
    minInvest: "$10,000",
    raised: "$5.8M",
    target: "$8.0M",
    progress: 72,
    status: "Active",
    desc: "Municipal water treatment plant serving 200,000+ residents in Lagos State. Revenue from municipal water tariffs.",
    highlights: ["Municipal contract", "200K+ beneficiaries", "Automated metering"],
  },
  {
    id: 3,
    name: "Ghana EV Charging SPV",
    asset: "EV Infrastructure",
    icon: TrendingUp,
    irr: "22.0%",
    term: "4 Years",
    minInvest: "$2,500",
    raised: "$800K",
    target: "$2.5M",
    progress: 32,
    status: "Active",
    desc: "Network of 50 fast-charging stations across Accra and Kumasi. Revenue from per-kWh charging fees.",
    highlights: ["First-mover advantage", "Per-kWh revenue", "Scalable network"],
  },
];

const Marketplace = () => {
  const [walletConnected, setWalletConnected] = useState(false);
  const [connectingWallet, setConnectingWallet] = useState(false);

  const handleConnectWallet = () => {
    setConnectingWallet(true);
    setTimeout(() => {
      setConnectingWallet(false);
      setWalletConnected(true);
      toast.success("Wallet connected successfully!");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border px-6 md:px-10 lg:px-16 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <img src={bakuaLogo} alt="Bakua Finance" className="h-7 md:h-8" />
        </Link>
        <div className="flex items-center gap-3">
          {walletConnected ? (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/20 text-[13px] font-medium text-green-400">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              0x1a2b...9f3e
            </div>
          ) : (
            <button
              onClick={handleConnectWallet}
              disabled={connectingWallet}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-[13px] font-semibold hover:brightness-110 transition-all disabled:opacity-60"
            >
              <Wallet className="w-4 h-4" />
              {connectingWallet ? "Connecting..." : "Connect Wallet"}
            </button>
          )}
        </div>
      </nav>

      {/* Header */}
      <div className="px-6 md:px-10 lg:px-16 pt-12 pb-8 max-w-[1200px] mx-auto">
        <span className="text-[11px] tracking-[4px] font-semibold text-primary font-display mb-3 block uppercase">Marketplace</span>
        <h1 className="font-display text-[clamp(28px,4vw,42px)] font-extrabold tracking-[-1.5px] leading-[1.05] text-foreground mb-3">
          Active SPV Opportunities
        </h1>
        <p className="text-[15px] text-muted-foreground font-light max-w-[520px] leading-relaxed">
          Browse verified infrastructure SPVs generating real yield from Africa's essential services. Connect your wallet to invest.
        </p>
      </div>

      {/* SPV Grid */}
      <div className="px-6 md:px-10 lg:px-16 pb-20 max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {spvs.map((spv) => (
            <div key={spv.id} className="glass-card rounded-2xl border border-border overflow-hidden flex flex-col">
              {/* Card header */}
              <div className="p-6 pb-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <spv.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 text-[10px] font-semibold tracking-wide uppercase">
                    {spv.status}
                  </span>
                </div>
                <h3 className="font-display text-[17px] font-bold tracking-tight mb-1">{spv.name}</h3>
                <p className="text-[12px] text-muted-foreground leading-relaxed mb-4">{spv.desc}</p>

                {/* Highlights */}
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {spv.highlights.map((h) => (
                    <span key={h} className="px-2 py-0.5 rounded-md bg-secondary text-[10px] text-muted-foreground border border-border">
                      {h}
                    </span>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="px-6 py-4 border-t border-border bg-secondary/30 flex-1">
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div>
                    <div className="text-[10px] text-muted-foreground mb-0.5">Target IRR</div>
                    <div className="font-display text-[16px] font-bold text-primary">{spv.irr}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground mb-0.5">Term</div>
                    <div className="font-display text-[14px] font-bold">{spv.term}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground mb-0.5">Min. Invest</div>
                    <div className="font-display text-[14px] font-bold">{spv.minInvest}</div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-[11px] text-muted-foreground mb-1.5">
                    <span>Raised: {spv.raised}</span>
                    <span>Target: {spv.target}</span>
                  </div>
                  <div className="h-1.5 bg-border rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${spv.progress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="p-6 pt-4 border-t border-border">
                {walletConnected ? (
                  <button
                    onClick={() => toast.info("Investment flow coming soon.")}
                    className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-[13px] font-semibold hover:brightness-110 transition-all flex items-center justify-center gap-2"
                  >
                    Invest Now <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={handleConnectWallet}
                    disabled={connectingWallet}
                    className="w-full py-3 rounded-xl bg-secondary text-foreground text-[13px] font-semibold border border-border hover:border-primary/40 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    <Wallet className="w-3.5 h-3.5" />
                    {connectingWallet ? "Connecting..." : "Connect Wallet to Invest"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
