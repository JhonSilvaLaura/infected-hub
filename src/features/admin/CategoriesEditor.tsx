"use client";

import { motion } from "motion/react";
import { ArrowDown, ArrowUp, Eye, EyeOff, Layers, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { FormNotice } from "@/components/forms/FormNotice";
import { TextField } from "@/components/forms/TextField";
import { TextAreaField } from "@/components/forms/TextAreaField";
import { Button } from "@/components/ui/Button";
import { CATEGORY_ICONS } from "@/components/ui/icons";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/cn";
import { slugify, validateCategory, type AdminCategory, type CategoryDraft } from "./filters";

export function CategoriesEditor({ initial }: { initial: AdminCategory[] }) {
  const [items, setItems] = useState(initial);
  const [draft, setDraft] = useState<CategoryDraft | null>(null);
  const [errors, setErrors] = useState<{ name?: string; description?: string }>({});
  const [notice, setNotice] = useState<string | null>(null);

  function move(index: number, delta: -1 | 1) {
    setItems((all) => {
      const next = [...all];
      [next[index], next[index + delta]] = [next[index + delta], next[index]];
      return next;
    });
  }

  function save() {
    if (!draft) return;
    const result = validateCategory(draft, items);
    setErrors(result);
    if (result.name || result.description) return;
    if (draft.slug) {
      setItems((all) => all.map((c) => (c.slug === draft.slug ? { ...c, name: draft.name.trim(), description: draft.description.trim() } : c)));
      setNotice(`Categoría “${draft.name.trim()}” actualizada (solo en esta demo).`);
    } else {
      setItems((all) => [...all, { slug: slugify(draft.name), name: draft.name.trim(), description: draft.description.trim(), modCount: 0, visible: false }]);
      setNotice(`Categoría “${draft.name.trim()}” creada oculta. Hazla visible cuando tenga mods (solo en esta demo).`);
    }
    setDraft(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={() => {
            setDraft({ slug: null, name: "", description: "" });
            setErrors({});
          }}
        >
          <Plus className="size-4" aria-hidden />
          Nueva categoría
        </Button>
      </div>
      <FormNotice message={notice} />

      <ol className="overflow-hidden rounded-[4px] border border-concrete">
        {items.map((c, i) => {
          const Icon = CATEGORY_ICONS[c.slug as keyof typeof CATEGORY_ICONS] ?? Layers;
          return (
            <motion.li
              key={c.slug}
              layout
              transition={{ type: "spring", stiffness: 500, damping: 40 }}
              className={cn("flex items-center gap-3 border-b border-concrete bg-soot px-3 py-3 last:border-b-0 sm:px-4", !c.visible && "opacity-60")}
            >
              <div className="flex flex-col">
                <button type="button" disabled={i === 0} onClick={() => move(i, -1)} aria-label={`Subir ${c.name}`} className="text-ash hover:text-bone disabled:opacity-20">
                  <ArrowUp className="size-4" />
                </button>
                <button type="button" disabled={i === items.length - 1} onClick={() => move(i, 1)} aria-label={`Bajar ${c.name}`} className="text-ash hover:text-bone disabled:opacity-20">
                  <ArrowDown className="size-4" />
                </button>
              </div>
              <Icon className="size-5 shrink-0 text-ash" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="font-semibold">
                  {c.name}
                  {!c.visible && <span className="ml-2 font-mono text-[10px] uppercase text-flare">Oculta</span>}
                </p>
                <p className="truncate text-xs text-ash">{c.description}</p>
              </div>
              <span className="hidden font-mono text-xs text-ash sm:block">{c.modCount} mods</span>
              <div className="flex shrink-0 gap-1">
                <IconButton
                  label={c.visible ? `Ocultar ${c.name}` : `Mostrar ${c.name}`}
                  onClick={() => setItems((all) => all.map((x) => (x.slug === c.slug ? { ...x, visible: !x.visible } : x)))}
                >
                  {c.visible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                </IconButton>
                <IconButton
                  label={`Editar ${c.name}`}
                  onClick={() => {
                    setDraft({ slug: c.slug, name: c.name, description: c.description });
                    setErrors({});
                  }}
                >
                  <Pencil className="size-4" />
                </IconButton>
                <IconButton
                  label={c.modCount ? `${c.name} tiene mods y no se puede eliminar` : `Eliminar ${c.name}`}
                  disabled={c.modCount > 0}
                  onClick={() => {
                    setItems((all) => all.filter((x) => x.slug !== c.slug));
                    setNotice(`Categoría “${c.name}” eliminada (solo en esta demo).`);
                  }}
                  danger
                >
                  <Trash2 className="size-4" />
                </IconButton>
              </div>
            </motion.li>
          );
        })}
      </ol>
      <p className="text-xs text-ash">Solo se pueden eliminar categorías sin mods. Para retirar una con contenido, ocúltala.</p>

      <Modal
        open={Boolean(draft)}
        onClose={() => setDraft(null)}
        title={draft?.slug ? "Editar categoría" : "Nueva categoría"}
        footer={
          <>
            <Button variant="ghost" onClick={() => setDraft(null)}>
              Cancelar
            </Button>
            <Button onClick={save}>{draft?.slug ? "Guardar cambios" : "Crear categoría"}</Button>
          </>
        }
      >
        {draft && (
          <div className="space-y-4">
            <TextField
              label="Nombre"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              error={errors.name}
              hint={draft.slug ? `URL: /categorias/${draft.slug} (no cambia)` : draft.name && `URL: /categorias/${slugify(draft.name)}`}
            />
            <TextAreaField
              label="Descripción"
              rows={3}
              max={140}
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              error={errors.description}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}

function IconButton({
  label,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-[3px] text-ash transition-colors disabled:opacity-25",
        danger ? "hover:bg-blood/15 hover:text-[#ff5a69]" : "hover:bg-soot-2 hover:text-bone",
      )}
    >
      {children}
    </button>
  );
}
