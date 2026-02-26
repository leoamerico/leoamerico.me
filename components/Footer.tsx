import { FOOTER } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="py-8 border-t border-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
        <span>{FOOTER.copy}</span>
        <span>{FOOTER.builtWith}</span>
      </div>
    </footer>
  );
}
