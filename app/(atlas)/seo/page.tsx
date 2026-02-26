// app/(atlas)/seo/page.tsx — SEO Atlas (Server Component)
import { buildSeoSnapshot } from "@/lib/seo/buildSeoSnapshot";
import SeoAtlas from "@/components/atlas/SeoAtlas";

export const metadata = { title: "SEO Atlas" };
export const revalidate = 3600;

export default async function SeoPage() {
  const snapshot = await buildSeoSnapshot();
  return <SeoAtlas snapshot={snapshot} />;
}
