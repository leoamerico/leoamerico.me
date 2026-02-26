// app/__visual/components/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Harness de regressão visual — renderiza cada componente isolado
// com data-testid estável para palette.spec.ts.
//
// ENFORCEMENT: esta rota NUNCA deve ser indexada.
// robots.ts e public/robots.txt garantem Disallow: /__visual/
// ─────────────────────────────────────────────────────────────────────────────
import React, { Suspense } from "react";
import About from "@/components/About";
import Certifications from "@/components/Certifications";
import Contact from "@/components/Contact";
import Diploma from "@/components/Diploma";
import Expertise from "@/components/Expertise";
import Footer from "@/components/Footer";
import GoveiaStats from "@/components/GoveiaStats";
import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import Projects from "@/components/Projects";
import Stack from "@/components/Stack";
// ControlPlane é "use client" com fetch — envolvido em Suspense
import ControlPlane from "@/components/ControlPlane";

export const metadata = {
  title: "Visual Harness — Components",
  robots: { index: false, follow: false },
};

// Wrapper isolado para cada componente no harness
function HarnessSection({
  testId,
  label,
  children,
  noPad = false,
}: {
  testId: string;
  label: string;
  children: React.ReactNode;
  noPad?: boolean;
}) {
  return (
    <section
      data-testid={testId}
      data-harness-label={label}
      className={`rounded-2xl border border-slate-800 overflow-hidden${noPad ? "" : " p-2"}`}
    >
      {children}
    </section>
  );
}

export default function VisualComponentsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Navbar — sem padding, testa comportamento real */}
      <HarnessSection testId="cmp-navbar" label="Navbar" noPad>
        <Navbar />
      </HarnessSection>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8 py-8">

        <header className="border border-slate-700 rounded-xl p-6 bg-slate-900">
          <h1 className="text-xl font-semibold text-white">Visual Harness</h1>
          <p className="text-sm text-slate-400 mt-1">
            Página interna · regressão visual por componente e tema (dark/light/system).
            Não indexada — Disallow: /&#95;&#95;visual/
          </p>
        </header>

        <HarnessSection testId="cmp-hero" label="Hero">
          <Hero />
        </HarnessSection>

        <HarnessSection testId="cmp-about" label="About">
          <About />
        </HarnessSection>

        <HarnessSection testId="cmp-expertise" label="Expertise">
          <Expertise />
        </HarnessSection>

        <HarnessSection testId="cmp-stack" label="Stack">
          <Stack />
        </HarnessSection>

        <HarnessSection testId="cmp-projects" label="Projects">
          <Projects />
        </HarnessSection>

        <HarnessSection testId="cmp-goveia-stats" label="GoveiaStats">
          <GoveiaStats />
        </HarnessSection>

        <HarnessSection testId="cmp-control-plane" label="ControlPlane">
          <Suspense fallback={<div className="h-40 animate-pulse bg-slate-800 rounded-xl" />}>
            <ControlPlane />
          </Suspense>
        </HarnessSection>

        <HarnessSection testId="cmp-certifications" label="Certifications">
          <Certifications />
        </HarnessSection>

        <HarnessSection testId="cmp-diploma" label="Diploma">
          <Diploma />
        </HarnessSection>

        <HarnessSection testId="cmp-contact" label="Contact">
          <Contact />
        </HarnessSection>

      </main>

      {/* Footer — sem padding, testa comportamento real */}
      <HarnessSection testId="cmp-footer" label="Footer" noPad>
        <Footer />
      </HarnessSection>
    </div>
  );
}
