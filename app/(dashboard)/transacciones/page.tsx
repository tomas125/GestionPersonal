import { redirect } from "next/navigation";
import { Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { deleteTransaction } from "@/lib/actions/transactions";
import { FloatingAddButton } from "@/components/dashboard/floating-add-button";
import { getCategoryIcon } from "@/lib/categories/icons";
import { formatAmount, formatShortDate } from "@/lib/format";
import { fetchTransactionsInRange } from "@/lib/queries/transactions";
import { subMonths } from "date-fns";

export default async function TransaccionesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const range = { start: subMonths(new Date(), 3), end: new Date() };
  const transactions = await fetchTransactionsInRange(supabase, user.id, range);

  const grouped = new Map<string, typeof transactions>();
  for (const t of transactions) {
    const key = t.occurred_at;
    grouped.set(key, [...(grouped.get(key) ?? []), t]);
  }

  return (
    <>
      <header className="rounded-b-3xl bg-header px-4 pb-4 pt-4 text-center text-lg font-semibold">
        Movimientos
      </header>

      <div className="flex flex-col gap-4 px-4 py-4">
        {transactions.length === 0 && (
          <p className="py-8 text-center text-sm text-muted">
            Todavía no cargaste movimientos.
          </p>
        )}

        {Array.from(grouped.entries()).map(([date, items]) => (
          <div key={date}>
            <p className="mb-2 text-xs uppercase tracking-wide text-muted">
              {formatShortDate(new Date(date))}
            </p>
            <div className="flex flex-col gap-2">
              {items.map((t) => {
                const Icon = getCategoryIcon(t.category?.icon ?? "help-circle");
                return (
                  <div
                    key={t.id}
                    className="flex items-center gap-3 rounded-2xl bg-surface px-4 py-3"
                  >
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                      style={{ backgroundColor: t.category?.color ?? "#64748b" }}
                    >
                      <Icon className="h-5 w-5 text-black/80" />
                    </span>
                    <div className="flex-1">
                      <p className="text-sm">{t.category?.name ?? "Sin categoría"}</p>
                      {t.description && (
                        <p className="text-xs text-muted">{t.description}</p>
                      )}
                      {t.installments_total && t.installments_total > 1 && (
                        <p className="text-xs text-muted">
                          Cuota {t.installment_number}/{t.installments_total}
                        </p>
                      )}
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        t.type === "ingreso" ? "text-accent-green" : "text-foreground"
                      }`}
                    >
                      {t.type === "ingreso" ? "+" : "-"}
                      {formatAmount(t.amount)}
                    </span>
                    <form action={deleteTransaction.bind(null, t.id)}>
                      <button
                        type="submit"
                        aria-label="Eliminar movimiento"
                        className="text-muted hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </form>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <FloatingAddButton />
    </>
  );
}
