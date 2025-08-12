import { HeroSection } from "./hero-section";
import { FeaturesSection } from "./features-section";
import { HowItWorksSection } from "./how-it-works";
import { StatsSection } from "./stats-section";
import { SecuritySection } from "./security-section";
import { Footer } from "./footer";

export function Landing() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <SecuritySection />
      <Footer />
    </div>
  );
}

export * from "./hero-section";
export * from "./features-section";
export * from "./how-it-works";
export * from "./stats-section";
export * from "./security-section";
export * from "./footer";