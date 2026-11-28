// src/pages/dashboard.jsx
// Needs one package:  npm i lucide-react

import { useMemo, useState, useEffect } from "react";
import {
  LayoutDashboard, ShoppingBag, Gem, Users, BarChart3, Megaphone, Percent,
  Store, CreditCard, Search, SlidersHorizontal, Bell, CalendarDays, ChevronDown,
  ChevronLeft, ChevronRight, Plus, Package, CheckCircle2, XCircle, Trophy,
  TrendingUp, TrendingDown, Trash2, X,
} from "lucide-react";
import { CATEGORIES } from "../products.js";
import { money } from "../config.js";
import { supabase } from "../supabase.js";
import AdminPages from "../components/AdminPages.jsx";

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
  "1d": { name: "1d", labels: ["12a", "3a", "6a", "9a", "12p", "3p", "6p", "9p"], rev: [0, 0, 0, 0, 0, 0, 0, 0], ord: [0, 0, 0, 0, 0, 0, 0, 0] },
  "7d": { name: "7d", labels: ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"], rev: [0, 0, 0, 0, 0, 0, 0], ord: [0, 0, 0, 0, 0, 0, 0] },
  "30d": { name: "30d", labels: ["Week 1", "Week 2", "Week 3", "Week 4"], rev: [0, 0, 0, 0], ord: [0, 0, 0, 0] },
  "12m": { name: "12m", labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], rev: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], ord: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  max: { name: "Max", labels: ["2022", "2023", "2024", "2025", "2026"], rev: [0, 0, 0, 0, 0], ord: [0, 0, 0, 0, 0] },
};

const BEST = [
  { name: "No sales yet", sold: 0, bg: "linear-gradient(150deg,#7a1d33,#33091a)" },
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
          <span><i style={{ background: "#5b1527", outline: "1px solid #c9a24b" }} />{money(rev[i])} sales</span>
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
  const [rawOrders, setRawOrders] = useState([]);

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
      setRawOrders(data);
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
    setRawOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
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
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", price: "", old_price: "", code: "", category: CATEGORIES[0] || "Necklaces", description: "", imagesText: "" });

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

  // একাধিক ছবির লিংক ও ডিটেইলস হ্যান্ডেল করার জন্য স্টেট
  const [newProd, setNewProd] = useState({ 
    name: "", 
    price: "", 
    old_price: "",
    code: "", 
    category: CATEGORIES[0] || "Necklaces", 
    description: "", // নতুন প্রোডাক্ট ডিটেইলস ফিল্ড
    images: [""] 
  });

  // নতুন ছবির ইনপুট বক্স যুক্ত করার ফাংশন
  const handleAddImageInput = () => {
    setNewProd({ ...newProd, images: [...newProd.images, ""] });
  };

  // নির্দিষ্ট ইনপুট বক্সের মান পরিবর্তনের ফাংশন
  const handleImageChange = (index, value) => {
    const updatedImages = [...newProd.images];
    updatedImages[index] = value;
    setNewProd({ ...newProd, images: updatedImages });
  };

  // নির্দিষ্ট ছবির ইনপুট বক্স ডিলিট করার ফাংশন
  const handleRemoveImageInput = (index) => {
    const updatedImages = newProd.images.filter((_, i) => i !== index);
    setNewProd({ ...newProd, images: updatedImages.length > 0 ? updatedImages : [""] });
  };

  // ফোন/পিসির গ্যালারি থেকে ছবি আপলোড (Supabase Storage এ জমা হবে)
  const [uploading, setUploading] = useState(false);

  // বড় ছবি ছোট করে (সর্বোচ্চ ১২০০px) যাতে সাইট দ্রুত খোলে
  const shrinkImage = (file) =>
    new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const scale = Math.min(1, 1200 / Math.max(img.width, img.height));
        const c = document.createElement("canvas");
        c.width = Math.round(img.width * scale);
        c.height = Math.round(img.height * scale);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        c.toBlob((b) => resolve(b || file), "image/jpeg", 0.85);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(file);
      };
      img.src = url;
    });

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (files.length === 0) return;
    setUploading(true);
    const urls = [];
    for (const file of files) {
      const blob = await shrinkImage(file);
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
      const { error } = await supabase.storage.from("product-images").upload(path, blob, { contentType: "image/jpeg" });
      if (error) {
        alert("Upload failed: " + error.message);
        continue;
      }
      urls.push(supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl);
    }
    if (urls.length > 0) {
      setNewProd((p) => ({ ...p, images: [...p.images.filter((u) => u.trim() !== ""), ...urls] }));
    }
    setUploading(false);
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProd.name || !newProd.price) return;
    
    // খালি লিংকগুলো ফিল্টার করে বাদ দেওয়া হচ্ছে
    const filteredImages = newProd.images.filter((url) => url.trim() !== "");
    const finalImages = filteredImages.length > 0 ? filteredImages : ["https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600"];
    const parsedOldPrice = String(newProd.old_price ?? "").trim();

    const row = {
      id: "p" + Date.now(),
      name: newProd.name,
      code: newProd.code || "LJ-" + Math.floor(100 + Math.random() * 900),
      category: newProd.category,
      price: Number(newProd.price),
      old_price: parsedOldPrice !== "" && Number(parsedOldPrice) > 0 ? Number(parsedOldPrice) : null,
      featured: true,
      description: newProd.description || "Exquisite handcrafted jewelry piece designed for elegance and timeless beauty.",
      specs: ["100% Authentic Material", "Handcrafted finish", "Gift-ready packaging"],
      images: finalImages
    };

    const { error } = await supabase.from("products").insert([row]);
    if (error) {
      alert("Add product failed: " + error.message);
      return;
    }

    setProducts([row, ...products]);
    setNewProd({ name: "", price: "", old_price: "", code: "", category: CATEGORIES[0] || "Necklaces", description: "", images: [""] });
    alert("Product added successfully with details and images to Supabase!");
  };

  const startEditProduct = (p) => {
    setEditId(p.id);
    setEditForm({
      name: p.name || "",
      price: p.price ?? "",
      old_price: p.old_price ?? "",
      code: p.code || "",
      category: p.category || CATEGORIES[0] || "Necklaces",
      description: p.description || p.desc || "",
      imagesText: Array.isArray(p.images) ? p.images.join("\n") : "",
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editId || !editForm.name || editForm.price === "") return;
    const imgs = editForm.imagesText.split("\n").map((u) => u.trim()).filter(Boolean);
    const parsedOld = String(editForm.old_price ?? "").trim();
    const updates = {
      name: editForm.name.trim(),
      price: Number(editForm.price),
      old_price: parsedOld !== "" && Number(parsedOld) > 0 ? Number(parsedOld) : null,
      code: editForm.code.trim(),
      category: editForm.category,
      description: editForm.description,
      images: imgs.length > 0 ? imgs : ["https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600"],
    };
    const { error } = await supabase.from("products").update(updates).eq("id", editId);
    if (error) {
      alert("Could not update product: " + error.message);
      return;
    }
    setProducts((prev) => prev.map((item) => (String(item.id) === String(editId) ? { ...item, ...updates } : item)));
    setEditId(null);
  };

  const handleDeleteProduct = async (id) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      alert("Could not delete: " + error.message);
      return;
    }
    setProducts(products.filter((p) => String(p.id) !== String(id)));
  };

  const validOrders = useMemo(() => rawOrders.filter((o) => o.status !== "Cancelled"), [rawOrders]);

  const r = useMemo(() => {
    const base = RANGES[range] || RANGES["7d"];
    const rev = [...base.rev];
    const ord = [...base.ord];
    const nowDt = new Date();

    if (range === "1d") {
      validOrders.forEach((o) => {
        const d = new Date(o.created_at);
        if (d.toDateString() === nowDt.toDateString()) {
          const idx = Math.min(7, Math.max(0, Math.floor(d.getHours() / 3)));
          rev[idx] += Number(o.total) || 0;
          ord[idx] += 1;
        }
      });
    } else if (range === "7d") {
      for (let i = 6; i >= 0; i--) {
        const d = new Date(nowDt);
        d.setDate(d.getDate() - i);
        const dayKey = d.toDateString();
        const idx = 6 - i;
        validOrders.forEach((o) => {
          if (new Date(o.created_at).toDateString() === dayKey) {
            rev[idx] += Number(o.total) || 0;
            ord[idx] += 1;
          }
        });
      }
    } else if (range === "30d") {
      validOrders.forEach((o) => {
        const daysAgo = Math.floor((nowDt - new Date(o.created_at)) / 86400000);
        if (daysAgo >= 0 && daysAgo < 28) {
          const idx = Math.min(3, Math.floor(daysAgo / 7));
          rev[3 - idx] += Number(o.total) || 0;
          ord[3 - idx] += 1;
        }
      });
    } else if (range === "12m") {
      validOrders.forEach((o) => {
        const d = new Date(o.created_at);
        const monthsDiff = (nowDt.getFullYear() - d.getFullYear()) * 12 + (nowDt.getMonth() - d.getMonth());
        if (monthsDiff >= 0 && monthsDiff < 12) {
          const idx = 11 - monthsDiff;
          rev[idx] += Number(o.total) || 0;
          ord[idx] += 1;
        }
      });
    } else {
      validOrders.forEach((o) => {
        const yr = new Date(o.created_at).getFullYear();
        const idx = base.labels.findIndex((lbl) => Number(lbl) === yr);
        if (idx >= 0) {
          rev[idx] += Number(o.total) || 0;
          ord[idx] += 1;
        }
      });
    }

    return { ...base, rev, ord };
  }, [range, validOrders]);

  const bestItems = useMemo(() => {
    const m = new Map();
    const bgs = [
      "linear-gradient(150deg,#7a1d33,#33091a)",
      "linear-gradient(150deg,#8a6a22,#3d2a08)",
      "linear-gradient(150deg,#5b1527,#1f0710)",
    ];
    validOrders.forEach((o) => {
      (Array.isArray(o.items) ? o.items : []).forEach((it) => {
        const qty = Number(it.qty) || 1;
        const prevItem = m.get(it.name) || { name: it.name || "Item", sold: 0 };
        prevItem.sold += qty;
        m.set(it.name, prevItem);
      });
    });
    const sorted = [...m.values()].sort((a, b) => b.sold - a.sold).slice(0, 3);
    if (sorted.length === 0) return BEST;
    return sorted.map((item, idx) => ({ ...item, bg: bgs[idx % bgs.length] }));
  }, [validOrders]);

  const total = r.rev.reduce((s, v) => s + v, 0);
  const gain = 0;

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

  const k = bestItems.length;
  const safeSlide = slide % k;
  const prev = bestItems[(safeSlide - 1 + k) % k];
  const cur = bestItems[safeSlide];
  const next = bestItems[(safeSlide + 1) % k];

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

        {active !== "overview" && active !== "products" ? (
          <AdminPages view={active} />
        ) : active === "products" ? (
          <div style={{ display: "grid", gap: "20px" }}>
            <div className="vd-card">
              <h2 className="vd-h" style={{ marginBottom: "15px" }}>Add New Jewelry Product (Details & Multiple Images)</h2>
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
                  type="number"
                  placeholder="Old Price in BDT (optional)"
                  value={newProd.old_price}
                  onChange={(e) => setNewProd({ ...newProd, old_price: e.target.value })}
                  style={{ padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--line)", outline: "none" }}
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

                {/* নতুন প্রোডাক্ট ডিটেইলস বা বিবরণ লেখার টেক্সটবক্স */}
                <div style={{ gridColumn: "1 / -1" }}>
                  <textarea
                    placeholder="Product Details / Full Description (e.g. Color-changing necklace Gradient Color effect...)"
                    value={newProd.description}
                    onChange={(e) => setNewProd({ ...newProd, description: e.target.value })}
                    rows={3}
                    style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", border: "1px solid var(--line)", outline: "none", resize: "vertical", fontFamily: "inherit" }}
                  />
                </div>

                {/* একাধিক ছবি ইনপুট দেওয়ার ডায়নামিক সেকশন */}
                <div style={{ gridColumn: "1 / -1", display: "grid", gap: "10px", background: "var(--bg)", padding: "14px", borderRadius: "12px", border: "1px solid var(--line)" }}>
                  <label style={{ fontWeight: 500, fontSize: "13px", color: "var(--ink)" }}>Product Image URLs (যত খুশি ছবি দিন):</label>
                  {newProd.images.map((imgUrl, idx) => (
                    <div key={idx} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <input
                        type="text"
                        placeholder={`Image URL ${idx + 1}`}
                        value={imgUrl}
                        onChange={(e) => handleImageChange(idx, e.target.value)}
                        style={{ flex: 1, padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--line)", outline: "none", background: "#fff" }}
                      />
                      {imgUrl.trim() !== "" && (
                        <img src={imgUrl} alt="preview" style={{ width: 32, height: 32, borderRadius: "6px", objectFit: "cover", border: "1px solid var(--line)" }} />
                      )}
                      {(newProd.images.length > 1 || imgUrl.trim() !== "") && (
                        <button type="button" onClick={() => handleRemoveImageInput(idx)} style={{ color: "var(--down)", padding: "6px" }} title="Remove image">
                          <X size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "4px" }}>
                    <label style={{ padding: "6px 12px", background: "var(--gold)", color: "var(--maroon-d)", borderRadius: "8px", fontSize: "12px", fontWeight: 600, cursor: "pointer", opacity: uploading ? 0.6 : 1 }}>
                      {uploading ? "Uploading..." : "📷 Choose photos"}
                      <input type="file" accept="image/*" multiple onChange={handleFiles} disabled={uploading} style={{ display: "none" }} />
                    </label>
                    <button type="button" onClick={handleAddImageInput} style={{ padding: "6px 12px", background: "var(--maroon)", color: "#fff", borderRadius: "8px", fontSize: "12px", fontWeight: 500 }}>
                    + Add Another Image Box
                  </button>
                  </div>
                </div>

                <button type="submit" disabled={uploading} className="vd-ranges on" style={{ padding: "10px 20px", borderRadius: "10px", fontWeight: 600, gridColumn: "1 / -1", justifyContent: "center" }}>
                  Add Product to Store
                </button>
              </form>
            </div>

            {editId && (
              <div className="vd-card" style={{ borderColor: "var(--gold)" }}>
                <h2 className="vd-h" style={{ marginBottom: "12px" }}>Edit Product</h2>
                <form onSubmit={handleSaveEdit} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                  <input type="text" placeholder="Product Name" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--line)" }} required />
                  <input type="number" placeholder="Price" value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--line)" }} required />
                  <input type="number" placeholder="Old Price (optional)" value={editForm.old_price} onChange={(e) => setEditForm({ ...editForm, old_price: e.target.value })} style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--line)" }} />
                  <input type="text" placeholder="Code" value={editForm.code} onChange={(e) => setEditForm({ ...editForm, code: e.target.value })} style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--line)" }} />
                  <select value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--line)", background: "#fff" }}>
                    {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                  <textarea placeholder="Description" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} rows={2} style={{ gridColumn: "1 / -1", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--line)", fontFamily: "inherit" }} />
                  <textarea placeholder="Image URLs (one per line)" value={editForm.imagesText} onChange={(e) => setEditForm({ ...editForm, imagesText: e.target.value })} rows={2} style={{ gridColumn: "1 / -1", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--line)", fontFamily: "inherit" }} />
                  <div style={{ gridColumn: "1 / -1", display: "flex", gap: "8px" }}>
                    <button type="submit" className="vd-ranges on" style={{ padding: "8px 16px", borderRadius: "8px", fontWeight: 600 }}>Save Changes</button>
                    <button type="button" onClick={() => setEditId(null)} style={{ padding: "8px 14px", borderRadius: "8px", border: "1px solid var(--line)" }}>Cancel</button>
                  </div>
                </form>
              </div>
            )}

            <div className="vd-card">
              <h2 className="vd-h" style={{ marginBottom: "15px" }}>Product Catalog ({products.length})</h2>
              <div className="vd-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Images</th>
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
                          <div style={{ display: "flex", gap: "4px" }}>
                            {p.images && p.images.length > 0 ? (
                              p.images.slice(0, 3).map((img, i) => (
                                <img key={i} src={img} alt={p.name} style={{ width: 32, height: 32, borderRadius: "6px", objectFit: "cover", border: "1px solid var(--line)" }} />
                              ))
                            ) : (
                              <span style={{ fontSize: "12px", color: "var(--mut)" }}>No image</span>
                            )}
                            {p.images?.length > 3 && <span style={{ fontSize: "11px", alignSelf: "center" }}>+{p.images.length - 3}</span>}
                          </div>
                        </td>
                        <td>
                          <b>{p.name}</b>
                          {p.description && <div style={{ fontSize: "11px", color: "var(--mut)", maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.description}</div>}
                        </td>
                        <td><span className="vd-pill" style={{ background: "var(--gold-s)", color: "var(--maroon)" }}>{p.category || "General"}</span></td>
                        <td>{p.code || "N/A"}</td>
                        <td>
                          <b>{money(p.price)}</b>
                          {Number(p.old_price) > Number(p.price) && (
                            <s style={{ marginLeft: 6, color: "var(--mut)", fontSize: 12 }}>{money(p.old_price)}</s>
                          )}
                        </td>
                        <td style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                          <button onClick={() => startEditProduct(p)} style={{ color: "var(--maroon)", fontWeight: 600 }}>Edit</button>
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
                <span className="vd-pill up"><TrendingUp size={12} />{money(gain)}</span>
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
.vd{--maroon:#5b1527;--maroon-d:#33091a;--gold:#c9a24b;--gold-s:#f6edd6;--bg:#f6f2ee;--ink:#241219;--mut:#8a7c82;--line:#ebe3dc;--up:#2f8a62;--down:#b53a32;display:flex;min-height:100vh;background:var(--bg);color:var(--ink);font-family:Inter,system-ui,sans-serif;font-size:14px;overflow-x:clip;max-width:100%}
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

.vd-main{flex:1;min-width:0;max-width:100%;overflow-x:clip;padding:24px 32px 40px}

.vd-head{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-bottom:22px}
.vd-head h1{margin:0;font-size:20px;font-weight:600}
.vd-head p{margin:2px 0 0;color:var(--mut);font-size:13px}
.vd-tools{display:flex;align-items:center;gap:10px}
.vd-chip{display:flex;align-items:center;gap:8px;height:40px;padding:0 14px;border-radius:12px;background:#fff;border:1px solid var(--line)}
.vd-bell{position:relative;width:40px;padding:0;justify-content:center}
.vd-bell b{position:absolute;top:-5px;right:-5px;min-width:16px;height:16px;border-radius:99px;background:var(--down);color:#fff;font-size:10px;display:grid;place-items:center}
.vd-avatar{width:26px;height:26px;border-radius:50%;background:var(--maroon);color:var(--gold);display:grid;place-items:center;font-weight:600;font-size:12px}

.vd-card{background:#fff;border:1px solid var(--line);border-radius:16px;padding:18px;min-width:0;max-width:100%}
.vd-kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
.vd-kpi{display:flex;align-items:center;gap:12px;min-width:0}
.vd-kpi > div{min-width:0}
.vd-ico{width:42px;height:42px;border-radius:50%;background:var(--gold-s);color:var(--maroon);display:grid;place-items:center;flex:none}
.vd-kpi small{display:block;color:var(--mut);font-size:12px;margin-bottom:2px}
.vd-kpi strong{font-size:22px;font-weight:600;margin-right:6px}
.vd-pill{display:inline-flex;align-items:center;gap:3px;font-size:11px;padding:2px 8px;border-radius:99px}
.vd-pill.up{color:var(--up);background:#e6f4ed}
.vd-pill.down{color:var(--down);background:#fae9e7}

.vd-h{margin:0;font-size:16px;font-weight:600}
.vd-sub{color:var(--mut);font-size:12px;margin:3px 0 0}
.vd-sales{margin-top:16px;display:grid;grid-template-columns:minmax(220px,300px) 1fr;gap:28px;align-items:start}
.vd-sales > div{min-width:0}
.vd-big{font-family:'Cormorant Garamond',Georgia,serif;font-size:clamp(34px,9vw,54px);line-height:1.1;font-weight:600;margin:22px 0 10px;color:var(--maroon-d);overflow-wrap:anywhere}
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

.vd-bottom{margin-top:16px;display:grid;grid-template-columns:minmax(0,1fr) 340px;gap:16px;align-items:start}
.vd-bottom > .vd-card{min-width:0}
.vd-tabletop{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px}
.vd-row{display:flex;gap:8px;position:relative}
.vd-search{display:flex;align-items:center;gap:8px;height:38px;padding:0 12px;border:1px solid var(--line);border-radius:12px;color:var(--mut)}
.vd-search input{border:0;outline:0;background:none;font:inherit;width:120px;color:var(--ink)}
.vd-filter{width:38px;height:38px;border:1px solid var(--line)!important;border-radius:12px;display:grid;place-items:center}
.vd-pop{position:absolute;right:0;top:44px;z-index:5;background:#fff;border:1px solid var(--line);border-radius:12px;padding:6px;box-shadow:0 10px 30px rgba(51,9,26,.16);min-width:150px}
.vd-pop button{display:block;width:100%;text-align:left;padding:8px 10px;border-radius:8px}
.vd-pop button:hover,.vd-pop button.on{background:var(--gold-s)}
.vd-scroll{overflow-x:auto;max-width:100%}
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
  .vd-big{font-size:clamp(30px,8.5vw,44px)}
  .vd-tabletop{flex-wrap:wrap}
  .vd-tile.side{width:46px;height:76px}
  .vd-tile.main{width:96px;height:128px}
}
`;