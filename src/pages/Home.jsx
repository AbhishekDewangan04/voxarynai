import React from "react";
import Background from "@/components/site/Background";
import Navbar from "@/components/site/Navbar";
import Hero from "@/components/site/Hero";
import StatsStrip from "@/components/site/StatsStrip";
import Features from "@/components/site/Features";
import HowItWorks from "@/components/site/HowItWorks";
import PersonalityStudio from "@/components/site/PersonalityStudio";
import DashboardPreview from "@/components/site/DashboardPreview";
import MemorySection from "@/components/site/MemorySection";
import Integrations from "@/components/site/Integrations";
import UseCases from "@/components/site/UseCases";
import Security from "@/components/site/Security";
import Pricing from "@/components/site/Pricing";
import Testimonials from "@/components/site/Testimonials";
import FAQ from "@/components/site/FAQ";
import FinalCTA from "@/components/site/FinalCTA";
import Footer from "@/components/site/Footer";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <Background />
      <a
        href="#features"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-[#05060f]"
      >
        Skip to content
      </a>
      <Navbar />
      <main>
        <Hero />
        <StatsStrip />
        <Features />
        <HowItWorks />
        <PersonalityStudio />
        <DashboardPreview />
        <MemorySection />
        <Integrations />
        <UseCases />
        <Security />
        <Pricing />
        <Testimonials />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}