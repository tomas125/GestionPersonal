"use client";

import { useActionState, useState } from "react";
import { signIn, signUp, type AuthActionState } from "@/lib/actions/auth";

const initialState: AuthActionState = {};

export function LoginForm() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const action = mode === "signin" ? signIn : signUp;
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm text-muted">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="rounded-lg bg-surface-alt border border-border px-4 py-3 text-foreground outline-none focus:border-accent-green"
          placeholder="vos@ejemplo.com"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm text-muted">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete={mode === "signin" ? "current-password" : "new-password"}
          className="rounded-lg bg-surface-alt border border-border px-4 py-3 text-foreground outline-none focus:border-accent-green"
          placeholder="••••••••"
        />
      </div>

      {state.error && <p className="text-sm text-red-400">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-lg bg-accent-green px-4 py-3 font-medium text-black disabled:opacity-60"
      >
        {pending
          ? "Ingresando..."
          : mode === "signin"
            ? "Ingresar"
            : "Crear cuenta"}
      </button>

      <button
        type="button"
        onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        className="text-sm text-muted hover:text-accent-green"
      >
        {mode === "signin"
          ? "¿Primera vez? Creá tu cuenta"
          : "¿Ya tenés cuenta? Ingresá"}
      </button>
    </form>
  );
}
