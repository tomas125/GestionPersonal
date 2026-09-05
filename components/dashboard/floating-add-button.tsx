import Link from "next/link";
import { Plus } from "lucide-react";

export function FloatingAddButton({ href = "/transacciones/nueva" }: { href?: string }) {
  return (
    <Link
      href={href}
      aria-label="Agregar movimiento"
      className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-accent-amber text-black shadow-lg"
    >
      <Plus className="h-7 w-7" />
    </Link>
  );
}
