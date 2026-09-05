import Link from "next/link";
import { buildQueryString, type SearchParamsInput } from "@/lib/url";
import type { PeriodType } from "@/lib/period";

const TABS: { value: PeriodType; label: string }[] = [
  { value: "dia", label: "Día" },
  { value: "semana", label: "Semana" },
  { value: "mes", label: "Mes" },
  { value: "anio", label: "Año" },
  { value: "periodo", label: "Período" },
];

export function PeriodTabs({
  basePath,
  current,
  activePeriod,
}: {
  basePath: string;
  current: SearchParamsInput;
  activePeriod: PeriodType;
}) {
  return (
    <div className="flex items-center justify-between px-4 pt-4 text-sm">
      {TABS.map((tab) => {
        const active = tab.value === activePeriod;
        return (
          <Link
            key={tab.value}
            href={`${basePath}${buildQueryString(current, {
              period: tab.value,
              date: undefined,
              start: undefined,
              end: undefined,
            })}`}
            className={active ? "text-accent-green" : "text-muted"}
          >
            {tab.label}
            {active && (
              <span className="mt-1 block h-0.5 rounded bg-accent-green" />
            )}
          </Link>
        );
      })}
    </div>
  );
}
