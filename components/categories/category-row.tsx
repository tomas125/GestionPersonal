"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { archiveCategory, updateCategory } from "@/lib/actions/categories";
import { getCategoryIcon } from "@/lib/categories/icons";
import { CategoryForm } from "@/components/categories/category-form";
import type { Category } from "@/lib/types/database";

export function CategoryRow({ category }: { category: Category }) {
  const [editing, setEditing] = useState(false);
  const Icon = getCategoryIcon(category.icon);

  if (editing) {
    return (
      <div className="rounded-2xl bg-surface p-4">
        <CategoryForm
          action={updateCategory.bind(null, category.id)}
          initial={{
            name: category.name,
            type: category.type,
            icon: category.icon,
            color: category.color,
          }}
          submitLabel="Guardar cambios"
          onSuccess={() => setEditing(false)}
        />
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="mt-2 text-xs text-muted"
        >
          Cancelar
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-surface px-4 py-3">
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: category.color }}
      >
        <Icon className="h-5 w-5 text-black/80" />
      </span>
      <span className="flex-1 text-sm">{category.name}</span>
      <button
        type="button"
        onClick={() => setEditing(true)}
        aria-label="Editar categoría"
        className="text-muted hover:text-accent-green"
      >
        <Pencil className="h-4 w-4" />
      </button>
      <form action={archiveCategory.bind(null, category.id)}>
        <button
          type="submit"
          className="text-xs text-muted hover:text-red-400"
        >
          Archivar
        </button>
      </form>
    </div>
  );
}
