const OnboardCTA = ({ onOpenModal, onScrollTo }: { onOpenModal: (type: string) => void; onScrollTo: (id: string) => void }) => (
  <section id="onboard" className="py-[120px] px-6 md:px-[60px] bg-cream">
    <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
      {/* Project Owners */}
      <div className="bg-foreground text-background rounded-[20px] p-10 md:p-12 relative overflow-hidden">
        <div className="absolute -bottom-8 -right-8 w-[180px] h-[180px] rounded-full bg-background/5" />
        <span className="text-[10px] tracking-[3px] font-bold opacity-60 mb-5 block font-display">FOR PROJECT OWNERS</span>
        <h3 className="font-display text-[32px] font-extrabold tracking-tight leading-[1.1] mb-4">
          Ready to fund your infrastructure project?
        </h3>
        <p className="text-[15px] leading-relaxed opacity-70 mb-8">
          Create your business account in minutes. Upload your documents, and our team will have a term sheet ready within 72 hours.
        </p>
        <div className="flex flex-col gap-2.5 mb-9">
          {["No upfront fees — origination fee charged on funding", "AI standardization of all project documents", "Capital in as little as 60 days", "Dedicated origination manager assigned"].map((check) => (
            <div key={check} className="flex items-center gap-2.5 text-sm">
              <div className="w-5 h-5 rounded-full bg-background/15 flex items-center justify-center text-[10px] min-w-[20px]">✓</div>
              {check}
            </div>
          ))}
        </div>
        <button
          onClick={() => onOpenModal("register")}
          className="inline-flex items-center gap-2 px-7 py-3.5 rounded-[10px] bg-background text-foreground text-sm font-semibold hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.15)] transition-all"
        >
          Create Business Account →
        </button>
      </div>

      {/* Investors */}
      <div className="bg-primary text-primary-foreground rounded-[20px] p-10 md:p-12 relative overflow-hidden">
        <div className="absolute -bottom-8 -right-8 w-[180px] h-[180px] rounded-full bg-background/5" />
        <span className="text-[10px] tracking-[3px] font-bold opacity-60 mb-5 block font-display">FOR INVESTORS</span>
        <h3 className="font-display text-[32px] font-extrabold tracking-tight leading-[1.1] mb-4">
          Start earning verified infrastructure yield.
        </h3>
        <p className="text-[15px] leading-relaxed opacity-70 mb-8">
          Connect your wallet and access a curated portfolio of on-chain infrastructure SPVs generating 12–22% IRR across Africa's fastest-growing economies.
        </p>
        <div className="flex flex-col gap-2.5 mb-9">
          {["Invest in USDC or USDT", "100% on-chain transparency", "Automated distributions to your wallet", "Independently verified by IoT oracles"].map((check) => (
            <div key={check} className="flex items-center gap-2.5 text-sm">
              <div className="w-5 h-5 rounded-full bg-background/15 flex items-center justify-center text-[10px] min-w-[20px]">✓</div>
              {check}
            </div>
          ))}
        </div>
        <button
          onClick={() => onScrollTo("spvs")}
          className="inline-flex items-center gap-2 px-7 py-3.5 rounded-[10px] bg-background text-foreground text-sm font-semibold hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.15)] transition-all"
        >
          Browse Opportunities →
        </button>
      </div>
    </div>
  </section>
);

export default OnboardCTA;
