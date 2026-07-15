"use client";

import HeroCarousel from "@/components/home/HeroCarousel";
import ClientSlider from "@/components/home/ClientCarousel";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import AboutIntro from "@/components/home/AboutIntro";
import IndustryInnovation from "@/components/home/IndustryInnovation";
import BusinessCTA from "@/components/home/BusinessCTA";
import PrinciplesSection from "@/components/home/PrinciplesSection";
import OurSolutionsGrid from "@/components/home/OurSolutionsGrid";
import LatestNews from "@/components/home/LatestNews";

export default function HomePage() {
  return (
    <>
      <HeroCarousel />

      <ClientSlider />

      <WhyChooseUs />

      <AboutIntro />

      <IndustryInnovation />

      <BusinessCTA />

      <PrinciplesSection />

      <OurSolutionsGrid />

      <LatestNews />
    </>
  );
}