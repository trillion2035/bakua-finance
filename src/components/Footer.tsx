import bakuaLogoWhite from "@/assets/bakua-logo-white.png";

const Footer = ({ onOpenModal, onScrollTo }: { onOpenModal: (type: string) => void; onScrollTo: (id: string) => void }) => (
  <footer className="bg-foreground text-background py-16 px-6 md:px-[60px]">
    <div className="max-w-[1200px] mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-[60px] pb-12 border-b border-background/[0.08] mb-8">
        <div>
          <img src={bakuaLogoWhite} alt="Bakua Finance" className="h-8 mb-4" />
          <p className="text-sm leading-relaxed text-background/40 max-w-[260px]">
            DeFi infrastructure finance for emerging markets. Connecting real assets with global on-chain capital.
          </p>
        </div>
        <div>
          <div className="font-display text-xs font-bold tracking-[2px] text-background/40 mb-5">PLATFORM</div>
          <div className="flex flex-col gap-3">
            <a href="#" onClick={(e) => { e.preventDefault(); onOpenModal("register"); }} className="text-sm text-background/60 hover:text-background transition-colors">List a Project</a>
            <a href="#spvs" onClick={(e) => { e.preventDefault(); onScrollTo("spvs"); }} className="text-sm text-background/60 hover:text-background transition-colors">Browse SPVs</a>
            <a href="#investors" onClick={(e) => { e.preventDefault(); onScrollTo("investors"); }} className="text-sm text-background/60 hover:text-background transition-colors">Investors</a>
            <a href="#how" onClick={(e) => { e.preventDefault(); onScrollTo("how"); }} className="text-sm text-background/60 hover:text-background transition-colors">How It Works</a>
          </div>
        </div>
        <div>
          <div className="font-display text-xs font-bold tracking-[2px] text-background/40 mb-5">ASSET CLASSES</div>
          <div className="flex flex-col gap-3">
            {["Energy & Solar", "Agriculture", "Real Estate", "Mobility & EV", "Water Utilities"].map((item) => (
              <a key={item} href="#" className="text-sm text-background/60 hover:text-background transition-colors">{item}</a>
            ))}
          </div>
        </div>
        <div>
          <div className="font-display text-xs font-bold tracking-[2px] text-background/40 mb-5">COMPANY</div>
          <div className="flex flex-col gap-3">
            {["About Us", "Team", "Careers", "Documentation", "Contact"].map((item) => (
              <a key={item} href="#" className="text-sm text-background/60 hover:text-background transition-colors">{item}</a>
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-[13px] text-background/30">© 2026 Bakua Finance. All rights reserved.</div>
        <div className="text-[11px] text-background/20 max-w-[400px] text-right leading-relaxed">
          Investment products involve risk. Past performance of SPVs does not guarantee future results. Bakua Finance is not a licensed broker-dealer or investment adviser.
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
