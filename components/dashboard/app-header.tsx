import Link from "next/link";
import { Receipt, Wallet } from "lucide-react";
import { NavDrawer } from "@/components/nav/nav-drawer";
import { formatCompactAmount } from "@/lib/format";

export function AppHeader({ totalBalance }: { totalBalance: number }) {
  return (
    <header className="rounded-b-3xl bg-header px-4 pb-8 pt-4 text-foreground">
      <div className="flex items-center justify-between">
        <NavDrawer />
        <div className="flex items-center gap-1 text-sm text-foreground/80">
          <Wallet className="h-4 w-4" />
          Total
        </div>
        <Link href="/transacciones" aria-label="Ver movimientos">
          <Receipt className="h-6 w-6" />
        </Link>
      </div>
      <p className="mt-2 text-center text-3xl font-semibold">
        {formatCompactAmount(totalBalance)}
      </p>
    </header>
  );
}
