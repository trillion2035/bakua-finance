const Hero = ({ onOpenModal, onScrollTo }: { onOpenModal: (type: string) => void; onScrollTo: (id: string) => void }) => {
  return (
    <section className="min-h-screen pt-[140px] pb-20 px-6 md:px-[60px] relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.08] via-transparent to-primary/[0.04]" />
        <div className="hero-grid-bg absolute inset-0" />
      </div>

      <div className="relative z-10 max-w-[1200px] mx-auto">
        <div className="flex flex-col items-center text-center">
          {/* Headline */}
          <h1 className="font-display text-[clamp(44px,6vw,76px)] font-extrabold leading-[1.02] tracking-[-2px] text-foreground mb-6 animate-fade-up">
            Infrastructure Capital,{" "}
            <span className="text-primary">On-Chain.</span>
          </h1>

          {/* Subtext */}
          <p className="text-lg leading-relaxed text-muted-foreground font-light max-w-[520px] mb-11 animate-fade-up" style={{ animationDelay: "0.1s" }}>
            Bakua Finance turns infrastructure projects into bankable, on-chain investment vehicles. We standardize, verify, and fund real assets — energy, agriculture, real estate, mobility, and more — connecting project owners across emerging markets with global DeFi capital.
          </p>

          {/* CTAs */}
          <div className="flex gap-3.5 flex-wrap justify-center mb-16 animate-fade-up" style={{ animationDelay: "0.2s" }}>
            <button
              onClick={() => onOpenModal("register")}
              className="px-8 py-4 rounded-xl text-[15px] font-semibold bg-foreground text-background border-2 border-foreground hover:bg-primary hover:border-primary hover:-translate-y-0.5 hover:shadow-[0_8px_24px_hsl(var(--primary)/0.3)] transition-all duration-250 inline-flex items-center gap-2"
            >
              List Your Project →
            </button>
            <button
              onClick={() => onScrollTo("spvs")}
              className="px-8 py-4 rounded-xl text-[15px] font-semibold bg-transparent text-foreground border-2 border-foreground/20 hover:border-primary hover:text-primary hover:-translate-y-0.5 transition-all duration-250"
            >
              Browse Opportunities
            </button>
          </div>

          {/* Stats */}
          <div className="flex gap-10 flex-wrap animate-fade-up" style={{ animationDelay: "0.4s" }}>
            {[
              { num: "$9.9", suffix: "M", label: "Capital deployed" },
              { num: "16.1", suffix: "%", label: "Average yield" },
              { num: "10", suffix: "+", label: "Active SPVs" },
              { num: "100", suffix: "%", label: "On-time repayment" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="font-display text-[28px] font-extrabold text-foreground tracking-tight">
                  {stat.num}<span className="text-primary">{stat.suffix}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5 tracking-wide">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
