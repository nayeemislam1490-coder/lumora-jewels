import { createContext, useContext, useEffect, useMemo, useReducer, useState } from "react";
import { PRODUCTS } from "./products.js";
import { SITE, getShippingFee } from "./config.js";
import { supabase } from "./supabase.js";

const CartCtx = createContext(null);
const KEY = "lumora_cart_v1";
const COUPON_KEY = "lumora_coupon_v1";

const getActiveLang = () => {
  try {
    return localStorage.getItem("veloria_lang") === "bn" ? "bn" : "en";
  } catch {
    return "en";
  }
};

const pickMsg = (en, bn) => (getActiveLang() === "bn" ? bn : en);

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

function loadCoupon() {
  try {
    return JSON.parse(sessionStorage.getItem(COUPON_KEY)) || null;
  } catch {
    return null;
  }
}

function saveCoupon(c) {
  try {
    if (c) sessionStorage.setItem(COUPON_KEY, JSON.stringify(c));
    else sessionStorage.removeItem(COUPON_KEY);
  } catch {
    /* ignore */
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(reducer, undefined, load);
  const [coupon, setCoupon] = useState(loadCoupon);
  const [shippingDistrict, setShippingDistrict] = useState("Dhaka");

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items]);

  useEffect(() => {
    saveCoupon(coupon);
  }, [coupon]);

  const value = useMemo(
    () => ({ items, dispatch, coupon, setCoupon, shippingDistrict, setShippingDistrict }),
    [items, coupon, shippingDistrict]
  );
  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export function useCart() {
  const { items, dispatch, coupon, setCoupon, shippingDistrict, setShippingDistrict } = useContext(CartCtx);
  const lines = items
    .map((i) => {
      const product = PRODUCTS.find((p) => p.id === i.id);
      if (!product) return null;
      const safePrice = Math.max(0, Number(product.price) || 0);
      const safeQty = Math.max(1, Math.min(99, Math.floor(Number(i.qty) || 1)));
      return { ...i, qty: safeQty, product: { ...product, price: safePrice } };
    })
    .filter((l) => l && l.product.price > 0);
  const count = lines.reduce((s, l) => s + l.qty, 0);
  const subtotal = lines.reduce((s, l) => s + l.qty * l.product.price, 0);

  const computeDiscount = (activeCoupon, currentSubtotal) => {
    if (!activeCoupon || currentSubtotal <= 0) return 0;
    const minOrder = Math.max(0, Number(activeCoupon.min_order) || 0);
    if (currentSubtotal < minOrder) return 0;
    const val = Math.max(0, Number(activeCoupon.value) || 0);
    if (activeCoupon.type === "fixed") return Math.min(currentSubtotal, val);
    const pct = Math.min(90, val);
    return Math.min(currentSubtotal, Math.round((currentSubtotal * pct) / 100));
  };

  const discount = useMemo(() => computeDiscount(coupon, subtotal), [coupon, subtotal]);

  const discountedSubtotal = Math.max(0, subtotal - discount);
  const shipping =
    discountedSubtotal === 0
      ? 0
      : discountedSubtotal > SITE.freeShippingOver
        ? 0
        : getShippingFee(shippingDistrict, discountedSubtotal);

  const applyCoupon = async (rawCode) => {
    const clean = String(rawCode || "").trim().toUpperCase();
    if (!clean) {
      return { ok: false, message: pickMsg("Please enter a discount code.", "দয়া করে একটি ডিসকাউন্ট কোড লিখুন।") };
    }
    if (subtotal <= 0) {
      return { ok: false, message: pickMsg("Your cart is empty.", "আপনার কার্ট খালি।") };
    }

    const { data, error } = await supabase.rpc("check_coupon", {
      p_code: clean,
      p_subtotal: subtotal,
      p_phone: null,
    });
    if (error || !data) {
      return {
        ok: false,
        message: pickMsg("Could not check the code. Please try again.", "কোড যাচাই করা যায়নি। আবার চেষ্টা করুন।"),
      };
    }
    if (!data.ok) {
      return {
        ok: false,
        message: data.message || pickMsg("Invalid or inactive discount code.", "ডিসকাউন্ট কোডটি সঠিক নয় বা চালু নেই।"),
      };
    }
    setCoupon(data);
    return { ok: true, message: pickMsg(`Code ${data.code} applied.`, `${data.code} কোডটি প্রয়োগ হয়েছে।`) };
  };

  const verifyCouponForOrder = async (phone) => {
    if (!coupon?.code) {
      return { valid: true, coupon: null, discount: 0 };
    }
    const { data, error } = await supabase.rpc("check_coupon", {
      p_code: coupon.code,
      p_subtotal: subtotal,
      p_phone: phone || null,
    });
    if (error || !data) {
      return {
        valid: false,
        message: pickMsg(
          "Could not verify the discount code. Please try again.",
          "ডিসকাউন্ট কোড যাচাই করা যায়নি। আবার চেষ্টা করুন।"
        ),
      };
    }
    if (!data.ok) {
      setCoupon(null);
      return {
        valid: false,
        message: data.message || pickMsg("This discount code is no longer valid.", "এই ডিসকাউন্ট কোডটি আর বৈধ নয়।"),
      };
    }
    const verifiedDiscount = computeDiscount(data, subtotal);
    const minOrder = Math.max(0, Number(data.min_order) || 0);
    if (subtotal < minOrder || verifiedDiscount <= 0) {
      return {
        valid: false,
        message: pickMsg(
          `Minimum order of ৳${Math.round(minOrder)} required for ${data.code}.`,
          `${data.code} কোডের জন্য ন্যূনতম ৳${Math.round(minOrder)} অর্ডার প্রয়োজন।`
        ),
      };
    }
    setCoupon(data);
    return { valid: true, coupon: data, discount: verifiedDiscount };
  };

  const clearCoupon = () => setCoupon(null);

  return {
    lines,
    count,
    subtotal,
    discount,
    discountedSubtotal,
    coupon,
    applyCoupon,
    verifyCouponForOrder,
    clearCoupon,
    shipping,
    shippingDistrict,
    setShippingDistrict,
    total: discountedSubtotal + shipping,
    add: (id, qty = 1) => dispatch({ type: "add", id, qty }),
    setQty: (id, qty) => dispatch({ type: "set", id, qty }),
    remove: (id) => dispatch({ type: "remove", id }),
    clear: () => {
      dispatch({ type: "clear" });
      setCoupon(null);
    },
  };
}