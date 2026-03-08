import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import bakuaLogo from "@/assets/bakua-logo-white.png";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const ProjectOwnerSignIn = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.info("Sign in functionality coming soon.");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background flex">
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
            Sign in to manage your infrastructure projects, track funding progress, and communicate with investors.
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
          <h2 className="font-display text-2xl font-extrabold tracking-tight mb-1">Sign in</h2>
          <p className="text-[14px] text-muted-foreground mb-8">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary hover:underline font-medium">Create one</Link>
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
        </div>
      </div>
    </div>
  );
};

export default ProjectOwnerSignIn;
