import { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import { PRODUCTS } from "./products.js";
import { SITE } from "./config.js";

const CartCtx = createContext(null);
const KEY = "lumora_cart_v1";

function reducer(state, a) {
  switch (a.type) {
    case "add": {
      const ex = state.find((i) => i.id === a.id);
      if (ex) return state.map((i) => (i.id === a.id ? { ...i, qty: i.qty + a.qty } : i));
      return [...state, { id: a.id, qty: a.qty }];
    }
    case "set":
      return state.map((i) => (i.id === a.id ? { ...i, qty: Math.max(1, a.qty) } : i));
    case "remove":
      return state.filter((i) => i.id !== a.id);
    case "clear":
      return [];
    default:
      return state;
  }
}

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(reducer, undefined, load);
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items]);
  const value = useMemo(() => ({ items, dispatch }), [items]);
  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export function useCart() {
  const { items, dispatch } = useContext(CartCtx);
  const lines = items
    .map((i) => ({ ...i, product: PRODUCTS.find((p) => p.id === i.id) }))
    .filter((l) => l.product);
  const count = lines.reduce((s, l) => s + l.qty, 0);
  const subtotal = lines.reduce((s, l) => s + l.qty * l.product.price, 0);
  const shipping = subtotal === 0 ? 0 : subtotal >= SITE.freeShippingOver ? 0 : SITE.shippingFee;
  return {
    lines,
    count,
    subtotal,
    shipping,
    total: subtotal + shipping,
    add: (id, qty = 1) => dispatch({ type: "add", id, qty }),
    setQty: (id, qty) => dispatch({ type: "set", id, qty }),
    remove: (id) => dispatch({ type: "remove", id }),
    clear: () => dispatch({ type: "clear" }),
  };
}
