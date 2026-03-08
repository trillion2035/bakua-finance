import { useState, useEffect } from "react";
import bakuaLogoWhite from "@/assets/bakua-logo-white.png";
import bakuaLogoDark from "@/assets/bakua-logo.png";

const Navbar = ({ onOpenModal, onScrollTo }: { onOpenModal: (type: string) => void; onScrollTo: (id: string) => void }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLight, setIsLight] = useState(() => document.documentElement.classList.contains("light-page"));

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsLight(document.documentElement.classList.contains("light-page"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const links = [
    { label: "How It Works", id: "how" },
    { label: "Asset Classes", id: "assets" },
    { label: "For Investors", id: "investors" },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 px-6 md:px-10 lg:px-16 py-4 flex items-center justify-between transition-all duration-300 ${scrolled ? "bg-background/95 backdrop-blur-xl border-b border-border" : "bg-transparent"}`}>
      <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="flex items-center">
        <img src={isLight ? bakuaLogoDark : bakuaLogoWhite} alt="Bakua Finance" className="h-7 md:h-8" />
      </a>

      <div className="hidden lg:flex items-center gap-8">
        {links.map((link) => (
          <a
            key={link.id}
            href={`#${link.id}`}
            onClick={(e) => { e.preventDefault(); onScrollTo(link.id); }}
            className="text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {link.label}
          </a>
        ))}
      </div>

      <div className="hidden lg:flex items-center gap-3">
        <button
          onClick={() => onOpenModal("signin")}
          className="px-5 py-2 rounded-lg text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Sign In
        </button>
        <button
          onClick={() => onOpenModal("register")}
          className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-[13px] font-semibold hover:brightness-110 transition-all"
        >
          Get Started
        </button>
      </div>

      <button className="lg:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
        {mobileOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
        )}
      </button>

      {mobileOpen && (
        <div className="absolute top-full left-0 right-0 bg-background/98 backdrop-blur-xl border-b border-border p-6 flex flex-col gap-4 lg:hidden">
          {links.map((link) => (
            <a key={link.id} href={`#${link.id}`} onClick={(e) => { e.preventDefault(); onScrollTo(link.id); setMobileOpen(false); }} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {link.label}
            </a>
          ))}
          <button onClick={() => { onOpenModal("register"); setMobileOpen(false); }} className="mt-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold w-fit">
            Get Started
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
