import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { SITE } from "@/lib/constants";
import { PERSON_JSON_LD } from "@/lib/structured-data";

const inter = localFont({
  src: "../public/fonts/inter-latin-var.woff2",
  variable: "--font-inter",
  display: "swap",
  weight: "100 900",
});

const sora = localFont({
  src: "../public/fonts/sora-latin-var.woff2",
  variable: "--font-sora",
  display: "swap",
  weight: "100 800",
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
    locale: SITE.locale,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.title,
    description: SITE.description,
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(PERSON_JSON_LD) }}
        />
      </head>
      <body
        className={`${inter.variable} ${sora.variable} font-sans antialiased bg-slate-950 text-slate-100 noise-overlay`}
      >
        {children}
      </body>
    </html>
  );
}
