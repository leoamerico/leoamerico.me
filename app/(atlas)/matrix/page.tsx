// app/(atlas)/matrix/page.tsx — V2 Coverage Matrix (Server Component)
import { buildSnapshot } from "@/lib/esa/buildSnapshot";
import CoverageMatrix from "@/components/atlas/CoverageMatrix";

export const metadata = { title: "Coverage Matrix" };
export const revalidate = 3600;

export default async function MatrixPage() {
  const snapshot = await buildSnapshot();
  return <CoverageMatrix snapshot={snapshot} />;
}
