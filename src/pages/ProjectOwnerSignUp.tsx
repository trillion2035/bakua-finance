import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import bakuaLogo from "@/assets/bakua-logo.png";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { seedDemoData } from "@/lib/seedDemoData";

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

const countryCurrency: Record<string, { code: string; symbol: string }> = {
  "United States": { code: "USD", symbol: "$" }, "United Kingdom": { code: "GBP", symbol: "£" },
  "Canada": { code: "CAD", symbol: "CA$" }, "Australia": { code: "AUD", symbol: "A$" },
  "Japan": { code: "JPY", symbol: "¥" }, "China": { code: "CNY", symbol: "¥" },
  "India": { code: "INR", symbol: "₹" }, "Brazil": { code: "BRL", symbol: "R$" },
  "Mexico": { code: "MXN", symbol: "MX$" }, "South Africa": { code: "ZAR", symbol: "R" },
  "Nigeria": { code: "NGN", symbol: "₦" }, "Kenya": { code: "KES", symbol: "KSh" },
  "Ghana": { code: "GHS", symbol: "GH₵" }, "Egypt": { code: "EGP", symbol: "E£" },
  "Morocco": { code: "MAD", symbol: "MAD " }, "Tanzania": { code: "TZS", symbol: "TSh" },
  "Ethiopia": { code: "ETB", symbol: "Br" }, "Uganda": { code: "UGX", symbol: "USh" },
  "Rwanda": { code: "RWF", symbol: "RF" }, "Cameroon": { code: "XAF", symbol: "FCFA " },
  "Côte d'Ivoire": { code: "XOF", symbol: "CFA " }, "Senegal": { code: "XOF", symbol: "CFA " },
  "Mali": { code: "XOF", symbol: "CFA " }, "Burkina Faso": { code: "XOF", symbol: "CFA " },
  "Benin": { code: "XOF", symbol: "CFA " }, "Togo": { code: "XOF", symbol: "CFA " },
  "Niger": { code: "XOF", symbol: "CFA " }, "Guinea-Bissau": { code: "XOF", symbol: "CFA " },
  "Chad": { code: "XAF", symbol: "FCFA " }, "Central African Republic": { code: "XAF", symbol: "FCFA " },
  "Congo (Republic)": { code: "XAF", symbol: "FCFA " }, "Gabon": { code: "XAF", symbol: "FCFA " },
  "Equatorial Guinea": { code: "XAF", symbol: "FCFA " },
  "Germany": { code: "EUR", symbol: "€" }, "France": { code: "EUR", symbol: "€" },
  "Italy": { code: "EUR", symbol: "€" }, "Spain": { code: "EUR", symbol: "€" },
  "Netherlands": { code: "EUR", symbol: "€" }, "Belgium": { code: "EUR", symbol: "€" },
  "Austria": { code: "EUR", symbol: "€" }, "Portugal": { code: "EUR", symbol: "€" },
  "Ireland": { code: "EUR", symbol: "€" }, "Finland": { code: "EUR", symbol: "€" },
  "Greece": { code: "EUR", symbol: "€" }, "Luxembourg": { code: "EUR", symbol: "€" },
  "Slovakia": { code: "EUR", symbol: "€" }, "Slovenia": { code: "EUR", symbol: "€" },
  "Estonia": { code: "EUR", symbol: "€" }, "Latvia": { code: "EUR", symbol: "€" },
  "Lithuania": { code: "EUR", symbol: "€" }, "Malta": { code: "EUR", symbol: "€" },
  "Cyprus": { code: "EUR", symbol: "€" }, "Croatia": { code: "EUR", symbol: "€" },
  "Switzerland": { code: "CHF", symbol: "CHF " }, "Sweden": { code: "SEK", symbol: "kr" },
  "Norway": { code: "NOK", symbol: "kr" }, "Denmark": { code: "DKK", symbol: "kr" },
  "Poland": { code: "PLN", symbol: "zł" }, "Czech Republic": { code: "CZK", symbol: "Kč" },
  "Hungary": { code: "HUF", symbol: "Ft" }, "Romania": { code: "RON", symbol: "lei" },
  "Turkey": { code: "TRY", symbol: "₺" }, "Russia": { code: "RUB", symbol: "₽" },
  "Ukraine": { code: "UAH", symbol: "₴" }, "Israel": { code: "ILS", symbol: "₪" },
  "Saudi Arabia": { code: "SAR", symbol: "SAR " }, "United Arab Emirates": { code: "AED", symbol: "AED " },
  "Qatar": { code: "QAR", symbol: "QR" }, "Kuwait": { code: "KWD", symbol: "KD" },
  "Bahrain": { code: "BHD", symbol: "BD" }, "Oman": { code: "OMR", symbol: "OMR " },
  "Pakistan": { code: "PKR", symbol: "₨" }, "Bangladesh": { code: "BDT", symbol: "৳" },
  "Sri Lanka": { code: "LKR", symbol: "Rs" }, "Indonesia": { code: "IDR", symbol: "Rp" },
  "Malaysia": { code: "MYR", symbol: "RM" }, "Thailand": { code: "THB", symbol: "฿" },
  "Philippines": { code: "PHP", symbol: "₱" }, "Vietnam": { code: "VND", symbol: "₫" },
  "South Korea": { code: "KRW", symbol: "₩" }, "Singapore": { code: "SGD", symbol: "S$" },
  "New Zealand": { code: "NZD", symbol: "NZ$" }, "Argentina": { code: "ARS", symbol: "AR$" },
  "Chile": { code: "CLP", symbol: "CL$" }, "Colombia": { code: "COP", symbol: "CO$" },
  "Peru": { code: "PEN", symbol: "S/" }, "Jamaica": { code: "JMD", symbol: "J$" },
  "Trinidad and Tobago": { code: "TTD", symbol: "TT$" },
  "Zambia": { code: "ZMW", symbol: "ZK" }, "Zimbabwe": { code: "ZWL", symbol: "Z$" },
  "Mozambique": { code: "MZN", symbol: "MT" }, "Botswana": { code: "BWP", symbol: "P" },
  "Namibia": { code: "NAD", symbol: "N$" }, "Malawi": { code: "MWK", symbol: "MK" },
};

function getCurrencyForCountry(country: string) {
  return countryCurrency[country] || { code: "USD", symbol: "$" };
}

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
  const [activeTab, setActiveTab] = useState("business");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      const fullName = `${form.firstName} ${form.lastName}`;

      // 1. Sign up
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: fullName,
            company: form.company,
            country: form.country,
            asset_type: form.assetType,
            capital_target: form.capitalTarget,
          },
          emailRedirectTo: window.location.origin,
        },
      });

      if (authError) throw authError;

      if (authData.user && !authData.session) {
        // Email confirmation required
        toast.success("Account created! Please check your email to verify your account before signing in.");
        navigate("/signin");
        return;
      }

      if (authData.user && authData.session) {
        // 2. Complete signup (profile + role)
        const { error: rpcError } = await supabase.rpc("complete_signup", {
          _full_name: fullName,
          _company_name: form.company,
          _role: "project_owner",
        });
        if (rpcError) console.error("complete_signup error:", rpcError);

        // 3. Seed demo SPV data
        await seedDemoData(authData.user.id);

        toast.success("Business account created!");
        navigate("/dashboard");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
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
          <p className="text-[14px] text-muted-foreground mb-6">
            Already have an account?{" "}
            <Link to="/signin" className="text-primary hover:underline font-medium">Sign in</Link>
          </p>

          <Tabs value={activeTab} onValueChange={(v) => {
            setActiveTab(v);
            if (v === "investor") {
              navigate("/earn");
            }
          }} className="mb-6">
            <TabsList className="w-full">
              <TabsTrigger value="business" className="flex-1 text-[13px]">Business Account</TabsTrigger>
              <TabsTrigger value="investor" className="flex-1 text-[13px]">Investor Account</TabsTrigger>
            </TabsList>
          </Tabs>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[12px] font-medium text-muted-foreground mb-1.5 block">First Name</label>
                <Input required placeholder="John" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="bg-secondary border-border" />
              </div>
              <div>
                <label className="text-[12px] font-medium text-muted-foreground mb-1.5 block">Last Name</label>
                <Input required placeholder="Doe" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="bg-secondary border-border" />
              </div>
            </div>
            <div>
              <label className="text-[12px] font-medium text-muted-foreground mb-1.5 block">Company / Project Name</label>
              <Input required placeholder="Acme Infrastructure Ltd" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="bg-secondary border-border" />
            </div>
            <div>
              <label className="text-[12px] font-medium text-muted-foreground mb-1.5 block">Email</label>
              <Input required type="email" placeholder="you@company.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="bg-secondary border-border" />
            </div>
            <div>
              <label className="text-[12px] font-medium text-muted-foreground mb-1.5 block">Country</label>
              <select required value={form.country} onChange={(e) => {
                const country = e.target.value;
                const { symbol } = getCurrencyForCountry(country);
                setForm({ ...form, country, capitalTarget: symbol });
              }} className={selectClasses}>
                <option value="">Select your country</option>
                {countries.map((c) => (<option key={c} value={c}>{c}</option>))}
              </select>
            </div>
            <div>
              <label className="text-[12px] font-medium text-muted-foreground mb-1.5 block">Asset Type</label>
              <select required value={form.assetType} onChange={(e) => setForm({ ...form, assetType: e.target.value })} className={selectClasses}>
                <option value="">Select asset type</option>
                {assetTypes.map((a) => (<option key={a} value={a}>{a}</option>))}
              </select>
            </div>
            <div>
              <label className="text-[12px] font-medium text-muted-foreground mb-1.5 block">
                Capital Raise Target{form.country ? ` (${getCurrencyForCountry(form.country).code})` : ""}
              </label>
              <Input
                required
                type="text"
                placeholder={form.country ? `e.g. ${getCurrencyForCountry(form.country).symbol}2,000,000` : "Select country first"}
                value={form.capitalTarget}
                onChange={(e) => {
                  const { symbol } = getCurrencyForCountry(form.country);
                  const raw = e.target.value;
                  // Prevent removing the currency prefix
                  if (!raw.startsWith(symbol) && form.country) {
                    setForm({ ...form, capitalTarget: symbol });
                  } else {
                    setForm({ ...form, capitalTarget: raw });
                  }
                }}
                className="bg-secondary border-border"
              />
            </div>
            <div>
              <label className="text-[12px] font-medium text-muted-foreground mb-1.5 block">Password</label>
              <Input required type="password" placeholder="Min. 8 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="bg-secondary border-border" />
            </div>
            <div>
              <label className="text-[12px] font-medium text-muted-foreground mb-1.5 block">Confirm Password</label>
              <Input required type="password" placeholder="Re-enter password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} className="bg-secondary border-border" />
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
