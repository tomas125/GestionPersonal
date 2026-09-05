const currencyFormatter = new Intl.NumberFormat("es-AR", {
  maximumFractionDigits: 0,
});

export function formatAmount(amount: number): string {
  return `${currencyFormatter.format(Math.round(amount))} $`;
}

export function formatCompactAmount(amount: number): string {
  if (Math.abs(amount) >= 1_000_000) {
    return `${(amount / 1_000_000).toLocaleString("es-AR", { maximumFractionDigits: 2 })} M$`;
  }
  return formatAmount(amount);
}

export function formatPercent(value: number): string {
  return `${Math.round(value)} %`;
}

const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "numeric",
  month: "short",
});

export function formatShortDate(date: Date): string {
  return dateFormatter.format(date);
}
