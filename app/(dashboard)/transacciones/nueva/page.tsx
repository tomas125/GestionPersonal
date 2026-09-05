import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { QuickAddForm } from "./quick-add-form";
import type { Account, Category, PaymentMethod } from "@/lib/types/database";

export default async function NuevaTransaccionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: categories }, { data: accounts }, { data: paymentMethods }] =
    await Promise.all([
      supabase
        .from("categories")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_archived", false)
        .order("sort_order"),
      supabase.from("accounts").select("*").eq("user_id", user.id).order("created_at"),
      supabase
        .from("payment_methods")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at"),
    ]);

  return (
    <QuickAddForm
      categories={(categories ?? []) as Category[]}
      accounts={(accounts ?? []) as Account[]}
      paymentMethods={(paymentMethods ?? []) as PaymentMethod[]}
    />
  );
}
