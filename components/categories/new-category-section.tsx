"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { createCategory } from "@/lib/actions/categories";
import { CategoryForm } from "@/components/categories/category-form";

export function NewCategorySection() {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-3 text-sm text-muted hover:text-accent-green"
      >
        <Plus className="h-4 w-4" />
        Nueva categoría
      </button>
    );
  }

  return (
    <div className="rounded-2xl bg-surface p-4">
      <CategoryForm
        action={createCategory}
        submitLabel="Crear categoría"
        onSuccess={() => setOpen(false)}
      />
      <button type="button" onClick={() => setOpen(false)} className="mt-2 text-xs text-muted">
        Cancelar
      </button>
    </div>
  );
}
