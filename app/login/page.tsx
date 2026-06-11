import { ShieldAlert } from "lucide-react";
import { SignInButton } from "@/components/auth-buttons";

export default function LoginPage({ searchParams }: { searchParams?: { error?: string } }) {
  return (
    <div className="mx-auto max-w-xl">
      <div className="card text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-yas-navy text-yas-yellow"><ShieldAlert /></div>
        <h1 className="mt-6 text-3xl font-black">YAS secure login</h1>
        <p className="mt-3 text-slate-600">Use your verified Google account ending with <strong>@yas.sn</strong>. Personal emails are blocked automatically.</p>
        {searchParams?.error && <p className="mt-4 rounded-2xl bg-red-50 p-3 text-sm font-bold text-red-700">Access refused. Please use an authorized YAS email.</p>}
        <div className="mt-6 flex justify-center"><SignInButton /></div>
      </div>
    </div>
  );
}
