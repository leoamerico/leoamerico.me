import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Expertise from "@/components/Expertise";
import Stack from "@/components/Stack";
import Projects from "@/components/Projects";
import Certifications from "@/components/Certifications";
import Diploma from "@/components/Diploma";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <Expertise />
        <Stack />
        <Projects />
        <Certifications />
        <Diploma />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
