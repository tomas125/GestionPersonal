"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { AVAILABLE_ICON_KEYS } from "@/lib/categories/icons";

const categorySchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(60),
  type: z.enum(["gasto", "ingreso"]),
  icon: z.enum(AVAILABLE_ICON_KEYS as [string, ...string[]]),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Elegí un color válido"),
  parentCategoryId: z.string().uuid().optional().or(z.literal("")),
});

export interface CategoryActionState {
  error?: string;
  success?: boolean;
}

export async function createCategory(
  _prevState: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    icon: formData.get("icon"),
    color: formData.get("color"),
    parentCategoryId: formData.get("parentCategoryId") ?? "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Tenés que iniciar sesión" };

  const { error } = await supabase.from("categories").insert({
    user_id: user.id,
    name: parsed.data.name,
    type: parsed.data.type,
    icon: parsed.data.icon,
    color: parsed.data.color,
    parent_category_id: parsed.data.parentCategoryId || null,
  });

  if (error) return { error: "No se pudo crear la categoría" };

  revalidatePath("/categorias");
  revalidatePath("/transacciones/nueva");
  return { success: true };
}

export async function updateCategory(
  id: string,
  _prevState: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    icon: formData.get("icon"),
    color: formData.get("color"),
    parentCategoryId: formData.get("parentCategoryId") ?? "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("categories")
    .update({
      name: parsed.data.name,
      type: parsed.data.type,
      icon: parsed.data.icon,
      color: parsed.data.color,
      parent_category_id: parsed.data.parentCategoryId || null,
    })
    .eq("id", id);

  if (error) return { error: "No se pudo actualizar la categoría" };

  revalidatePath("/categorias");
  revalidatePath("/transacciones/nueva");
  return { success: true };
}

export async function archiveCategory(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("categories")
    .update({ is_archived: true })
    .eq("id", id);
  if (error) throw error;

  revalidatePath("/categorias");
  revalidatePath("/transacciones/nueva");
}
