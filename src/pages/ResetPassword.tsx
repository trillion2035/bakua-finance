import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import bakuaLogo from "@/assets/bakua-logo.png";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Password updated successfully!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="light-page min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-[420px]">
        <Link to="/" className="mb-8 block">
          <img src={bakuaLogo} alt="Bakua Finance" className="h-7" />
        </Link>
        <h2 className="font-display text-2xl font-extrabold tracking-tight mb-1 text-foreground">Reset Password</h2>
        <p className="text-[14px] text-muted-foreground mb-6">Enter your new password below.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-[12px] font-medium text-muted-foreground mb-1.5 block">New Password</label>
            <Input required type="password" placeholder="Min. 8 characters"
              value={password} onChange={(e) => setPassword(e.target.value)}
              className="bg-secondary border-border" />
          </div>
          <div>
            <label className="text-[12px] font-medium text-muted-foreground mb-1.5 block">Confirm Password</label>
            <Input required type="password" placeholder="Re-enter password"
              value={confirm} onChange={(e) => setConfirm(e.target.value)}
              className="bg-secondary border-border" />
          </div>
          <button type="submit" disabled={loading}
            className="mt-2 w-full py-3.5 rounded-xl bg-primary text-primary-foreground text-[13px] font-semibold hover:brightness-110 transition-all disabled:opacity-60">
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
