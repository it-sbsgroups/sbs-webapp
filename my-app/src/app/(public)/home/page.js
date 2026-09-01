"use client";

import HeroCarousel from "@/components/home/HeroCarousel";
import ClientSlider from "@/components/home/ClientCarousel";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import AboutIntro from "@/components/home/AboutIntro";
import BusinessCTA from "@/components/home/BusinessCTA";
import PrinciplesSection from "@/components/home/PrinciplesSection";
import OurSolutionsGrid from "@/components/home/OurSolutionsGrid";
import LatestNews from "@/components/home/LatestNews";
import LazySection from "@/components/shared/LazySection";

export default function HomePage() {
  return (
    <>
      {/* Hero stays eager — it's above the fold and must render immediately */}
      <LazySection id="hero-carousel" minHeight={200}>
        <HeroCarousel />
      </LazySection>

      <LazySection id="brand-partners" minHeight={200}>
        <ClientSlider />
      </LazySection>

      <LazySection id="why-choose-us" minHeight={500}>
        <WhyChooseUs />
      </LazySection>

      <LazySection id="about" minHeight={500}>
        <AboutIntro />
      </LazySection>

      {/* <IndustryInnovation /> */}

      <LazySection id="get-started" minHeight={300}>
        <BusinessCTA />
      </LazySection>

      <LazySection id="our-principles" minHeight={500}>
        <PrinciplesSection />
      </LazySection>

      <LazySection id="our-solutions" minHeight={600}>
        <OurSolutionsGrid />
      </LazySection>

      <LazySection id="latest-news" minHeight={500}>
        <LatestNews />
      </LazySection>
    </>
  );
}
