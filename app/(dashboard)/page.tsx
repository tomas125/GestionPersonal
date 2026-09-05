import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/dashboard/app-header";
import { TypeTabs } from "@/components/dashboard/type-tabs";
import { PeriodTabs } from "@/components/dashboard/period-tabs";
import { PeriodNav } from "@/components/dashboard/period-nav";
import { CategoryDonut } from "@/components/dashboard/category-donut";
import { CategoryBreakdownList } from "@/components/dashboard/category-breakdown-list";
import { FloatingAddButton } from "@/components/dashboard/floating-add-button";
import { getPeriodRange, type PeriodType } from "@/lib/period";
import {
  fetchTotalBalance,
  fetchTransactionsInRange,
  summarizeByCategory,
} from "@/lib/queries/transactions";
import type { MovementType } from "@/lib/types/database";

const VALID_PERIODS: PeriodType[] = ["dia", "semana", "mes", "anio", "periodo"];

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const type: MovementType = params.type === "ingreso" ? "ingreso" : "gasto";
  const period: PeriodType = VALID_PERIODS.includes(params.period as PeriodType)
    ? (params.period as PeriodType)
    : "mes";
  const referenceDate = params.date ? new Date(params.date) : new Date();
  const custom =
    period === "periodo" && params.start && params.end
      ? { start: new Date(params.start), end: new Date(params.end) }
      : undefined;

  const range = getPeriodRange(period, referenceDate, custom);

  const [transactions, totalBalance] = await Promise.all([
    fetchTransactionsInRange(supabase, user.id, range, type),
    fetchTotalBalance(supabase, user.id),
  ]);

  const { items, total } = summarizeByCategory(transactions);
  const current = { type, period, date: params.date, start: params.start, end: params.end };

  return (
    <>
      <AppHeader totalBalance={totalBalance} />
      <TypeTabs basePath="/" current={current} activeType={type} />
      <PeriodTabs basePath="/" current={current} activePeriod={period} />
      <PeriodNav
        basePath="/"
        current={current}
        period={period}
        referenceDate={referenceDate}
        range={range}
      />
      <CategoryDonut items={items} total={total} />
      <CategoryBreakdownList items={items} />
      <FloatingAddButton />
    </>
  );
}
