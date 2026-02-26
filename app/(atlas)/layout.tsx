// app/(atlas)/layout.tsx
// Layout do ESA Atlas — nav lateral com 5 visões
import Link from "next/link";
import type { ReactNode } from "react";

export const metadata = {
  title: { template: "%s · Atlas", default: "Atlas" },
  robots: { index: false, follow: false },
};

const VIEWS = [
  // ── ESA Atlas ──────────────────────────────────────────────────────
  { href: "/atlas/matrix",   label: "V2 — Coverage Matrix",  badge: "◉",  group: "ESA" },
  { href: "/atlas/trace",    label: "V3 — Evidence Trace",   badge: "◎",  group: "ESA", soon: true },
  { href: "/atlas/timeline", label: "V4 — Timeline",         badge: "◎",  group: "ESA", soon: true },
  { href: "/atlas/story",    label: "V5 — Story Mode",       badge: "◎",  group: "ESA", soon: true },
  // ── SEO Atlas ──────────────────────────────────────────────────────
  { href: "/atlas/seo",      label: "SEO — Atlas",           badge: "◉",  group: "SEO" },
];

export default function AtlasLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 border-r border-slate-800 flex flex-col py-8 px-4 gap-1">
        <div className="mb-6 px-2">
          <p className="text-[10px] uppercase tracking-widest text-slate-600 mb-1">ESA Atlas</p>
          <h1 className="text-sm font-bold text-white leading-tight">
            Mapa de Segurança<br />
            <span className="text-slate-500 font-normal">Govevia · ERP · ESA</span>
          </h1>
        </div>

        {/* Planes legend */}
        <div className="mb-4 px-2 space-y-1">
          <p className="text-[9px] uppercase tracking-widest text-slate-700 mb-2">Planos</p>
          {[
            { color: "bg-cyan-500",    label: "Trust"    },
            { color: "bg-violet-500",  label: "Decision" },
            { color: "bg-emerald-500", label: "Evidence" },
          ].map(p => (
            <div key={p.label} className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${p.color}`} />
              <span className="text-[11px] text-slate-400">{p.label}</span>
            </div>
          ))}
        </div>

        <hr className="border-slate-800 mb-4" />

        {/* View nav — grouped by ESA / SEO */}
        <nav className="flex flex-col gap-1">
          {["ESA", "SEO"].map(group => {
            const items = VIEWS.filter(v => v.group === group);
            return (
              <div key={group}>
                <p className="text-[9px] uppercase tracking-widest text-slate-700 px-3 pt-3 pb-1">{group}</p>
                {items.map(v => (
                  <Link
                    key={v.href}
                    href={v.href}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-[12px] transition-colors
                      ${'soon' in v && v.soon
                        ? "text-slate-700 cursor-not-allowed pointer-events-none"
                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                      }`}
                  >
                    <span className="shrink-0">{v.badge}</span>
                    <span>{v.label}</span>
                    {'soon' in v && v.soon && <span className="ml-auto text-[9px] text-slate-700">em breve</span>}
                  </Link>
                ))}
              </div>
            );
          })}
        </nav>

        <div className="mt-auto px-2 pt-6">
          <Link href="/" className="text-[11px] text-slate-700 hover:text-slate-400">
            ← leoamerico.me
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
