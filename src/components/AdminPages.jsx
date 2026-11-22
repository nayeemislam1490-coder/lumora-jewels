// src/components/AdminPages.jsx
// Orders, Customers and Analytics pages for the admin dashboard.
// All numbers come from the real "orders" table in Supabase.
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabase.js";

const STATUSES = ["Processing", "Delivered", "Cancelled"];
const taka = (n) => "৳" + Math.round(Number(n) || 0).toLocaleString("en-IN");
const fmtDate = (d) => new Date(d).toLocaleDateString("en-GB");
const waLink = (phone) => {
  let d = String(phone || "").replace(/\D/g, "");
  if (!d) return null;
  if (d.startsWith("0")) d = "88" + d;
  return `https://wa.me/${d}`;
};

const btn = {
  padding: "5px 10px",
  borderRadius: 8,
  border: "1px solid var(--line)",
  background: "#fff",
  cursor: "pointer",
  font: "inherit",
  fontSize: 12,
  textDecoration: "none",
  color: "inherit",
  display: "inline-block",
};
const wrapCell = {
  whiteSpace: "normal",
  minWidth: 160,
  maxWidth: 260,
};
const stack = {
  display: "grid",
  gap: 16,
  minWidth: 0,
  maxWidth: "100%",
};

const SOON = {
  marketing: "Marketing",
  online: "Online store",
  pos: "Point of sale",
};

const signed = (n) => (n < 0 ? "−" : "") + taka(Math.abs(n));
const tone = (n) => (n < 0 ? "var(--down)" : "var(--up)");

const discountOf = (o) => {
  if (o.discount_amount != null && o.discount_amount !== "") {
    return Number(o.discount_amount) || 0;
  }
  const m = String(o.item_text || "").match(
    /Coupon:[^\]]*?[−-]\s*৳?\s*([\d,.]+)\s*\]/
  );
  return m ? Number(m[1].replace(/,/g, "")) || 0 : 0;
};

const shippingCollectedOf = (o) => {
  if (o.shipping_fee != null && o.shipping_fee !== "") {
    return Number(o.shipping_fee) || 0;
  }
  const itemsSub = (Array.isArray(o.items) ? o.items : []).reduce(
    (s, it) => s + (Number(it.price) || 0) * (Number(it.qty) || 1),
    0
  );
  const disc = discountOf(o);
  const total = Number(o.total) || 0;
  const inferred = total - Math.max(0, itemsSub - disc);
  return inferred > 0 ? inferred : 0;
};

const extraCostOf = (o) => {
  const n = Number(o.courier_cost);
  return Number.isFinite(n) && n > 0 ? n : 0;
};

export default function AdminPages({ view }) {
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState("");

  const load = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      setError(error.message);
      return;
    }
    setError("");
    setOrders(data);
  };

  useEffect(() => {
    load();
  }, []);

  if (view === "discount") return <Discounts />;

  if (SOON[view]) {
    return (
      <div className="vd-card" style={{ minWidth: 0, maxWidth: "100%" }}>
        <h2 className="vd-h">{SOON[view]}</h2>
        <p className="vd-sub">
          This section is not built yet. Orders, Customers, Discounts and
          Analytics are live.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="vd-card" style={{ minWidth: 0, maxWidth: "100%" }}>
        Could not load orders: {error}
      </div>
    );
  }

  if (!orders) {
    return (
      <div className="vd-card" style={{ minWidth: 0, maxWidth: "100%" }}>
        Loading...
      </div>
    );
  }

  if (view === "orders") {
    return <Orders orders={orders} setOrders={setOrders} reload={load} />;
  }

  if (view === "customers") {
    return <Customers orders={orders} />;
  }

  return <Analytics orders={orders} />;
}

/* ---------------- Discounts ---------------- */
function Discounts() {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [f, setF] = useState({
    code: "",
    type: "percent",
    value: "",
    min_order: "0",
    expires: "",
    max_uses: "",
    one_per_phone: false,
  });

  const loadCodes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("discounts")
      .select("*")
      .order("created_at", { ascending: false });
    setLoading(false);
    if (error) {
      setMsg("Run the discounts SQL in Supabase first (" + error.message + ").");
      return;
    }
    setCodes(data || []);
  };

  useEffect(() => {
    loadCodes();
  }, []);

  const createCode = async (e) => {
    e.preventDefault();
    setMsg("");
    const code = f.code.trim().toUpperCase().replace(/\s+/g, "");
    const value = Number(f.value);
    const minOrder = Math.max(0, Number(f.min_order) || 0);
    if (!code || code.length < 3) {
      return setMsg("Enter a code with at least 3 characters.");
    }
    if (!value || value <= 0) {
      return setMsg("Enter a valid discount value greater than 0.");
    }
    if (f.type === "percent" && value > 90) {
      return setMsg("Percentage discount cannot exceed 90%.");
    }

    const id = "DC-" + Date.now().toString(36).toUpperCase().slice(-6);
    const { data, error } = await supabase
      .from("discounts")
      .insert({
        id,
        code,
        type: f.type,
        value,
        min_order: minOrder,
        active: true,
        expires_at: f.expires
          ? new Date(f.expires + "T23:59:59").toISOString()
          : null,
        max_uses: f.max_uses
          ? Math.max(1, Math.floor(Number(f.max_uses)))
          : null,
        one_per_phone: !!f.one_per_phone,
      })
      .select()
      .single();

    if (error) {
      setMsg("Could not save code: " + error.message);
      return;
    }
    setCodes([data, ...codes]);
    setF({
      code: "",
      type: "percent",
      value: "",
      min_order: "0",
      expires: "",
      max_uses: "",
      one_per_phone: false,
    });
    setMsg(`Created code ${code}.`);
  };

  const toggleActive = async (item) => {
    const next = !item.active;
    setCodes(codes.map((c) => (c.id === item.id ? { ...c, active: next } : c)));
    const { error } = await supabase
      .from("discounts")
      .update({ active: next })
      .eq("id", item.id);
    if (error) {
      setCodes(
        codes.map((c) => (c.id === item.id ? { ...c, active: item.active } : c))
      );
      setMsg("Could not update code: " + error.message);
    }
  };

  const removeCode = async (id) => {
    if (!window.confirm("Delete this discount code?")) return;
    const prev = codes;
    setCodes(codes.filter((c) => c.id !== id));
    const { error } = await supabase.from("discounts").delete().eq("id", id);
    if (error) {
      setCodes(prev);
      setMsg("Could not delete code: " + error.message);
    }
  };

  return (
    <div style={stack}>
      <div className="vd-card" style={{ minWidth: 0, maxWidth: "100%" }}>
        <h2 className="vd-h">Discount codes</h2>
        <p className="vd-sub">
          Create percentage or flat Taka promo codes for customers at cart or
          checkout.
        </p>

        <form
          onSubmit={createCode}
          style={{
            display: "grid",
            gap: 12,
            marginTop: 14,
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          }}
        >
          <input
            value={f.code}
            onChange={(e) => setF({ ...f, code: e.target.value })}
            placeholder="Code (e.g. LUMORA10)"
            style={{
              padding: "8px 10px",
              borderRadius: 8,
              border: "1px solid var(--line)",
              font: "inherit",
            }}
          />
          <select
            value={f.type}
            onChange={(e) => setF({ ...f, type: e.target.value })}
            style={{
              padding: "8px 10px",
              borderRadius: 8,
              border: "1px solid var(--line)",
              font: "inherit",
              background: "#fff",
            }}
          >
            <option value="percent">Percentage (%)</option>
            <option value="fixed">Flat amount (৳)</option>
          </select>
          <input
            type="number"
            min="1"
            value={f.value}
            onChange={(e) => setF({ ...f, value: e.target.value })}
            placeholder={f.type === "percent" ? "Off % (e.g. 10)" : "Off ৳ (e.g. 150)"}
            style={{
              padding: "8px 10px",
              borderRadius: 8,
              border: "1px solid var(--line)",
              font: "inherit",
            }}
          />
          <input
            type="number"
            min="0"
            value={f.min_order}
            onChange={(e) => setF({ ...f, min_order: e.target.value })}
            placeholder="Min order ৳ (0 = none)"
            style={{
              padding: "8px 10px",
              borderRadius: 8,
              border: "1px solid var(--line)",
              font: "inherit",
            }}
          />
          <label
            style={{
              display: "grid",
              gap: 4,
              fontSize: 12,
              color: "var(--mut)",
            }}
          >
            Expires on (optional)
            <input
              type="date"
              value={f.expires}
              onChange={(e) => setF({ ...f, expires: e.target.value })}
              style={{
                padding: "8px 10px",
                borderRadius: 8,
                border: "1px solid var(--line)",
                font: "inherit",
              }}
            />
          </label>
          <input
            type="number"
            min="1"
            value={f.max_uses}
            onChange={(e) => setF({ ...f, max_uses: e.target.value })}
            placeholder="Total uses (empty = unlimited)"
            style={{
              padding: "8px 10px",
              borderRadius: 8,
              border: "1px solid var(--line)",
              font: "inherit",
            }}
          />
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
            }}
          >
            <input
              type="checkbox"
              checked={f.one_per_phone}
              onChange={(e) => setF({ ...f, one_per_phone: e.target.checked })}
            />
            One use per phone number
          </label>
          <button
            type="submit"
            style={{
              ...btn,
              background: "var(--maroon)",
              color: "#fff",
              borderColor: "var(--maroon)",
              padding: "8px 14px",
            }}
          >
            Add code
          </button>
        </form>
        {msg ? (
          <p className="vd-sub" style={{ marginTop: 10 }}>
            {msg}
          </p>
        ) : null}
      </div>

      <div className="vd-card" style={{ minWidth: 0, maxWidth: "100%" }}>
        <div className="vd-tabletop">
          <h2 className="vd-h">Active &amp; saved codes ({codes.length})</h2>
          <button style={btn} onClick={loadCodes}>
            Refresh
          </button>
        </div>
        <div className="vd-scroll">
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Discount</th>
                <th>Min order</th>
                <th>Expires</th>
                <th>Limit</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td
                    colSpan={7}
                    style={{ textAlign: "center", color: "var(--mut)" }}
                  >
                    Loading...
                  </td>
                </tr>
              )}
              {!loading &&
                codes.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <b>{c.code}</b>
                    </td>
                    <td>
                      {c.type === "fixed"
                        ? taka(c.value) + " off"
                        : `${c.value}% off`}
                    </td>
                    <td>
                      {Number(c.min_order) > 0
                        ? taka(c.min_order)
                        : "No minimum"}
                    </td>
                    <td>
                      {c.expires_at
                        ? new Date(c.expires_at).toLocaleDateString("en-GB")
                        : "No expiry"}
                    </td>
                    <td>
                      {c.max_uses ? `${c.max_uses} uses` : "Unlimited"}
                      {c.one_per_phone ? " · 1 per phone" : ""}
                    </td>
                    <td>{c.active ? "Active" : "Paused"}</td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button style={btn} onClick={() => toggleActive(c)}>
                          {c.active ? "Pause" : "Activate"}
                        </button>
                        <button
                          style={{ ...btn, color: "var(--down)" }}
                          onClick={() => removeCode(c.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              {!loading && codes.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    style={{ textAlign: "center", color: "var(--mut)" }}
                  >
                    No discount codes yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Orders ---------------- */
function Orders({ orders, setOrders, reload }) {
  const [filter, setFilter] = useState("All");
  const [q, setQ] = useState("");
  const [costsMap, setCostsMap] = useState({});

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("product_costs")
        .select("product_id,cost_price");
      if (Array.isArray(data)) {
        const m = {};
        data.forEach((r) => (m[r.product_id] = Number(r.cost_price)));
        setCostsMap(m);
      }
    })();
  }, []);

  const count = (s) =>
    s === "All" ? orders.length : orders.filter((o) => o.status === s).length;

  const rows = useMemo(() => {
    const t = q.trim().toLowerCase();
    return orders.filter(
      (o) =>
        (filter === "All" || o.status === filter) &&
        [o.id, o.customer, o.phone, o.item_text]
          .join(" ")
          .toLowerCase()
          .includes(t)
    );
  }, [orders, filter, q]);

  const changeStatus = async (id, status) => {
    const prev = orders;
    setOrders(orders.map((o) => (o.id === id ? { ...o, status } : o)));
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", id);
    if (error) {
      alert("Could not update status: " + error.message);
      setOrders(prev);
    }
  };

  const saveExtraCost = async (orderId, rawVal) => {
    const v = String(rawVal ?? "").trim();
    const n = v === "" ? 0 : Number(v);
    if (!Number.isFinite(n) || n < 0) return;
    const target = orders.find((x) => x.id === orderId);
    if (target && extraCostOf(target) === n) return;
    const prev = orders;
    setOrders(
      orders.map((o) => (o.id === orderId ? { ...o, courier_cost: n } : o))
    );
    const { error } = await supabase
      .from("orders")
      .update({ courier_cost: n })
      .eq("id", orderId);
    if (error) setOrders(prev);
  };

  const orderProfitInfo = (o) => {
    if (o.status === "Cancelled") {
      return { label: "Cancelled", value: null };
    }
    const items = Array.isArray(o.items) ? o.items : [];
    let itemSales = 0;
    let buyingCost = 0;
    for (const it of items) {
      const qty = Number(it.qty) || 1;
      itemSales += (Number(it.price) || 0) * qty;
      const c = costsMap[it.id];
      if (c !== undefined) buyingCost += c * qty;
    }
    const net =
      itemSales -
      discountOf(o) -
      buyingCost +
      shippingCollectedOf(o) -
      extraCostOf(o);
    return { label: signed(net), value: net };
  };

  const remove = async (id) => {
    if (!window.confirm(`Delete order ${id}? This cannot be undone.`)) return;
    const { data, error } = await supabase
      .from("orders")
      .delete()
      .eq("id", id)
      .select();
    if (error || !data || data.length === 0) {
      alert(
        "Could not delete. Run the delete-permission SQL in Supabase first."
      );
      return;
    }
    setOrders(orders.filter((o) => o.id !== id));
  };

  const extraInputStyle = {
    width: 82,
    padding: "4px 7px",
    borderRadius: 8,
    border: "1px solid var(--line)",
    font: "inherit",
    fontSize: 12,
  };

  return (
    <div className="vd-card" style={{ minWidth: 0, maxWidth: "100%" }}>
      <div className="vd-tabletop">
        <h2 className="vd-h">Orders</h2>
        <div className="vd-row">
          <label className="vd-search">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name, phone, ID"
            />
          </label>
          <button style={btn} onClick={reload}>
            Refresh
          </button>
        </div>
      </div>

      <div className="vd-ranges" style={{ marginTop: 0, marginBottom: 12 }}>
        {["All", ...STATUSES].map((s) => (
          <button
            key={s}
            className={filter === s ? "on" : ""}
            onClick={() => setFilter(s)}
          >
            {s} ({count(s)})
          </button>
        ))}
      </div>

      <div className="vd-scroll">
        <table>
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Extra cost</th>
              <th>Profit</th>
              <th>Date</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((o) => {
              const link = waLink(o.phone);
              const pInfo = orderProfitInfo(o);
              return (
                <tr key={o.id}>
                  <td>
                    <b>{o.id}</b>
                  </td>
                  <td style={wrapCell}>
                    <b>{o.customer}</b>
                    <div className="vd-sub">{o.phone}</div>
                    <div className="vd-sub">
                      {[o.address, o.city].filter(Boolean).join(", ")}
                    </div>
                    {o.payment ? (
                      <div className="vd-sub">Payment: {o.payment}</div>
                    ) : null}
                  </td>
                  <td style={wrapCell}>{o.item_text}</td>
                  <td>
                    <b>{taka(o.total)}</b>
                    <div className="vd-sub">
                      Del: {taka(shippingCollectedOf(o))} · Disc:{" "}
                      {taka(discountOf(o))}
                    </div>
                  </td>
                  <td>
                    <input
                      key={o.id + ":" + (o.courier_cost ?? 0)}
                      type="number"
                      min="0"
                      defaultValue={o.courier_cost ? o.courier_cost : ""}
                      placeholder="Optional"
                      style={extraInputStyle}
                      onBlur={(e) => saveExtraCost(o.id, e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && e.currentTarget.blur()
                      }
                    />
                  </td>
                  <td
                    style={{
                      color: pInfo.value == null ? "var(--mut)" : tone(pInfo.value),
                    }}
                  >
                    <b>{pInfo.label}</b>
                  </td>
                  <td>{fmtDate(o.created_at)}</td>
                  <td>
                    <select
                      value={o.status || "Processing"}
                      onChange={(e) => changeStatus(o.id, e.target.value)}
                      style={{
                        padding: "4px 8px",
                        borderRadius: 8,
                        border: "1px solid var(--line)",
                        font: "inherit",
                      }}
                    >
                      {STATUSES.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      {link ? (
                        <a
                          style={btn}
                          href={link}
                          target="_blank"
                          rel="noreferrer"
                        >
                          WhatsApp
                        </a>
                      ) : null}
                      <button
                        style={{ ...btn, color: "var(--down)" }}
                        onClick={() => remove(o.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  style={{ textAlign: "center", color: "var(--mut)" }}
                >
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------------- Customers ---------------- */
function Customers({ orders }) {
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    const m = new Map();
    for (const o of orders) {
      const key =
        String(o.phone || "").replace(/\D/g, "") || o.customer || o.id;
      const c = m.get(key) || {
        name: o.customer,
        phone: o.phone,
        city: o.city,
        orders: 0,
        spent: 0,
        last: o.created_at,
      };
      c.orders += 1;
      if (o.status !== "Cancelled") c.spent += Number(o.total) || 0;
      if (new Date(o.created_at) > new Date(c.last)) c.last = o.created_at;
      m.set(key, c);
    }
    return [...m.values()].sort((a, b) => b.spent - a.spent);
  }, [orders]);

  const t = q.trim().toLowerCase();
  const rows = list.filter((c) =>
    [c.name, c.phone, c.city].join(" ").toLowerCase().includes(t)
  );

  return (
    <div className="vd-card" style={{ minWidth: 0, maxWidth: "100%" }}>
      <div className="vd-tabletop">
        <h2 className="vd-h">Customers ({list.length})</h2>
        <label className="vd-search">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name or phone"
          />
        </label>
      </div>
      <div className="vd-scroll">
        <table>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Phone</th>
              <th>City</th>
              <th>Orders</th>
              <th>Spent</th>
              <th>Last order</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c, i) => {
              const link = waLink(c.phone);
              return (
                <tr key={i}>
                  <td>
                    <b>{c.name}</b>
                  </td>
                  <td>{c.phone}</td>
                  <td>{c.city}</td>
                  <td>{c.orders}</td>
                  <td>
                    <b>{taka(c.spent)}</b>
                  </td>
                  <td>{fmtDate(c.last)}</td>
                  <td>
                    {link ? (
                      <a
                        style={btn}
                        href={link}
                        target="_blank"
                        rel="noreferrer"
                      >
                        WhatsApp
                      </a>
                    ) : null}
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  style={{ textAlign: "center", color: "var(--mut)" }}
                >
                  No customers yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="vd-sub" style={{ marginTop: 10 }}>
        Customers are built from orders. "Spent" does not count cancelled
        orders.
      </p>
    </div>
  );
}

/* ---------------- Analytics ---------------- */
function Analytics({ orders }) {
  const [range, setRange] = useState("7d");
  const valid = useMemo(
    () => orders.filter((o) => o.status !== "Cancelled"),
    [orders]
  );

  const buckets = useMemo(() => {
    const now = new Date();
    const out = [];
    if (range === "12m") {
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        out.push({
          key: `${d.getFullYear()}-${d.getMonth()}`,
          label: d.toLocaleString("en-GB", { month: "short" }),
          total: 0,
          count: 0,
        });
      }
      valid.forEach((o) => {
        const d = new Date(o.created_at);
        const b = out.find(
          (x) => x.key === `${d.getFullYear()}-${d.getMonth()}`
        );
        if (b) {
          b.total += Number(o.total) || 0;
          b.count += 1;
        }
      });
    } else {
      const n = range === "7d" ? 7 : 30;
      for (let i = n - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        out.push({
          key: d.toDateString(),
          label: d.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
          }),
          total: 0,
          count: 0,
        });
      }
      valid.forEach((o) => {
        const b = out.find(
          (x) => x.key === new Date(o.created_at).toDateString()
        );
        if (b) {
          b.total += Number(o.total) || 0;
          b.count += 1;
        }
      });
    }
    return out;
  }, [valid, range]);

  const revenue = buckets.reduce((s, b) => s + b.total, 0);
  const count = buckets.reduce((s, b) => s + b.count, 0);
  const avg = count ? revenue / count : 0;
  const cancelled = orders.length - valid.length;
  const max = Math.max(...buckets.map((b) => b.total), 1);

  const top = useMemo(() => {
    const m = new Map();
    valid.forEach((o) =>
      (Array.isArray(o.items) ? o.items : []).forEach((it) => {
        const qty = Number(it.qty) || 1;
        const r = m.get(it.name) || { name: it.name, qty: 0, rev: 0 };
        r.qty += qty;
        r.rev += (Number(it.price) || 0) * qty;
        m.set(it.name, r);
      })
    );
    return [...m.values()].sort((a, b) => b.qty - a.qty).slice(0, 5);
  }, [valid]);
  const topMax = Math.max(...top.map((t) => t.qty), 1);

  const stat = (label, value) => (
    <div className="vd-card" style={{ minWidth: 0 }}>
      <div className="vd-sub">{label}</div>
      <div style={{ fontSize: 22, fontWeight: 600, marginTop: 4 }}>{value}</div>
    </div>
  );

  return (
    <div style={stack}>
      <div className="vd-kpis">
        {stat("Revenue", taka(revenue))}
        {stat("Orders", count)}
        {stat("Average order", taka(avg))}
        {stat("Cancelled (all time)", cancelled)}
      </div>

      <div className="vd-card" style={{ minWidth: 0, maxWidth: "100%" }}>
        <div className="vd-tabletop">
          <h2 className="vd-h">Sales</h2>
          <div className="vd-ranges" style={{ marginTop: 0 }}>
            {[
              ["7d", "7 days"],
              ["30d", "30 days"],
              ["12m", "12 months"],
            ].map(([k, l]) => (
              <button
                key={k}
                className={range === k ? "on" : ""}
                onClick={() => setRange(k)}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 6,
            height: 180,
            marginTop: 8,
          }}
        >
          {buckets.map((b) => (
            <div
              key={b.key}
              title={`${b.label}: ${taka(b.total)} (${b.count} orders)`}
              style={{
                flex: 1,
                minWidth: 0,
                height: "100%",
                display: "flex",
                alignItems: "flex-end",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: `${(b.total / max) * 100}%`,
                  minHeight: b.total ? 4 : 2,
                  background: "var(--maroon)",
                  borderRadius: "6px 6px 0 0",
                  opacity: b.total ? 1 : 0.15,
                }}
              />
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
          {buckets.map((b, i) => (
            <div
              key={b.key}
              style={{
                flex: 1,
                minWidth: 0,
                textAlign: "center",
                fontSize: 11,
                color: "var(--mut)",
                overflow: "hidden",
              }}
            >
              {range === "30d" && i % 5 !== 0 ? "" : b.label}
            </div>
          ))}
        </div>
      </div>

      <div className="vd-card" style={{ minWidth: 0, maxWidth: "100%" }}>
        <h2 className="vd-h">Top products (all time)</h2>
        {top.length === 0 && <p className="vd-sub">No sales yet.</p>}
        <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
          {top.map((t) => (
            <div key={t.name}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 10,
                  fontSize: 13,
                }}
              >
                <span>{t.name}</span>
                <span className="vd-sub">
                  {t.qty} sold · {taka(t.rev)}
                </span>
              </div>
              <div
                style={{
                  height: 8,
                  background: "var(--gold-s)",
                  borderRadius: 99,
                  marginTop: 6,
                }}
              >
                <div
                  style={{
                    width: `${(t.qty / topMax) * 100}%`,
                    height: "100%",
                    background: "var(--gold)",
                    borderRadius: 99,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <Profit orders={orders} />
    </div>
  );
}

/* ---------------- Profit & cost (admin only) ---------------- */
function Profit({ orders }) {
  const [products, setProducts] = useState(null);
  const [costs, setCosts] = useState({});
  const [note, setNote] = useState("");
  const [range, setRange] = useState("all");
  const [q, setQ] = useState("");
  const [onlySold, setOnlySold] = useState(false);

  useEffect(() => {
    (async () => {
      const p = await supabase
        .from("products")
        .select("id,name,price,category")
        .order("created_at", { ascending: false });
      if (p.error) {
        setNote("Could not load products: " + p.error.message);
        setProducts([]);
        return;
      }
      setProducts(p.data);
      const c = await supabase
        .from("product_costs")
        .select("product_id,cost_price");
      if (c.error) {
        setNote(
          "Cost table not found. Run the product-costs SQL in Supabase first."
        );
        return;
      }
      const m = {};
      c.data.forEach((r) => (m[r.product_id] = Number(r.cost_price)));
      setCosts(m);
    })();
  }, []);

  const saveCost = async (id, value) => {
    const v = String(value).trim();
    if (v === "") return;
    const n = Number(v);
    if (!Number.isFinite(n) || n < 0) return;
    const { error } = await supabase
      .from("product_costs")
      .upsert({
        product_id: id,
        cost_price: n,
        updated_at: new Date().toISOString(),
      });
    if (error) return;
    setCosts((c) => ({ ...c, [id]: n }));
  };

  const calcOrdersProfit = (orderList, cutoff) => {
    let itemSales = 0;
    let costOfItems = 0;
    let discounts = 0;
    let shippingCollected = 0;
    let extraPaid = 0;

    for (const o of orderList) {
      if (o.status === "Cancelled") continue;
      if (cutoff && new Date(o.created_at) < cutoff) continue;
      for (const it of Array.isArray(o.items) ? o.items : []) {
        const qty = Number(it.qty) || 1;
        itemSales += (Number(it.price) || 0) * qty;
        const c = costs[it.id];
        if (c !== undefined) costOfItems += c * qty;
      }
      discounts += discountOf(o);
      shippingCollected += shippingCollectedOf(o);
      extraPaid += extraCostOf(o);
    }

    return {
      itemSales,
      costOfItems,
      discounts,
      shippingCollected,
      extraPaid,
      profit:
        itemSales - discounts - costOfItems + shippingCollected - extraPaid,
    };
  };

  const { rows, realized, potential, toBuyList, toBuyTotalCost } = useMemo(() => {
    if (!products) {
      const zero = {
        itemSales: 0,
        costOfItems: 0,
        discounts: 0,
        shippingCollected: 0,
        extraPaid: 0,
        profit: 0,
      };
      return {
        rows: [],
        realized: zero,
        potential: zero,
        toBuyList: [],
        toBuyTotalCost: 0,
      };
    }

    const cutoff =
      range === "all"
        ? null
        : new Date(Date.now() - (range === "7d" ? 7 : 30) * 86400000);
    const sold = new Map();
    const buyMap = new Map();

    orders.forEach((o) => {
      if (o.status === "Cancelled") return;
      const inRange = !cutoff || new Date(o.created_at) >= cutoff;
      const items = Array.isArray(o.items) ? o.items : [];
      if (inRange) {
        items.forEach((it) => {
          const qty = Number(it.qty) || 1;
          const r = sold.get(it.id) || {
            qty: 0,
            rev: 0,
            name: it.name,
            price: Number(it.price) || 0,
          };
          r.qty += qty;
          r.rev += (Number(it.price) || 0) * qty;
          sold.set(it.id, r);
        });
      }
      if ((o.status || "Processing") === "Processing") {
        items.forEach((it) => {
          const qty = Number(it.qty) || 1;
          const cur = buyMap.get(it.id) || {
            id: it.id,
            name: it.name,
            qty: 0,
          };
          cur.qty += qty;
          buyMap.set(it.id, cur);
        });
      }
    });

    const map = new Map();
    products.forEach((p) =>
      map.set(p.id, {
        id: p.id,
        name: p.name,
        price: Number(p.price) || 0,
        qty: 0,
        rev: 0,
        removed: false,
      })
    );
    sold.forEach((s, id) => {
      const base = map.get(id) || {
        id,
        name: s.name,
        price: s.price,
        removed: true,
      };
      map.set(id, { ...base, qty: s.qty, rev: s.rev });
    });

    const list = [...map.values()].map((r) => {
      const cost = costs[r.id];
      const hasCost = cost !== undefined;
      return {
        ...r,
        cost,
        hasCost,
        marginPc: hasCost ? r.price - cost : null,
        marginPct:
          hasCost && r.price > 0 ? ((r.price - cost) / r.price) * 100 : null,
        profit: hasCost ? r.rev - cost * r.qty : null,
      };
    });

    let buyCostSum = 0;
    const buyRows = [...buyMap.values()].map((b) => {
      const c = costs[b.id];
      const hasC = c !== undefined;
      if (hasC) buyCostSum += c * b.qty;
      return {
        ...b,
        cost: c,
        hasCost: hasC,
        totalCost: hasC ? c * b.qty : null,
      };
    });

    return {
      rows: list,
      realized: calcOrdersProfit(
        orders.filter((o) => o.status === "Delivered"),
        cutoff
      ),
      potential: calcOrdersProfit(
        orders.filter((o) => o.status !== "Cancelled"),
        cutoff
      ),
      toBuyList: buyRows,
      toBuyTotalCost: buyCostSum,
    };
  }, [products, costs, orders, range]);

  if (!products) return <div className="vd-card">Loading profit...</div>;

  const soldRows = rows.filter((r) => r.qty > 0);
  const revenue = soldRows.reduce((s, r) => s + r.rev, 0);
  const margin =
    potential.itemSales > 0 ? (potential.profit / potential.itemSales) * 100 : 0;
  const noCostCount = rows.filter((r) => !r.hasCost && !r.removed).length;

  const t = q.trim().toLowerCase();
  const shown = rows
    .filter((r) => (!onlySold || r.qty > 0) && r.name.toLowerCase().includes(t))
    .sort(
      (a, b) =>
        (b.profit ?? -Infinity) - (a.profit ?? -Infinity) || b.qty - a.qty
    );

  const stat = (label, value, color, sub) => (
    <div className="vd-card">
      <div className="vd-sub">{label}</div>
      <div style={{ fontSize: 22, fontWeight: 600, marginTop: 4, color }}>
        {value}
      </div>
      {sub ? (
        <div className="vd-sub" style={{ marginTop: 4 }}>
          {sub}
        </div>
      ) : null}
    </div>
  );
  const cellInput = {
    width: 90,
    padding: "5px 8px",
    borderRadius: 8,
    border: "1px solid var(--line)",
    font: "inherit",
  };

  return (
    <div className="vd-card">
      <div className="vd-tabletop">
        <h2 className="vd-h">Profit &amp; cost</h2>
        <div className="vd-ranges" style={{ marginTop: 0 }}>
          {[
            ["all", "All time"],
            ["30d", "30 days"],
            ["7d", "7 days"],
          ].map(([k, l]) => (
            <button
              key={k}
              className={range === k ? "on" : ""}
              onClick={() => setRange(k)}
            >
              {l}
            </button>
          ))}
        </div>
      </div>
      {note && (
        <p className="vd-sub" style={{ color: "var(--down)" }}>
          {note}
        </p>
      )}

      <div className="vd-kpis" style={{ marginTop: 6 }}>
        {stat(
          "Realized profit (Delivered)",
          signed(realized.profit),
          tone(realized.profit),
          `Sales ${taka(realized.itemSales)} · Extra ${taka(realized.extraPaid)}`
        )}
        {stat(
          "Potential profit (incl. Processing)",
          signed(potential.profit),
          tone(potential.profit),
          `Sales ${taka(revenue)} · Disc ${taka(potential.discounts)}`
        )}
        {stat(
          "Cost of items",
          taka(potential.costOfItems),
          undefined,
          `Del ${taka(potential.shippingCollected)} · Extra ${taka(
            potential.extraPaid
          )}`
        )}
        {stat(
          "Net margin",
          `${margin.toFixed(0)}%`,
          tone(potential.profit)
        )}
      </div>
      <p className="vd-sub" style={{ marginTop: 10 }}>
        Profit = Item sales − Discount − Buying cost + Delivery collected −
        Extra cost.
      </p>

      <div
        className="vd-card"
        style={{ marginTop: 14, background: "rgba(0,0,0,0.02)" }}
      >
        <div className="vd-tabletop">
          <h3 className="vd-h" style={{ fontSize: 14 }}>
            To buy today (Processing orders)
          </h3>
          <span className="vd-sub">
            Estimated buy cost: <b>{taka(toBuyTotalCost)}</b>
          </span>
        </div>
        {toBuyList.length === 0 ? (
          <p className="vd-sub" style={{ marginTop: 8 }}>
            No Processing items to buy right now.
          </p>
        ) : (
          <div style={{ display: "grid", gap: 6, marginTop: 8 }}>
            {toBuyList.map((b) => (
              <div
                key={b.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 13,
                }}
              >
                <span>
                  <b>{b.name}</b> × {b.qty}
                </span>
                <span className="vd-sub">
                  {b.hasCost ? taka(b.totalCost) : "Cost not set"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="vd-tabletop" style={{ marginTop: 14 }}>
        <h3 className="vd-h" style={{ fontSize: 14 }}>
          Per product ({noCostCount} without cost)
        </h3>
        <div className="vd-row" style={{ alignItems: "center" }}>
          <label className="vd-search">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search product"
            />
          </label>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
            }}
          >
            <input
              type="checkbox"
              checked={onlySold}
              onChange={(e) => setOnlySold(e.target.checked)}
            />{" "}
            Sold only
          </label>
        </div>
      </div>

      <div className="vd-scroll">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Sell price</th>
              <th>Your cost</th>
              <th>Profit / piece</th>
              <th>Margin</th>
              <th>Sold</th>
              <th>Sales</th>
              <th>Profit / Loss</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((r) => (
              <tr key={r.id}>
                <td style={wrapCell}>
                  {r.name}
                  {r.removed ? (
                    <span className="vd-sub"> (removed)</span>
                  ) : null}
                </td>
                <td>{taka(r.price)}</td>
                <td>
                  {r.removed ? (
                    r.hasCost ? (
                      taka(r.cost)
                    ) : (
                      "—"
                    )
                  ) : (
                    <input
                      key={r.id + ":" + (r.cost ?? "")}
                      type="number"
                      min="0"
                      defaultValue={r.cost ?? ""}
                      placeholder="Set cost"
                      style={cellInput}
                      onBlur={(e) => saveCost(r.id, e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && e.currentTarget.blur()
                      }
                    />
                  )}
                </td>
                <td
                  style={{
                    color: r.marginPc == null ? undefined : tone(r.marginPc),
                  }}
                >
                  {r.marginPc == null ? "—" : signed(r.marginPc)}
                </td>
                <td>
                  {r.marginPct == null ? "—" : `${r.marginPct.toFixed(0)}%`}
                </td>
                <td>{r.qty}</td>
                <td>{taka(r.rev)}</td>
                <td
                  style={{
                    color: r.profit == null ? undefined : tone(r.profit),
                  }}
                >
                  <b>{r.profit == null ? "—" : signed(r.profit)}</b>
                </td>
              </tr>
            ))}
            {shown.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  style={{ textAlign: "center", color: "var(--mut)" }}
                >
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="vd-sub" style={{ marginTop: 10 }}>
        Type your buying cost in the "Your cost" box and press Enter. Customers
        can never see these numbers.
      </p>
    </div>
  );
}