import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import bakuaLogo from "@/assets/bakua-logo.png";
import { Zap, TrendingUp, Droplets, Wallet, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import WalletConnectModal from "@/components/investor/WalletConnectModal";
import InvestModal from "@/components/investor/InvestModal";

const spvs = [
  {
    id: 1,
    name: "Menoua Highlands Coffee Cooperative SPV",
    asset: "Agriculture",
    icon: TrendingUp,
    irr: "18.5%",
    term: "3 Years",
    minInvest: "$2,500",
    raised: "$77.5K",
    target: "$78.3K",
    progress: 99,
    status: "Active",
    desc: "Specialty arabica coffee cooperative in Menoua, West Cameroon. Revenue backed by long-term export contracts with European roasters. IoT-monitored post-harvest processing.",
    highlights: ["Export contracts", "IoT-verified quality", "99% funded"],
  },
  {
    id: 2,
    name: "NW Energy Distributed Solar SPV",
    asset: "Solar Energy",
    icon: Zap,
    irr: "16.2%",
    term: "7 Years",
    minInvest: "$1,000",
    raised: "$15K",
    target: "$47K",
    progress: 32,
    status: "Active",
    desc: "Distributed solar energy project powering commercial and residential buildings in Bamenda, Northwest Cameroon. Revenue from pay-as-you-go tariffs.",
    highlights: ["Pay-as-you-go model", "Off-grid resilience", "Early stage"],
  },
  {
    id: 3,
    name: "Bamenda Fish Farm SPV",
    asset: "Aquaculture",
    icon: Droplets,
    irr: "21.0%",
    term: "3 Years",
    minInvest: "$500",
    raised: "$16K",
    target: "$22K",
    progress: 73,
    status: "Active",
    desc: "Integrated fish farming operation in Bamenda, Cameroon producing tilapia and catfish for local and regional markets. Sensor-monitored water quality and feed cycles.",
    highlights: ["Local market demand", "Sensor-monitored", "Short tenor"],
  },
];

const Marketplace = () => {
  const navigate = useNavigate();
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [investModalOpen, setInvestModalOpen] = useState(false);
  const [selectedSPV, setSelectedSPV] = useState<typeof spvs[0] | null>(null);

  const handleWalletConnected = (_wallet: string, _address: string) => {
    setWalletConnected(true);
    setWalletModalOpen(false);
    toast.success("Wallet connected! You can now invest in SPVs.");
  };

  const handleInvestClick = (spv: typeof spvs[0]) => {
    setSelectedSPV(spv);
    setInvestModalOpen(true);
  };

  const handleInvested = (_spvId: number, amount: string, currency: string) => {
    setInvestModalOpen(false);
    toast.success(`Successfully invested $${amount} ${currency}!`);
    // Navigate to investor dashboard after a moment
    setTimeout(() => navigate("/investor"), 1000);
  };

  return (
    <div className="light-page min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border px-6 md:px-10 lg:px-16 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <img src={bakuaLogo} alt="Bakua Finance" className="h-7 md:h-8" />
        </Link>
        <div className="flex items-center gap-3">
          {walletConnected ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/investor")}
                className="text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                My Portfolio
              </button>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[hsl(var(--green))]/10 border border-[hsl(var(--green))]/20 text-[13px] font-medium text-[hsl(var(--green))]">
                <div className="w-2 h-2 rounded-full bg-[hsl(var(--green))]" />
                0x1a2b...9f3e
              </div>
            </div>
          ) : (
            <button
              onClick={() => setWalletModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-[13px] font-semibold hover:brightness-110 transition-all"
            >
              <Wallet className="w-4 h-4" />
              Connect Wallet
            </button>
          )}
        </div>
      </nav>

      {/* Header */}
      <div className="px-6 md:px-10 lg:px-16 pt-12 pb-8 max-w-[1200px] mx-auto">
        <span className="text-[11px] tracking-[4px] font-semibold text-primary font-display mb-3 block uppercase">Earn</span>
        <h1 className="font-display text-[clamp(28px,4vw,42px)] font-extrabold tracking-[-1.5px] leading-[1.05] text-foreground mb-3">
          Active SPVs
        </h1>
        <p className="text-[15px] text-muted-foreground font-light max-w-[520px] leading-relaxed">
          Browse verified infrastructure SPVs generating real yield from real assets. Connect your wallet to invest.
        </p>
      </div>

      {/* SPV Grid */}
      <div className="px-6 md:px-10 lg:px-16 pb-20 max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {spvs.map((spv) => (
            <div key={spv.id} className="glass-card rounded-2xl border border-border overflow-hidden flex flex-col">
              <div className="p-6 pb-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <spv.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-[hsl(var(--green))]/10 text-[hsl(var(--green))] text-[10px] font-semibold tracking-wide uppercase">
                    {spv.status}
                  </span>
                </div>
                <h3 className="font-display text-[17px] font-bold tracking-tight mb-1">{spv.name}</h3>
                <p className="text-[12px] text-muted-foreground leading-relaxed mb-4">{spv.desc}</p>
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {spv.highlights.map((h) => (
                    <span key={h} className="px-2 py-0.5 rounded-md bg-secondary text-[10px] text-muted-foreground border border-border">
                      {h}
                    </span>
                  ))}
                </div>
              </div>

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
                <div className="mb-3">
                  <div className="flex justify-between text-[11px] text-muted-foreground mb-1.5">
                    <span>Raised: {spv.raised}</span>
                    <span>Target: {spv.target}</span>
                  </div>
                  <div className="h-1.5 bg-border rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${spv.progress}%` }} />
                  </div>
                </div>
              </div>

              <div className="p-6 pt-4 border-t border-border">
                {walletConnected ? (
                  <button
                    onClick={() => handleInvestClick(spv)}
                    className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-[13px] font-semibold hover:brightness-110 transition-all flex items-center justify-center gap-2"
                  >
                    Invest Now <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={() => setWalletModalOpen(true)}
                    className="w-full py-3 rounded-xl bg-secondary text-foreground text-[13px] font-semibold border border-border hover:border-primary/40 transition-all flex items-center justify-center gap-2"
                  >
                    <Wallet className="w-3.5 h-3.5" />
                    Connect Wallet
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      <WalletConnectModal
        open={walletModalOpen}
        onOpenChange={setWalletModalOpen}
        onConnected={handleWalletConnected}
      />
      <InvestModal
        open={investModalOpen}
        onOpenChange={setInvestModalOpen}
        spv={selectedSPV}
        onInvested={handleInvested}
      />
    </div>
  );
};

export default Marketplace;
