import Link from "next/link";
import { Trophy, ShieldCheck } from "lucide-react";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-white/70 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link href="/matches" className="flex items-center gap-3 font-black tracking-tight text-yas-navy">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-yas-navy text-yas-yellow"><Trophy size={22} /></span>
            <span className="leading-tight">YAS<br /><span className="text-yas-blue">Pronostics</span></span>
          </Link>
          <nav className="flex items-center gap-2">
            <Link className="btn-secondary py-2" href="/matches">Matchs</Link>
            <Link className="btn-secondary py-2" href="/leaderboard">Classement</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
      <footer className="mx-auto max-w-7xl px-4 pb-8 text-center text-xs text-slate-500">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 shadow-soft">
          <ShieldCheck size={14} /> Pronostics simples, réservés aux emails @yas.sn.
        </div>
      </footer>
    </div>
  );
}
