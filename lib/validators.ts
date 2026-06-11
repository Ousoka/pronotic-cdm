import { z } from "zod";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => (value.length ? value : null))
    .optional()
    .nullable();

export const matchSchema = z.object({
  id: z.string().cuid().optional(),
  matchNumber: z.coerce.number().int().positive().optional(),
  round: z.enum(["GROUP", "ROUND_OF_32", "ROUND_OF_16", "QUARTER_FINAL", "SEMI_FINAL", "THIRD_PLACE", "FINAL"]),
  groupName: optionalText(10),
  homeTeam: z.string().trim().min(2).max(80),
  awayTeam: z.string().trim().min(2).max(80),
  stadium: optionalText(120),
  city: optionalText(80),
  kickoffAt: z.string().datetime(),
  lockedAt: z.string().datetime().optional().nullable(),
  notes: optionalText(500)
});

export const resultSchema = z.object({
  matchId: z.string().cuid(),
  homeScore: z.coerce.number().int().min(0).max(30),
  awayScore: z.coerce.number().int().min(0).max(30)
});

export const predictionSchema = z.object({
  matchId: z.string().cuid(),
  firstName: z.string().trim().min(2, "Prénom requis").max(80),
  lastName: z.string().trim().min(2, "Nom requis").max(80),
  email: z.string().trim().toLowerCase().email("Email invalide").max(160),
  predictedHome: z.coerce.number().int().min(0).max(30),
  predictedAway: z.coerce.number().int().min(0).max(30)
});
