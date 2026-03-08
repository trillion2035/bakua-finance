import { Shield, BarChart3, Zap, Lock } from "lucide-react";

const benefits = [
  { icon: Shield, title: "On-Chain Transparency", desc: "Every SPV's cash flows, oracle data, and smart contract logic is fully auditable. No opaque fund structures." },
  { icon: BarChart3, title: "Institutional-Grade Yield", desc: "12–22% IRR from verified infrastructure assets. Uncorrelated to crypto market volatility." },
  { icon: Zap, title: "Instant Settlement", desc: "Invest in USDC or USDT. No wire transfers, no settlement delays. Capital moves at the speed of stablecoins." },
  { icon: Lock, title: "Smart Contract Protections", desc: "Automated waterfalls, reserve accounts, and liquidation triggers built into every SPV." },
];

const InvestorsSection = () => (
  <section id="investors" className="py-28 px-6 md:px-10 lg:px-16">
    <div className="max-w-[1100px] mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
        <div>
          <span className="text-[11px] tracking-[4px] font-semibold text-primary font-display mb-4 block uppercase">For Investors</span>
          <h2 className="font-display text-[clamp(32px,4vw,48px)] font-extrabold tracking-[-1.5px] leading-[1.05] text-foreground mb-4">
            Real yield from real infrastructure.
          </h2>
          <p className="text-[16px] text-muted-foreground font-light max-w-[460px] leading-relaxed mb-10">
            Access verified, on-chain infrastructure SPVs generating consistent returns from Africa's essential services economy.
          </p>
          <div className="flex flex-col gap-3">
            {benefits.map((b) => (
              <div key={b.title} className="flex gap-4 p-5 glass-card rounded-xl">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center min-w-[36px]">
                  <b.icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="font-display text-[14px] font-bold mb-1">{b.title}</div>
                  <p className="text-[13px] text-muted-foreground leading-relaxed">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:pt-16">
          <div className="glass-card rounded-2xl p-7">
            <div className="font-display text-base font-bold mb-6">Connect & Invest</div>
            <div className="flex flex-col gap-2.5 mb-6">
              {[
                { name: "MetaMask", desc: "Browser extension & mobile" },
                { name: "WalletConnect", desc: "300+ compatible wallets" },
                { name: "Coinbase Wallet", desc: "Self-custody wallet" },
                { name: "Ledger", desc: "Hardware wallet via bridge" },
              ].map((w) => (
                <div key={w.name} className="flex items-center gap-3.5 px-4 py-3.5 rounded-xl bg-secondary border border-border cursor-pointer hover:border-primary/40 transition-all">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-primary/60" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">{w.name}</div>
                    <div className="text-[11px] text-muted-foreground">{w.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground text-[13px] font-semibold hover:brightness-110 transition-all">
              Connect Wallet & Explore SPVs
            </button>
            <p className="text-[11px] text-muted-foreground/60 text-center mt-4 leading-relaxed">
              Investments are subject to the terms of each individual SPV smart contract.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default InvestorsSection;
