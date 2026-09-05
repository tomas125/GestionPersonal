"use client";

import { useActionState, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { addDays, format } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { createTransaction, type TransactionActionState } from "@/lib/actions/transactions";
import { getCategoryIcon } from "@/lib/categories/icons";
import type { Account, Category, MovementType, PaymentMethod } from "@/lib/types/database";

const initialState: TransactionActionState = {};

function quickDateOptions() {
  const today = new Date();
  return [
    { label: "hoy", sublabel: format(today, "d/M"), date: today },
    { label: "ayer", sublabel: format(addDays(today, -1), "d/M"), date: addDays(today, -1) },
    {
      label: "hace dos días",
      sublabel: format(addDays(today, -2), "d/M"),
      date: addDays(today, -2),
    },
  ];
}

export function QuickAddForm({
  categories,
  accounts,
  paymentMethods,
}: {
  categories: Category[];
  accounts: Account[];
  paymentMethods: PaymentMethod[];
}) {
  const router = useRouter();
  const [type, setType] = useState<MovementType>("gasto");
  const [categoryId, setCategoryId] = useState<string>("");
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [useCustomDate, setUseCustomDate] = useState(false);
  const [installments, setInstallments] = useState(1);

  const dateOptions = useMemo(quickDateOptions, []);
  const filteredCategories = categories.filter((c) => c.type === type);

  const [state, formAction, pending] = useActionState(async (
    prevState: TransactionActionState,
    formData: FormData,
  ) => {
    const result = await createTransaction(prevState, formData);
    if (result.success) router.push("/");
    return result;
  }, initialState);

  return (
    <>
      <header className="flex items-center gap-3 bg-header px-4 py-4 text-foreground">
        <button type="button" onClick={() => router.back()} aria-label="Volver">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-base font-medium">Añadir transacciones</h1>
      </header>

      <div className="flex border-b border-border px-4">
        {(["gasto", "ingreso"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              setType(t);
              setCategoryId("");
            }}
            className={`flex-1 border-b-2 py-3 text-center text-sm font-medium ${
              type === t
                ? "border-foreground text-foreground"
                : "border-transparent text-muted"
            }`}
          >
            {t === "gasto" ? "GASTOS" : "INGRESOS"}
          </button>
        ))}
      </div>

      <form action={formAction} className="flex flex-col gap-6 px-4 py-4">
        <input type="hidden" name="type" value={type} />
        <input type="hidden" name="categoryId" value={categoryId} />
        <input
          type="hidden"
          name="occurredAt"
          value={format(selectedDate, "yyyy-MM-dd")}
        />

        <div className="flex flex-col gap-1">
          <label className="text-sm text-muted">Monto</label>
          <input
            name="amount"
            type="number"
            step="0.01"
            min="0"
            inputMode="decimal"
            required
            placeholder="0"
            className="rounded-lg bg-surface-alt border border-border px-4 py-3 text-2xl font-semibold outline-none focus:border-accent-green"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-muted">Cuenta</label>
          <select
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            name="accountId"
            className="rounded-lg bg-surface-alt border border-border px-4 py-3 text-accent-green outline-none"
          >
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-muted">Categorías</label>
          <div className="grid grid-cols-4 gap-3">
            {filteredCategories.map((c) => {
              const Icon = getCategoryIcon(c.icon);
              const active = c.id === categoryId;
              return (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => setCategoryId(c.id)}
                  className="flex flex-col items-center gap-1"
                >
                  <span
                    className={`flex h-14 w-14 items-center justify-center rounded-full ring-2 ${
                      active ? "ring-accent-green" : "ring-transparent"
                    }`}
                    style={{ backgroundColor: c.color }}
                  >
                    <Icon className="h-6 w-6 text-black/80" />
                  </span>
                  <span className="text-center text-xs text-muted">{c.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-muted">Fecha</label>
          <div className="flex items-center gap-2">
            {dateOptions.map((opt) => {
              const active =
                !useCustomDate && format(selectedDate, "yyyy-MM-dd") === format(opt.date, "yyyy-MM-dd");
              return (
                <button
                  type="button"
                  key={opt.label}
                  onClick={() => {
                    setSelectedDate(opt.date);
                    setUseCustomDate(false);
                  }}
                  className={`flex flex-col items-center rounded-lg px-3 py-2 text-xs ${
                    active ? "bg-accent-green text-black" : "bg-surface-alt text-muted"
                  }`}
                >
                  <span>{opt.sublabel}</span>
                  <span>{opt.label}</span>
                </button>
              );
            })}
            <label className="flex items-center gap-1 rounded-lg bg-surface-alt px-3 py-2 text-muted">
              <CalendarDays className="h-4 w-4" />
              <input
                type="date"
                className="bg-transparent text-xs outline-none [color-scheme:dark]"
                value={format(selectedDate, "yyyy-MM-dd")}
                onChange={(e) => {
                  if (!e.target.value) return;
                  setSelectedDate(new Date(`${e.target.value}T00:00:00`));
                  setUseCustomDate(true);
                }}
              />
            </label>
          </div>
          {useCustomDate && (
            <p className="text-xs text-muted">
              {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-muted">Medio de pago</label>
            <select
              name="paymentMethodId"
              defaultValue=""
              className="rounded-lg bg-surface-alt border border-border px-4 py-3 outline-none"
            >
              <option value="">Sin especificar</option>
              {paymentMethods.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-muted">Cuotas</label>
            <input
              name="installmentsTotal"
              type="number"
              min={1}
              max={60}
              value={installments}
              onChange={(e) => setInstallments(Number(e.target.value) || 1)}
              className="rounded-lg bg-surface-alt border border-border px-4 py-3 outline-none"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-muted">Comentario</label>
          <textarea
            name="description"
            rows={2}
            placeholder="Comentario"
            className="rounded-lg bg-surface-alt border border-border px-4 py-3 outline-none focus:border-accent-green"
          />
        </div>

        {state.error && <p className="text-sm text-red-400">{state.error}</p>}

        <button
          type="submit"
          disabled={pending || !categoryId || !accountId}
          className="rounded-lg bg-accent-amber px-4 py-3 font-medium text-black disabled:opacity-50"
        >
          {pending ? "Guardando..." : "Añadir"}
        </button>
      </form>
    </>
  );
}
