import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default function MerciPage() {
  return (
    <div className="mx-auto max-w-xl">
      <div className="card text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-green-100 text-green-700"><CheckCircle2 size={34} /></div>
        <h1 className="mt-6 text-3xl font-black">Pronostic enregistré</h1>
        <p className="mt-3 text-slate-600">Merci ! Ton pronostic a bien été enregistré. Il est définitif pour ce match : un seul pronostic est autorisé par email et par match.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/matches" className="btn-primary">Pronostiquer un autre match</Link>
          <Link href="/leaderboard" className="btn-secondary">Voir le classement</Link>
        </div>
      </div>
    </div>
  );
}
