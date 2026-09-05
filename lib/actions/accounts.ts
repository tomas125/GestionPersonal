"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const accountSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(60),
  type: z.enum(["efectivo", "banco", "tarjeta", "otro"]),
  initialBalance: z.coerce.number().default(0),
});

const paymentMethodSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(60),
});

export interface FormActionState {
  error?: string;
  success?: boolean;
}

export async function createAccount(
  _prevState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const parsed = accountSchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    initialBalance: formData.get("initialBalance") || 0,
  });

  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Tenés que iniciar sesión" };

  const { error } = await supabase.from("accounts").insert({
    user_id: user.id,
    name: parsed.data.name,
    type: parsed.data.type,
    initial_balance: parsed.data.initialBalance,
  });

  if (error) return { error: "No se pudo crear la cuenta" };

  revalidatePath("/configuracion");
  return { success: true };
}

export async function deleteAccount(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("accounts").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/configuracion");
}

export async function createPaymentMethod(
  _prevState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const parsed = paymentMethodSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Tenés que iniciar sesión" };

  const { error } = await supabase
    .from("payment_methods")
    .insert({ user_id: user.id, name: parsed.data.name });

  if (error) return { error: "No se pudo crear el medio de pago" };

  revalidatePath("/configuracion");
  return { success: true };
}

export async function deletePaymentMethod(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("payment_methods").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/configuracion");
}
