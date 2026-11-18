import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { SITE, money } from "../config.js";
import { useCart } from "../cart.jsx";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function Header() {
  const [open, setOpen] = useState(false);
  const { count } = useCart();
  const { pathname } = useLocation();
  useEffect(() => setOpen(false), [pathname]);
  const [first, ...rest] = SITE.name.split(" ");

  return (
    <header className="header">
      <div className="container header-in">
        <Link to="/" className="logo">
          <span>{first}</span> {rest.join(" ")}
        </Link>
        <nav className={`nav ${open ? "open" : ""}`}>
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/shop">Shop</NavLink>
          <NavLink to="/about">Our Story</NavLink>
          <NavLink to="/help">Help Center</NavLink>
          <NavLink to="/contact">Contact</NavLink>
        </nav>
        <div className="header-actions">
          <Link to="/cart" className="cart-link">
            <span className="t">Cart</span>
            <span className="cart-count">{count}</span>
          </Link>
          <button className="menu-btn" aria-label="Menu" onClick={() => setOpen(!open)}>
            {open ? "✕" : "☰"}
          </button>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <Link to="/" className="logo">{SITE.name}</Link>
            <p>{SITE.tagline}.</p>
            <div className="socials">
              {SITE.facebook && <a href={SITE.facebook} target="_blank" rel="noreferrer" aria-label="Facebook">f</a>}
              {SITE.instagram && <a href={SITE.instagram} target="_blank" rel="noreferrer" aria-label="Instagram">ig</a>}
              <a href={`https://wa.me/${SITE.whatsapp}`} target="_blank" rel="noreferrer" aria-label="WhatsApp">wa</a>
            </div>
          </div>
          <div>
            <h5>Shop</h5>
            <ul>
              <li><Link to="/shop">All Jewelry</Link></li>
              <li><Link to="/shop?cat=Necklaces">Necklaces</Link></li>
              <li><Link to="/shop?cat=Earrings">Earrings</Link></li>
              <li><Link to="/shop?cat=Rings">Rings</Link></li>
              <li><Link to="/shop?cat=Sets">Sets</Link></li>
            </ul>
          </div>
          <div>
            <h5>Help</h5>
            <ul>
              <li><Link to="/help">Help Center / FAQ</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
              <li><Link to="/policy/shipping">Shipping & Delivery</Link></li>
              <li><Link to="/policy/returns">Returns & Exchange</Link></li>
              <li><Link to="/policy/privacy">Privacy Policy</Link></li>
              <li><Link to="/policy/terms">Terms & Conditions</Link></li>
            </ul>
          </div>
          <div>
            <h5>Contact</h5>
            <ul>
              {SITE.address && <li>{SITE.address}</li>}
              <li><a href={`tel:${SITE.phone.replace(/\s/g, "")}`}>{SITE.phone}</a></li>
              {SITE.email && <li><a href={`mailto:{SITE.email}`}>{SITE.email}</a></li>}
              <li>{SITE.hours}</li>
            </ul>
          </div>
        </div>
        <div className="copy" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
          <span>© {new Date().getFullYear()} {SITE.name}. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}

export default function Layout() {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith("/dashboard");

  return (
    <>
      <ScrollToTop />
      {!isAdmin && (
        <div className="announce">
          Free delivery on orders over {money(SITE.freeShippingOver)} &nbsp;•&nbsp; Easy {SITE.returnDays}-day exchange
        </div>
      )}
      {!isAdmin && <Header />}
      <main>
        <Outlet />
      </main>
      {!isAdmin && <Footer />}
    </>
  );
}