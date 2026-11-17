import { useState, useEffect } from "react";
import { Link, useParams, useNavigate, useSearchParams } from "react-router-dom";
import { SITE, money } from "../config.js";
import { CATEGORIES, PRODUCTS as DEFAULT_PRODUCTS, byId as defaultById } from "../products.js";
import { useCart } from "../cart.jsx";
import ProductCard from "../components/ProductCard.jsx";
import Reveal from "../components/Reveal.jsx";

function getActiveProducts() {
  const saved = localStorage.getItem("veloria_admin_products");
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      return DEFAULT_PRODUCTS;
    }
  }
  return DEFAULT_PRODUCTS;
}

export function Shop() {
  const [params, setParams] = useSearchParams();
  const [sort, setSort] = useState("featured");
  const [products, setProducts] = useState(getActiveProducts());
  const cat = params.get("cat") || "All";

  useEffect(() => {
    setProducts(getActiveProducts());
  }, []);

  let list = cat === "All" ? [...products] : products.filter((p) => p.category === cat);
  if (sort === "low") list.sort((a, b) => a.price - b.price);
  if (sort === "high") list.sort((a, b) => b.price - a.price);

  const choose = (c) => (c === "All" ? setParams({}) : setParams({ cat: c }));

  return (
    <>
      <div className="page-head">
        <div className="container">
          <div className="crumbs"><Link to="/">Home</Link> / Shop</div>
          <h1 className="title">{cat === "All" ? "All " : ""}<em>{cat === "All" ? "Jewelry" : cat}</em></h1>
        </div>
      </div>
      <section className="section" style={{ paddingTop: 50 }}>
        <div className="container">
          <div className="toolbar">
            <div className="chips">
              {["All", ...CATEGORIES].map((c) => (
                <button key={c} className={`chip ${cat === c ? "on" : ""}`} onClick={() => choose(c)}>
                  {c}
                </button>
              ))}
            </div>
            <select className="select" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="featured">Sort: Featured</option>
              <option value="low">Price: Low to High</option>
              <option value="high">Price: High to Low</option>
            </select>
          </div>
          {list.length === 0 ? (
            <p className="lead">No products in this category yet.</p>
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
                {added ? "Added ✓" : "Add to cart"}
              </button>
            </div>
            <button className="btn btn-ghost btn-block" onClick={buyNow}>Buy it now</button>
            <p className="note">
              Questions?{" "}
              <a href={`https://wa.me/${SITE.whatsapp}?text=${askText}`} target="_blank" rel="noreferrer" style={{ color: "var(--gold-light)", textDecoration: "underline" }}>
                Ask us on WhatsApp
              </a>
            </p>
            <div className="assure">
              <div><b>Delivery</b>{SITE.deliveryTime}</div>
              <div><b>Exchange</b>{SITE.returnDays} days</div>
              <div><b>Packaging</b>Gift-ready</div>
            </div>
          </div>
        </div>
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