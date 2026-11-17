import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SITE, money, hasPlaceholderWhatsapp } from "../config.js";
import { useCart } from "../cart.jsx";

const ORDER_KEY = "lumora_last_order_v1";
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

function Summary({ cart, children }) {
  return (
    <aside className="summary">
      <h3>Order summary</h3>
      <div className="sum-row"><span>Subtotal</span><span>{money(cart.subtotal)}</span></div>
      <div className="sum-row">
        <span>Delivery</span>
        <span>{cart.shipping === 0 ? "Free" : money(cart.shipping)}</span>
      </div>
      <div className="sum-row total"><span>Total</span><b>{money(cart.total)}</b></div>
      {cart.subtotal > 0 && cart.shipping > 0 && (
        <p className="note">Add {money(SITE.freeShippingOver - cart.subtotal)} more for free delivery.</p>
      )}
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
        <Summary cart={cart}>
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
  const [f, setF] = useState({ name: "", phone: "", address: "", city: "", note: "", pay: "cod" });
  const [errors, setErrors] = useState({});
  const [done, setDone] = useState(() => (cart.lines.length === 0 ? loadOrder() : null));

  useEffect(() => {
    if (cart.lines.length > 0) saveOrder(null);
  }, [cart.lines.length]);

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const buildMessage = (id, lines, totals) => {
    const items = lines.map(
      (l) => `• ${l.product.name} (${l.product.code}) × ${l.qty} = ${money(l.product.price * l.qty)}`
    );
    return [
      `🛍️ New order ${id}`,
      "",
      ...items,
      "",
      `Subtotal: ${money(totals.subtotal)}`,
      `Delivery: ${totals.shipping === 0 ? "Free" : money(totals.shipping)}`,
      `Total: ${money(totals.total)}`,
      `Payment: ${f.pay === "cod" ? "Cash on delivery" : "Mobile payment (bKash / Nagad)"}`,
      "",
      `Name: ${f.name}`,
      `Phone: ${f.phone}`,
      `Address: ${f.address}, ${f.city}`,
      f.note ? `Note: ${f.note}` : "",
    ]
      .filter((x) => x !== "")
      .join("\n");
  };

  const submit = (e) => {
    e.preventDefault();
    const er = {};
    if (f.name.trim().length < 2) er.name = "Please enter your name.";
    if (!/^[+\d][\d\s-]{6,}$/.test(f.phone.trim())) er.phone = "Please enter a valid phone number.";
    if (f.address.trim().length < 5) er.address = "Please enter your full address.";
    if (f.city.trim().length < 2) er.city = "Please enter your city.";
    setErrors(er);
    if (Object.keys(er).length) return;

    const id = "LJ-" + Date.now().toString(36).toUpperCase().slice(-6);
    const totals = { subtotal: cart.subtotal, shipping: cart.shipping, total: cart.total };
    const url = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(buildMessage(id, cart.lines, totals))}`;
    
    // --- লাইভ অর্ডারের ডাটা লোকাল স্টোরেজে সেভ করার কোড ---
    const newOrderRecord = {
      id: id,
      item: cart.lines.map(l => `${l.product.name} (x${l.qty})`).join(", "),
      date: new Date().toLocaleDateString("en-GB"),
      price: cart.total,
      ch: "Website",
      status: "Processing",
      customer: f.name,
      phone: f.phone
    };
    const existingOrders = JSON.parse(localStorage.getItem("veloria_orders") || "[]");
    localStorage.setItem("veloria_orders", JSON.stringify([newOrderRecord, ...existingOrders]));
    // ----------------------------------------------------

    const order = { id, url, total: cart.total, pay: f.pay };
    setDone(order);
    saveOrder(order);
    cart.clear();
    if (!hasPlaceholderWhatsapp()) window.open(url, "_blank");
  };

  if (done) {
    return (
      <div className="container success">
        <div className="tick">✓</div>
        <h2>Thank you!</h2>
        <p>Your order <b style={{ color: "var(--gold-light)" }}>{done.id}</b> is ready to send. Total: {money(done.total)}.</p>
        <p>Press the button below to send your order details to us on WhatsApp. We will confirm it with you shortly.</p>
        {done.pay === "mobile" && <p className="note">{SITE.mobilePayment}</p>}
        {hasPlaceholderWhatsapp() && (
          <div className="warn">Owner note: set your real WhatsApp number in <b>src/config.js</b> so orders reach you.</div>
        )}
        <div className="hero-cta" style={{ justifyContent: "center", marginTop: 26 }}>
          <a href={done.url} target="_blank" rel="noreferrer" className="btn btn-gold">Send order on WhatsApp</a>
          <Link to="/shop" className="btn btn-ghost" onClick={() => saveOrder(null)}>Continue shopping</Link>
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

  return (
    <>
      <div className="page-head">
        <div className="container">
          <div className="crumbs"><Link to="/cart">Cart</Link> / Checkout</div>
          <h1 className="title"><em>Checkout</em></h1>
        </div>
      </div>
      <form className="container two-col" onSubmit={submit} noValidate>
        <div className="form">
          <h3 className="form-title">Delivery details</h3>
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
          <div className="field">
            <label>City / District</label>
            <input value={f.city} onChange={set("city")} />
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
        </div>

        <Summary cart={cart}>
          <div style={{ marginTop: 14 }}>
            {cart.lines.map((l) => (
              <div className="sum-row" key={l.id}>
                <span>{l.product.name} × {l.qty}</span>
                <span>{money(l.product.price * l.qty)}</span>
              </div>
            ))}
          </div>
          <button type="submit" className="btn btn-gold btn-block" style={{ marginTop: 18 }}>
            Place order
          </button>
          <p className="note">Your order details will be sent to us on WhatsApp for confirmation.</p>
        </Summary>
      </form>
    </>
  );
}