import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { formatUtcDateFr } from "@/lib/date";
import { hasPlaceholderTeam, isPredictionClosed } from "@/lib/match-utils";
import { TeamName } from "@/components/team-name";
import { PredictionForm } from "@/components/prediction-form";

export default async function PronosticPage({
  params,
  searchParams
}: {
  params: { matchId: string };
  searchParams?: { error?: string };
}) {
  const match = await prisma.worldCupMatch.findUnique({ where: { id: params.matchId } });
  if (!match) notFound();

  const placeholder = hasPlaceholderTeam(match);
  const locked = isPredictionClosed(match);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="card">
        <p className="badge inline-flex">{formatUtcDateFr(match.kickoffAt, "long")} GMT</p>
        <div className="mt-5 grid gap-4 rounded-[2rem] bg-slate-50 p-5">
          <TeamName team={match.homeTeam} size="lg" />
          <div className="flex items-center gap-3 text-xs font-black uppercase tracking-[.35em] text-slate-300">
            <span className="h-px flex-1 bg-slate-200" /> vs <span className="h-px flex-1 bg-slate-200" />
          </div>
          <TeamName team={match.awayTeam} size="lg" />
        </div>
        <p className="mt-4 text-slate-500">{[match.stadium, match.city].filter(Boolean).join(" • ")}</p>

        {placeholder ? (
          <p className="mt-6 rounded-2xl bg-yellow-50 p-4 font-bold text-yellow-800">
            Les équipes de ce match ne sont pas encore connues. L’admin pourra les modifier après qualification, puis les pronostics seront ouverts.
          </p>
        ) : locked ? (
          <p className="mt-6 rounded-2xl bg-red-50 p-4 font-bold text-red-700">Les pronostics sont fermés pour ce match.</p>
        ) : (
          <PredictionForm
            matchId={match.id}
            homeTeam={match.homeTeam}
            awayTeam={match.awayTeam}
            allowedEmailDomain={env.allowedEmailDomain}
            initialError={searchParams?.error === "already" ? "already" : undefined}
          />
        )}
      </div>
    </div>
  );
}
