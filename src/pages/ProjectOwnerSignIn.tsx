import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import bakuaLogo from "@/assets/bakua-logo.png";
import { Input } from "@/components/ui/input";
import { Wallet } from "lucide-react";
import { toast } from "sonner";

const ProjectOwnerSignIn = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"owner" | "investor">("owner");
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [connectingWallet, setConnectingWallet] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.info("Sign in functionality coming soon.");
    }, 1000);
  };

  const handleConnectWallet = () => {
    setConnectingWallet(true);
    setTimeout(() => {
      setConnectingWallet(false);
      toast.success("Wallet connected! Redirecting to your portfolio...");
      navigate("/earn");
    }, 1500);
  };

  return (
    <div className="light-page min-h-screen bg-background flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-[45%] bg-primary/5 border-r border-border flex-col justify-between p-12">
        <Link to="/">
          <img src={bakuaLogo} alt="Bakua Finance" className="h-8" />
        </Link>
        <div>
          <h1 className="font-display text-[clamp(28px,3vw,40px)] font-extrabold tracking-[-1px] leading-[1.1] text-foreground mb-4">
            Welcome back.
          </h1>
          <p className="text-[15px] text-muted-foreground leading-relaxed max-w-[400px]">
            {tab === "owner"
              ? "Sign in to manage your infrastructure projects, track funding progress, and communicate with investors."
              : "Connect your wallet to view your SPV investments, track yields, and manage your portfolio."}
          </p>
        </div>
        <p className="text-[11px] text-muted-foreground/40">© 2026 Bakua Finance. All rights reserved.</p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-[420px]">
          <Link to="/" className="lg:hidden mb-8 block">
            <img src={bakuaLogo} alt="Bakua Finance" className="h-7" />
          </Link>
          <h2 className="font-display text-2xl font-extrabold tracking-tight mb-1 text-foreground">Sign in</h2>

          {/* Tab switcher */}
          <div className="flex gap-1 p-1 rounded-lg bg-secondary border border-border mt-4 mb-6">
            <button
              onClick={() => setTab("owner")}
              className={`flex-1 py-2 rounded-md text-[13px] font-semibold transition-all ${
                tab === "owner"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Project Owner
            </button>
            <button
              onClick={() => setTab("investor")}
              className={`flex-1 py-2 rounded-md text-[13px] font-semibold transition-all ${
                tab === "investor"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Investor
            </button>
          </div>

          {tab === "owner" ? (
            <>
              <p className="text-[14px] text-muted-foreground mb-6">
                Don't have an account?{" "}
                <Link to="/signup" className="text-primary hover:underline font-medium">List your project</Link>
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="text-[12px] font-medium text-muted-foreground mb-1.5 block">Email</label>
                  <Input
                    required
                    type="email"
                    placeholder="you@company.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="bg-secondary border-border"
                  />
                </div>
                <div>
                  <label className="text-[12px] font-medium text-muted-foreground mb-1.5 block">Password</label>
                  <Input
                    required
                    type="password"
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="bg-secondary border-border"
                  />
                </div>

                <div className="flex justify-end">
                  <button type="button" className="text-[12px] text-primary hover:underline">
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground text-[13px] font-semibold hover:brightness-110 transition-all disabled:opacity-60"
                >
                  {loading ? "Signing in..." : "Sign In"}
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-col gap-5">
              <p className="text-[14px] text-muted-foreground">
                Connect your wallet to access your SPV investments and track your yields.
              </p>

              <button
                onClick={handleConnectWallet}
                disabled={connectingWallet}
                className="w-full py-4 rounded-xl bg-primary text-primary-foreground text-[14px] font-semibold hover:brightness-110 transition-all disabled:opacity-60 flex items-center justify-center gap-2.5"
              >
                <Wallet className="w-5 h-5" />
                {connectingWallet ? "Connecting..." : "Connect Wallet"}
              </button>

              <div className="flex items-center gap-3 my-2">
                <div className="flex-1 h-px bg-border" />
                <span className="text-[11px] text-muted-foreground/50 uppercase tracking-wider">Supported wallets</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <div className="grid grid-cols-3 gap-2">
                {["MetaMask", "WalletConnect", "Coinbase"].map((wallet) => (
                  <div key={wallet} className="flex items-center justify-center py-3 rounded-lg border border-border bg-secondary/50 text-[12px] text-muted-foreground font-medium">
                    {wallet}
                  </div>
                ))}
              </div>

              <p className="text-[11px] text-muted-foreground/50 text-center mt-2 leading-relaxed">
                New to crypto wallets?{" "}
                <a href="#" className="text-primary hover:underline">Learn how to get started</a>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectOwnerSignIn;
