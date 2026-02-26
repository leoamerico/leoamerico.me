import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";
import { SITE } from "@/lib/constants";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Leo Américo",
  description: SITE.description,
  metadataBase: new URL(SITE.url),
  openGraph: {
    title: SITE.title,
    description: SITE.description,
    url: SITE.url,
    siteName: SITE.name,
    images: [{ url: SITE.ogImage, width: 1200, height: 630 }],
    locale: SITE.locale,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.title,
    description: SITE.description,
    images: [SITE.ogImage],
  },
  icons: {
    icon: "/icon.svg",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Leonardo Américo José Ribeiro",
  jobTitle: "Consultor de Sistemas para Gestão Pública",
  url: SITE.url,
  sameAs: [
    "https://www.linkedin.com/in/leoamericojr",
    "https://github.com/leoamerico",
  ],
  worksFor: {
    "@type": "Organization",
    name: "ENV-NEO LTDA",
    url: "https://envneo.com.br",
    makesOffer: {
      "@type": "Offer",
      itemOffered: {
        "@type": "SoftwareApplication",
        name: "ENV-NEO Govevia",
        applicationCategory: "BusinessApplication",
        description:
          "Plataforma de governança executável para administração municipal brasileira",
        url: "https://govevia.com.br",
        creator: {
          "@type": "Organization",
          name: "ENV-NEO LTDA",
        },
      },
    },
  },
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "Faculdade CNEC Unaí",
  },
  knowsAbout: [
    "Gestão Pública Digital",
    "Implantação de Sistemas de Gestão Pública",
    "Transformação Digital",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body
        className={`${inter.variable} ${sora.variable} font-sans antialiased bg-slate-950 text-slate-100`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
