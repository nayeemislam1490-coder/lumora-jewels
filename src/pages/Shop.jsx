import { useState, useEffect } from "react";
import { Link, useParams, useNavigate, useSearchParams } from "react-router-dom";
import { SITE, money } from "../config.js";
import { CATEGORIES, PRODUCTS as DEFAULT_PRODUCTS, byId as defaultById } from "../products.js";
import { useCart } from "../cart.jsx";
import ProductCard from "../components/ProductCard.jsx";
import Reveal from "../components/Reveal.jsx";

function getActiveProducts() {
  return DEFAULT_PRODUCTS;
}

export function Shop() {
  const [params, setParams] = useSearchParams();
  const [sort, setSort] = useState("featured");
  const [maxPrice, setMaxPrice] = useState(10000);
  const [products, setProducts] = useState(getActiveProducts());
  const cat = params.get("cat") || "All";

  useEffect(() => {
    setProducts(getActiveProducts());
  }, []);

  let list = cat === "All" ? [...products] : products.filter((p) => p.category === cat);
  list = list.filter((p) => p.price <= maxPrice);

  if (sort === "low") list.sort((a, b) => a.price - b.price);
  if (sort === "high") list.sort((a, b) => b.price - a.price);

  const choose = (c) => (c === "All" ? setParams({}) : setParams({ cat: c }));

  return (
    <>
      <style>{`
        @media (max-width: 760px) {
          .shop-filter-bar {
            width: 100%;
            justify-content: space-between;
          }
          .shop-price-pill {
            flex: 1;
            min-width: 0;
          }
          .shop-price-range {
            width: 84px !important;
          }
        }
      `}</style>
      <div className="page-head">
        <div className="container">
          <div className="crumbs"><Link to="/">Home</Link> / Shop</div>
          <h1 className="title">{cat === "All" ? "All " : ""}<em>{cat === "All" ? "Jewelry" : cat}</em></h1>
        </div>
      </div>
      <section className="section" style={{ paddingTop: 50 }}>
        <div className="container">
          <div className="toolbar" style={{ flexWrap: "wrap", gap: "15px" }}>
            <div className="chips">
              {["All", ...CATEGORIES].map((c) => (
                <button key={c} className={`chip ${cat === c ? "on" : ""}`} onClick={() => choose(c)}>
                  {c}
                </button>
              ))}
            </div>

            <div className="shop-filter-bar" style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
              <div className="shop-price-pill" style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.04)", padding: "6px 14px", borderRadius: "99px", border: "1px solid rgba(255,255,255,0.1)" }}>
                <span style={{ fontSize: "13px", opacity: 0.85, whiteSpace: "nowrap" }}>Max: <b>{money(maxPrice)}</b></span>
                <input
                  className="shop-price-range"
                  type="range"
                  min="500"
                  max="10000"
                  step="100"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  style={{ accentColor: "var(--gold)", cursor: "pointer", width: "110px" }}
                />
              </div>

              <select className="select" value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="featured">Sort: Featured</option>
                <option value="low">Price: Low to High</option>
                <option value="high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {list.length === 0 ? (
            <p className="lead">No products match your filter criteria.</p>
          ) : (
            <div className="grid">
              {list.map((p) => (
                <ProductCard key={p.id} p={p} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export function Product() {
  const { id } = useParams();
  return <ProductView key={id} id={id} />;
}

function ProductView({ id }) {
  const allProds = getActiveProducts();
  const p = allProds.find((x) => String(x.id) === String(id)) || defaultById(id);
  const cart = useCart();
  const nav = useNavigate();
  const [img, setImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  if (!p) {
    return (
      <div className="container empty">
        <h2>Product not found</h2>
        <p>This piece may have been removed.</p>
        <Link to="/shop" className="btn btn-gold">Back to shop</Link>
      </div>
    );
  }

  const images = p.images && p.images.length > 0 ? p.images : ["https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600"];
  const related = allProds.filter((x) => String(x.id) !== String(p.id) && x.category === p.category).slice(0, 4);
  const save = p.oldPrice ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100) : 0;
  const lineTotal = (Number(p.price) || 0) * qty;
  const insideFee = SITE.shippingFee ?? 80;
  const outsideFee = SITE.outsideDhakaFee ?? 120;

  const addToCart = () => {
    cart.add(p.id, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };
  const buyNow = () => {
    cart.add(p.id, qty);
    nav("/checkout");
  };
  const zoom = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--zx", `${((e.clientX - r.left) / r.width) * 100}%`);
    e.currentTarget.style.setProperty("--zy", `${((e.clientY - r.top) / r.height) * 100}%`);
  };
  const askText = encodeURIComponent(`Hi! I'm interested in ${p.name} (${p.code || "LJ"}).`);

  return (
    <>
      <style>{`
        .pd-sticky-bar {
          display: none;
        }
        @media (max-width: 760px) {
          .pd {
            padding-bottom: 84px;
          }
          .pd h1 {
            font-size: 1.55rem;
            line-height: 1.22;
          }
          .pd-sticky-bar {
            position: fixed;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 95;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            padding: 10px 14px;
            background: rgba(12, 15, 28, 0.96);
            backdrop-filter: blur(12px);
            border-top: 1px solid rgba(201, 162, 75, 0.28);
            box-shadow: 0 -8px 24px rgba(0, 0, 0, 0.45);
          }
          .pd-sticky-meta {
            display: flex;
            flex-direction: column;
            min-width: 0;
          }
          .pd-sticky-meta span {
            font-size: 11px;
            opacity: 0.78;
            line-height: 1.2;
          }
          .pd-sticky-meta b {
            font-size: 16px;
            color: var(--gold-light);
            line-height: 1.25;
          }
          .pd-sticky-btn {
            flex: 1;
            max-width: 210px;
            padding: 11px 16px;
            white-space: nowrap;
          }
        }
      `}</style>
      <div className="container">
        <div className="pd">
          <div>
            <div className="gallery-main" onMouseMove={zoom}>
              <img src={images[img]} alt={p.name} />
            </div>
            {images.length > 1 && (
              <div className="thumbs">
                {images.map((src, i) => (
                  <button key={src} className={i === img ? "on" : ""} onClick={() => setImg(i)}>
                    <img src={src} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div>
            <div className="crumbs">
              <Link to="/shop">Shop</Link> {p.category ? <> / <Link to={`/shop?cat=${p.category}`}>{p.category}</Link></> : ""}
            </div>
            <span className="card-code">{p.code || "LJ-NEW"}</span>
            <h1>{p.name}</h1>
            <div className="price">
              <b>{money(p.price)}</b>
              {p.oldPrice && <s>{money(p.oldPrice)}</s>}
              {save > 0 && <span className="badge" style={{ position: "static" }}>Save {save}%</span>}
            </div>
            <p className="pd-desc">{p.desc || "Exquisite handcrafted jewelry piece designed for elegance and timeless beauty."}</p>
            <p className="note" style={{ marginTop: 0, marginBottom: 12 }}>
              Delivery: Inside Dhaka <b>{money(insideFee)}</b> · Outside <b>{money(outsideFee)}</b> · Free over <b>{money(SITE.freeShippingOver)}</b>
            </p>
            {p.specs && p.specs.length > 0 && (
              <ul className="specs">
                {p.specs.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            )}
            <div className="buy-row">
              <div className="qty">
                <button onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
                <span>{qty}</span>
                <button onClick={() => setQty(qty + 1)}>+</button>
              </div>
              <button className="btn btn-gold" style={{ flex: 1 }} onClick={addToCart}>
                {added ? "Added ✓" : `Add to cart · ${money(lineTotal)}`}
              </button>
            </div>
            <button className="btn btn-ghost btn-block" onClick={buyNow}>Buy it now</button>
            <p className="note">
              Questions?{" "}
              <a href={`https://wa.me/${SITE.whatsapp}?text=${askText}`} target="_blank" rel="noreferrer" style={{ color: "var(--gold-light)", textDecoration: "underline" }}>
                Ask us on WhatsApp
              </a>
            </p>
            <div className="assure" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "24px", padding: "16px", background: "rgba(201, 162, 75, 0.08)", border: "1px solid rgba(201, 162, 75, 0.25)", borderRadius: "12px" }}>
              <div><b style={{ display: "block", color: "var(--gold-light)" }}>🔒 Secure Checkout</b><span style={{ fontSize: "12px", opacity: 0.85 }}>Safe & encrypted order</span></div>
              <div><b style={{ display: "block", color: "var(--gold-light)" }}>💎 100% Authentic</b><span style={{ fontSize: "12px", opacity: 0.85 }}>Certified quality finish</span></div>
              <div><b style={{ display: "block", color: "var(--gold-light)" }}>🚚 Fast Delivery</b><span style={{ fontSize: "12px", opacity: 0.85 }}>{SITE.deliveryTime}</span></div>
              <div><b style={{ display: "block", color: "var(--gold-light)" }}>🔄 {SITE.returnDays}-Day Exchange</b><span style={{ fontSize: "12px", opacity: 0.85 }}>Gift-ready packaging</span></div>
            </div>
          </div>
        </div>
      </div>

      <div className="pd-sticky-bar">
        <div className="pd-sticky-meta">
          <span>Total ({qty} {qty > 1 ? "items" : "item"})</span>
          <b>{money(lineTotal)}</b>
        </div>
        <button type="button" className="btn btn-gold pd-sticky-btn" onClick={addToCart}>
          {added ? "Added ✓" : "Add to cart"}
        </button>
      </div>

      {related.length > 0 && (
        <section className="section alt">
          <div className="container">
            <Reveal className="head-row">
              <div>
                <span className="eyebrow">You may also like</span>
                <h2 className="title">More <em>{p.category || "Collection"}</em></h2>
              </div>
            </Reveal>
            <div className="grid">
              {related.map((r) => (
                <ProductCard key={r.id} p={r} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}