import { useCallback } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import WhyBakua from "@/components/WhyBakua";
import AssetClasses from "@/components/AssetClasses";
import ProcessTimeline from "@/components/ProcessTimeline";
import SPVMarketplace from "@/components/SPVMarketplace";
import InvestorsSection from "@/components/InvestorsSection";
import OnboardCTA from "@/components/OnboardCTA";
import SocialProof from "@/components/SocialProof";
import Footer from "@/components/Footer";
import { toast } from "sonner";

const Index = () => {
  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const openModal = useCallback((type: string) => {
    if (type === "register") {
      toast.info("Account registration coming soon. Contact us at hello@bakua.finance");
    } else {
      toast.info("Sign in coming soon. Contact us at hello@bakua.finance");
    }
  }, []);

  return (
    <div className="bg-background text-foreground overflow-x-hidden">
      <Navbar onOpenModal={openModal} onScrollTo={scrollTo} />
      <Hero onOpenModal={openModal} onScrollTo={scrollTo} />
      <HowItWorks />
      <WhyBakua />
      <AssetClasses />
      <ProcessTimeline />
      <SPVMarketplace />
      <InvestorsSection />
      <OnboardCTA onOpenModal={openModal} onScrollTo={scrollTo} />
      <SocialProof />
      <Footer onOpenModal={openModal} onScrollTo={scrollTo} />
    </div>
  );
};

export default Index;
