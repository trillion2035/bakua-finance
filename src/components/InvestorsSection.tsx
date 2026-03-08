const benefits = [
  { icon: "🔒", title: "On-Chain Transparency", desc: "Every SPV's cash flows, oracle data, and smart contract logic is fully auditable on-chain. No opaque fund structures." },
  { icon: "📊", title: "Institutional-Grade Yield", desc: "12–22% IRR from verified infrastructure assets across Africa's fastest-growing markets. Uncorrelated to crypto volatility." },
  { icon: "⚡", title: "Instant Settlement", desc: "Invest in USDC or USDT. No wire transfers, no settlement delays. Capital moves at the speed of stablecoins." },
  { icon: "🛡️", title: "Smart Contract Protections", desc: "Automated waterfalls, reserve accounts, and liquidation triggers built into every SPV contract. Investor capital is structurally protected." },
];

const wallets = [
  { logo: "🦊", name: "MetaMask", desc: "Browser extension & mobile" },
  { logo: "🔗", name: "WalletConnect", desc: "300+ compatible wallets" },
  { logo: "🔵", name: "Coinbase Wallet", desc: "Self-custody wallet" },
  { logo: "🔒", name: "Ledger", desc: "Hardware wallet via bridge" },
];

const InvestorsSection = () => (
  <section id="investors" className="py-[120px] px-6 md:px-[60px] bg-foreground text-background">
    <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-[100px] items-center">
      <div>
        <span className="text-[11px] tracking-[4px] font-semibold text-primary font-display mb-4 block">FOR INVESTORS</span>
        <h2 className="font-display text-[clamp(36px,4vw,52px)] font-extrabold tracking-[-1.5px] leading-[1.05] text-background mb-4">
          Real yield from<br />real infrastructure.
        </h2>
        <p className="text-[17px] text-background/50 font-light max-w-[560px] leading-relaxed mb-10">
          Access a curated portfolio of verified, on-chain infrastructure SPVs generating consistent returns from Africa's essential services economy.
        </p>
        <div className="flex flex-col gap-5 mb-10">
          {benefits.map((b) => (
            <div key={b.title} className="flex gap-4 p-5 bg-background/[0.04] rounded-xl border border-background/[0.06]">
              <div className="text-2xl min-w-[30px]">{b.icon}</div>
              <div>
                <div className="font-display text-[15px] font-bold mb-1">{b.title}</div>
                <p className="text-[13px] text-background/50 leading-relaxed">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="bg-background/[0.04] border border-background/[0.08] rounded-2xl p-7">
          <div className="font-display text-base font-bold mb-5">Connect Your Wallet</div>
          <div className="flex flex-col gap-2.5 mb-5">
            {wallets.map((w) => (
              <div key={w.name} className="flex items-center gap-3.5 px-4 py-3.5 rounded-[10px] bg-background/[0.03] border border-background/[0.08] cursor-pointer hover:border-primary hover:bg-primary/[0.08] transition-all">
                <div className="w-8 h-8 rounded-lg bg-background/10 flex items-center justify-center text-base">{w.logo}</div>
                <div>
                  <div className="text-sm font-medium">{w.name}</div>
                  <div className="text-[11px] text-background/40">{w.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full py-3.5 rounded-[10px] bg-primary text-primary-foreground text-sm font-semibold hover:bg-blue-light hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
            <span>🔗</span> Connect Wallet & Explore SPVs
          </button>
          <p className="text-[11px] text-background/30 text-center mt-3.5 leading-relaxed">
            By connecting, you agree to Bakua's Terms of Service. Investments are subject to the terms of each individual SPV smart contract.
          </p>
        </div>
      </div>
    </div>
  </section>
);

export default InvestorsSection;
