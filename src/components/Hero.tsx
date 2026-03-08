const Hero = ({ onOpenModal, onScrollTo }: { onOpenModal: (type: string) => void; onScrollTo: (id: string) => void }) => {
  return (
    <section className="min-h-screen pt-[160px] pb-24 px-6 md:px-10 lg:px-16 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 z-0">
        <div className="hero-grid-bg absolute inset-0" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/[0.04] blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-primary/[0.03] blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-[1100px] mx-auto">
        <div className="flex flex-col items-center text-center">
          {/* Headline */}
          <h1 className="font-display text-[clamp(42px,6.5vw,80px)] font-extrabold leading-[0.95] tracking-[-3px] text-foreground mb-7 animate-fade-up" style={{ animationDelay: "0.08s" }}>
            Infrastructure Capital,{" "}
            <span className="text-gradient-primary">On-Chain.</span>
          </h1>

          {/* Subtext */}
          <p className="text-[17px] leading-[1.7] text-muted-foreground font-light max-w-[540px] mb-12 animate-fade-up" style={{ animationDelay: "0.16s" }}>
            We transform infrastructure projects across emerging markets into standardized, on-chain investment vehicles — connecting project owners with global DeFi capital in 60 days, not 36 months.
          </p>

          {/* CTAs */}
          <div className="flex gap-3 flex-wrap justify-center mb-20 animate-fade-up" style={{ animationDelay: "0.24s" }}>
            <button
              onClick={() => onOpenModal("register")}
              className="px-8 py-4 rounded-xl text-[14px] font-semibold bg-primary text-primary-foreground hover:brightness-110 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_hsl(var(--primary)/0.25)] transition-all duration-200"
            >
              List Your Project
            </button>
            <button
              onClick={() => onScrollTo("spvs")}
              className="px-8 py-4 rounded-xl text-[14px] font-semibold text-foreground border border-border hover:border-primary/50 hover:text-primary hover:-translate-y-0.5 transition-all duration-200"
            >
              Browse Opportunities
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 animate-fade-up" style={{ animationDelay: "0.4s" }}>
            {[
              { num: "$9.9M", label: "Capital deployed" },
              { num: "16.1%", label: "Average yield" },
              { num: "10+", label: "Active SPVs" },
              { num: "8+", label: "African markets" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-display text-[26px] font-extrabold text-foreground tracking-tight">
                  {stat.num}
                </div>
                <div className="text-[11px] text-muted-foreground mt-1 tracking-wide uppercase">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
