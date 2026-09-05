"use client";

import { useActionState, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { createAccount, deleteAccount } from "@/lib/actions/accounts";
import type { Account, AccountType } from "@/lib/types/database";

const ACCOUNT_TYPES: { value: AccountType; label: string }[] = [
  { value: "banco", label: "Banco" },
  { value: "efectivo", label: "Efectivo" },
  { value: "tarjeta", label: "Tarjeta" },
  { value: "otro", label: "Otro" },
];

export function AccountsPanel({ accounts }: { accounts: Account[] }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(async (
    prevState: { error?: string; success?: boolean },
    formData: FormData,
  ) => {
    const result = await createAccount(prevState, formData);
    if (result.success) setOpen(false);
    return result;
  }, {});

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-xs uppercase tracking-wide text-muted">Cuentas</h2>
      {accounts.map((a) => (
        <div key={a.id} className="flex items-center gap-3 rounded-2xl bg-surface px-4 py-3">
          <span className="flex-1 text-sm">{a.name}</span>
          <span className="text-xs text-muted">{a.type}</span>
          <form action={deleteAccount.bind(null, a.id)}>
            <button type="submit" aria-label="Eliminar cuenta" className="text-muted hover:text-red-400">
              <Trash2 className="h-4 w-4" />
            </button>
          </form>
        </div>
      ))}

      {open ? (
        <form action={formAction} className="flex flex-col gap-2 rounded-2xl bg-surface p-4">
          <input
            name="name"
            placeholder="Nombre de la cuenta"
            required
            className="rounded-lg bg-surface-alt border border-border px-3 py-2 text-sm outline-none"
          />
          <select
            name="type"
            defaultValue="banco"
            className="rounded-lg bg-surface-alt border border-border px-3 py-2 text-sm outline-none"
          >
            {ACCOUNT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <input
            name="initialBalance"
            type="number"
            step="0.01"
            placeholder="Saldo inicial"
            className="rounded-lg bg-surface-alt border border-border px-3 py-2 text-sm outline-none"
          />
          {state.error && <p className="text-xs text-red-400">{state.error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={pending}
              className="rounded-lg bg-accent-green px-3 py-2 text-xs font-medium text-black disabled:opacity-60"
            >
              {pending ? "Guardando..." : "Crear"}
            </button>
            <button type="button" onClick={() => setOpen(false)} className="text-xs text-muted">
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-3 text-sm text-muted hover:text-accent-green"
        >
          <Plus className="h-4 w-4" />
          Nueva cuenta
        </button>
      )}
    </section>
  );
}
