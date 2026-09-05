import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EvolutionChart } from "@/components/charts/evolution-chart";
import { buildQueryString } from "@/lib/url";
import { getEvolutionRange, type EvolutionGranularity } from "@/lib/period";
import { fetchEvolution } from "@/lib/queries/transactions";

const VIEW_TABS = [
  { value: "general", label: "GENERAL" },
  { value: "gastos", label: "GASTOS" },
  { value: "ingresos", label: "INGRESOS" },
] as const;

const GRANULARITY_TABS: { value: EvolutionGranularity; label: string }[] = [
  { value: "anio", label: "por año" },
  { value: "mes", label: "por mes" },
  { value: "semana", label: "por semana" },
  { value: "dia", label: "por día" },
];

type ViewMode = (typeof VIEW_TABS)[number]["value"];

export default async function GraficosPage({
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

  const view: ViewMode = VIEW_TABS.some((t) => t.value === params.view)
    ? (params.view as ViewMode)
    : "general";
  const granularity: EvolutionGranularity = GRANULARITY_TABS.some(
    (t) => t.value === params.granularity,
  )
    ? (params.granularity as EvolutionGranularity)
    : "mes";

  const range = getEvolutionRange(granularity);
  const data = await fetchEvolution(supabase, user.id, range, granularity);

  const current = { view, granularity };
  const seriesKeys =
    view === "gastos"
      ? (["gastos"] as const)
      : view === "ingresos"
        ? (["ingresos"] as const)
        : undefined;

  const yearLabel = range.end.getFullYear();

  return (
    <>
      <header className="rounded-b-3xl bg-header px-4 pb-4 pt-4 text-center text-lg font-semibold">
        Gráficos
      </header>

      <div className="flex border-b border-border px-4">
        {VIEW_TABS.map((tab) => (
          <Link
            key={tab.value}
            href={`/graficos${buildQueryString(current, { view: tab.value })}`}
            className={`flex-1 border-b-2 py-3 text-center text-sm font-medium ${
              view === tab.value
                ? "border-foreground text-foreground"
                : "border-transparent text-muted"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="flex items-center justify-between px-4 py-3 text-sm">
        {GRANULARITY_TABS.map((tab) => (
          <Link
            key={tab.value}
            href={`/graficos${buildQueryString(current, { granularity: tab.value })}`}
            className={granularity === tab.value ? "text-accent-green" : "text-muted"}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="rounded-2xl bg-surface mx-4 pt-4">
        <EvolutionChart data={data} seriesKeys={seriesKeys ? [...seriesKeys] : undefined} />
      </div>

      <p className="pt-3 text-center text-sm text-muted">{yearLabel}</p>
    </>
  );
}
