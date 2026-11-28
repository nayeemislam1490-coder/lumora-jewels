import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SITE, BD_DISTRICTS, getShippingFee, money, hasPlaceholderWhatsapp } from "../config.js";
import { useCart } from "../cart.jsx";
import { supabase } from "../supabase.js";
import { saveMyOrder } from "../myOrders.js";

const ORDER_KEY = "lumora_last_order_v1";
const LAST_SUBMIT_KEY = "lumora_last_order_ts_v1";
const FBQ_PURCHASE_KEY = "lumora_fbq_purchase_v1";
const OUTSIDE_DHAKA_FEE = SITE.outsideDhakaFee ?? 120;
const NOTIFY_ORDER_URL = "https://jocaqgeavsghhxhrsayl.supabase.co/functions/v1/notify-order";

const DHAKA_ZONE_DISTRICTS = new Set(["dhaka", "gazipur", "narayanganj"]);
const DHAKA_SUB_AREAS = ["keraniganj", "savar", "dhamrai", "ashulia"];

const isDhakaZone = (district, address = "") => {
  const d = String(district || "Dhaka").trim().toLowerCase();
  if (DHAKA_ZONE_DISTRICTS.has(d)) return true;
  const addr = String(address || "").toLowerCase();
  return DHAKA_SUB_AREAS.some((area) => d.includes(area) || addr.includes(area));
};

const trackPurchase = (orderId, total, lines) => {
  try {
    if (typeof window === "undefined" || typeof window.fbq !== "function") return;
    if (!orderId || sessionStorage.getItem(FBQ_PURCHASE_KEY) === orderId) return;

    const contents = (lines || []).map((l) => ({
      id: String(l.id),
      quantity: Number(l.qty) || 1,
      item_price: Number(l.product?.price) || 0,
    }));
    const numItems = contents.reduce((sum, item) => sum + item.quantity, 0);

    window.fbq(
      "track",
      "Purchase",
      {
        value: Number(total) || 0,
        currency: "BDT",
        content_type: "product",
        content_ids: contents.map((item) => item.id),
        contents,
        num_items: numItems,
      },
      { eventID: orderId }
    );

    sessionStorage.setItem(FBQ_PURCHASE_KEY, orderId);
  } catch {
    /* ignore */
  }
};

const getDeliveryFee = (baseAmount, district = "Dhaka", address = "") => {
  if (baseAmount <= 0) return 0;
  if (baseAmount > SITE.freeShippingOver) return 0;
  if (isDhakaZone(district, address)) return SITE.shippingFee;
  return getShippingFee(district, baseAmount);
};

const loadOrder = () => {
  try {
    return JSON.parse(sessionStorage.getItem(ORDER_KEY));
  } catch {
    return null;
  }
};
const saveOrder = (o) => {
  try {
    if (o) sessionStorage.setItem(ORDER_KEY, JSON.stringify(o));
    else sessionStorage.removeItem(ORDER_KEY);
  } catch {
    /* ignore */
  }
};

function CouponBox({ cart }) {
  const [codeInput, setCodeInput] = useState("");
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);

  const handleApply = async (e) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setStatus(null);
    const res = await cart.applyCoupon(codeInput);
    setBusy(false);
    setStatus(res);
    if (res.ok) setCodeInput("");
  };

  const handleRemove = () => {
    cart.clearCoupon();
    setStatus(null);
  };

  return (
    <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--line, rgba(255,255,255,0.12))" }}>
      {cart.coupon ? (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, fontSize: 13 }}>
          <span>
            Code <b>{cart.coupon.code}</b> applied
            {cart.discount === 0 && Number(cart.coupon.min_order) > 0
              ? ` (add ${money(Number(cart.coupon.min_order) - cart.subtotal)} more)`
              : ""}
          </span>
          <button
            type="button"
            onClick={handleRemove}
            style={{ background: "none", border: "none", color: "var(--gold-light)", cursor: "pointer", font: "inherit", textDecoration: "underline", padding: 0 }}
          >
            Remove
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", gap: 8 }}>
          <input
            type="text"
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value)}
            placeholder="Discount code"
            aria-label="Discount code"
            style={{ flex: 1, minWidth: 0, padding: "8px 10px", borderRadius: 8, border: "1px solid var(--line, rgba(255,255,255,0.2))", background: "transparent", color: "inherit", font: "inherit" }}
          />
          <button
            type="button"
            onClick={handleApply}
            disabled={busy}
            className="btn btn-ghost"
            style={{ padding: "8px 12px", whiteSpace: "nowrap" }}
          >
            {busy ? "..." : "Apply"}
          </button>
        </div>
      )}
      {status && (
        <p className="note" style={{ marginTop: 6, color: status.ok ? "var(--gold-light)" : "var(--down, #e06c75)" }}>
          {status.message}
        </p>
      )}
    </div>
  );
}

function Summary({ cart, district = cart.shippingDistrict || "Dhaka", address = "", children }) {
  const baseForShipping = cart.discountedSubtotal ?? cart.subtotal;
  const shipping = getDeliveryFee(baseForShipping, district, address);
  const total = baseForShipping + shipping;
  const cleanDistrict = String(district || "Dhaka").trim() || "Dhaka";
  const areaLabel = isDhakaZone(cleanDistrict, address) ? "Inside Dhaka" : "Outside Dhaka";

  return (
    <aside className="summary">
      <h3>Order summary</h3>
      <div className="sum-row"><span>Subtotal</span><span>{money(cart.subtotal)}</span></div>
      {cart.discount > 0 && (
        <div className="sum-row">
          <span>Discount ({cart.coupon?.code})</span>
          <span style={{ color: "var(--gold-light)" }}>−{money(cart.discount)}</span>
        </div>
      )}
      <div className="sum-row">
        <span>Delivery ({areaLabel})</span>
        <span>{shipping === 0 ? "Free" : money(shipping)}</span>
      </div>
      <div className="sum-row total"><span>Total</span><b>{money(total)}</b></div>
      {baseForShipping > 0 && shipping > 0 && (
        <p className="note">Add {money(SITE.freeShippingOver - baseForShipping)} more for free delivery.</p>
      )}
      <CouponBox cart={cart} />
      {children}
    </aside>
  );
}

export function Cart() {
  const cart = useCart();

  if (cart.lines.length === 0) {
    return (
      <div className="container empty">
        <h2>Your cart is empty</h2>
        <p>Looks like you haven't picked anything yet.</p>
        <Link to="/shop" className="btn btn-gold">Start shopping</Link>
      </div>
    );
  }

  return (
    <>
      <div className="page-head">
        <div className="container">
          <div className="crumbs"><Link to="/">Home</Link> / Cart</div>
          <h1 className="title">Your <em>cart</em></h1>
        </div>
      </div>
      <div className="container two-col">
        <div>
          {cart.lines.map((l) => (
            <div className="line" key={l.id}>
              <Link to={`/product/${l.id}`}><img src={l.product.images[0]} alt={l.product.name} /></Link>
              <div>
                <h4>{l.product.name}</h4>
                <div className="meta">{l.product.code} · {money(l.product.price)}</div>
                <button className="rm" onClick={() => cart.remove(l.id)}>Remove</button>
              </div>
              <div className="line-right">
                <div className="qty">
                  <button onClick={() => cart.setQty(l.id, l.qty - 1)}>−</button>
                  <span>{l.qty}</span>
                  <button onClick={() => cart.setQty(l.id, l.qty + 1)}>+</button>
                </div>
                <b style={{ color: "var(--gold-light)" }}>{money(l.product.price * l.qty)}</b>
              </div>
            </div>
          ))}
        </div>
        <Summary cart={cart} district={cart.shippingDistrict}>
          <Link to="/checkout" className="btn btn-gold btn-block" style={{ marginTop: 18 }}>
            Proceed to checkout
          </Link>
          <Link to="/shop" className="btn btn-ghost btn-block" style={{ marginTop: 10 }}>
            Continue shopping
          </Link>
        </Summary>
      </div>
    </>
  );
}

export function Checkout() {
  const cart = useCart();
  const initialDistrict = cart.shippingDistrict || "Dhaka";
  const [f, setF] = useState({
    name: "",
    phone: "",
    address: "",
    city: initialDistrict,
    note: "",
    pay: "cod",
    payPhone: "",
    trxId: "",
    zone: isDhakaZone(initialDistrict, "") ? "inside" : "outside",
  });
  const [districtMenuOpen, setDistrictMenuOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [done, setDone] = useState(() => (cart.lines.length === 0 ? loadOrder() : null));

  useEffect(() => {
    if (cart.lines.length > 0) saveOrder(null);
  }, [cart.lines.length]);

  const set = (k) => (e) => {
    const val = e.target.value;
    setF((prev) => {
      const next = { ...prev, [k]: val };
      if (k === "address") {
        next.zone = isDhakaZone(prev.city, val) ? "inside" : "outside";
      }
      return next;
    });
  };

  const applyDistrictValue = (rawValue) => {
    const nextZone = isDhakaZone(rawValue, f.address) ? "inside" : "outside";
    setF((prev) => ({ ...prev, city: rawValue, zone: nextZone }));
    if (cart.setShippingDistrict) cart.setShippingDistrict(rawValue.trim() || "Dhaka");
  };

  const handleDistrictInput = (e) => {
    applyDistrictValue(e.target.value);
    setDistrictMenuOpen(true);
  };

  const handleSelectDistrict = (districtName) => {
    applyDistrictValue(districtName);
    setDistrictMenuOpen(false);
  };

  const filteredDistricts = BD_DISTRICTS.filter((d) =>
    d.toLowerCase().includes(String(f.city || "").trim().toLowerCase())
  );

  const buildMessage = (id, lines, totals) => {
    const items = lines.map(
      (l) => `• ${l.product.name} (${l.product.code}) × ${l.qty} = ${money(l.product.price * l.qty)}`
    );
    const paymentLine =
      f.pay === "cod"
        ? "Payment: Cash on delivery"
        : `Payment: Mobile payment (${f.payPhone.trim()} | TrxID: ${f.trxId.trim()})`;
    const discountLine =
      totals.discount > 0
        ? `Discount (${totals.couponCode || "Coupon"}): −${money(totals.discount)}`
        : "";
    const districtName = f.city.trim() || "Dhaka";
    const areaText = isDhakaZone(districtName, f.address) ? "Inside Dhaka" : "Outside Dhaka";

    return [
      `🛍️ New order ${id}`,
      "",
      ...items,
      "",
      `Subtotal: ${money(totals.subtotal)}`,
      discountLine,
      `Delivery (${districtName} · ${areaText}): ${totals.shipping === 0 ? "Free" : money(totals.shipping)}`,
      `Total: ${money(totals.total)}`,
      paymentLine,
      "",
      `Name: ${f.name}`,
      `Phone: ${f.phone}`,
      `Address: ${f.address}, ${districtName}`,
      f.note ? `Note: ${f.note}` : "",
    ]
      .filter((x) => x !== "")
      .join("\n");
  };

  const submit = async (e) => {
    e.preventDefault();
    if (submitting || cart.lines.length === 0) return;

    const nowTs = Date.now();
    const lastTs = Number(sessionStorage.getItem(LAST_SUBMIT_KEY) || 0);
    if (nowTs - lastTs < 15000) {
      setErrors({ form: "Please wait a few seconds before placing another order." });
      return;
    }

    const cleanName = f.name.trim().slice(0, 100);
    const cleanPhone = f.phone.trim().slice(0, 30);
    const cleanAddress = f.address.trim().slice(0, 240);
    const cleanCity = f.city.trim().slice(0, 80);
    const cleanNote = f.note.trim().slice(0, 300);

    const er = {};
    if (cleanName.length < 2) er.name = "Please enter your name.";
    if (!/^[+\d][\d\s-]{6,}$/.test(cleanPhone)) er.phone = "Please enter a valid phone number.";
    if (cleanAddress.length < 5) er.address = "Please enter your full address.";
    if (cleanCity.length < 2) er.city = "Please enter or select your district.";
    if (f.pay === "mobile") {
      if (!/^[+\d][\d\s-]{6,}$/.test(f.payPhone.trim())) er.payPhone = "Please enter the sender bKash/Nagad number.";
      if (f.trxId.trim().length < 4) er.trxId = "Please enter the transaction ID (trxID).";
    }
    setErrors(er);
    if (Object.keys(er).length) return;

    setSubmitting(true);
    const couponCheck = await cart.verifyCouponForOrder(cleanPhone);
    if (!couponCheck.valid) {
      setSubmitting(false);
      setErrors({ form: couponCheck.message || "Discount code could not be verified." });
      return;
    }

    const discount = couponCheck.discount || 0;
    const discountedSubtotal = Math.max(0, cart.subtotal - discount);
    const shipping = getDeliveryFee(discountedSubtotal, cleanCity, cleanAddress);
    const total = discountedSubtotal + shipping;
    if (total <= 0) {
      setSubmitting(false);
      setErrors({ form: "Invalid order total." });
      return;
    }

    const id = "VH-" + Date.now().toString(36).toUpperCase().slice(-6);
    const couponCode = couponCheck.coupon?.code || "";
    const totals = { subtotal: cart.subtotal, discount, couponCode, shipping, total };
    const orderLines = [...cart.lines];
    const url = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(buildMessage(id, orderLines, totals))}`;
    const paymentRecord =
      f.pay === "cod" ? "cod" : `mobile (${f.payPhone.trim().slice(0, 25)} | TrxID: ${f.trxId.trim().slice(0, 40)})`;
    const baseItemText = orderLines
      .map((l) => (l.product.code ? `${l.product.name} [${l.product.code}] (x${l.qty})` : `${l.product.name} (x${l.qty})`))
      .join(", ");
    const itemText = discount > 0 && couponCode ? `${baseItemText} [Coupon: ${couponCode} −${money(discount)}]` : baseItemText;
    const areaLabel = isDhakaZone(cleanCity, cleanAddress) ? "Inside Dhaka" : "Outside Dhaka";

    const { error } = await supabase
      .from("orders")
      .insert({
        id,
        items: orderLines.map((l) => ({
          id: l.id,
          code: l.product.code || "",
          name: l.product.name,
          price: l.product.price,
          qty: l.qty,
        })),
        item_text: itemText,
        total,
        shipping_fee: shipping,
        discount_amount: discount,
        courier_cost: 0,
        customer: cleanName,
        phone: cleanPhone,
        address: cleanNote ? `${cleanAddress} (Note: ${cleanNote})` : cleanAddress,
        city: `${cleanCity} (${areaLabel})`,
        payment: paymentRecord,
        coupon_code: couponCode || null,
      });

    setSubmitting(false);
    try {
      sessionStorage.setItem(LAST_SUBMIT_KEY, String(Date.now()));
    } catch {
      /* ignore */
    }

    const savedOk = !error;
    if (error) {
      console.error("Order save failed:", error.message);
    }

    trackPurchase(id, total, orderLines);

    const order = { id, url, total, pay: f.pay, savedOk, saveError: error?.message || "" };
    setCopied(false);
    setDone(order);
    saveOrder(order);
    if (savedOk) {
      saveMyOrder(id);
      fetch(NOTIFY_ORDER_URL, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id }),
        keepalive: true,
      }).catch(() => {});
    }
    cart.clear();
  };

  const handleCopyOrderId = async (orderId) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(orderId);
      } else {
        const el = document.createElement("textarea");
        el.value = orderId;
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  if (done) {
    return (
      <div className="container success">
        <div className="tick">{done.savedOk === false ? "!" : "✓"}</div>
        <h2>{done.savedOk === false ? "Order created with warning" : "Thank you!"}</h2>
        <p>Your order number is</p>
        <div
          className="order-no"
          style={{
            fontSize: "2rem",
            fontWeight: 700,
            color: "var(--gold-light)",
            letterSpacing: "0.08em",
            margin: "6px 0 4px",
          }}
        >
          {done.id}
        </div>
        <p className="note">Total: {money(done.total)}</p>
        {done.savedOk === false ? (
          <div className="warn">
            Could not save order to dashboard database ({done.saveError || "check Supabase insert permission"}). You can still send it on WhatsApp below.
          </div>
        ) : (
          <>
            <p>
              Please save or screenshot this number. You can check your order status any time in <b>View my orders</b> on this phone.
            </p>
            <div className="hero-cta" style={{ justifyContent: "center", marginTop: 12 }}>
              <button type="button" className="btn btn-ghost" onClick={() => handleCopyOrderId(done.id)}>
                {copied ? "Copied ✓" : "Copy number"}
              </button>
              <Link to={`/orders?new=${done.id}`} className="btn btn-gold" onClick={() => saveOrder(null)}>
                View my orders
              </Link>
            </div>
          </>
        )}
        {done.pay === "mobile" && <p className="note">{SITE.mobilePayment}</p>}
        {hasPlaceholderWhatsapp() && (
          <div className="warn">Owner note: set your real WhatsApp number in <b>src/config.js</b> so orders reach you.</div>
        )}
        <div className="hero-cta" style={{ justifyContent: "center", marginTop: 26 }}>
          {done.savedOk === false && (
            <a href={done.url} target="_blank" rel="noreferrer" className="btn btn-gold">
              Send order on WhatsApp
            </a>
          )}
          <Link to="/shop" className="btn btn-ghost" onClick={() => saveOrder(null)}>
            Continue shopping
          </Link>
        </div>
      </div>
    );
  }

  if (cart.lines.length === 0) {
    return (
      <div className="container empty">
        <h2>Nothing to check out</h2>
        <p>Add something to your cart first.</p>
        <Link to="/shop" className="btn btn-gold">Go to shop</Link>
      </div>
    );
  }

  const inDhakaZone = isDhakaZone(f.city, f.address);
  const currentCharge = inDhakaZone ? SITE.shippingFee : OUTSIDE_DHAKA_FEE;

  return (
    <>
      <div className="page-head">
        <div className="container">
          <div className="crumbs"><Link to="/">Home</Link> / Checkout</div>
          <h1 className="title"><em>Checkout</em></h1>
        </div>
      </div>
      <form className="container two-col" onSubmit={submit} noValidate>
        <div className="form">
          <h3 className="form-title">Delivery details</h3>
          {errors.form && <div className="err" style={{ marginBottom: 12 }}>{errors.form}</div>}
          <div className="row">
            <div className="field">
              <label>Full name</label>
              <input value={f.name} onChange={set("name")} autoComplete="name" />
              {errors.name && <div className="err">{errors.name}</div>}
            </div>
            <div className="field">
              <label>Phone number</label>
              <input value={f.phone} onChange={set("phone")} inputMode="tel" autoComplete="tel" />
              {errors.phone && <div className="err">{errors.phone}</div>}
            </div>
          </div>
          <div className="field">
            <label>Full address</label>
            <input value={f.address} onChange={set("address")} autoComplete="street-address" />
            {errors.address && <div className="err">{errors.address}</div>}
          </div>
          <div className="field" style={{ position: "relative" }}>
            <label>District</label>
            <input
              type="text"
              value={f.city}
              onChange={handleDistrictInput}
              onFocus={() => setDistrictMenuOpen(true)}
              onBlur={() => setTimeout(() => setDistrictMenuOpen(false), 150)}
              placeholder="Search or type district (e.g. Dhaka, Gazipur, Narayanganj)"
              autoComplete="address-level2"
            />
            {districtMenuOpen && filteredDistricts.length > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  zIndex: 25,
                  maxHeight: 200,
                  overflowY: "auto",
                  marginTop: 4,
                  borderRadius: 8,
                  border: "1px solid var(--line, rgba(255,255,255,0.2))",
                  background: "#121629",
                  boxShadow: "0 10px 24px rgba(0,0,0,0.35)",
                }}
              >
                {filteredDistricts.map((district) => (
                  <button
                    key={district}
                    type="button"
                    onMouseDown={() => handleSelectDistrict(district)}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      width: "100%",
                      padding: "8px 12px",
                      border: "none",
                      borderBottom: "1px solid rgba(255,255,255,0.06)",
                      background: f.city.toLowerCase() === district.toLowerCase() ? "rgba(255,255,255,0.1)" : "transparent",
                      color: "#fff",
                      textAlign: "left",
                      cursor: "pointer",
                      font: "inherit",
                      fontSize: 14,
                    }}
                  >
                    <span>{district}</span>
                    <span style={{ fontSize: 12, opacity: 0.75 }}>
                      {isDhakaZone(district, f.address) ? money(SITE.shippingFee) : money(OUTSIDE_DHAKA_FEE)}
                    </span>
                  </button>
                ))}
              </div>
            )}
            <p className="note" style={{ marginTop: 6 }}>
              Delivery charge: <b>{money(currentCharge)}</b> ({inDhakaZone ? "Inside Dhaka" : "Outside Dhaka"} · Free over {money(SITE.freeShippingOver)})
            </p>
            {errors.city && <div className="err">{errors.city}</div>}
          </div>

          <div className="field">
            <label>Order note (optional)</label>
            <textarea value={f.note} onChange={set("note")} />
          </div>

          <h3 className="form-title">Payment</h3>
          <div className="pay">
            <label className={f.pay === "cod" ? "on" : ""}>
              <input type="radio" name="pay" checked={f.pay === "cod"} onChange={() => setF({ ...f, pay: "cod" })} />
              <span>Cash on delivery<small>Pay when your order arrives.</small></span>
            </label>
            <label className={f.pay === "mobile" ? "on" : ""}>
              <input type="radio" name="pay" checked={f.pay === "mobile"} onChange={() => setF({ ...f, pay: "mobile" })} />
              <span>Mobile payment (bKash / Nagad)<small>{SITE.mobilePayment}</small></span>
            </label>
          </div>

          {f.pay === "mobile" && (
            <div className="row" style={{ marginTop: 14 }}>
              <div className="field">
                <label>Sender bKash / Nagad number</label>
                <input
                  value={f.payPhone}
                  onChange={set("payPhone")}
                  placeholder="01XXXXXXXXX"
                  inputMode="tel"
                />
                {errors.payPhone && <div className="err">{errors.payPhone}</div>}
              </div>
              <div className="field">
                <label>Transaction ID (trxID)</label>
                <input
                  value={f.trxId}
                  onChange={set("trxId")}
                  placeholder="e.g. BGH78K9L2M"
                />
                {errors.trxId && <div className="err">{errors.trxId}</div>}
              </div>
            </div>
          )}
        </div>

        <Summary cart={cart} district={f.city} address={f.address}>
          <div style={{ marginTop: 14 }}>
            {cart.lines.map((l) => (
              <div className="sum-row" key={l.id}>
                <span>{l.product.name} × {l.qty}</span>
                <span>{money(l.product.price * l.qty)}</span>
              </div>
            ))}
          </div>
          <button type="submit" disabled={submitting} className="btn btn-gold btn-block" style={{ marginTop: 18 }}>
            {submitting ? "Verifying & saving..." : "Place order"}
          </button>
          <p className="note">Your order will be saved directly to our store and appear in your Orders list.</p>
        </Summary>
      </form>
    </>
  );
}