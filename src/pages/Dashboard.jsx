// src/pages/dashboard.jsx
// Needs one package:  npm i lucide-react

import { useMemo, useState, useEffect } from "react";
import {
  LayoutDashboard, ShoppingBag, Gem, Users, BarChart3, Megaphone, Percent,
  Store, CreditCard, Search, SlidersHorizontal, Bell, CalendarDays, ChevronDown,
  ChevronLeft, ChevronRight, Plus, Package, CheckCircle2, XCircle, Trophy,
  TrendingUp, TrendingDown, Trash2,
} from "lucide-react";
import { CATEGORIES } from "../products.js";
import { money } from "../config.js";
import { supabase } from "../supabase.js";

const NAV = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "orders", label: "Orders", icon: ShoppingBag },
  { id: "products", label: "Products", icon: Gem },
  { id: "customers", label: "Customers", icon: Users },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "marketing", label: "Marketing", icon: Megaphone },
  { id: "discount", label: "Discount", icon: Percent },
];
const CHANNEL_NAV = [
  { id: "online", label: "Online store", icon: Store },
  { id: "pos", label: "Point of sale", icon: CreditCard },
];
const APPS = [
  { name: "Website", tag: "W", color: "#5b1527" },
  { name: "Facebook", tag: "f", color: "#1877f2" },
  { name: "WhatsApp", tag: "WA", color: "#1f9d55" },
  { name: "Daraz", tag: "D", color: "#f26b21" },
];

const RANGES = {
  "1d": { name: "1d", delta: 3.2, labels: ["12a", "3a", "6a", "9a", "12p", "3p", "6p", "9p"], rev: [3, 2, 1, 8, 16, 12, 21, 26], ord: [0, 0, 0, 1, 2, 1, 3, 4] },
  "7d": { name: "7d", delta: 2.5, labels: ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"], rev: [62, 48, 71, 55, 93, 84, 120], ord: [3, 2, 4, 3, 6, 5, 8] },
  "30d": { name: "30d", delta: 8.1, labels: ["Week 1", "Week 2", "Week 3", "Week 4"], rev: [310, 420, 380, 560], ord: [18, 24, 21, 33] },
  "12m": { name: "12m", delta: 14.6, labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], rev: [820, 640, 910, 1100, 980, 1320, 1210, 1580, 1390, 1450, 1860, 2240], ord: [48, 37, 55, 64, 57, 79, 72, 93, 81, 88, 112, 134] },
  max: { name: "Max", delta: 22.4, labels: ["2022", "2023", "2024", "2025", "2026"], rev: [4200, 7800, 11500, 15200, 18900], ord: [250, 460, 690, 910, 1130] },
};

const BEST = [
  { name: "Gold necklace set", sold: 271, bg: "linear-gradient(150deg,#7a1d33,#33091a)" },
  { name: "Diamond stud earrings", sold: 214, bg: "linear-gradient(150deg,#8a6a22,#3d2a08)" },
  { name: "Pearl bracelet", sold: 187, bg: "linear-gradient(150deg,#5b1527,#1f0710)" },
];

function smooth(pts) {
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[i + 1];
    const cx = (x0 + x1) / 2;
    d += ` C${cx},${y0} ${cx},${y1} ${x1},${y1}`;
  }
  return d;
}

function Delta({ v }) {
  const up = v >= 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span className={`vd-pill ${up ? "up" : "down"}`}>
      <Icon size={12} />
      {up ? "+" : ""}{v}%
    </span>
  );
}

function NavGroup({ title, items, active, setActive, className = "" }) {
  return (
    <div className={`vd-group ${className}`}>
      <div className="vd-sec">{title}</div>
      {items.map(({ id, label, icon: Icon, badge }) => (
        <button key={id} title={label} className={`vd-nav ${active === id ? "on" : ""}`} onClick={() => setActive(id)}>
          <Icon size={18} />
          <span className="vd-lbl">{label}</span>
          {badge ? <em className="vd-badge">{badge}</em> : null}
        </button>
      ))}
    </div>
  );
}

function SalesChart({ labels, rev, ord }) {
  const W = 600, H = 220, P = 16;
  const n = labels.length;
  const [hover, setHover] = useState(null);

  const toPts = (arr) => {
    const max = Math.max(...arr) * 1.12 || 1;
    return arr.map((v, i) => [(i / (n - 1)) * W, H - P - (v / max) * (H - 2 * P)]);
  };
  const a = toPts(rev);
  const b = toPts(ord);
  const i = hover ?? Math.floor(n * 0.6);

  const move = (e) => {
    const box = e.currentTarget.getBoundingClientRect();
    const k = Math.round(((e.clientX - box.left) / box.width) * (n - 1));
    setHover(Math.max(0, Math.min(n - 1, k)));
  };
  const px = (x) => `${(x / W) * 100}%`;
  const py = (y) => `${(y / H) * 100}%`;
  const tipLeft = Math.min(84, Math.max(16, (a[i][0] / W) * 100));

  return (
    <div>
      <div className="vd-plot" onPointerMove={move} onPointerDown={move}>
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label="Sales chart">
          <defs>
            <linearGradient id="vdFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5b1527" stopOpacity=".16" />
              <stop offset="100%" stopColor="#5b1527" stopOpacity="0" />
            </linearGradient>
          </defs>
          {a.map(([x], k) => (
            <line key={k} x1={x} x2={x} y1="0" y2={H} stroke="#efe8e2" vectorEffect="non-scaling-stroke" />
          ))}
          <path d={`${smooth(a)} L${W},${H} L0,${H} Z`} fill="url(#vdFill)" />
          <path d={smooth(b)} fill="none" stroke="#c9a24b" strokeWidth="2" vectorEffect="non-scaling-stroke" />
          <path d={smooth(a)} fill="none" stroke="#5b1527" strokeWidth="2" vectorEffect="non-scaling-stroke" />
        </svg>
        <div className="vd-vline" style={{ left: px(a[i][0]) }} />
        <div className="vd-dot" style={{ left: px(a[i][0]), top: py(a[i][1]), background: "#5b1527" }} />
        <div className="vd-dot" style={{ left: px(b[i][0]), top: py(b[i][1]), background: "#c9a24b" }} />
        <div className="vd-tip" style={{ left: `${tipLeft}%` }}>
          <b>{labels[i]}</b>
          <span><i style={{ background: "#5b1527", outline: "1px solid #c9a24b" }} />{money(rev[i] * 1000)} sales</span>
          <span><i style={{ background: "#c9a24b" }} />{ord[i]} orders</span>
        </div>
      </div>
      <div className="vd-axis">{labels.map((l) => <span key={l}>{l}</span>)}</div>
    </div>
  );
}

export default function Dashboard() {
  const [collapsed, setCollapsed] = useState(false);
  const [active, setActive] = useState("overview");
  const [range, setRange] = useState("7d");
  const [q, setQ] = useState("");
  const [channel, setChannel] = useState("All");
  const [fOpen, setFOpen] = useState(false);
  const [sel, setSel] = useState(() => new Set());
  const [slide, setSlide] = useState(0);

  const [orders, setOrders] = useState([]);

  const loadOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Load orders failed:", error.message);
      return;
    }

    if (data) {
      const mappedOrders = data.map((o) => ({
        id: o.id,
        item: o.item_text,
        date: new Date(o.created_at).toLocaleDateString(),
        price: o.total,
        ch: o.channel || "Website",
        status: o.status || "Processing",
      }));
      setOrders(mappedOrders);
      if (mappedOrders.length > 0) {
        setSel(new Set([mappedOrders[0].id]));
      }
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const changeStatus = async (id, status) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", id);
    if (error) {
      console.error("Status update failed:", error.message);
    }
  };

  // Supabase থেকে প্রোডাক্ট লোড করার ব্যবস্থা
  const [products, setProducts] = useState([]);

  const loadAdminProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) {
      setProducts(data);
    }
  };

  useEffect(() => {
    loadAdminProducts();
  }, []);

  const [newProd, setNewProd] = useState({ name: "", price: "", code: "", category: CATEGORIES[0] || "Necklaces", image: "" });

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProd.name || !newProd.price) return;
    
    const row = {
      id: "p" + Date.now(),
      name: newProd.name,
      code: newProd.code || "LJ-" + Math.floor(100 + Math.random() * 900),
      category: newProd.category,
      price: Number(newProd.price),
      description: "Exquisite handcrafted jewelry piece designed for elegance and timeless beauty.",
      specs: ["100% Authentic Material", "Handcrafted finish", "Gift-ready packaging"],
      images: [newProd.image || "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600"]
    };

    const { error } = await supabase.from("products").insert([row]);
    if (error) {
      alert("Add product failed: " + error.message);
      return;
    }

    setProducts([row, ...products]);
    setNewProd({ name: "", price: "", code: "", category: CATEGORIES[0] || "Necklaces", image: "" });
    alert("Product added successfully to Supabase!");
  };

  const handleDeleteProduct = async (id) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      alert("Could not delete: " + error.message);
      return;
    }
    setProducts(products.filter((p) => String(p.id) !== String(id)));
  };

  const r = RANGES[range];
  const total = r.rev.reduce((s, v) => s + v, 0) * 1000;
  const gain = total - total / (1 + r.delta / 100);

  const rows = useMemo(() => {
    const t = q.trim().toLowerCase();
    return orders.filter((o) => (channel === "All" || o.ch === channel) && ((o.id || "") + (o.item || "")).toLowerCase().includes(t));
  }, [q, channel, orders]);
  const allSel = rows.length > 0 && rows.every((o) => sel.has(o.id));

  const toggle = (id) =>
    setSel((p) => {
      const n = new Set(p);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  const toggleAll = () =>
    setSel((p) => {
      const n = new Set(p);
      rows.forEach((o) => (allSel ? n.delete(o.id) : n.add(o.id)));
      return n;
    });

  const now = new Date();
  const hr = now.getHours();
  const greet = hr < 12 ? "Morning" : hr < 17 ? "Afternoon" : "Evening";
  const today = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  const k = BEST.length;
  const prev = BEST[(slide - 1 + k) % k];
  const cur = BEST[slide];
  const next = BEST[(slide + 1) % k];

  return (
    <div className="vd">
      <style>{css}</style>

      <div className="vd-sidewrap">
        <aside className={`vd-side ${collapsed ? "is-collapsed" : ""}`}>
          <div className="vd-brand vd-desk">
            <span className="vd-logo">V</span>
            <span className="vd-brand-name">Veloria House</span>
          </div>

          <NavGroup title="Main Menu" items={NAV} active={active} setActive={setActive} />
          <NavGroup title="Sales Channel" items={CHANNEL_NAV} active={active} setActive={setActive} className="vd-desk" />

          <div className="vd-desk">
            <div className="vd-sec">Apps</div>
            {APPS.map((a) => (
              <div className="vd-nav" key={a.name} title={a.name}>
                <span className="vd-appdot" style={{ background: a.color }}>{a.tag}</span>
                <span className="vd-lbl">{a.name}</span>
              </div>
            ))}
          </div>
        </aside>
        <button className="vd-collapse" onClick={() => setCollapsed((c) => !c)} aria-label="Collapse sidebar">
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      <main className="vd-main">
        <header className="vd-head">
          <div>
            <h1>Good {greet}, Admin!</h1>
            <p>Manage your store products and categories</p>
          </div>
          <div className="vd-tools">
            <div className="vd-chip"><CalendarDays size={16} />{today}</div>
            <button className="vd-chip vd-bell" aria-label="Notifications">
              <Bell size={16} /><b>2</b>
            </button>
            <button className="vd-chip" aria-label="Account">
              <span className="vd-avatar">A</span><ChevronDown size={14} />
            </button>
          </div>
        </header>

        {active === "products" ? (
          <div style={{ display: "grid", gap: "20px" }}>
            <div className="vd-card">
              <h2 className="vd-h" style={{ marginBottom: "15px" }}>Add New Jewelry Product</h2>
              <form onSubmit={handleAddProduct} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px" }}>
                <input
                  type="text"
                  placeholder="Product Name"
                  value={newProd.name}
                  onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
                  style={{ padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--line)", outline: "none" }}
                  required
                />
                <input
                  type="number"
                  placeholder="Price in BDT (e.g. 15000)"
                  value={newProd.price}
                  onChange={(e) => setNewProd({ ...newProd, price: e.target.value })}
                  style={{ padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--line)", outline: "none" }}
                  required
                />
                <input
                  type="text"
                  placeholder="Product Code (e.g. LJ-09)"
                  value={newProd.code}
                  onChange={(e) => setNewProd({ ...newProd, code: e.target.value })}
                  style={{ padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--line)", outline: "none" }}
                />
                <select
                  value={newProd.category}
                  onChange={(e) => setNewProd({ ...newProd, category: e.target.value })}
                  style={{ padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--line)", outline: "none", background: "#fff" }}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Image URL (optional)"
                  value={newProd.image}
                  onChange={(e) => setNewProd({ ...newProd, image: e.target.value })}
                  style={{ padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--line)", outline: "none", gridColumn: "1 / -1" }}
                />
                <button type="submit" className="vd-ranges on" style={{ padding: "10px 20px", borderRadius: "10px", fontWeight: 600, gridColumn: "1 / -1", justifyContent: "center" }}>
                  Add Product to Store
                </button>
              </form>
            </div>

            <div className="vd-card">
              <h2 className="vd-h" style={{ marginBottom: "15px" }}>Product Catalog ({products.length})</h2>
              <div className="vd-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Product Name</th>
                      <th>Category</th>
                      <th>Code</th>
                      <th>Price</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <img src={p.images?.[p.images.length - 1] || p.images?.[0]} alt={p.name} style={{ width: 36, height: 36, borderRadius: "8px", objectFit: "cover" }} />
                        </td>
                        <td><b>{p.name}</b></td>
                        <td><span className="vd-pill" style={{ background: "var(--gold-s)", color: "var(--maroon)" }}>{p.category || "General"}</span></td>
                        <td>{p.code || "N/A"}</td>
                        <td>{money(p.price)}</td>
                        <td>
                          <button onClick={() => handleDeleteProduct(p.id)} style={{ color: "var(--down)", display: "flex", alignItems: "center", gap: 4 }}>
                            <Trash2 size={16} /> Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <>
            <section className="vd-kpis">
              <div className="vd-card vd-kpi">
                <span className="vd-ico"><Package size={18} /></span>
                <div>
                  <small>Total products</small>
                  <strong>{products.length}</strong>
                </div>
              </div>
              <div className="vd-card vd-kpi">
                <span className="vd-ico"><CheckCircle2 size={18} /></span>
                <div>
                  <small>Completed orders</small>
                  <strong>{orders.filter((o) => o.status === "Delivered").length}</strong>
                </div>
              </div>
              <div className="vd-card vd-kpi">
                <span className="vd-ico"><XCircle size={18} /></span>
                <div>
                  <small>Canceled orders</small>
                  <strong>{orders.filter((o) => o.status === "Cancelled").length}</strong>
                </div>
              </div>
              <div className="vd-card vd-kpi">
                <span className="vd-ico"><Trophy size={18} /></span>
                <div>
                  <small>Total Catalog</small>
                  <strong>{products.length}</strong>
                </div>
              </div>
            </section>

            <section className="vd-card vd-sales">
              <div>
                <h2 className="vd-h">Your sales report</h2>
                <p className="vd-sub">Look at your sale</p>
                <div className="vd-big">{money(total)}</div>
                <span className="vd-pill up"><TrendingUp size={12} />{money(gain)} (+{r.delta}%)</span>
                <div className="vd-ranges">
                  {Object.entries(RANGES).map(([key, v]) => (
                    <button key={key} className={range === key ? "on" : ""} onClick={() => setRange(key)}>{v.name}</button>
                  ))}
                </div>
              </div>
              <SalesChart key={range} labels={r.labels} rev={r.rev} ord={r.ord} />
            </section>

            <section className="vd-bottom">
              <div className="vd-card">
                <div className="vd-tabletop">
                  <h2 className="vd-h">Last transaction (Live Orders)</h2>
                  <div className="vd-row">
                    <label className="vd-search">
                      <Search size={16} />
                      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" />
                    </label>
                    <button className="vd-filter" onClick={() => setFOpen((o) => !o)} aria-label="Filter by platform">
                      <SlidersHorizontal size={16} />
                    </button>
                    {fOpen && (
                      <div className="vd-pop">
                        {["All", ...APPS.map((a) => a.name)].map((c) => (
                          <button key={c} className={channel === c ? "on" : ""} onClick={() => { setChannel(c); setFOpen(false); }}>{c}</button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="vd-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th><input type="checkbox" checked={allSel} onChange={toggleAll} aria-label="Select all" /></th>
                        <th>Order ID</th><th>Item</th><th>Date</th><th>Price</th><th>Platform</th><th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((o) => {
                        const app = APPS.find((x) => x.name === (o.ch || "Website")) || APPS[0];
                        return (
                          <tr key={o.id} className={sel.has(o.id) ? "sel" : ""}>
                            <td><input type="checkbox" checked={sel.has(o.id)} onChange={() => toggle(o.id)} aria-label={`Select ${o.id}`} /></td>
                            <td>{o.id}</td>
                            <td>{o.item}</td>
                            <td>{o.date}</td>
                            <td><b>{money(o.price)}</b></td>
                            <td>
                              <span className="vd-plat">
                                <span className="vd-appdot" style={{ background: app.color }}>{app.tag}</span>{o.ch || "Website"}
                              </span>
                            </td>
                            <td>
                              <select
                                value={o.status}
                                onChange={(e) => changeStatus(o.id, e.target.value)}
                                style={{ padding: "4px 8px", borderRadius: "8px", border: "1px solid var(--line)", background: "#fff", fontSize: "13px", cursor: "pointer" }}
                              >
                                <option>Processing</option>
                                <option>Delivered</option>
                                <option>Cancelled</option>
                              </select>
                            </td>
                          </tr>
                        );
                      })}
                      {rows.length === 0 && (
                        <tr><td colSpan={7} style={{ textAlign: "center", color: "var(--mut)" }}>No orders match. Clear the search or filter.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="vd-card vd-win">
                <h2 className="vd-h">Congratulations! 🎉</h2>
                <p className="vd-sub">Some of your products already have the highest buyers</p>
                <div className="vd-show">
                  <button className="vd-arrow" onClick={() => setSlide((slide - 1 + k) % k)} aria-label="Previous"><ChevronLeft size={16} /></button>
                  <div className="vd-tile side" style={{ background: prev.bg }}><Gem size={22} /></div>
                  <div className="vd-tile main" style={{ background: cur.bg }}><Gem size={40} /></div>
                  <div className="vd-tile side" style={{ background: next.bg }}><Gem size={22} /></div>
                  <button className="vd-arrow" onClick={() => setSlide((slide + 1) % k)} aria-label="Next"><ChevronRight size={16} /></button>
                </div>
                <div className="vd-cap">
                  <b>{cur.name}</b>
                  <span>{cur.sold} sold</span>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

const css = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&family=Inter:wght@400;500;600&display=swap');
.vd{--maroon:#5b1527;--maroon-d:#33091a;--gold:#c9a24b;--gold-s:#f6edd6;--bg:#f6f2ee;--ink:#241219;--mut:#8a7c82;--line:#ebe3dc;--up:#2f8a62;--down:#b53a32;display:flex;min-height:100vh;background:var(--bg);color:var(--ink);font-family:Inter,system-ui,sans-serif;font-size:14px}
.vd *{box-sizing:border-box}
.vd button{font:inherit;color:inherit;background:none;border:0;cursor:pointer;padding:0}
.vd button:focus-visible,.vd input:focus-visible{outline:2px solid var(--gold);outline-offset:2px}

.vd-sidewrap{position:sticky;top:0;height:100vh;flex:none}
.vd-side{width:240px;height:100%;padding:22px 14px;background:var(--maroon-d);color:#d9c9c1;overflow:auto;transition:width .2s}
.vd-side.is-collapsed{width:76px}
.vd-brand{display:flex;align-items:center;gap:10px;padding:0 8px 14px;color:#fff;font-family:'Cormorant Garamond',Georgia,serif;font-size:22px;font-weight:600;white-space:nowrap}
.vd-logo{width:32px;height:32px;border-radius:50%;background:var(--gold);color:var(--maroon-d);display:grid;place-items:center;font-size:18px;flex:none}
.vd-sec{margin:18px 8px 6px;font-size:12px;color:#9c8790}
.vd-nav{display:flex;align-items:center;gap:12px;width:100%;padding:10px;border-radius:10px;color:#d9c9c1;text-align:left;position:relative;white-space:nowrap}
button.vd-nav:hover{background:rgba(255,255,255,.07)}
.vd-nav.on{background:var(--gold);color:var(--maroon-d);font-weight:600}
.vd-badge{margin-left:auto;font-style:normal;font-size:11px;background:var(--down);color:#fff;border-radius:99px;padding:1px 7px}
.vd-appdot{width:22px;height:22px;border-radius:6px;display:grid;place-items:center;color:#fff;font-size:10px;font-weight:700;flex:none}
.vd-add{color:#9fb8ff}
.vd-collapse{position:absolute;top:26px;right:-13px;width:26px;height:26px;border-radius:50%;background:#fff;box-shadow:0 1px 6px rgba(0,0,0,.2);display:grid;place-items:center;color:var(--maroon)}
.is-collapsed .vd-lbl,.is-collapsed .vd-brand-name,.is-collapsed .vd-sec{display:none}
.is-collapsed .vd-nav{justify-content:center}
.is-collapsed .vd-badge{position:absolute;top:2px;right:6px;margin:0}

.vd-main{flex:1;min-width:0;padding:24px 32px 40px}

.vd-head{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-bottom:22px}
.vd-head h1{margin:0;font-size:20px;font-weight:600}
.vd-head p{margin:2px 0 0;color:var(--mut);font-size:13px}
.vd-tools{display:flex;align-items:center;gap:10px}
.vd-chip{display:flex;align-items:center;gap:8px;height:40px;padding:0 14px;border-radius:12px;background:#fff;border:1px solid var(--line)}
.vd-bell{position:relative;width:40px;padding:0;justify-content:center}
.vd-bell b{position:absolute;top:-5px;right:-5px;min-width:16px;height:16px;border-radius:99px;background:var(--down);color:#fff;font-size:10px;display:grid;place-items:center}
.vd-avatar{width:26px;height:26px;border-radius:50%;background:var(--maroon);color:var(--gold);display:grid;place-items:center;font-weight:600;font-size:12px}

.vd-card{background:#fff;border:1px solid var(--line);border-radius:16px;padding:18px}
.vd-kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
.vd-kpi{display:flex;align-items:center;gap:12px}
.vd-ico{width:42px;height:42px;border-radius:50%;background:var(--gold-s);color:var(--maroon);display:grid;place-items:center;flex:none}
.vd-kpi small{display:block;color:var(--mut);font-size:12px;margin-bottom:2px}
.vd-kpi strong{font-size:22px;font-weight:600;margin-right:6px}
.vd-pill{display:inline-flex;align-items:center;gap:3px;font-size:11px;padding:2px 8px;border-radius:99px}
.vd-pill.up{color:var(--up);background:#e6f4ed}
.vd-pill.down{color:var(--down);background:#fae9e7}

.vd-h{margin:0;font-size:16px;font-weight:600}
.vd-sub{color:var(--mut);font-size:12px;margin:3px 0 0}
.vd-sales{margin-top:16px;display:grid;grid-template-columns:minmax(220px,300px) 1fr;gap:28px;align-items:start}
.vd-big{font-family:'Cormorant Garamond',Georgia,serif;font-size:54px;line-height:1.1;font-weight:600;margin:22px 0 10px;color:var(--maroon-d)}
.vd-ranges{display:flex;gap:6px;margin-top:24px;flex-wrap:wrap}
.vd-ranges button{padding:6px 13px;border-radius:99px;color:var(--mut)}
.vd-ranges button.on{background:var(--maroon);color:#fff}
.vd-plot{position:relative;height:220px;margin-top:64px;touch-action:none}
.vd-plot svg{width:100%;height:100%;display:block}
.vd-vline{position:absolute;top:0;bottom:0;width:1px;background:var(--gold);pointer-events:none}
.vd-dot{position:absolute;width:11px;height:11px;border-radius:50%;border:2px solid #fff;transform:translate(-50%,-50%);pointer-events:none}
.vd-tip{position:absolute;top:-8px;transform:translate(-50%,-100%);background:var(--maroon-d);color:#fff;border-radius:10px;padding:8px 12px;font-size:12px;display:grid;gap:4px;white-space:nowrap;pointer-events:none}
.vd-tip span{display:flex;align-items:center;gap:6px;color:#e8d9cf}
.vd-tip i{width:8px;height:8px;border-radius:50%}
.vd-axis{display:flex;justify-content:space-between;color:var(--mut);font-size:12px;margin-top:8px}

.vd-bottom{margin-top:16px;display:grid;grid-template-columns:1fr 340px;gap:16px;align-items:start}
.vd-tabletop{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px}
.vd-row{display:flex;gap:8px;position:relative}
.vd-search{display:flex;align-items:center;gap:8px;height:38px;padding:0 12px;border:1px solid var(--line);border-radius:12px;color:var(--mut)}
.vd-search input{border:0;outline:0;background:none;font:inherit;width:120px;color:var(--ink)}
.vd-filter{width:38px;height:38px;border:1px solid var(--line)!important;border-radius:12px;display:grid;place-items:center}
.vd-pop{position:absolute;right:0;top:44px;z-index:5;background:#fff;border:1px solid var(--line);border-radius:12px;padding:6px;box-shadow:0 10px 30px rgba(51,9,26,.16);min-width:150px}
.vd-pop button{display:block;width:100%;text-align:left;padding:8px 10px;border-radius:8px}
.vd-pop button:hover,.vd-pop button.on{background:var(--gold-s)}
.vd-scroll{overflow-x:auto}
.vd table{width:100%;border-collapse:collapse;min-width:560px}
.vd th{text-align:left;font-weight:500;color:var(--mut);font-size:12px;padding:8px 10px}
.vd td{padding:12px 10px;border-top:1px solid var(--line);white-space:nowrap}
.vd tr.sel td{background:var(--gold-s)}
.vd input[type=checkbox]{accent-color:var(--maroon);width:15px;height:15px}
.vd-plat{display:inline-flex;align-items:center;gap:8px}

.vd-win{background:linear-gradient(165deg,#fff,var(--gold-s))}
.vd-show{display:flex;align-items:center;justify-content:center;gap:10px;margin:20px 0 14px}
.vd-tile{border-radius:14px;display:grid;place-items:center;color:var(--gold);flex:none}
.vd-tile.side{width:60px;height:92px;opacity:.7}
.vd-tile.main{width:118px;height:148px;box-shadow:0 12px 26px rgba(51,9,26,.28)}
.vd-arrow{width:28px;height:28px;border-radius:50%;background:#fff;border:1px solid var(--line)!important;display:grid;place-items:center;flex:none}
.vd-cap{text-align:center}
.vd-cap b{display:block;font-weight:600}
.vd-cap span{color:var(--mut);font-size:12px}

@media(max-width:1100px){
  .vd-kpis{grid-template-columns:repeat(2,1fr)}
  .vd-sales,.vd-bottom{grid-template-columns:1fr}
}
@media(max-width:760px){
  .vd{flex-direction:column}
  .vd-sidewrap{position:fixed;inset:auto 0 0 0;height:auto;z-index:20}
  .vd-side,.vd-side.is-collapsed{width:100%;height:auto;padding:6px;display:flex;overflow-x:auto}
  .vd-desk,.vd-collapse,.vd-sec{display:none}
  .vd-group{display:flex;gap:2px}
  .vd-side .vd-nav{flex-direction:column;gap:2px;width:auto;min-width:68px;padding:8px 10px;font-size:10px;justify-content:center}
  .vd-side .vd-lbl{display:block}
  .vd-nav .vd-badge{position:absolute;top:2px;right:10px;margin:0}
  .vd-main{padding:16px 14px 96px}
  .vd-big{font-size:44px}
  .vd-tabletop{flex-wrap:wrap}
}
`;