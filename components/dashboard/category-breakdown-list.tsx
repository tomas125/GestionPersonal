import { getCategoryIcon } from "@/lib/categories/icons";
import { formatAmount, formatPercent } from "@/lib/format";
import type { CategoryBreakdownItem } from "@/lib/queries/transactions";

export function CategoryBreakdownList({
  items,
}: {
  items: CategoryBreakdownItem[];
}) {
  if (items.length === 0) {
    return (
      <p className="px-4 py-8 text-center text-sm text-muted">
        No hay movimientos en este período.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3 px-4 py-4">
      {items.map((item) => {
        const Icon = getCategoryIcon(item.icon);
        return (
          <div
            key={item.categoryId}
            className="flex items-center gap-3 rounded-2xl bg-surface px-4 py-3"
          >
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: item.color }}
            >
              <Icon className="h-5 w-5 text-black/80" />
            </span>
            <span className="flex-1 text-sm">{item.name}</span>
            <span className="w-12 text-right text-sm text-muted">
              {formatPercent(item.percent)}
            </span>
            <span className="w-24 text-right text-sm font-medium">
              {formatAmount(item.total)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
