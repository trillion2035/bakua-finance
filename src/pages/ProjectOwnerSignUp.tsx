import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import bakuaLogo from "@/assets/bakua-logo.png";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const ProjectOwnerSignUp = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", company: "", email: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Account created! We'll be in touch shortly.");
      navigate("/");
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
            Fund your infrastructure project on-chain.
          </h1>
          <p className="text-[15px] text-muted-foreground leading-relaxed max-w-[400px]">
            Create your account, upload your project documents, and receive a term sheet within 72 hours.
          </p>
          <div className="flex flex-col gap-3 mt-10">
            {["No upfront fees", "AI-powered document review", "Capital in as little as 60 days"].map((item) => (
              <div key={item} className="flex items-center gap-3 text-[13px] text-muted-foreground">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                {item}
              </div>
            ))}
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground/40">© 2026 Bakua Finance. All rights reserved.</p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-[420px]">
          <Link to="/" className="lg:hidden mb-8 block">
            <img src={bakuaLogo} alt="Bakua Finance" className="h-7" />
          </Link>
          <h2 className="font-display text-2xl font-extrabold tracking-tight mb-1">Create your account</h2>
          <p className="text-[14px] text-muted-foreground mb-8">
            Already have an account?{" "}
            <Link to="/signin" className="text-primary hover:underline font-medium">Sign in</Link>
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-[12px] font-medium text-muted-foreground mb-1.5 block">Full Name</label>
              <Input
                required
                placeholder="John Doe"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="bg-secondary border-border"
              />
            </div>
            <div>
              <label className="text-[12px] font-medium text-muted-foreground mb-1.5 block">Company / Project Name</label>
              <Input
                required
                placeholder="Acme Infrastructure Ltd"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                className="bg-secondary border-border"
              />
            </div>
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
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="bg-secondary border-border"
              />
            </div>
            <div>
              <label className="text-[12px] font-medium text-muted-foreground mb-1.5 block">Confirm Password</label>
              <Input
                required
                type="password"
                placeholder="Re-enter password"
                value={form.confirm}
                onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                className="bg-secondary border-border"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full py-3.5 rounded-xl bg-primary text-primary-foreground text-[13px] font-semibold hover:brightness-110 transition-all disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="text-[11px] text-muted-foreground/50 text-center mt-6 leading-relaxed">
            By creating an account, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProjectOwnerSignUp;
