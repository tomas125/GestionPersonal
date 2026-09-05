"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { addMonths, format } from "date-fns";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const transactionSchema = z.object({
  type: z.enum(["gasto", "ingreso"]),
  amount: z.coerce.number().positive("El monto debe ser mayor a 0"),
  categoryId: z.string().uuid("Elegí una categoría"),
  accountId: z.string().uuid("Elegí una cuenta"),
  paymentMethodId: z.string().uuid().optional().or(z.literal("")),
  occurredAt: z.string().min(1, "Elegí una fecha"),
  description: z.string().optional(),
  notes: z.string().optional(),
  installmentsTotal: z.coerce.number().int().min(1).max(60).optional(),
});

export interface TransactionActionState {
  error?: string;
  success?: boolean;
}

export async function createTransaction(
  _prevState: TransactionActionState,
  formData: FormData,
): Promise<TransactionActionState> {
  const parsed = transactionSchema.safeParse({
    type: formData.get("type"),
    amount: formData.get("amount"),
    categoryId: formData.get("categoryId"),
    accountId: formData.get("accountId"),
    paymentMethodId: formData.get("paymentMethodId") ?? "",
    occurredAt: formData.get("occurredAt"),
    description: formData.get("description") ?? "",
    notes: formData.get("notes") ?? "",
    installmentsTotal: formData.get("installmentsTotal") || 1,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Tenés que iniciar sesión" };
  }

  const {
    type,
    amount,
    categoryId,
    accountId,
    paymentMethodId,
    occurredAt,
    description,
    notes,
    installmentsTotal,
  } = parsed.data;

  const baseDate = new Date(occurredAt);
  const total = installmentsTotal ?? 1;
  const installmentGroupId = total > 1 ? randomUUID() : null;

  const rows = Array.from({ length: total }, (_, index) => ({
    user_id: user.id,
    account_id: accountId,
    category_id: categoryId,
    payment_method_id: paymentMethodId || null,
    type,
    amount,
    description: description || null,
    occurred_at: format(addMonths(baseDate, index), "yyyy-MM-dd"),
    installment_group_id: installmentGroupId,
    installment_number: total > 1 ? index + 1 : null,
    installments_total: total > 1 ? total : null,
    notes: notes || null,
    source: "web" as const,
  }));

  const { error } = await supabase.from("transactions").insert(rows);

  if (error) {
    return { error: "No se pudo guardar el movimiento. Intentá de nuevo." };
  }

  revalidatePath("/");
  revalidatePath("/transacciones");
  revalidatePath("/graficos");
  return { success: true };
}

export async function deleteTransaction(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("transactions").delete().eq("id", id);
  if (error) throw error;

  revalidatePath("/");
  revalidatePath("/transacciones");
  revalidatePath("/graficos");
}
