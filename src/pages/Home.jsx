import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { SITE } from "../config.js";
import { CATEGORIES, PRODUCTS } from "../products.js";
import { useLang } from "../i18n.jsx";
import Reveal from "../components/Reveal.jsx";
import HeroArt from "../components/HeroArt.jsx";
import "../hero-mobile.css";
import "../home-v9.css";

const Hero3D = lazy(() => import("../components/Hero3D.jsx"));

function isInAppBrowser() {
  try {
    const ua = navigator.userAgent || "";
    return /FBAN|FBAV|Instagram|Messenger|TikTok|BytedanceWebview|Line|Snapchat|WhatsApp/i.test(ua);
  } catch {
    return false;
  }
}

function hasWebGL() {
  if (isInAppBrowser()) return false;
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (c.getContext("webgl") || c.getContext("experimental-webgl")));
  } catch (e) {
    return false;
  }
}

const WIDE = "(min-width: 761px)";
function useWide() {
  const [wide, setWide] = useState(() => !isInAppBrowser() && window.matchMedia(WIDE).matches);
  useEffect(() => {
    if (isInAppBrowser()) {
      setWide(false);
      return;
    }
    const m = window.matchMedia(WIDE);
    const on = () => setWide(m.matches);
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, []);
  return wide;
}

// Photo for each category: prefer a featured product, then any product in that category
const catImage = (cat) => {
  const hit = PRODUCTS.find((p) => p.category === cat && p.featured) || PRODUCTS.find((p) => p.category === cat);
  return hit?.images?.[0] || "";
};

// (kept for reference) Thin gold line icons (no photos in the category row, so it always looks clean)
const ICONS = {
  Necklaces: (
    <path d="M6 10 Q16 26 26 10 M16 22 L16 26 M13.5 27.5 Q16 30 18.5 27.5 Q16 25 13.5 27.5 Z" />
  ),
  Earrings: (
    <path d="M12 6 L12 14 M20 6 L20 14 M9 14 A3 3 0 0 0 15 14 M17 14 A3 3 0 0 0 23 14 M12 17 A8 8 0 0 0 20 17" />
  ),
  Rings: (
    <path d="M9 20 A7 7 0 1 0 23 20 A7 7 0 1 0 9 20 M16 6 L19 10 L16 13 L13 10 Z" />
  ),
  Sets: (
    <path d="M9 14 A6 6 0 1 0 9 26 A6 6 0 1 0 9 14 M23 14 A6 6 0 1 1 23 26 A6 6 0 1 1 23 14" />
  ),
};

const money = (n) => "৳" + Math.round(Number(n) || 0).toLocaleString("en-IN");

function BestCard({ p, i }) {
  return (
    <Reveal delay={(i % 2) + 1}>
      <Link to={`/product/${p.id}`} className="best-card">
        <div className="best-img">
          <img src={p.images?.[0]} alt={p.name} loading="lazy" />
        </div>
        <div className="best-meta">
          <span className="best-code">{p.code || ""}</span>
          <h3>{p.name}</h3>
        </div>
      </Link>
    </Reveal>
  );
}

export default function Home() {
  const heroRef = useRef(null);
  const wide = useWide();
  const [inApp] = useState(() => isInAppBrowser());
  const [canWebGL] = useState(() => hasWebGL());
  const { t } = useLang();

  const tr = (key, fallback) => {
    const val = t(key);
    return val && val !== key ? val : fallback;
  };

  useEffect(() => {
    if (inApp) return;
    const ctx = gsap.context(() => {
      gsap.from(".hero-anim", { y: 30, opacity: 0, duration: 1.1, ease: "power3.out", stagger: 0.12, delay: 0.1 });
      gsap.from(".hero-3d", { scale: 0.94, opacity: 0, duration: 1.6, ease: "power3.out", delay: 0.2 });
    }, heroRef);
    return () => ctx.revert();
  }, [inApp]);

  const featured = PRODUCTS.filter((p) => p.featured).slice(0, 6);
  const fallback = PRODUCTS.slice(0, 6);
  const best = featured.length >= 4 ? featured : fallback;
  const model = PRODUCTS.find((p) => p.images[1])?.images[1];

  return (
    <div className="home-v4">
      <style>{`@media (max-width: 760px) { .wa-float { display: none !important; } }`}</style>
      {/* ---------------- HERO ---------------- */}
      <section className="hero" ref={heroRef}>
        <div className="hero-grid">
          <div>
            <span className="eyebrow hero-anim">{tr("home.eyebrow", "New collection")}</span>
            <h1 className="hero-anim">
              {tr("home.heroTitleBefore", "Shine")} <em>{tr("home.heroTitleEm", "like")}</em> {tr("home.heroTitleAfter", "you mean it.")}
            </h1>
            <p className="hero-anim">
              {tr(
                "home.heroDesc",
                "Delicate necklaces, sparkling sets and little treasures, designed for everyday luxury and gifts they will never forget."
              )}
            </p>
            <div className="hero-cta hero-anim">
              <Link to="/shop" className="btn btn-gold">{tr("home.shopCta", "Shop the collection")}</Link>
              <Link to="/about" className="btn btn-ghost">{tr("home.storyCta", "Our story")}</Link>
            </div>
            <div className="hero-facts hero-anim">
              <span><b>{PRODUCTS.length}+</b> {tr("home.factDesigns", "designs")}</span>
              <i />
              <span><b>{SITE.returnDays} {tr("home.factDays", "days")}</b> {tr("home.factExchange", "exchange")}</span>
              <i />
              <span><b>{tr("home.factGiftBold", "Gift-ready")}</b> {tr("home.factGiftRest", "packaging")}</span>
            </div>
          </div>
          <div className="hero-3d">
            {canWebGL ? (
              <Suspense fallback={<HeroArt />}>
                <Hero3D />
              </Suspense>
            ) : (
              <HeroArt />
            )}
            {wide && canWebGL && <div className="hero-hint">{tr("home.hint3d", "Move your mouse · Scroll")}</div>}
          </div>
        </div>
      </section>

      {/* ---------------- CATEGORIES (line icons) ---------------- */}
      <section className="home-cats-wrap">
        <div className="home-cats">
          {CATEGORIES.map((c) => (
            <Link key={c} to={`/shop?cat=${c}`} className="home-cat">
              <span className="home-cat-ico">
                <img src={catImage(c)} alt="" loading={inApp ? "eager" : "lazy"} />
              </span>
              <span>{tr(`cat.${c.toLowerCase()}`, c)}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------------- BEST SELLERS ---------------- */}
      <section className="home-best">
        <div className="home-wrap">
          <Reveal className="home-head">
            <span className="home-kicker">{tr("home.bestKicker", "Best sellers")}</span>
            <h2>{tr("home.bestTitleBefore", "Our")} <em>{tr("home.bestTitleEm", "favourites")}</em></h2>
            <Link to="/shop" className="home-viewall">{tr("home.viewAll", "View all")}</Link>
          </Reveal>
          <div className="home-best-grid">
            {best.map((p, i) => (
              <BestCard key={p.id} p={p} i={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- TRUST ---------------- */}
      <section className="home-trust">
        <div><b>{tr("home.trust1Bold", "Secure")}</b><span>{tr("home.trust1Sub", "Checkout")}</span></div>
        <div><b>{tr("home.trust2Bold", "Gift")}</b><span>{tr("home.trust2Sub", "Ready")}</span></div>
        <div><b>{tr("home.trust3Bold", "Easy")}</b><span>{tr("home.trust3Sub", "Exchange")}</span></div>
      </section>

      {/* ---------------- STORY (desktop) ---------------- */}
      <section className="section alt home-desk">
        <div className="container story">
          <Reveal className="story-img">
            <img src={model} alt="Jewelry styled on a model" loading={inApp ? "eager" : "lazy"} />
          </Reveal>
          <Reveal delay={2}>
            <span className="eyebrow">{tr("home.storyEyebrow", "Designed to be worn")}</span>
            <h2 className="title">{tr("home.storyTitleBefore", "Everyday luxury,")} <em>{tr("home.storyTitleEm", "made personal")}</em></h2>
            <p>
              {tr(
                "home.storyDesc",
                "Every piece in our collection is chosen to feel special without being complicated: light on the neck, easy to layer and beautiful enough to gift."
              )}
            </p>
            <div className="hero-cta">
              <Link to="/shop" className="btn btn-gold">{tr("home.startShopping", "Start shopping")}</Link>
              <Link to="/contact" className="btn btn-ghost">{tr("home.talkToUs", "Talk to us")}</Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------- WHATSAPP ---------------- */}
      <section className="home-wa">
        <span className="home-kicker">{tr("home.waKicker", "Need help choosing?")}</span>
        <h2>{tr("home.waTitleBefore", "Chat with us on")} <em>{tr("home.waTitleEm", "WhatsApp")}</em></h2>
        <p>{tr("home.waDesc", "Send a message and we will recommend the perfect piece for you or your loved one.")}</p>
        <div className="home-wa-btns">
          <a className="btn btn-gold" href={`https://wa.me/${SITE.whatsapp}`} target="_blank" rel="noreferrer">
            {tr("home.messageUs", "Message us")}
          </a>
          <Link to="/help" className="btn btn-ghost">{tr("nav.help", "Help Center")}</Link>
        </div>
      </section>

      {/* ---------------- MOBILE TAB BAR ---------------- */}
      <nav className="home-tabbar" aria-label="Quick menu">
        <Link to="/" className="active"><i>⌂</i><span>{tr("nav.home", "Home")}</span></Link>
        <Link to="/shop"><i>◇</i><span>{tr("nav.shop", "Shop")}</span></Link>
        <Link to="/cart"><i>▢</i><span>{tr("nav.cart", "Cart")}</span></Link>
        <Link to="/orders"><i>≡</i><span>{tr("nav.orders", "Orders")}</span></Link>
      </nav>
    </div>
  );
}