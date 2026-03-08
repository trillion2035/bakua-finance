import { Link } from "react-router-dom";
import bakuaLogo from "@/assets/bakua-logo.png";
import { Wallet, TrendingUp, DollarSign, Calendar, ArrowUpRight, ExternalLink, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { mockInvestments, mockPortfolioStats, mockTransactions } from "@/data/mockInvestorData";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  Active: "bg-primary/10 text-primary border-primary/20",
  Distributing: "bg-[hsl(var(--green))]/10 text-[hsl(var(--green))] border-[hsl(var(--green))]/20",
  Matured: "bg-muted text-muted-foreground border-border",
};

export default function InvestorDashboard() {
  return (
    <div className="light-page min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border px-6 md:px-10 lg:px-16 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <img src={bakuaLogo} alt="Bakua Finance" className="h-7 md:h-8" />
        </Link>
        <div className="flex items-center gap-3">
          <Link
            to="/earn"
            className="text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:inline"
          >
            Browse SPVs
          </Link>
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[hsl(var(--green))]/10 border border-[hsl(var(--green))]/20 text-[13px] font-medium text-[hsl(var(--green))]">
            <div className="w-2 h-2 rounded-full bg-[hsl(var(--green))]" />
            0x1a2b...9f3e
          </div>
          <button
            onClick={() => { toast.info("Wallet disconnected"); window.location.href = "/earn"; }}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
            title="Disconnect"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </nav>

      <div className="px-6 md:px-10 lg:px-16 py-10 max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <span className="text-[11px] tracking-[4px] font-semibold text-primary font-display mb-2 block uppercase">
            Investor Dashboard
          </span>
          <h1 className="font-display text-[clamp(24px,3vw,36px)] font-extrabold tracking-[-1px] leading-[1.1] text-foreground">
            Your Portfolio
          </h1>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { label: "Total Invested", value: mockPortfolioStats.totalInvested, icon: DollarSign },
            { label: "Current Value", value: mockPortfolioStats.currentValue, icon: TrendingUp, accent: true },
            { label: "Total Yield", value: `${mockPortfolioStats.totalYield} (${mockPortfolioStats.yieldPercent})`, icon: ArrowUpRight },
            { label: "Next Payout", value: mockPortfolioStats.nextPayout, icon: Calendar },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-card rounded-xl p-5 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <kpi.icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-[11px] text-muted-foreground font-medium">{kpi.label}</span>
              </div>
              <div className={`font-display text-[18px] font-bold ${kpi.accent ? "text-[hsl(var(--green))]" : "text-foreground"}`}>
                {kpi.value}
              </div>
            </div>
          ))}
        </div>

        {/* Wallet Balance */}
        <div className="bg-primary/5 rounded-xl p-5 border border-primary/10 flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Wallet className="w-5 h-5 text-primary" />
            <div>
              <div className="text-[11px] text-muted-foreground">Wallet Balance</div>
              <div className="font-display text-lg font-bold">{mockPortfolioStats.walletBalance}</div>
            </div>
          </div>
          <Link
            to="/earn"
            className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-[13px] font-semibold hover:brightness-110 transition-all"
          >
            Invest More
          </Link>
        </div>

        {/* Active Investments */}
        <div className="mb-8">
          <h2 className="font-display text-lg font-bold mb-4">Active Investments</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockInvestments.map((inv) => (
              <div key={inv.id} className="bg-card rounded-xl p-5 border border-border">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-display text-[15px] font-bold">{inv.spvName}</div>
                    <div className="text-[11px] text-muted-foreground">{inv.asset} · {inv.id}</div>
                  </div>
                  <Badge variant="outline" className={`text-[10px] ${statusColors[inv.status]}`}>
                    {inv.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-y-3 gap-x-6 mt-4">
                  {[
                    ["Invested", inv.amountInvested],
                    ["Current Value", inv.currentValue],
                    ["Target IRR", inv.irr],
                    ["Currency", inv.currency],
                    ["Invested On", inv.investedDate],
                    ["Next Dist.", inv.nextDistribution],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <div className="text-[10px] text-muted-foreground">{label}</div>
                      <div className="text-[13px] font-semibold">{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Transaction History */}
        <div>
          <h2 className="font-display text-lg font-bold mb-4">Transaction History</h2>
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="text-left px-5 py-3 text-[11px] font-semibold text-muted-foreground">Type</th>
                    <th className="text-left px-5 py-3 text-[11px] font-semibold text-muted-foreground">SPV</th>
                    <th className="text-left px-5 py-3 text-[11px] font-semibold text-muted-foreground">Amount</th>
                    <th className="text-left px-5 py-3 text-[11px] font-semibold text-muted-foreground">Date</th>
                    <th className="text-left px-5 py-3 text-[11px] font-semibold text-muted-foreground">Tx Hash</th>
                  </tr>
                </thead>
                <tbody>
                  {mockTransactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                      <td className="px-5 py-3.5">
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${
                            tx.type === "Distribution"
                              ? "bg-[hsl(var(--green))]/10 text-[hsl(var(--green))] border-[hsl(var(--green))]/20"
                              : "bg-primary/10 text-primary border-primary/20"
                          }`}
                        >
                          {tx.type}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 font-medium">{tx.spv}</td>
                      <td className={`px-5 py-3.5 font-semibold ${tx.type === "Distribution" ? "text-[hsl(var(--green))]" : ""}`}>
                        {tx.amount}
                      </td>
                      <td className="px-5 py-3.5 text-muted-foreground">{tx.date}</td>
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-[12px] text-muted-foreground flex items-center gap-1">
                          {tx.hash} <ExternalLink className="w-3 h-3" />
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
