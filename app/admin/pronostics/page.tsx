import Link from "next/link";
import { requireAdmin } from "@/lib/security";
import { prisma } from "@/lib/prisma";
import { formatUtcDateFr } from "@/lib/date";
import { TeamName } from "@/components/team-name";

export default async function AdminPronosticsPage() {
  await requireAdmin();

  const predictions = await prisma.prediction.findMany({
    orderBy: { createdAt: "desc" },
    take: 1000,
    include: {
      user: true,
      match: true
    }
  });

  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <p className="font-bold uppercase tracking-wider text-yas-blue">Admin</p>
          <h1 className="text-4xl font-black">Tous les pronostics</h1>
          <p className="mt-2 text-sm text-slate-500">
            Chaque email peut pronostiquer une seule fois par match. Cette règle est protégée côté serveur et côté base de données.
          </p>
        </div>
        <Link href="/admin" className="btn-secondary">Retour admin</Link>
      </div>

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-yas-navy text-white">
              <tr>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4">Participant</th>
                <th className="px-5 py-4">Match</th>
                <th className="px-5 py-4">Pronostic</th>
                <th className="px-5 py-4">Points</th>
              </tr>
            </thead>
            <tbody>
              {predictions.map((prediction) => (
                <tr key={prediction.id} className="border-t border-slate-100 align-top">
                  <td className="px-5 py-4 text-xs font-semibold text-slate-500">
                    {formatUtcDateFr(prediction.createdAt, "long")} GMT
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-bold">{prediction.user.firstName} {prediction.user.lastName}</p>
                    <p className="text-xs text-slate-500">{prediction.user.email}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-xs font-bold uppercase text-slate-400">Match {prediction.match.matchNumber ?? "—"}</p>
                    <div className="mt-2 grid gap-1">
                      <TeamName team={prediction.match.homeTeam} />
                      <TeamName team={prediction.match.awayTeam} />
                    </div>
                  </td>
                  <td className="px-5 py-4 text-2xl font-black text-yas-navy">
                    {prediction.predictedHome} - {prediction.predictedAway}
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-black text-yas-blue">{prediction.totalPoints} pt{prediction.totalPoints > 1 ? "s" : ""}</p>
                    <p className="text-xs text-slate-500">Exact {prediction.scorePoints} • Résultat {prediction.outcomePoints}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {predictions.length === 0 && <div className="p-10 text-center text-slate-500">Aucun pronostic enregistré.</div>}
      </div>
    </div>
  );
}
