import Link from "next/link";
import { buildQueryString, type SearchParamsInput } from "@/lib/url";
import type { MovementType } from "@/lib/types/database";

export function TypeTabs({
  basePath,
  current,
  activeType,
}: {
  basePath: string;
  current: SearchParamsInput;
  activeType: MovementType;
}) {
  const tabs: { value: MovementType; label: string }[] = [
    { value: "gasto", label: "GASTOS" },
    { value: "ingreso", label: "INGRESOS" },
  ];

  return (
    <div className="flex border-b border-border px-4">
      {tabs.map((tab) => {
        const active = tab.value === activeType;
        return (
          <Link
            key={tab.value}
            href={`${basePath}${buildQueryString(current, { type: tab.value })}`}
            className={`flex-1 border-b-2 py-3 text-center text-sm font-medium ${
              active
                ? "border-foreground text-foreground"
                : "border-transparent text-muted"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
