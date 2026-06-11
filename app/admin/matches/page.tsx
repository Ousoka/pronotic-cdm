import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/security";
import { deleteMatchAction, upsertMatchAction } from "@/lib/actions";
import { TeamName } from "@/components/team-name";

const rounds = ["GROUP", "ROUND_OF_32", "ROUND_OF_16", "QUARTER_FINAL", "SEMI_FINAL", "THIRD_PLACE", "FINAL"];
const roundLabels: Record<string, string> = {
  GROUP: "Groupe",
  ROUND_OF_32: "32es de finale",
  ROUND_OF_16: "8es de finale",
  QUARTER_FINAL: "Quart de finale",
  SEMI_FINAL: "Demi-finale",
  THIRD_PLACE: "Petite finale",
  FINAL: "Finale"
};

export default async function AdminMatchesPage() {
  await requireAdmin();
  const matches = await prisma.worldCupMatch.findMany({ orderBy: [{ kickoffAt: "asc" }] });

  return (
    <div className="grid gap-8 lg:grid-cols-[.9fr_1.1fr]">
      <section className="card">
        <p className="font-bold uppercase tracking-wider text-yas-blue">Admin</p>
        <h1 className="mt-2 text-3xl font-black">Créer / modifier un match</h1>
        <form action={upsertMatchAction} className="mt-6 grid gap-4">
          <div><label className="label">Numéro du match</label><input className="input mt-2" name="matchNumber" type="number" min="1" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Tour</label><select className="input mt-2" name="round">{rounds.map((r) => <option key={r} value={r}>{roundLabels[r]}</option>)}</select></div>
            <div><label className="label">Groupe</label><input className="input mt-2" name="groupName" placeholder="A" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Équipe 1</label><input className="input mt-2" name="homeTeam" required /></div>
            <div><label className="label">Équipe 2</label><input className="input mt-2" name="awayTeam" required /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Stade</label><input className="input mt-2" name="stadium" /></div>
            <div><label className="label">Ville</label><input className="input mt-2" name="city" /></div>
          </div>
          <div><label className="label">Date et heure du match</label><input className="input mt-2" name="kickoffAt" type="datetime-local" required /></div>
          <div><label className="label">Fermeture des pronostics optionnelle</label><input className="input mt-2" name="lockedAt" type="datetime-local" /></div>
          <div><label className="label">Notes</label><textarea className="input mt-2" name="notes" /></div>
          <button className="btn-primary" type="submit">Enregistrer le match</button>
        </form>
      </section>

      <section className="card">
        <h2 className="text-2xl font-black">Matchs existants</h2>
        <div className="mt-5 grid gap-3">
          {matches.map((m) => (
            <div className="rounded-2xl border border-slate-100 bg-white p-4" key={m.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-slate-400">#{m.matchNumber ?? "—"} • {m.status}</p>
                  <div className="mt-1 grid gap-1">
                    <TeamName team={m.homeTeam} size="sm" />
                    <span className="text-xs font-black uppercase tracking-[.25em] text-slate-300">vs</span>
                    <TeamName team={m.awayTeam} size="sm" />
                  </div>
                  <p className="text-sm text-slate-500">{m.kickoffAt.toISOString()}</p>
                </div>
                <form action={deleteMatchAction}>
                  <input type="hidden" name="id" value={m.id} />
                  <button className="rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-700" type="submit">Supprimer</button>
                </form>
              </div>
              <details className="mt-3">
                <summary className="cursor-pointer text-sm font-bold text-yas-blue">Modifier</summary>
                <form action={upsertMatchAction} className="mt-4 grid gap-3">
                  <input type="hidden" name="id" value={m.id} />
                  <input className="input" name="matchNumber" defaultValue={m.matchNumber ?? ""} />
                  <select className="input" name="round" defaultValue={m.round}>{rounds.map((r) => <option key={r} value={r}>{roundLabels[r]}</option>)}</select>
                  <input className="input" name="groupName" defaultValue={m.groupName ?? ""} />
                  <input className="input" name="homeTeam" defaultValue={m.homeTeam} />
                  <input className="input" name="awayTeam" defaultValue={m.awayTeam} />
                  <input className="input" name="stadium" defaultValue={m.stadium ?? ""} />
                  <input className="input" name="city" defaultValue={m.city ?? ""} />
                  <input className="input" name="kickoffAt" type="datetime-local" defaultValue={m.kickoffAt.toISOString().slice(0,16)} />
                  <input className="input" name="lockedAt" type="datetime-local" defaultValue={m.lockedAt?.toISOString().slice(0,16) ?? ""} />
                  <textarea className="input" name="notes" defaultValue={m.notes ?? ""} />
                  <button className="btn-primary" type="submit">Mettre à jour</button>
                </form>
              </details>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
