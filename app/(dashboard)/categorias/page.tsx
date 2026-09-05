import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CategoryRow } from "@/components/categories/category-row";
import { NewCategorySection } from "@/components/categories/new-category-section";
import type { Category } from "@/lib/types/database";

export default async function CategoriasPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_archived", false)
    .order("sort_order");

  const categories = (data ?? []) as Category[];
  const gastos = categories.filter((c) => c.type === "gasto");
  const ingresos = categories.filter((c) => c.type === "ingreso");

  return (
    <>
      <header className="rounded-b-3xl bg-header px-4 pb-4 pt-4 text-center text-lg font-semibold">
        Categorías
      </header>

      <div className="flex flex-col gap-6 px-4 py-4">
        <NewCategorySection />

        <section className="flex flex-col gap-2">
          <h2 className="text-xs uppercase tracking-wide text-muted">Gastos</h2>
          {gastos.map((c) => (
            <CategoryRow key={c.id} category={c} />
          ))}
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-xs uppercase tracking-wide text-muted">Ingresos</h2>
          {ingresos.map((c) => (
            <CategoryRow key={c.id} category={c} />
          ))}
        </section>
      </div>
    </>
  );
}
