"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { MatchStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { adminSessionToken, ADMIN_COOKIE_NAME, audit, requireAdmin, sanitizePersonName } from "@/lib/security";
import { env, isAllowedYasEmail, normalizeEmail } from "@/lib/env";
import { matchSchema, predictionSchema, resultSchema } from "@/lib/validators";
import { scoreMatch } from "@/lib/scoring";
import { hasPlaceholderTeam } from "@/lib/match-utils";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function toIsoDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error("Date invalide.");
  return date.toISOString();
}

function matchInputFromForm(formData: FormData) {
  return matchSchema.safeParse({
    id: getString(formData, "id") || undefined,
    matchNumber: getString(formData, "matchNumber") || undefined,
    round: getString(formData, "round"),
    groupName: getString(formData, "groupName") || null,
    homeTeam: getString(formData, "homeTeam"),
    awayTeam: getString(formData, "awayTeam"),
    stadium: getString(formData, "stadium") || null,
    city: getString(formData, "city") || null,
    kickoffAt: toIsoDate(getString(formData, "kickoffAt")),
    lockedAt: getString(formData, "lockedAt") ? toIsoDate(getString(formData, "lockedAt")) : null,
    notes: getString(formData, "notes") || null
  });
}

export type PredictionActionState = {
  status: "idle" | "error";
  title?: string;
  message?: string;
  fieldErrors?: Partial<Record<"firstName" | "lastName" | "email" | "predictedHome" | "predictedAway" | "matchId", string[]>>;
  values?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    predictedHome?: string;
    predictedAway?: string;
  };
};


function predictionValuesFromForm(formData: FormData): PredictionActionState["values"] {
  return {
    firstName: getString(formData, "firstName"),
    lastName: getString(formData, "lastName"),
    email: getString(formData, "email"),
    predictedHome: getString(formData, "predictedHome"),
    predictedAway: getString(formData, "predictedAway")
  };
}

function predictionErrorState(
  title: string,
  message: string,
  formData: FormData,
  fieldErrors?: PredictionActionState["fieldErrors"]
): PredictionActionState {
  return {
    status: "error",
    title,
    message,
    fieldErrors,
    values: predictionValuesFromForm(formData)
  };
}

export async function adminLoginAction(formData: FormData) {
  const password = getString(formData, "password");
  if (!env.adminPassword) redirect("/admin/login?error=not-configured");
  if (password !== env.adminPassword) redirect("/admin/login?error=invalid");

  cookies().set(ADMIN_COOKIE_NAME, adminSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8
  });

  await audit("ADMIN_LOGIN", "Admin");
  redirect("/admin");
}

export async function adminLogoutAction() {
  cookies().delete(ADMIN_COOKIE_NAME);
  redirect("/admin/login");
}

export async function upsertMatchAction(formData: FormData) {
  const admin = await requireAdmin();
  const parsed = matchInputFromForm(formData);
  if (!parsed.success) throw new Error("Données du match invalides.");

  const data = parsed.data;
  const payload: Prisma.WorldCupMatchUncheckedCreateInput = {
    matchNumber: data.matchNumber ?? null,
    round: data.round,
    groupName: data.groupName,
    homeTeam: data.homeTeam,
    awayTeam: data.awayTeam,
    stadium: data.stadium,
    city: data.city,
    kickoffAt: new Date(data.kickoffAt),
    lockedAt: data.lockedAt ? new Date(data.lockedAt) : null,
    notes: data.notes
  };

  const match = data.id
    ? await prisma.worldCupMatch.update({ where: { id: data.id }, data: payload })
    : await prisma.worldCupMatch.create({ data: payload });

  await audit("UPSERT_MATCH", "WorldCupMatch", match.id, { admin: admin.email });
  revalidatePath("/");
  revalidatePath("/matches");
  revalidatePath("/admin/matches");
  redirect("/admin/matches");
}

export async function savePredictionAction(
  _previousState: PredictionActionState,
  formData: FormData
): Promise<PredictionActionState> {
  const parsed = predictionSchema.safeParse({
    matchId: getString(formData, "matchId"),
    firstName: getString(formData, "firstName"),
    lastName: getString(formData, "lastName"),
    email: getString(formData, "email"),
    predictedHome: getString(formData, "predictedHome"),
    predictedAway: getString(formData, "predictedAway")
  });

  if (!parsed.success) {
    return predictionErrorState(
      "Champs à corriger",
      "Vérifie les informations saisies avant de valider ton pronostic.",
      formData,
      parsed.error.flatten().fieldErrors as PredictionActionState["fieldErrors"]
    );
  }

  const data = parsed.data;
  const email = normalizeEmail(data.email);

  if (!isAllowedYasEmail(email)) {
    return predictionErrorState(
      "Email non autorisé",
      `Seules les adresses @${env.allowedEmailDomain} sont autorisées pour participer.`,
      formData,
      { email: [`Utilise ton adresse professionnelle @${env.allowedEmailDomain}.`] }
    );
  }

  const match = await prisma.worldCupMatch.findUnique({ where: { id: data.matchId } });
  if (!match) {
    return predictionErrorState(
      "Match introuvable",
      "Ce match n’existe plus ou n’est pas disponible.",
      formData
    );
  }

  if (hasPlaceholderTeam(match)) {
    return predictionErrorState(
      "Pronostic indisponible",
      "Les équipes de ce match ne sont pas encore connues.",
      formData
    );
  }

  const lockDate = match.lockedAt ?? match.kickoffAt;
  if (new Date() >= lockDate) {
    return predictionErrorState(
      "Pronostics fermés",
      "Les pronostics sont fermés pour ce match.",
      formData
    );
  }

  if (match.status !== "SCHEDULED") {
    return predictionErrorState(
      "Pronostics fermés",
      "Ce match n’accepte plus de pronostics.",
      formData
    );
  }

  const firstName = sanitizePersonName(data.firstName);
  const lastName = sanitizePersonName(data.lastName);
  const displayName = `${firstName} ${lastName}`.trim();

  try {
    const user = await prisma.user.upsert({
      where: { email },
      update: { firstName, lastName, name: displayName },
      create: { firstName, lastName, name: displayName, email }
    });

    if (user.isBlocked) {
      return predictionErrorState(
        "Participation bloquée",
        "Cet utilisateur n’est pas autorisé à participer.",
        formData
      );
    }

    const alreadyPredicted = await prisma.prediction.findUnique({
      where: { userId_matchId: { userId: user.id, matchId: data.matchId } },
      select: { id: true }
    });

    if (alreadyPredicted) {
      return predictionErrorState(
        "Pronostic déjà enregistré",
        "Tu as déjà pronostiqué ce match avec cet email. Un seul pronostic est autorisé par email et par match.",
        formData,
        { email: ["Cet email a déjà été utilisé pour ce match."] }
      );
    }

    const prediction = await prisma.prediction.create({
      data: {
        userId: user.id,
        matchId: data.matchId,
        predictedHome: data.predictedHome,
        predictedAway: data.predictedAway
      }
    });

    await audit("SAVE_PREDICTION", "Prediction", prediction.id, { matchId: data.matchId, email, firstName, lastName });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return predictionErrorState(
        "Pronostic déjà enregistré",
        "Tu as déjà pronostiqué ce match avec cet email. Un seul pronostic est autorisé par email et par match.",
        formData,
        { email: ["Cet email a déjà été utilisé pour ce match."] }
      );
    }

    console.error("Erreur lors de l’enregistrement du pronostic", error);
    return predictionErrorState(
      "Erreur technique",
      "Impossible d’enregistrer ton pronostic pour le moment. Réessaie dans quelques instants.",
      formData
    );
  }

  revalidatePath("/");
  revalidatePath("/matches");
  revalidatePath("/leaderboard");
  redirect(`/merci?match=${data.matchId}`);
}

export async function saveResultAction(formData: FormData) {
  const admin = await requireAdmin();
  const parsed = resultSchema.safeParse({
    matchId: getString(formData, "matchId"),
    homeScore: getString(formData, "homeScore"),
    awayScore: getString(formData, "awayScore")
  });

  if (!parsed.success) throw new Error("Résultat invalide.");
  const data = parsed.data;

  await prisma.worldCupMatch.update({
    where: { id: data.matchId },
    data: {
      homeScore: data.homeScore,
      awayScore: data.awayScore,
      status: MatchStatus.FINISHED
    }
  });

  await scoreMatch(data.matchId);
  await audit("SAVE_RESULT_AND_SCORE", "WorldCupMatch", data.matchId, { admin: admin.email });
  revalidatePath("/");
  revalidatePath("/leaderboard");
  revalidatePath("/admin/results");
  revalidatePath("/matches");
  redirect("/admin/results");
}

export async function deleteMatchAction(formData: FormData) {
  const admin = await requireAdmin();
  const id = getString(formData, "id");
  if (!id) throw new Error("Identifiant du match manquant.");

  await prisma.worldCupMatch.delete({ where: { id } });
  await audit("DELETE_MATCH", "WorldCupMatch", id, { admin: admin.email });
  revalidatePath("/");
  revalidatePath("/admin/matches");
  revalidatePath("/matches");
}
