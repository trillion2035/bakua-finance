import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import bakuaLogoWhite from "@/assets/bakua-logo-white.png";
import bakuaLogo from "@/assets/bakua-logo.png";

const Footer = ({ onOpenModal, onScrollTo }: { onOpenModal: (type: string) => void; onScrollTo: (id: string) => void }) => {
  const [isDark, setIsDark] = useState(() => !document.documentElement.classList.contains("light-page"));

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.remove("light-page");
    } else {
      document.documentElement.classList.add("light-page");
    }
  }, [isDark]);

  return (
    <footer className="border-t border-border py-16 px-6 md:px-10 lg:px-16">
      <div className="max-w-[1100px] mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-14 pb-12 border-b border-border mb-8">
          <div>
            <img src={isDark ? bakuaLogoWhite : bakuaLogo} alt="Bakua Finance" className="h-7 mb-4" />
            <p className="text-[13px] leading-relaxed text-muted-foreground max-w-[240px]">
              On-chain infrastructure finance for emerging markets. Connecting real assets with global capital.
            </p>
          </div>
          <div>
            <div className="font-display text-[11px] font-bold tracking-[2px] text-muted-foreground/60 mb-5 uppercase">Platform</div>
            <div className="flex flex-col gap-3">
              <a href="#" onClick={(e) => { e.preventDefault(); onOpenModal("register"); }} className="text-[13px] text-muted-foreground hover:text-foreground transition-colors">List a Project</a>
              <a href="#spvs" onClick={(e) => { e.preventDefault(); onScrollTo("spvs"); }} className="text-[13px] text-muted-foreground hover:text-foreground transition-colors">Browse SPVs</a>
              <a href="#investors" onClick={(e) => { e.preventDefault(); onScrollTo("investors"); }} className="text-[13px] text-muted-foreground hover:text-foreground transition-colors">Investors</a>
              <a href="#how" onClick={(e) => { e.preventDefault(); onScrollTo("how"); }} className="text-[13px] text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
            </div>
          </div>
          <div>
            <div className="font-display text-[11px] font-bold tracking-[2px] text-muted-foreground/60 mb-5 uppercase">Resources</div>
            <div className="flex flex-col gap-3">
              {["Documentation", "API Reference", "Risk Framework", "Audit Reports"].map((item) => (
                <a key={item} href="#" className="text-[13px] text-muted-foreground hover:text-foreground transition-colors">{item}</a>
              ))}
            </div>
          </div>
          <div>
            <div className="font-display text-[11px] font-bold tracking-[2px] text-muted-foreground/60 mb-5 uppercase">Company</div>
            <div className="flex flex-col gap-3">
              {["About", "Team", "Careers", "Contact"].map((item) => (
                <a key={item} href="#" className="text-[13px] text-muted-foreground hover:text-foreground transition-colors">{item}</a>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-[12px] text-muted-foreground/50">© 2026 Bakua Finance. All rights reserved.</div>
          <button
            onClick={() => setIsDark(!isDark)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border text-[12px] text-muted-foreground hover:text-foreground transition-colors"
          >
            {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            {isDark ? "Light Mode" : "Dark Mode"}
          </button>
        </div>
        <div className="text-[11px] text-muted-foreground/30 text-center mt-6 leading-relaxed max-w-[600px] mx-auto">
          Investment products involve risk. Past performance does not guarantee future results. Bakua Finance is not a licensed broker-dealer.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
