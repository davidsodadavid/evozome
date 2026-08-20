"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/app/actions/auth";

const initialState: LoginState = {};

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6">
      <div className="flex items-center gap-3 mb-8 justify-center">
        <img src="/evozome/logo-light.png" alt="" width={26} height={26} />
        <span className="text-sm font-bold tracking-[0.22em]">EVOZOME</span>
      </div>
      <div className="rounded-xl bg-white/5 border border-white/10 p-8">
        <h1 className="mb-6 text-xl font-semibold text-white">Admin login</h1>
        <form action={formAction} className="flex flex-col gap-4">
          <input
            type="password"
            name="password"
            required
            autoFocus
            placeholder="Password"
            className="w-full rounded-md border border-white/15 bg-transparent px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none"
          />
          {state.error && <p className="text-sm text-red-400">{state.error}</p>}
          <button
            type="submit"
            disabled={pending}
            className="rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50"
            style={{ backgroundColor: "rgb(226,224,213)", color: "rgb(20,21,22)" }}
          >
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
