import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AccountsPanel } from "@/components/settings/accounts-panel";
import { PaymentMethodsPanel } from "@/components/settings/payment-methods-panel";
import { BudgetsPanel } from "@/components/settings/budgets-panel";
import type { Account, Budget, Category, PaymentMethod } from "@/lib/types/database";

export default async function ConfiguracionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [
    { data: accounts },
    { data: paymentMethods },
    { data: budgets },
    { data: categories },
  ] = await Promise.all([
    supabase.from("accounts").select("*").eq("user_id", user.id).order("created_at"),
    supabase.from("payment_methods").select("*").eq("user_id", user.id).order("created_at"),
    supabase.from("budgets").select("*").eq("user_id", user.id).order("created_at"),
    supabase
      .from("categories")
      .select("*")
      .eq("user_id", user.id)
      .eq("type", "gasto")
      .eq("is_archived", false)
      .order("sort_order"),
  ]);

  return (
    <>
      <header className="rounded-b-3xl bg-header px-4 pb-4 pt-4 text-center text-lg font-semibold">
        Configuración
      </header>

      <div className="flex flex-col gap-6 px-4 py-4">
        <AccountsPanel accounts={(accounts ?? []) as Account[]} />
        <PaymentMethodsPanel methods={(paymentMethods ?? []) as PaymentMethod[]} />
        <BudgetsPanel
          budgets={(budgets ?? []) as Budget[]}
          categories={(categories ?? []) as Category[]}
        />
      </div>
    </>
  );
}
