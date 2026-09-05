"use client";

import { useActionState, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { createPaymentMethod, deletePaymentMethod } from "@/lib/actions/accounts";
import type { PaymentMethod } from "@/lib/types/database";

export function PaymentMethodsPanel({ methods }: { methods: PaymentMethod[] }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(async (
    prevState: { error?: string; success?: boolean },
    formData: FormData,
  ) => {
    const result = await createPaymentMethod(prevState, formData);
    if (result.success) setOpen(false);
    return result;
  }, {});

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-xs uppercase tracking-wide text-muted">Medios de pago</h2>
      {methods.map((m) => (
        <div key={m.id} className="flex items-center gap-3 rounded-2xl bg-surface px-4 py-3">
          <span className="flex-1 text-sm">{m.name}</span>
          <form action={deletePaymentMethod.bind(null, m.id)}>
            <button type="submit" aria-label="Eliminar medio de pago" className="text-muted hover:text-red-400">
              <Trash2 className="h-4 w-4" />
            </button>
          </form>
        </div>
      ))}

      {open ? (
        <form action={formAction} className="flex flex-col gap-2 rounded-2xl bg-surface p-4">
          <input
            name="name"
            placeholder="Nombre del medio de pago"
            required
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
          Nuevo medio de pago
        </button>
      )}
    </section>
  );
}
