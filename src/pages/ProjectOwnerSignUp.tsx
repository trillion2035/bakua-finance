import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import bakuaLogo from "@/assets/bakua-logo.png";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { saveUserProfile } from "@/data/userContext";

const countries = [
  "Afghanistan","Albania","Algeria","Andorra","Angola","Antigua and Barbuda","Argentina","Armenia","Australia","Austria",
  "Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bhutan",
  "Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso","Burundi","Cabo Verde","Cambodia",
  "Cameroon","Canada","Central African Republic","Chad","Chile","China","Colombia","Comoros","Congo (DRC)","Congo (Republic)",
  "Costa Rica","Côte d'Ivoire","Croatia","Cuba","Cyprus","Czech Republic","Denmark","Djibouti","Dominica","Dominican Republic",
  "Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Eswatini","Ethiopia","Fiji","Finland",
  "France","Gabon","Gambia","Georgia","Germany","Ghana","Greece","Grenada","Guatemala","Guinea",
  "Guinea-Bissau","Guyana","Haiti","Honduras","Hungary","Iceland","India","Indonesia","Iran","Iraq",
  "Ireland","Israel","Italy","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kiribati","Kosovo",
  "Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania",
  "Luxembourg","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands","Mauritania","Mauritius",
  "Mexico","Micronesia","Moldova","Monaco","Mongolia","Montenegro","Morocco","Mozambique","Myanmar","Namibia",
  "Nauru","Nepal","Netherlands","New Zealand","Nicaragua","Niger","Nigeria","North Korea","North Macedonia","Norway",
  "Oman","Pakistan","Palau","Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland",
  "Portugal","Qatar","Romania","Russia","Rwanda","Saint Kitts and Nevis","Saint Lucia","Saint Vincent and the Grenadines",
  "Samoa","San Marino","São Tomé and Príncipe","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore",
  "Slovakia","Slovenia","Solomon Islands","Somalia","South Africa","South Korea","South Sudan","Spain","Sri Lanka","Sudan",
  "Suriname","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand","Timor-Leste","Togo",
  "Tonga","Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Tuvalu","Uganda","Ukraine","United Arab Emirates",
  "United Kingdom","United States","Uruguay","Uzbekistan","Vanuatu","Vatican City","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe"
];

const assetTypes = [
  "Energy & Solar",
  "Agriculture",
  "Real Estate",
  "Land & Forestry",
  "Mobility & EV",
  "Hospitality",
  "Aviation",
  "Industrial",
  "Waste & Energy",
  "Water Utilities",
  "Other",
];

const ProjectOwnerSignUp = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    company: "",
    email: "",
    country: "",
    assetType: "",
    capitalTarget: "",
    password: "",
    confirm: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    saveUserProfile({
      firstName: form.firstName,
      lastName: form.lastName,
      company: form.company,
      email: form.email,
      country: form.country,
      assetType: form.assetType,
      capitalTarget: form.capitalTarget,
    });
    setTimeout(() => {
      setLoading(false);
      toast.success("Business account created!");
      navigate("/dashboard");
    }, 1500);
  };

  const selectClasses =
    "w-full h-10 rounded-md border border-border bg-secondary px-3 text-[14px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background";

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
            Create your business account, upload your project documents, and receive a term sheet within 72 hours.
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
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 overflow-y-auto">
        <div className="w-full max-w-[420px] py-8">
          <Link to="/" className="lg:hidden mb-8 block">
            <img src={bakuaLogo} alt="Bakua Finance" className="h-7" />
          </Link>
          <h2 className="font-display text-2xl font-extrabold tracking-tight mb-1 text-foreground">Create your account</h2>
          <p className="text-[14px] text-muted-foreground mb-8">
            Already have an account?{" "}
            <Link to="/signin" className="text-primary hover:underline font-medium">Sign in</Link>
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[12px] font-medium text-muted-foreground mb-1.5 block">First Name</label>
                <Input
                  required
                  placeholder="John"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  className="bg-secondary border-border"
                />
              </div>
              <div>
                <label className="text-[12px] font-medium text-muted-foreground mb-1.5 block">Last Name</label>
                <Input
                  required
                  placeholder="Doe"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  className="bg-secondary border-border"
                />
              </div>
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
              <label className="text-[12px] font-medium text-muted-foreground mb-1.5 block">Country</label>
              <select
                required
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                className={selectClasses}
              >
                <option value="">Select your country</option>
                {countries.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[12px] font-medium text-muted-foreground mb-1.5 block">Asset Type</label>
              <select
                required
                value={form.assetType}
                onChange={(e) => setForm({ ...form, assetType: e.target.value })}
                className={selectClasses}
              >
                <option value="">Select asset type</option>
                {assetTypes.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[12px] font-medium text-muted-foreground mb-1.5 block">Capital Raise Target (USD)</label>
              <Input
                required
                type="text"
                placeholder="e.g. $2,000,000"
                value={form.capitalTarget}
                onChange={(e) => setForm({ ...form, capitalTarget: e.target.value })}
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
              {loading ? "Creating account..." : "Create Business Account"}
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
