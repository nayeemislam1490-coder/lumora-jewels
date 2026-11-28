import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { SITE, money } from "../config.js";
import { useCart } from "../cart.jsx";
import { LangToggle, useLang } from "../i18n.jsx";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function BrandLogo({ size = 34, children }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}>
      <img
        src="/logo.jpg"
        alt={SITE.name}
        width={size}
        height={size}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          objectFit: "cover",
          borderRadius: "8px",
          background: "#ffffff",
          display: "block",
          flexShrink: 0,
        }}
      />
      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>{children}</span>
    </span>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const { count } = useCart();
  const { pathname } = useLocation();
  const { t } = useLang();
  useEffect(() => setOpen(false), [pathname]);
  const [first, ...rest] = SITE.name.split(" ");

  const tr = (key, fallback) => {
    const val = t(key);
    return val && val !== key ? val : fallback;
  };

  return (
    <header className="header">
      <div className="container header-in">
        <Link to="/" className="logo">
          <BrandLogo size={34}>
            <span>{first}</span> {rest.join(" ")}
          </BrandLogo>
        </Link>
        <nav className={`nav ${open ? "open" : ""}`}>
          <NavLink to="/" end>{tr("nav.home", "Home")}</NavLink>
          <NavLink to="/shop">{tr("nav.shop", "Shop")}</NavLink>
          <NavLink to="/about">{tr("nav.about", "Our Story")}</NavLink>
          <NavLink to="/help">{tr("nav.help", "Help Center")}</NavLink>
          <NavLink to="/contact">{tr("nav.contact", "Contact")}</NavLink>
        </nav>
        <div className="header-actions">
          <LangToggle />
          <Link to="/cart" className="cart-link">
            <span className="t">{tr("nav.cart", "Cart")}</span>
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
  const { t } = useLang();
  const tr = (key, fallback) => {
    const val = t(key);
    return val && val !== key ? val : fallback;
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <Link to="/" className="logo">
              <BrandLogo size={36}>{SITE.name}</BrandLogo>
            </Link>
            <p>{tr("footer.tagline", `${SITE.tagline}.`)}</p>
            <div className="socials">
              {SITE.facebook && <a href={SITE.facebook} target="_blank" rel="noreferrer" aria-label="Facebook">f</a>}
              {SITE.instagram && <a href={SITE.instagram} target="_blank" rel="noreferrer" aria-label="Instagram">ig</a>}
              <a href={`https://wa.me/${SITE.whatsapp}`} target="_blank" rel="noreferrer" aria-label="WhatsApp">wa</a>
            </div>
          </div>
          <div>
            <h5>{tr("footer.shop", "Shop")}</h5>
            <ul>
              <li><Link to="/shop">{tr("footer.allJewelry", "All Jewelry")}</Link></li>
              <li><Link to="/shop?cat=Necklaces">{tr("cat.necklaces", "Necklaces")}</Link></li>
              <li><Link to="/shop?cat=Earrings">{tr("cat.earrings", "Earrings")}</Link></li>
              <li><Link to="/shop?cat=Rings">{tr("cat.rings", "Rings")}</Link></li>
              <li><Link to="/shop?cat=Sets">{tr("cat.sets", "Sets")}</Link></li>
            </ul>
          </div>
          <div>
            <h5>{tr("footer.help", "Help")}</h5>
            <ul>
              <li><Link to="/help">{tr("footer.helpCenter", "Help Center / FAQ")}</Link></li>
              <li><Link to="/contact">{tr("footer.contactUs", "Contact Us")}</Link></li>
              <li><Link to="/policy/shipping">{tr("footer.shipping", "Shipping & Delivery")}</Link></li>
              <li><Link to="/policy/returns">{tr("footer.returns", "Returns & Exchange")}</Link></li>
              <li><Link to="/policy/privacy">{tr("footer.privacy", "Privacy Policy")}</Link></li>
              <li><Link to="/policy/terms">{tr("footer.terms", "Terms & Conditions")}</Link></li>
            </ul>
          </div>
          <div>
            <h5>{tr("footer.contact", "Contact")}</h5>
            <ul>
              {SITE.address && <li>{SITE.address}</li>}
              <li><a href={`tel:${SITE.phone.replace(/\s/g, "")}`}>{SITE.phone}</a></li>
              {SITE.email && <li><a href={`mailto:${SITE.email}`}>{SITE.email}</a></li>}
              <li>{SITE.hours}</li>
            </ul>
          </div>
        </div>
        <div className="copy" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
          <span>© {new Date().getFullYear()} {SITE.name}. {tr("footer.rights", "All rights reserved.")}</span>
        </div>
      </div>
    </footer>
  );
}

function FloatingWhatsApp() {
  if (!SITE.whatsapp || SITE.whatsapp.toUpperCase().includes("X")) return null;
  const text = encodeURIComponent(`Hi ${SITE.name}, I need help with an order.`);
  return (
    <>
      <style>{`
        .wa-float {
          position: fixed;
          right: 18px;
          bottom: 18px;
          z-index: 90;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 11px 16px;
          border-radius: 999px;
          background: var(--gold);
          color: #0b0f19;
          font-weight: 600;
          font-size: 0.88rem;
          text-decoration: none;
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.35);
        }
        .wa-float svg { width: 22px; height: 22px; flex: none; }
        @media (max-width: 760px) {
          .wa-float {
            right: 14px;
            bottom: 88px;
            width: 56px;
            height: 56px;
            padding: 0;
            justify-content: center;
            gap: 0;
          }
          .wa-float span { display: none; }
          .wa-float svg { width: 26px; height: 26px; }
        }
      `}</style>
      <a
        href={`https://wa.me/${SITE.whatsapp}?text=${text}`}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat on WhatsApp"
        className="wa-float"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 2a8 8 0 1 1-4.1 14.9l-.3-.2-2.9.8.8-2.8-.2-.3A8 8 0 0 1 12 4zm-3.1 4.2c-.2 0-.5 0-.7.3-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3.2 5 4.4 2.5 1 3 .8 3.5.7.5-.1 1.7-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.4l-1.9-.9c-.3-.1-.5-.1-.7.1l-.9 1.1c-.2.2-.3.2-.6.1-.3-.1-1.2-.4-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.4.1-.6l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.1c-.2-.5-.4-.5-.6-.5z" />
        </svg>
        <span>WhatsApp</span>
      </a>
    </>
  );
}

export default function Layout() {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith("/dashboard");
  const { t } = useLang();

  const defaultAnnounce = `Free delivery on orders over ${money(SITE.freeShippingOver)} • Easy ${SITE.returnDays}-day exchange`;
  const announceText = t("announce.bar") && t("announce.bar") !== "announce.bar"
    ? t("announce.bar")
    : defaultAnnounce;

  return (
    <>
      <ScrollToTop />
      {!isAdmin && (
        <div className="announce">
          {announceText}
        </div>
      )}
      {!isAdmin && <Header />}
      <main>
        <Outlet />
      </main>
      {!isAdmin && <Footer />}
      {!isAdmin && <FloatingWhatsApp />}
    </>
  );
}