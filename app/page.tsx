import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Expertise from "@/components/Expertise";
import Stack from "@/components/Stack";
import Projects from "@/components/Projects";
import Certifications from "@/components/Certifications";
import Diploma from "@/components/Diploma";
import Audit from "@/components/Audit";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-cyan-400 focus:text-slate-950 focus:rounded-md focus:font-semibold"
      >
        Pular para o conteúdo principal
      </a>
      <Navbar />
      <main id="main-content">
        <Hero />
        <About />
        <Expertise />
        <Stack />
        <Projects />
        <Certifications />
        <Diploma />
        <Audit />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
