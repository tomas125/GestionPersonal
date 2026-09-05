import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buildQueryString, type SearchParamsInput } from "@/lib/url";
import {
  formatPeriodLabel,
  shiftReferenceDate,
  toISODate,
  type DateRange,
  type PeriodType,
} from "@/lib/period";

export function PeriodNav({
  basePath,
  current,
  period,
  referenceDate,
  range,
}: {
  basePath: string;
  current: SearchParamsInput;
  period: PeriodType;
  referenceDate: Date;
  range: DateRange;
}) {
  if (period === "periodo") {
    return (
      <form
        method="get"
        action={basePath}
        className="flex items-center justify-center gap-2 px-4 py-3 text-sm"
      >
        <input type="hidden" name="type" value={current.type} />
        <input type="hidden" name="period" value="periodo" />
        <input
          type="date"
          name="start"
          defaultValue={toISODate(range.start)}
          className="rounded-lg border border-border bg-surface-alt px-2 py-1 text-foreground"
        />
        <span className="text-muted">–</span>
        <input
          type="date"
          name="end"
          defaultValue={toISODate(range.end)}
          className="rounded-lg border border-border bg-surface-alt px-2 py-1 text-foreground"
        />
        <button
          type="submit"
          className="rounded-lg bg-accent-green px-3 py-1 text-black"
        >
          Ver
        </button>
      </form>
    );
  }

  const prevDate = toISODate(shiftReferenceDate(period, referenceDate, -1));
  const nextDate = toISODate(shiftReferenceDate(period, referenceDate, 1));

  return (
    <div className="flex items-center justify-between px-4 py-3">
      <Link href={`${basePath}${buildQueryString(current, { date: prevDate })}`}>
        <ChevronLeft className="h-5 w-5 text-muted" />
      </Link>
      <span className="text-sm font-medium underline decoration-muted underline-offset-4">
        {formatPeriodLabel(period, range)}
      </span>
      <Link href={`${basePath}${buildQueryString(current, { date: nextDate })}`}>
        <ChevronRight className="h-5 w-5 text-muted" />
      </Link>
    </div>
  );
}
