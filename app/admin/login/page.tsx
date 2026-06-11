import { LockKeyhole } from "lucide-react";
import { adminLoginAction } from "@/lib/actions";

export default function AdminLoginPage({ searchParams }: { searchParams?: { error?: string } }) {
  const error = searchParams?.error;
  return (
    <div className="mx-auto max-w-md">
      <div className="card">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-yas-navy text-yas-yellow"><LockKeyhole size={30} /></div>
        <h1 className="mt-6 text-center text-3xl font-black">Administration</h1>
        <p className="mt-2 text-center text-sm text-slate-500">Accès réservé à l’équipe en charge des matchs et résultats.</p>
        {error === "invalid" && <p className="mt-4 rounded-2xl bg-red-50 p-3 text-sm font-bold text-red-700">Mot de passe incorrect.</p>}
        {error === "not-configured" && <p className="mt-4 rounded-2xl bg-red-50 p-3 text-sm font-bold text-red-700">ADMIN_PASSWORD n’est pas configuré dans le fichier .env.</p>}
        <form action={adminLoginAction} className="mt-6 grid gap-4">
          <div>
            <label className="label">Mot de passe admin</label>
            <input className="input mt-2" name="password" type="password" required autoComplete="current-password" />
          </div>
          <button className="btn-primary" type="submit">Se connecter</button>
        </form>
      </div>
    </div>
  );
}
