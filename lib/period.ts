import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  endOfDay,
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subDays,
  subMonths,
  subWeeks,
  subYears,
} from "date-fns";
import { es } from "date-fns/locale";

export type EvolutionGranularity = "dia" | "semana" | "mes" | "anio";

export type PeriodType = "dia" | "semana" | "mes" | "anio" | "periodo";

export interface DateRange {
  start: Date;
  end: Date;
}

export function getPeriodRange(
  type: PeriodType,
  referenceDate: Date,
  custom?: DateRange,
): DateRange {
  switch (type) {
    case "dia":
      return { start: startOfDay(referenceDate), end: endOfDay(referenceDate) };
    case "semana":
      return {
        start: startOfWeek(referenceDate, { weekStartsOn: 1 }),
        end: endOfWeek(referenceDate, { weekStartsOn: 1 }),
      };
    case "mes":
      return { start: startOfMonth(referenceDate), end: endOfMonth(referenceDate) };
    case "anio":
      return { start: startOfYear(referenceDate), end: endOfYear(referenceDate) };
    case "periodo":
      return custom ?? { start: startOfMonth(referenceDate), end: endOfMonth(referenceDate) };
  }
}

export function shiftReferenceDate(
  type: PeriodType,
  referenceDate: Date,
  direction: 1 | -1,
): Date {
  switch (type) {
    case "dia":
      return addDays(referenceDate, direction);
    case "semana":
      return addWeeks(referenceDate, direction);
    case "mes":
      return addMonths(referenceDate, direction);
    case "anio":
      return addYears(referenceDate, direction);
    case "periodo":
      return referenceDate;
  }
}

export function formatPeriodLabel(type: PeriodType, range: DateRange): string {
  switch (type) {
    case "dia":
      return capitalize(format(range.start, "EEEE d 'de' MMMM", { locale: es }));
    case "semana":
      return `${format(range.start, "d MMM", { locale: es })} – ${format(range.end, "d MMM", { locale: es })}`;
    case "mes":
      return capitalize(format(range.start, "MMMM 'de' yyyy", { locale: es }));
    case "anio":
      return format(range.start, "yyyy");
    case "periodo":
      return `${format(range.start, "d MMM yyyy", { locale: es })} – ${format(range.end, "d MMM yyyy", { locale: es })}`;
  }
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function toISODate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function getEvolutionRange(
  granularity: EvolutionGranularity,
  referenceDate: Date = new Date(),
): DateRange {
  switch (granularity) {
    case "dia":
      return { start: startOfDay(subDays(referenceDate, 13)), end: endOfDay(referenceDate) };
    case "semana":
      return {
        start: startOfWeek(subWeeks(referenceDate, 7), { weekStartsOn: 1 }),
        end: endOfDay(referenceDate),
      };
    case "mes":
      return { start: startOfMonth(subMonths(referenceDate, 5)), end: endOfDay(referenceDate) };
    case "anio":
      return { start: startOfYear(subYears(referenceDate, 4)), end: endOfDay(referenceDate) };
  }
}
