"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatAmount } from "@/lib/format";
import type { EvolutionPoint } from "@/lib/queries/transactions";

type SeriesKey = "ingresos" | "gastos" | "beneficio" | "perdida";

const ALL_SERIES: { key: SeriesKey; name: string; color: string }[] = [
  { key: "ingresos", name: "ingresos", color: "#34d399" },
  { key: "gastos", name: "gastos", color: "#f5c542" },
  { key: "beneficio", name: "beneficio", color: "#60a5fa" },
  { key: "perdida", name: "pérdida", color: "#f87171" },
];

export function EvolutionChart({
  data,
  seriesKeys,
}: {
  data: EvolutionPoint[];
  seriesKeys?: SeriesKey[];
}) {
  const SERIES = seriesKeys
    ? ALL_SERIES.filter((s) => seriesKeys.includes(s.key))
    : ALL_SERIES;

  return (
    <div className="h-72 w-full px-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2c2d22" vertical={false} />
          <XAxis
            dataKey="label"
            stroke="#9aa094"
            tickLine={false}
            axisLine={false}
            fontSize={12}
          />
          <YAxis hide />
          <Tooltip
            formatter={(value) => formatAmount(Number(value))}
            contentStyle={{
              background: "#1c1d16",
              border: "1px solid #2c2d22",
              borderRadius: 8,
              color: "#f2f3ee",
            }}
          />
          <Legend
            formatter={(value) => <span className="text-muted">{value}</span>}
            iconType="circle"
          />
          {SERIES.map((s) => (
            <Bar key={s.key} dataKey={s.key} name={s.name} fill={s.color} radius={[3, 3, 0, 0]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
