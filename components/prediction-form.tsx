"use client";

import { AlertCircle, CheckCircle2, Loader2, MailWarning } from "lucide-react";
import { useFormState, useFormStatus } from "react-dom";
import { savePredictionAction } from "@/lib/actions";
import type { PredictionActionState } from "@/lib/actions";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button className="btn-primary text-base disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={pending}>
      {pending ? (
        <span className="inline-flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" /> Enregistrement...
        </span>
      ) : (
        "Valider mon pronostic"
      )}
    </button>
  );
}

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return <p className="mt-2 text-xs font-bold text-red-600">{messages[0]}</p>;
}

function ErrorBox({ state }: { state: PredictionActionState }) {
  if (state.status !== "error") return null;

  const isEmailError = state.fieldErrors?.email?.length;

  return (
    <div className="rounded-[1.75rem] border border-red-200 bg-red-50 p-4 text-red-900" role="alert" aria-live="polite">
      <div className="flex gap-3">
        <div className="mt-0.5 rounded-2xl bg-white p-2 text-red-600 shadow-sm">
          {isEmailError ? <MailWarning className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
        </div>
        <div>
          <p className="font-black">{state.title ?? "Action impossible"}</p>
          <p className="mt-1 text-sm font-semibold text-red-800">{state.message}</p>
        </div>
      </div>
    </div>
  );
}

export function PredictionForm({
  matchId,
  homeTeam,
  awayTeam,
  allowedEmailDomain,
  initialError
}: {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  allowedEmailDomain: string;
  initialError?: "already";
}) {
  const initialState: PredictionActionState = initialError === "already"
    ? {
        status: "error",
        title: "Pronostic déjà enregistré",
        message: "Tu as déjà pronostiqué ce match avec cet email. Un seul pronostic est autorisé par email et par match."
      }
    : { status: "idle" };

  const [state, formAction] = useFormState(savePredictionAction, initialState);
  const values = state.values;

  return (
    <form action={formAction} className="mt-8 grid gap-5" noValidate>
      <input type="hidden" name="matchId" value={matchId} />

      <ErrorBox state={state} />

      <div className="rounded-3xl border border-blue-100 bg-blue-50 p-4 text-sm font-semibold text-blue-950">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-yas-blue" />
          <p>
            Aucun compte à créer. Renseigne ton prénom, nom, email professionnel et uniquement ton score pronostiqué. Un seul pronostic est autorisé par email et par match. Barème : score exact 3 pts, bon résultat 1 pt.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="label" htmlFor="firstName">Prénom</label>
          <input
            className="input mt-2"
            id="firstName"
            name="firstName"
            placeholder="Ex: Ousmane"
            required
            minLength={2}
            maxLength={80}
            autoComplete="given-name"
            defaultValue={values?.firstName ?? ""}
            aria-invalid={Boolean(state.fieldErrors?.firstName)}
          />
          <FieldError messages={state.fieldErrors?.firstName} />
        </div>
        <div>
          <label className="label" htmlFor="lastName">Nom</label>
          <input
            className="input mt-2"
            id="lastName"
            name="lastName"
            placeholder="Ex: KA"
            required
            minLength={2}
            maxLength={80}
            autoComplete="family-name"
            defaultValue={values?.lastName ?? ""}
            aria-invalid={Boolean(state.fieldErrors?.lastName)}
          />
          <FieldError messages={state.fieldErrors?.lastName} />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="email">Email professionnel</label>
        <input
          className="input mt-2"
          id="email"
          name="email"
          type="email"
          placeholder={`prenom.nom@${allowedEmailDomain}`}
          required
          maxLength={160}
          autoComplete="email"
          defaultValue={values?.email ?? ""}
          aria-invalid={Boolean(state.fieldErrors?.email)}
        />
        <FieldError messages={state.fieldErrors?.email} />
        <p className="mt-2 text-xs text-slate-500">Seules les adresses @{allowedEmailDomain} sont acceptées.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 rounded-[2rem] bg-white p-2">
        <div>
          <label className="label block px-2 pt-2" htmlFor="predictedHome">Score {homeTeam}</label>
          <input
            className="input mt-2 text-center text-3xl font-black"
            id="predictedHome"
            name="predictedHome"
            type="number"
            min="0"
            max="30"
            required
            defaultValue={values?.predictedHome ?? "0"}
            aria-invalid={Boolean(state.fieldErrors?.predictedHome)}
          />
          <FieldError messages={state.fieldErrors?.predictedHome} />
        </div>
        <div>
          <label className="label block px-2 pt-2" htmlFor="predictedAway">Score {awayTeam}</label>
          <input
            className="input mt-2 text-center text-3xl font-black"
            id="predictedAway"
            name="predictedAway"
            type="number"
            min="0"
            max="30"
            required
            defaultValue={values?.predictedAway ?? "0"}
            aria-invalid={Boolean(state.fieldErrors?.predictedAway)}
          />
          <FieldError messages={state.fieldErrors?.predictedAway} />
        </div>
      </div>

      <p className="text-xs text-slate-500">Après validation, ton pronostic est définitif pour ce match. Aucun second pronostic ne sera accepté avec le même email.</p>

      <SubmitButton />
    </form>
  );
}
