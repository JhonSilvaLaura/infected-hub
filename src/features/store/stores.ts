"use client";

import { createLocalListStore } from "@/lib/local-list-store";

/** Mod ids in the cart. Only paid mods are added; free ones download directly. */
export const cartStore = createLocalListStore("infectedhub:cart");

/** Mod ids on the wishlist. Keeps the key of the old "favorites" so nothing saved is lost. */
export const wishlistStore = createLocalListStore("modhub:favorites");

/** Library mods the demo buyer marked as inactive (to resolve character conflicts). Local only. */
export const inactiveStore = createLocalListStore("infectedhub:library-inactive");
