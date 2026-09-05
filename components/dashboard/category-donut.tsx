"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { formatCompactAmount } from "@/lib/format";
import type { CategoryBreakdownItem } from "@/lib/queries/transactions";

export function CategoryDonut({
  items,
  total,
}: {
  items: CategoryBreakdownItem[];
  total: number;
}) {
  const data = items.length > 0 ? items : [{ name: "Sin datos", total: 1, color: "#2c2d22" }];

  return (
    <div className="relative mx-auto h-56 w-56">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="total"
            nameKey="name"
            innerRadius="70%"
            outerRadius="100%"
            paddingAngle={items.length > 1 ? 2 : 0}
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={"color" in entry ? entry.color : "#2c2d22"} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-semibold">{formatCompactAmount(total)}</span>
      </div>
    </div>
  );
}
