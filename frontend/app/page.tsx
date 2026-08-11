import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import FeaturedCourts from "@/components/landing/FeaturedCourts";
import WhyChoose from "@/components/landing/WhyChoose";
import AvailabilitySection from "@/components/landing/AvailabilitySection";
import Gallery from "@/components/landing/Gallery";
import TournamentSection from "@/components/landing/TournamentSection";
import Testimonials from "@/components/landing/Testimonials";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";
export default function Home() {
  return (
    <>
      <Navbar />

      <Hero />

      <FeaturedCourts />

      {/* <WhyChoose />

      <AvailabilitySection />

      <Gallery />

      <TournamentSection />

      <Testimonials />

      <CTA /> */}

      <Footer />
    </>
  );
}