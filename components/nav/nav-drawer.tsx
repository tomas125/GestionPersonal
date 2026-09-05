"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  LayoutDashboard,
  ListTree,
  Menu,
  Settings,
  Wallet,
  X,
} from "lucide-react";
import { signOut } from "@/lib/actions/auth";

const LINKS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/graficos", label: "Gráficos", icon: BarChart3 },
  { href: "/transacciones", label: "Movimientos", icon: Wallet },
  { href: "/categorias", label: "Categorías", icon: ListTree },
  { href: "/configuracion", label: "Configuración", icon: Settings },
];

export function NavDrawer() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <button
        type="button"
        aria-label="Abrir menú"
        onClick={() => setOpen(true)}
        className="text-foreground"
      >
        <Menu className="h-6 w-6" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setOpen(false)}
          />
          <nav className="relative flex h-full w-72 flex-col gap-1 bg-surface p-4">
            <button
              type="button"
              aria-label="Cerrar menú"
              onClick={() => setOpen(false)}
              className="mb-4 self-end text-muted hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>

            {LINKS.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm ${
                    active
                      ? "bg-surface-alt text-accent-green"
                      : "text-foreground hover:bg-surface-alt"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </Link>
              );
            })}

            <form action={signOut} className="mt-auto pt-4">
              <button
                type="submit"
                className="w-full rounded-lg px-3 py-3 text-left text-sm text-muted hover:bg-surface-alt hover:text-foreground"
              >
                Cerrar sesión
              </button>
            </form>
          </nav>
        </div>
      )}
    </>
  );
}
