import { useState, useEffect } from "react";
import bakuaLogo from "@/assets/bakua-logo.png";

const Navbar = ({ onOpenModal, onScrollTo }: { onOpenModal: (type: string) => void; onScrollTo: (id: string) => void }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 px-6 md:px-[60px] py-5 flex items-center justify-between transition-all duration-300 ${scrolled ? "bg-background/92 backdrop-blur-xl border-b border-border shadow-sm" : "bg-background/80 backdrop-blur-md"}`}>
      <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="flex items-center">
        <img src={bakuaLogo} alt="Bakua Finance" className="h-8 md:h-10" />
      </a>

      <div className="hidden lg:flex items-center gap-9">
        {[
          { label: "How It Works", id: "how" },
          { label: "Asset Classes", id: "assets" },
          { label: "For Investors", id: "investors" },
        ].map((link) => (
          <a
            key={link.id}
            href={`#${link.id}`}
            onClick={(e) => { e.preventDefault(); onScrollTo(link.id); }}
            className="text-sm font-normal text-foreground/70 hover:text-foreground transition-opacity"
          >
            {link.label}
          </a>
        ))}
      </div>

      <div className="hidden lg:flex items-center gap-3">
        <button
          onClick={() => onOpenModal("signin")}
          className="px-5 py-2.5 border border-foreground/20 rounded-lg text-sm font-medium text-foreground hover:border-primary hover:text-primary transition-all"
        >
          Sign In
        </button>
        <button
          onClick={() => onOpenModal("register")}
          className="px-5 py-2.5 bg-foreground text-background rounded-lg text-sm font-medium hover:bg-primary transition-all"
        >
          List a Project
        </button>
      </div>

      {/* Mobile hamburger */}
      <button className="lg:hidden text-foreground text-2xl" onClick={() => setMobileOpen(!mobileOpen)}>
        {mobileOpen ? "✕" : "☰"}
      </button>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="absolute top-full left-0 right-0 bg-background border-b border-border p-6 flex flex-col gap-4 lg:hidden shadow-lg">
          {["How It Works:how", "Why Bakua:why", "Asset Classes:assets", "SPV Marketplace:spvs", "For Investors:investors"].map((item) => {
            const [label, id] = item.split(":");
            return (
              <a key={id} href={`#${id}`} onClick={(e) => { e.preventDefault(); onScrollTo(id); setMobileOpen(false); }} className="text-sm text-foreground/70 hover:text-foreground">
                {label}
              </a>
            );
          })}
          <button onClick={() => { onOpenModal("register"); setMobileOpen(false); }} className="mt-2 px-5 py-2.5 bg-foreground text-background rounded-lg text-sm font-medium">
            List a Project
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
