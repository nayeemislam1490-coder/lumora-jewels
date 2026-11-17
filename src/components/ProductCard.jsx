import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { money } from "../config.js";
import { useCart } from "../cart.jsx";
import "../product-cards.css";

// One shared observer marks each card "is-in" the first time it is visible (starts its image animation).
const seen =
  typeof IntersectionObserver !== "undefined"
    ? new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("is-in");
              seen.unobserve(e.target);
            }
          });
        },
        { threshold: 0.2 }
      )
    : null;

export default function ProductCard({ p }) {
  const cart = useCart();
  const ref = useRef(null);
  const raf = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!seen) {
      el.classList.add("is-in");
      return;
    }
    seen.observe(el);
    return () => seen.unobserve(el);
  }, []);

  // Tilt + image depth follow a desktop mouse only; touch and pen are ignored.
  const onMove = (e) => {
    if (e.pointerType !== "mouse") return;
    const el = ref.current;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      el.style.setProperty("--ry", `${(x * 8).toFixed(2)}deg`);
      el.style.setProperty("--rx", `${(-y * 8).toFixed(2)}deg`);
      el.style.setProperty("--tx", `${(-x * 14).toFixed(1)}px`);
      el.style.setProperty("--ty", `${(-y * 14).toFixed(1)}px`);
    });
  };
  const onLeave = () => {
    cancelAnimationFrame(raf.current);
    const el = ref.current;
    ["--rx", "--ry", "--tx", "--ty"].forEach((k) => el.style.removeProperty(k));
  };

  return (
    <div className="card-3d" ref={ref} onPointerMove={onMove} onPointerLeave={onLeave}>
      <article className="card">
        <Link to={`/product/${p.id}`} className="card-img">
          {p.badge && <span className="badge">{p.badge}</span>}
          <img className="first" src={p.images[0]} alt={p.name} loading="lazy" />
          {p.images[1] && <img className="second" src={p.images[1]} alt="" loading="lazy" />}
        </Link>
        <div className="card-body">
          <span className="card-code">{p.code}</span>
          <Link to={`/product/${p.id}`} className="card-name">
            {p.name}
          </Link>
          <div className="price">
            <b>{money(p.price)}</b>
            {p.oldPrice && <s>{money(p.oldPrice)}</s>}
          </div>
          <button className="card-add" onClick={() => cart.add(p.id, 1)}>
            Add to cart
          </button>
        </div>
      </article>
    </div>
  );
}
