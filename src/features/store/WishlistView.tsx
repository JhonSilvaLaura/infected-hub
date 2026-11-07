"use client";

import { Heart, ShoppingCart, X } from "lucide-react";
import { ModCard } from "@/components/cards/ModCard";
import { Button, ButtonLink } from "@/components/ui/Button";
import type { Category, Creator, Mod } from "@/types/mod";
import { cartStore, wishlistStore } from "./stores";

interface WishlistViewProps {
  mods: Mod[];
  creators: Creator[];
  categories: Category[];
  ownedIds: string[];
}

export function WishlistView({ mods, creators, categories, ownedIds }: WishlistViewProps) {
  const ids = wishlistStore.useIds();
  const cart = cartStore.useIds();
  const items = ids.flatMap((id) => mods.filter((m) => m.id === id));

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-[4px] border border-dashed border-concrete-2 px-6 py-20 text-center">
        <Heart className="mb-4 size-10 text-ash" aria-hidden />
        <p className="font-display text-3xl font-black uppercase">Sin deseos todavía</p>
        <p className="mt-2 max-w-sm text-sm text-ash">Pulsa “Deseos” en la ficha de un mod para guardarlo aquí.</p>
        <ButtonLink href="/mods" className="mt-6">
          Explorar el catálogo
        </ButtonLink>
      </div>
    );
  }

  return (
    <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((m) => {
        const inCart = cart.includes(m.id);
        const owned = ownedIds.includes(m.id);
        return (
          <li key={m.id} className="flex flex-col gap-2">
            <ModCard
              mod={m}
              creator={creators.find((c) => c.slug === m.creatorSlug)}
              category={categories.find((c) => c.slug === m.categorySlug)}
              className="flex-1"
            />
            <div className="grid grid-cols-[1fr_auto] gap-2">
              {owned ? (
                <ButtonLink href="/cuenta/biblioteca" variant="outline" size="sm">
                  Ya lo tienes
                </ButtonLink>
              ) : m.price === null ? (
                <ButtonLink href={`/mods/${m.slug}`} variant="outline" size="sm">
                  Gratis · ver ficha
                </ButtonLink>
              ) : (
                <Button size="sm" variant={inCart ? "outline" : "primary"} onClick={() => (inCart ? cartStore.remove(m.id) : cartStore.add(m.id))}>
                  <ShoppingCart className="size-4" aria-hidden />
                  {inCart ? "En el carrito" : "Añadir al carrito"}
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={() => wishlistStore.remove(m.id)} aria-label={`Quitar ${m.title} de deseos`}>
                <X className="size-4" aria-hidden />
              </Button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
