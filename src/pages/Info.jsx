import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { SITE, money } from "../config.js";
import { PRODUCTS } from "../products.js";
import Reveal from "../components/Reveal.jsx";

function PageHead({ title, em, crumb }) {
  return (
    <div className="page-head">
      <div className="container">
        <div className="crumbs"><Link to="/">Home</Link> / {crumb}</div>
        <h1 className="title">{title} <em>{em}</em></h1>
      </div>
    </div>
  );
}

/* ----------------------------- ABOUT ----------------------------- */
export function About() {
  const img = PRODUCTS.find((p) => p.images[1])?.images[1];
  return (
    <>
      <PageHead title="Our" em="story" crumb="Our Story" />
      <section className="section">
        <div className="container story">
          <Reveal className="story-img"><img src={img} alt="" /></Reveal>
          <Reveal delay={2}>
            <span className="eyebrow">About {SITE.name}</span>
            <h2 className="title">Small details, <em>big sparkle</em></h2>
            <p>
              {SITE.name} was created with one idea: beautiful jewelry should feel personal. Every piece is
              selected for its design, its finish and the way it looks when it is worn every day.
            </p>
            <p>
              We pack each order with care so it is ready to give as a gift, and we are always here to help
              you choose, exchange or simply say hello.
            </p>
            <div className="hero-cta">
              <Link to="/shop" className="btn btn-gold">Shop now</Link>
              <Link to="/contact" className="btn btn-ghost">Contact us</Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

/* ----------------------------- HELP CENTER ----------------------------- */
const FAQ = () => [
  ["How do I place an order?", "Choose your jewelry, add it to the cart and fill in the checkout form. Your order details open in WhatsApp, and we confirm it with you right away."],
  ["How long does delivery take?", `Orders are usually delivered in ${SITE.deliveryTime}. Delivery is ${money(SITE.shippingFee)}, and free on orders over ${money(SITE.freeShippingOver)}.`],
  ["What payment methods do you accept?", "Cash on delivery, and mobile payment (bKash / Nagad). Mobile payment instructions are shown at checkout."],
  ["Can I exchange or return an item?", `Yes. You can request an exchange or return within ${SITE.returnDays} days of receiving your order, as long as the item is unused and in its original packaging. See our Returns & Exchange policy for details.`],
  ["How do I take care of my jewelry?", "Keep it dry, store it in its box, and put it on after perfume or lotion. Wipe gently with a soft cloth after wearing."],
  ["Can I order jewelry as a gift?", "Of course. Every order is packed gift-ready. Add a note at checkout if you would like us to include a message."],
  ["How can I contact you?", `${SITE.email ? `Message us on WhatsApp, call ${SITE.phone}, or email ${SITE.email}.` : `Message us on WhatsApp or call ${SITE.phone}.`} We are available ${SITE.hours.toLowerCase()}.`],
];

export function Help() {
  const [open, setOpen] = useState(0);
  const items = FAQ();
  return (
    <>
      <PageHead title="Help" em="Center" crumb="Help Center" />
      <section className="section">
        <div className="container">
          <div className="info-cards">
            <div className="info-card"><h4>Shipping & Delivery</h4><p>Delivery times, charges and tracking.</p><p><Link to="/policy/shipping">Read more →</Link></p></div>
            <div className="info-card"><h4>Returns & Exchange</h4><p>{SITE.returnDays}-day exchange and returns.</p><p><Link to="/policy/returns">Read more →</Link></p></div>
            <div className="info-card"><h4>Talk to us</h4><p>We are happy to help with any question.</p><p><Link to="/contact">Contact →</Link></p></div>
          </div>
          <div className="faq">
            <h2 className="title center" style={{ marginBottom: 28 }}>Frequently asked <em>questions</em></h2>
            {items.map(([q, a], i) => (
              <div className={`faq-item ${open === i ? "open" : ""}`} key={q}>
                <button className="faq-q" onClick={() => setOpen(open === i ? -1 : i)}>
                  {q} <i>+</i>
                </button>
                <div className="faq-a">{a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

/* ----------------------------- CONTACT ----------------------------- */
export function Contact() {
  const [f, setF] = useState({ name: "", contact: "", message: "" });
  const [sent, setSent] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const send = (e) => {
    e.preventDefault();
    if (!f.name.trim() || !f.message.trim()) return;
    const text = `Hello! I'm ${f.name}${f.contact ? ` (${f.contact})` : ""}.\n\n${f.message}`;
    window.open(`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`, "_blank");
    setSent(true);
  };

  return (
    <>
      <PageHead title="Contact" em="us" crumb="Contact" />
      <div className="container contact-grid">
        <div>
          <span className="eyebrow">Get in touch</span>
          <h2 className="title">We'd love to <em>hear from you</em></h2>
          <p className="lead">Questions about an order, a gift idea or a product? Reach us any way you like.</p>
          <div style={{ display: "grid", gap: 14, marginTop: 30 }}>
            <div className="info-card"><h4>Phone</h4><a href={`tel:${SITE.phone.replace(/\s/g, "")}`}>{SITE.phone}</a></div>
            <div className="info-card"><h4>WhatsApp</h4><a href={`https://wa.me/${SITE.whatsapp}`} target="_blank" rel="noreferrer">Chat with us</a></div>
            {SITE.email && <div className="info-card"><h4>Email</h4><a href={`mailto:${SITE.email}`}>{SITE.email}</a></div>}
            <div className="info-card"><h4>{SITE.address ? "Visit" : "Hours"}</h4>{SITE.address && <p>{SITE.address}</p>}<p>{SITE.hours}</p></div>
          </div>
        </div>
        <form className="form" onSubmit={send}>
          <div className="field"><label>Your name</label><input value={f.name} onChange={set("name")} required /></div>
          <div className="field"><label>Phone or email</label><input value={f.contact} onChange={set("contact")} /></div>
          <div className="field"><label>Message</label><textarea value={f.message} onChange={set("message")} required /></div>
          <button className="btn btn-gold" type="submit">Send via WhatsApp</button>
          {sent && <p className="note">Your message opened in WhatsApp. Just press send there.</p>}
        </form>
      </div>
    </>
  );
}

/* ----------------------------- POLICIES ----------------------------- */
// These are starter templates. Review and edit them to match your real business rules.
const POLICIES = () => ({
  shipping: {
    title: "Shipping & Delivery",
    body: [
      ["Delivery time", `Orders are usually delivered within ${SITE.deliveryTime} after confirmation. Delivery times may vary during holidays or in remote areas.`],
      ["Delivery charge", `Delivery costs ${money(SITE.shippingFee)}. Orders over ${money(SITE.freeShippingOver)} qualify for free delivery.`],
      ["Order confirmation", "After you place an order, we confirm the details with you on WhatsApp or by phone before dispatch."],
      ["Receiving your order", "Please check the parcel when it arrives. If anything is wrong, contact us as soon as possible."],
    ],
  },
  returns: {
    title: "Returns & Exchange",
    body: [
      ["Return window", `You may request an exchange or return within ${SITE.returnDays} days of receiving your order.`],
      ["Condition", "Items must be unused, in their original condition and packaging."],
      ["Damaged or wrong item", "If you received a damaged or incorrect item, contact us right away with a photo and we will make it right."],
      ["How to request", `Message us on WhatsApp or call ${SITE.phone} with your order number.`],
    ],
  },
  privacy: {
    title: "Privacy Policy",
    body: [
      ["What we collect", "When you order, we collect your name, phone number and delivery address so we can fulfil your order."],
      ["How we use it", "We use your details only to confirm, deliver and support your order. We do not sell your personal information."],
      ["Your cart", "Your shopping cart is stored in your own browser on your device."],
      ["Contact", SITE.email ? `For any privacy question, email ${SITE.email}.` : `For any privacy question, message us on WhatsApp or call ${SITE.phone}.`],
    ],
  },
  terms: {
    title: "Terms & Conditions",
    body: [
      ["Orders", "All orders are subject to availability and confirmation. We may contact you to verify details before dispatch."],
      ["Prices", "Prices are shown in " + SITE.currency + " and may change without notice. The price at the time of your confirmed order applies."],
      ["Product images", "We try to show colours and details accurately, but small differences may occur due to screens and lighting."],
      ["Changes", "We may update these terms from time to time. Please check this page for the latest version."],
    ],
  },
});

export function Policy() {
  const { slug } = useParams();
  const p = POLICIES()[slug];
  if (!p) return <NotFound />;
  return (
    <>
      <PageHead title={p.title} em="" crumb={p.title} />
      <div className="container prose">
        {p.body.map(([h, t]) => (
          <div key={h}>
            <h2>{h}</h2>
            <p>{t}</p>
          </div>
        ))}
        <p style={{ marginTop: 30 }}>Questions? <Link to="/contact" style={{ color: "var(--gold-light)" }}>Contact us</Link>.</p>
      </div>
    </>
  );
}

export function NotFound() {
  return (
    <div className="container empty">
      <h2>Page not found</h2>
      <p>The page you are looking for does not exist.</p>
      <Link to="/" className="btn btn-gold">Back to home</Link>
    </div>
  );
}
