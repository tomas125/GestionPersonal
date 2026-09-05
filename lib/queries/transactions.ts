import type { SupabaseClient } from "@supabase/supabase-js";
import { format } from "date-fns";
import type { DateRange, EvolutionGranularity } from "@/lib/period";
import { toISODate } from "@/lib/period";
import type { MovementType } from "@/lib/types/database";

export interface TransactionRow {
  id: string;
  amount: number;
  description: string | null;
  occurred_at: string;
  type: MovementType;
  installment_number: number | null;
  installments_total: number | null;
  category: {
    id: string;
    name: string;
    icon: string;
    color: string;
  } | null;
}

export interface CategoryBreakdownItem {
  categoryId: string;
  name: string;
  icon: string;
  color: string;
  total: number;
  percent: number;
}

const TRANSACTION_SELECT =
  "id, amount, description, occurred_at, type, installment_number, installments_total, category:categories(id, name, icon, color)";

export async function fetchTransactionsInRange(
  supabase: SupabaseClient,
  userId: string,
  range: DateRange,
  type?: MovementType,
): Promise<TransactionRow[]> {
  let query = supabase
    .from("transactions")
    .select(TRANSACTION_SELECT)
    .eq("user_id", userId)
    .gte("occurred_at", toISODate(range.start))
    .lte("occurred_at", toISODate(range.end))
    .order("occurred_at", { ascending: false });

  if (type) {
    query = query.eq("type", type);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as TransactionRow[];
}

export function summarizeByCategory(
  transactions: TransactionRow[],
): { items: CategoryBreakdownItem[]; total: number } {
  const total = transactions.reduce((sum, t) => sum + Number(t.amount), 0);

  const byCategory = new Map<string, CategoryBreakdownItem>();
  for (const t of transactions) {
    if (!t.category) continue;
    const existing = byCategory.get(t.category.id);
    if (existing) {
      existing.total += Number(t.amount);
    } else {
      byCategory.set(t.category.id, {
        categoryId: t.category.id,
        name: t.category.name,
        icon: t.category.icon,
        color: t.category.color,
        total: Number(t.amount),
        percent: 0,
      });
    }
  }

  const items = Array.from(byCategory.values())
    .map((item) => ({
      ...item,
      percent: total > 0 ? (item.total / total) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total);

  return { items, total };
}

export interface EvolutionPoint {
  bucketKey: string;
  label: string;
  ingresos: number;
  gastos: number;
  beneficio: number;
  perdida: number;
}

const BUCKET_FORMAT: Record<EvolutionGranularity, string> = {
  dia: "yyyy-MM-dd",
  semana: "RRRR-'W'II",
  mes: "yyyy-MM",
  anio: "yyyy",
};

const LABEL_FORMAT: Record<EvolutionGranularity, string> = {
  dia: "d MMM",
  semana: "d MMM",
  mes: "MMM",
  anio: "yyyy",
};

export async function fetchEvolution(
  supabase: SupabaseClient,
  userId: string,
  range: DateRange,
  granularity: EvolutionGranularity,
): Promise<EvolutionPoint[]> {
  const { data, error } = await supabase
    .from("transactions")
    .select("amount, type, occurred_at")
    .eq("user_id", userId)
    .gte("occurred_at", toISODate(range.start))
    .lte("occurred_at", toISODate(range.end));

  if (error) throw error;

  const buckets = new Map<string, { ingresos: number; gastos: number; date: Date }>();
  for (const row of (data ?? []) as { amount: number; type: MovementType; occurred_at: string }[]) {
    const date = new Date(row.occurred_at);
    const key = format(date, BUCKET_FORMAT[granularity]);
    const bucket = buckets.get(key) ?? { ingresos: 0, gastos: 0, date };
    if (row.type === "ingreso") bucket.ingresos += Number(row.amount);
    else bucket.gastos += Number(row.amount);
    buckets.set(key, bucket);
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([bucketKey, bucket]) => {
      const beneficio = Math.max(bucket.ingresos - bucket.gastos, 0);
      const perdida = Math.max(bucket.gastos - bucket.ingresos, 0);
      return {
        bucketKey,
        label: format(bucket.date, LABEL_FORMAT[granularity]).replace(".", ""),
        ingresos: bucket.ingresos,
        gastos: bucket.gastos,
        beneficio,
        perdida,
      };
    });
}

export interface PeriodTotals {
  gastos: number;
  ingresos: number;
  balance: number;
}

export async function fetchPeriodTotals(
  supabase: SupabaseClient,
  userId: string,
  range: DateRange,
): Promise<PeriodTotals> {
  const { data, error } = await supabase
    .from("transactions")
    .select("amount, type")
    .eq("user_id", userId)
    .gte("occurred_at", toISODate(range.start))
    .lte("occurred_at", toISODate(range.end));

  if (error) throw error;

  let gastos = 0;
  let ingresos = 0;
  for (const row of (data ?? []) as { amount: number; type: MovementType }[]) {
    if (row.type === "gasto") gastos += Number(row.amount);
    else ingresos += Number(row.amount);
  }

  return { gastos, ingresos, balance: ingresos - gastos };
}

export async function fetchTotalBalance(
  supabase: SupabaseClient,
  userId: string,
): Promise<number> {
  const [{ data: accounts, error: accountsError }, { data: transactions, error: txError }] =
    await Promise.all([
      supabase.from("accounts").select("initial_balance").eq("user_id", userId),
      supabase.from("transactions").select("amount, type").eq("user_id", userId),
    ]);

  if (accountsError) throw accountsError;
  if (txError) throw txError;

  const initial = (accounts ?? []).reduce(
    (sum, a) => sum + Number((a as { initial_balance: number }).initial_balance),
    0,
  );

  const net = (transactions ?? []).reduce((sum, t) => {
    const row = t as { amount: number; type: MovementType };
    return sum + (row.type === "ingreso" ? Number(row.amount) : -Number(row.amount));
  }, 0);

  return initial + net;
}
