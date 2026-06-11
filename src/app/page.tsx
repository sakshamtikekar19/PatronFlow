import type { Metadata } from "next";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { SocialProof } from "@/components/landing/social-proof";
import { ProblemSection } from "@/components/landing/problem-section";
import { SolutionSection } from "@/components/landing/solution-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { DashboardShowcase } from "@/components/landing/dashboard-showcase";
import { AdvantagesSection } from "@/components/landing/advantages-section";
import { RoiSection } from "@/components/landing/roi-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { FinalCta } from "@/components/landing/final-cta";
import { LandingFooter } from "@/components/landing/landing-footer";
import { BRAND, BRAND_TITLE } from "@/config/branding";

export const metadata: Metadata = {
  title: BRAND_TITLE,
  description: BRAND.description,
};

export default function Home() {
  return (
    <div className="theme-light min-h-screen bg-background">
      <LandingNavbar />
      <main>
        <HeroSection />
        <SocialProof />
        <ProblemSection />
        <SolutionSection />
        <FeaturesSection />
        <DashboardShowcase />
        <AdvantagesSection />
        <RoiSection />
        <TestimonialsSection />
        <FinalCta />
      </main>
      <LandingFooter />
    </div>
  );
}
