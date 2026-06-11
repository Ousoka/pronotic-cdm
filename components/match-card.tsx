import Link from "next/link";
import { WorldCupMatch } from "@prisma/client";
import { formatUtcDateFr } from "@/lib/date";
import { hasPlaceholderTeam, isPredictionClosed } from "@/lib/match-utils";
import { TeamName } from "@/components/team-name";

function roundLabel(round: string) {
  const labels: Record<string, string> = {
    GROUP: "Groupe",
    ROUND_OF_32: "32es de finale",
    ROUND_OF_16: "8es de finale",
    QUARTER_FINAL: "Quart de finale",
    SEMI_FINAL: "Demi-finale",
    THIRD_PLACE: "Petite finale",
    FINAL: "Finale"
  };
  return labels[round] ?? round.replaceAll("_", " ");
}

export function MatchCard({ match, predictionCount = 0 }: { match: WorldCupMatch; predictionCount?: number }) {
  const placeholder = hasPlaceholderTeam(match);
  const locked = isPredictionClosed(match);
  const disabled = placeholder || locked;

  const badgeLabel = placeholder ? "À déterminer" : locked ? "Fermé" : "Ouvert";
  const buttonLabel = placeholder ? "Bientôt" : locked ? "Fermé" : "Pronostiquer";

  return (
    <article className="card flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <span className="badge">{roundLabel(match.round)} {match.groupName ? `• Groupe ${match.groupName}` : ""}</span>
        <span className={`badge ${disabled ? "bg-slate-100 text-slate-600" : "bg-green-50 text-green-700"}`}>{badgeLabel}</span>
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Match {match.matchNumber ?? "—"}</p>
        <div className="mt-4 grid gap-3 rounded-3xl bg-slate-50 p-4">
          <TeamName team={match.homeTeam} />
          <div className="flex items-center gap-3 text-xs font-black uppercase tracking-[.3em] text-slate-300">
            <span className="h-px flex-1 bg-slate-200" /> vs <span className="h-px flex-1 bg-slate-200" />
          </div>
          <TeamName team={match.awayTeam} />
        </div>
        <p className="mt-4 text-sm font-semibold text-slate-600">{formatUtcDateFr(match.kickoffAt)} GMT</p>
        <p className="text-sm text-slate-500">{[match.stadium, match.city].filter(Boolean).join(" • ")}</p>
        {placeholder && <p className="mt-3 rounded-2xl bg-yellow-50 p-3 text-xs font-semibold text-yellow-800">Les équipes seront mises à jour après qualification. Les pronostics seront ouverts ensuite.</p>}
      </div>

      {match.status === "FINISHED" && match.homeScore !== null && match.awayScore !== null && (
        <div className="rounded-2xl bg-yas-navy p-4 text-white">
          <p className="text-xs font-bold uppercase text-yas-yellow">Résultat final</p>
          <p className="text-3xl font-black">{match.homeScore} - {match.awayScore}</p>
        </div>
      )}

      <div className="mt-auto flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-slate-500">{predictionCount} pronostic{predictionCount > 1 ? "s" : ""}</span>
        {disabled ? (
          <span className="btn-secondary pointer-events-none opacity-60">{buttonLabel}</span>
        ) : (
          <Link href={`/pronostic/${match.id}`} className="btn-primary">{buttonLabel}</Link>
        )}
      </div>
    </article>
  );
}
