"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";

const RfqCartContext = createContext(null);
const STORAGE_KEY = "sbs_rfq_quote_bucket";

function loadCart() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// A cart line is keyed by `id` — for a plain product this is the product id/sku;
// for a specific variant it should be `${productId}::${variantId}` so different
// variants of the same product sit as separate lines (see Products/Variants work).
export function RfqCartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setCart(loadCart());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return; // don't overwrite storage with [] before the initial load runs
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch { /* storage full/unavailable — cart still works in-memory for this tab */ }
  }, [cart, hydrated]);

  // Keep multiple tabs/pages in sync (e.g. chatbot panel + product page open together)
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY) setCart(loadCart());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const addItem = useCallback((item, quantity = 1) => {
    const lineId = item.variantId ? `${item.id}::${item.variantId}` : item.id;
    setCart((prev) => {
      const existing = prev.find((line) => line.lineId === lineId);
      if (existing) {
        return prev.map((line) =>
          line.lineId === lineId ? { ...line, quantity: line.quantity + quantity } : line
        );
      }
      return [...prev, { ...item, lineId, quantity }];
    });
  }, []);

  const removeItem = useCallback((lineId) => {
    setCart((prev) => prev.filter((line) => line.lineId !== lineId));
  }, []);

  const updateQuantity = useCallback((lineId, quantity) => {
    setCart((prev) =>
      prev.map((line) => (line.lineId === lineId ? { ...line, quantity: Math.max(1, quantity) } : line))
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const isInCart = useCallback(
    (id, variantId) => cart.some((line) => line.lineId === (variantId ? `${id}::${variantId}` : id)),
    [cart]
  );

  const itemCount = useMemo(() => cart.reduce((sum, l) => sum + l.quantity, 0), [cart]);

  const value = useMemo(
    () => ({ cart, addItem, removeItem, updateQuantity, clearCart, isInCart, itemCount, hydrated }),
    [cart, addItem, removeItem, updateQuantity, clearCart, isInCart, itemCount, hydrated]
  );

  return <RfqCartContext.Provider value={value}>{children}</RfqCartContext.Provider>;
}

export function useRfqCart() {
  const ctx = useContext(RfqCartContext);
  if (!ctx) throw new Error("useRfqCart must be used within RfqCartProvider");
  return ctx;
}
