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
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Leo Américo",
  url: SITE.url,
  jobTitle: "Arquiteto de Software AI-First",
  worksFor: {
    "@type": "Organization",
    name: "Env Neo Ltda",
    url: "https://envneo.com.br",
  },
  address: {
    "@type": "PostalAddress",
    addressLocality: "Uberlândia",
    addressRegion: "MG",
    addressCountry: "BR",
  },
  sameAs: [
    "https://www.linkedin.com/in/leoamericojr",
    "https://github.com/leoamerico",
    "https://substack.com/@leoamericojr",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${inter.variable} ${sora.variable} font-sans antialiased bg-slate-950 text-slate-100`}
      >
        {children}
      </body>
    </html>
  );
}
