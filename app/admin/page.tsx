import Link from "next/link";
import { adminLogoutAction } from "@/lib/actions";
import { requireAdmin } from "@/lib/security";

export default async function AdminPage() {
  await requireAdmin();
  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <p className="font-bold uppercase tracking-wider text-yas-blue">Admin</p>
          <h1 className="text-4xl font-black">Tableau de bord</h1>
        </div>
        <form action={adminLogoutAction}><button className="btn-secondary" type="submit">Déconnexion admin</button></form>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/admin/matches" className="card">
          <h2 className="text-2xl font-black">Gérer les matchs</h2>
          <p className="mt-2 text-slate-500">Créer, modifier les équipes, horaires, stades et infos des matchs.</p>
        </Link>
        <Link href="/admin/results" className="card">
          <h2 className="text-2xl font-black">Résultats & scoring</h2>
          <p className="mt-2 text-slate-500">Saisir les scores réels puis recalculer les points.</p>
        </Link>
        <Link href="/admin/pronostics" className="card">
          <h2 className="text-2xl font-black">Tous les pronostics</h2>
          <p className="mt-2 text-slate-500">Voir les pronostics enregistrés. Un seul pronostic est autorisé par email et par match.</p>
        </Link>
      </div>
    </div>
  );
}
