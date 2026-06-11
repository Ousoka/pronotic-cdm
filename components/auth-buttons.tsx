"use client";

import { signIn, signOut } from "next-auth/react";

export function SignInButton() {
  return (
    <button className="btn-primary" type="button" onClick={() => signIn("google", { callbackUrl: "/matches" })}>
      Sign in with Google
    </button>
  );
}

export function SignOutButton() {
  return (
    <button className="btn-secondary py-2" type="button" onClick={() => signOut({ callbackUrl: "/" })}>
      Logout
    </button>
  );
}
