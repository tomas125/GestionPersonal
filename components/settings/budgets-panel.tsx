"use client";

import { useActionState, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { createBudget, deleteBudget } from "@/lib/actions/budgets";
import { formatAmount } from "@/lib/format";
import type { Budget, Category } from "@/lib/types/database";

export function BudgetsPanel({
  budgets,
  categories,
}: {
  budgets: Budget[];
  categories: Category[];
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(async (
    prevState: { error?: string; success?: boolean },
    formData: FormData,
  ) => {
    const result = await createBudget(prevState, formData);
    if (result.success) setOpen(false);
    return result;
  }, {});

  const categoryName = (id: string | null) =>
    id ? categories.find((c) => c.id === id)?.name ?? "Categoría eliminada" : "General";

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-xs uppercase tracking-wide text-muted">Presupuestos mensuales</h2>
      {budgets.map((b) => (
        <div key={b.id} className="flex items-center gap-3 rounded-2xl bg-surface px-4 py-3">
          <span className="flex-1 text-sm">{categoryName(b.category_id)}</span>
          <span className="text-sm text-muted">{formatAmount(b.amount)}</span>
          <form action={deleteBudget.bind(null, b.id)}>
            <button type="submit" aria-label="Eliminar presupuesto" className="text-muted hover:text-red-400">
              <Trash2 className="h-4 w-4" />
            </button>
          </form>
        </div>
      ))}

      {open ? (
        <form action={formAction} className="flex flex-col gap-2 rounded-2xl bg-surface p-4">
          <select
            name="categoryId"
            defaultValue=""
            className="rounded-lg bg-surface-alt border border-border px-3 py-2 text-sm outline-none"
          >
            <option value="">General (todas las categorías)</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <input
            name="amount"
            type="number"
            step="0.01"
            min="0"
            required
            placeholder="Monto mensual"
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
          Nuevo presupuesto
        </button>
      )}
    </section>
  );
}
