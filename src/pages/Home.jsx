import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { SITE } from "../config.js";
import { CATEGORIES, PRODUCTS } from "../products.js";
import ProductCard from "../components/ProductCard.jsx";
import Reveal from "../components/Reveal.jsx";
import HeroArt from "../components/HeroArt.jsx";
import "../hero-mobile.css";

const Hero3D = lazy(() => import("../components/Hero3D.jsx"));

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (c.getContext("webgl") || c.getContext("experimental-webgl")));
  } catch (e) {
    return false;
  }
}

// Phones get a light SVG ring; the heavy 3D scene (three.js) is only downloaded on wider screens.
const WIDE = "(min-width: 761px)";
function useWide() {
  const [wide, setWide] = useState(() => window.matchMedia(WIDE).matches);
  useEffect(() => {
    const m = window.matchMedia(WIDE);
    const on = () => setWide(m.matches);
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, []);
  return wide;
}

const catImage = (cat) => PRODUCTS.find((p) => p.category === cat)?.images[0];

export default function Home() {
  const heroRef = useRef(null);
  const wide = useWide();
  const [canWebGL] = useState(hasWebGL());

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".hero-anim", { y: 46, opacity: 0, duration: 1.1, ease: "power3.out", stagger: 0.14, delay: 0.15 });
      gsap.from(".hero-3d", { scale: 0.88, opacity: 0, duration: 1.6, ease: "power3.out", delay: 0.2 });
    }, heroRef);
    return () => ctx.revert();
  }, []);

  const featured = PRODUCTS.filter((p) => p.featured).slice(0, 8);
  const model = PRODUCTS.find((p) => p.images[1])?.images[1];

  return (
    <>
      {/* ---------------- HERO ---------------- */}
      <section className="hero" ref={heroRef}>
        <div className="hero-grid">
          <div>
            <span className="eyebrow hero-anim">New collection</span>
            <h1 className="hero-anim">
              Jewelry that <em>shines</em> as bright as your story
            </h1>
            <p className="hero-anim">
              Delicate necklaces, sparkling sets and little treasures, designed for everyday luxury and
              gifts they will never forget.
            </p>
            <div className="hero-cta hero-anim">
              <Link to="/shop" className="btn btn-gold">Shop the collection</Link>
              <Link to="/about" className="btn btn-ghost">Our story</Link>
            </div>
            <div className="hero-stats hero-anim">
              <div><b>{PRODUCTS.length}+</b><span>Designs</span></div>
              <div><b>{SITE.returnDays} days</b><span>Easy exchange</span></div>
              <div><b>Gift-ready</b><span>Packaging</span></div>
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
            {wide && canWebGL && <div className="hero-hint">Move your mouse · Scroll</div>}
          </div>
        </div>
      </section>

      {/* ---------------- CATEGORIES ---------------- */}
      <section className="section">
        <div className="container">
          <Reveal className="center">
            <span className="eyebrow">Browse</span>
            <h2 className="title">Shop by <em>category</em></h2>
          </Reveal>
          <div className="cat-grid" style={{ marginTop: 44 }}>
            {CATEGORIES.map((c, i) => (
              <Reveal key={c} delay={(i % 3) + 1}>
                <Link to={`/shop?cat=${c}`} className="cat-card">
                  <img src={catImage(c)} alt={c} loading="lazy" />
                  <div>
                    <h3>{c}</h3>
                    <span>Explore →</span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- FEATURED ---------------- */}
      <section className="section alt">
        <div className="container">
          <Reveal className="head-row">
            <div>
              <span className="eyebrow">Best sellers</span>
              <h2 className="title">Our <em>favourites</em></h2>
            </div>
            <Link to="/shop" className="btn btn-ghost">View all</Link>
          </Reveal>
          <div className="grid">
            {featured.map((p, i) => (
              <Reveal key={p.id} delay={(i % 4) + 1 > 3 ? 3 : (i % 4) + 1}>
                <ProductCard p={p} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- STORY ---------------- */}
      <section className="section">
        <div className="container story">
          <Reveal className="story-img">
            <img src={model} alt="Jewelry styled on a model" loading="lazy" />
          </Reveal>
          <Reveal delay={2}>
            <span className="eyebrow">Designed to be worn</span>
            <h2 className="title">Everyday luxury, <em>made personal</em></h2>
            <p>
              Every piece in our collection is chosen to feel special without being complicated: light on the
              neck, easy to layer and beautiful enough to gift.
            </p>
            <p>
              Not sure what to pick? Message us and we will help you choose the perfect piece.
            </p>
            <div className="hero-cta">
              <Link to="/shop" className="btn btn-gold">Start shopping</Link>
              <Link to="/contact" className="btn btn-ghost">Talk to us</Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------- WHY US ---------------- */}
      <section className="section alt">
        <div className="container">
          <Reveal className="center" style={{ marginBottom: 44 }}>
            <span className="eyebrow">Why {SITE.name}</span>
            <h2 className="title">Shop with <em>confidence</em></h2>
          </Reveal>
          <div className="features">
            {[
              ["✦", "Fast delivery", `Delivered in ${SITE.deliveryTime}.`],
              ["↺", "Easy exchange", `${SITE.returnDays}-day exchange and return window.`],
              ["❖", "Gift-ready", "Beautiful packaging for every order."],
              ["☏", "Friendly support", "Real people on WhatsApp, ready to help."],
            ].map(([ico, t, d], i) => (
              <Reveal key={t} delay={i % 3 + 1}>
                <div className="feature">
                  <div className="ico">{ico}</div>
                  <h4>{t}</h4>
                  <p>{d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- CTA ---------------- */}
      <section className="cta-band">
        <Reveal className="container">
          <span className="eyebrow">Need help choosing?</span>
          <h2 className="title">Chat with us on <em>WhatsApp</em></h2>
          <p className="lead">Send a message and we will recommend the perfect piece for you or your loved one.</p>
          <div className="hero-cta" style={{ justifyContent: "center" }}>
            <a className="btn btn-gold" href={`https://wa.me/${SITE.whatsapp}`} target="_blank" rel="noreferrer">
              Message us
            </a>
            <Link to="/help" className="btn btn-ghost">Help Center</Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}