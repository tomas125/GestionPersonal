"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { FormActionState } from "@/lib/actions/accounts";

const budgetSchema = z.object({
  categoryId: z.string().uuid().optional().or(z.literal("")),
  amount: z.coerce.number().positive("El monto debe ser mayor a 0"),
});

export async function createBudget(
  _prevState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const parsed = budgetSchema.safeParse({
    categoryId: formData.get("categoryId") ?? "",
    amount: formData.get("amount"),
  });

  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Tenés que iniciar sesión" };

  const { error } = await supabase.from("budgets").insert({
    user_id: user.id,
    category_id: parsed.data.categoryId || null,
    amount: parsed.data.amount,
  });

  if (error) return { error: "No se pudo crear el presupuesto" };

  revalidatePath("/configuracion");
  return { success: true };
}

export async function deleteBudget(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("budgets").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/configuracion");
}
