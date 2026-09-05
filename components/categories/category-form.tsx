"use client";

import { useActionState, useState } from "react";
import { AVAILABLE_ICON_KEYS, getCategoryIcon } from "@/lib/categories/icons";
import type { MovementType } from "@/lib/types/database";

export interface CategoryFormValues {
  name?: string;
  type?: MovementType;
  icon?: string;
  color?: string;
  parentCategoryId?: string;
}

export interface CategoryFormActionState {
  error?: string;
  success?: boolean;
}

export function CategoryForm({
  action,
  initial,
  submitLabel,
  onSuccess,
}: {
  action: (
    prevState: CategoryFormActionState,
    formData: FormData,
  ) => Promise<CategoryFormActionState>;
  initial?: CategoryFormValues;
  submitLabel: string;
  onSuccess?: () => void;
}) {
  const [type, setType] = useState<MovementType>(initial?.type ?? "gasto");
  const [icon, setIcon] = useState(initial?.icon ?? AVAILABLE_ICON_KEYS[0]);
  const [color, setColor] = useState(initial?.color ?? "#38bdf8");

  const [state, formAction, pending] = useActionState(async (
    prevState: CategoryFormActionState,
    formData: FormData,
  ) => {
    const result = await action(prevState, formData);
    if (result.success) onSuccess?.();
    return result;
  }, {});

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="icon" value={icon} />
      <input type="hidden" name="color" value={color} />

      <div className="flex gap-2">
        {(["gasto", "ingreso"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
              type === t ? "bg-accent-green text-black" : "bg-surface-alt text-muted"
            }`}
          >
            {t === "gasto" ? "Gasto" : "Ingreso"}
          </button>
        ))}
      </div>

      <input
        name="name"
        defaultValue={initial?.name}
        placeholder="Nombre de la categoría"
        required
        className="rounded-lg bg-surface-alt border border-border px-4 py-2.5 outline-none focus:border-accent-green"
      />

      <div className="flex items-center gap-3">
        <span className="text-xs text-muted">Color</span>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="h-8 w-8 cursor-pointer rounded-full border-none bg-transparent p-0"
        />
      </div>

      <div className="grid grid-cols-6 gap-2">
        {AVAILABLE_ICON_KEYS.map((key) => {
          const Icon = getCategoryIcon(key);
          const active = key === icon;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setIcon(key)}
              className={`flex h-9 w-9 items-center justify-center rounded-full ${
                active ? "bg-accent-green text-black" : "bg-surface-alt text-muted"
              }`}
            >
              <Icon className="h-4 w-4" />
            </button>
          );
        })}
      </div>

      {state.error && <p className="text-sm text-red-400">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-accent-green px-4 py-2.5 text-sm font-medium text-black disabled:opacity-60"
      >
        {pending ? "Guardando..." : submitLabel}
      </button>
    </form>
  );
}
