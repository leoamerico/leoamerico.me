import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Expertise from "@/components/Expertise";
import Stack from "@/components/Stack";
import Projects from "@/components/Projects";
import GoveiaStats from "@/components/GoveiaStats";
import dynamic from "next/dynamic";
const ControlPlane = dynamic(() => import("@/components/ControlPlane"), {
  ssr: false,
  loading: () => (
    <section className="py-24 md:py-32 border-t border-slate-800/50 min-h-[600px]" aria-label="Carregando Control Plane…" />
  ),
});
import Certifications from "@/components/Certifications";
import Diploma from "@/components/Diploma";
import Audit from "@/components/Audit";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main data-seo-root="true">
        <Hero />
        <About />
        <Expertise />
        <Stack />
        <Projects />
        <GoveiaStats />
        <ControlPlane />
        <Certifications />
        <Diploma />
        <Audit />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
