import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { SITE, money } from "../config.js";
import { PRODUCTS } from "../products.js";
import { useLang } from "../i18n.jsx";
import Reveal from "../components/Reveal.jsx";

function useTr() {
  const { lang, t } = useLang();
  const isBn = lang === "bn";
  const tr = (key, enText, bnText) => {
    const val = t(key);
    if (val && val !== key) return val;
    return isBn && bnText !== undefined ? bnText : enText;
  };
  return { lang, isBn, tr };
}

function PageHead({ title, em, crumb }) {
  const { tr } = useTr();

  return (
    <div className="page-head">
      <div className="container">
        <div className="crumbs"><Link to="/">{tr("nav.home", "Home", "হোম")}</Link> / {crumb}</div>
        <h1 className="title">{title} {em ? <em>{em}</em> : null}</h1>
      </div>
    </div>
  );
}

/* ----------------------------- ABOUT ----------------------------- */
export function About() {
  const img = PRODUCTS.find((p) => p.images[1])?.images[1];
  const { tr } = useTr();

  return (
    <>
      <PageHead
        title={tr("about.headTitle", "Our", "আমাদের")}
        em={tr("about.headEm", "story", "গল্প")}
        crumb={tr("nav.about", "Our Story", "আমাদের গল্প")}
      />
      <section className="section">
        <div className="container story">
          <Reveal className="story-img"><img src={img} alt="" /></Reveal>
          <Reveal delay={2}>
            <span className="eyebrow">
              {tr("about.eyebrowPrefix", "About", "সম্পর্কে")} {SITE.name}
            </span>
            <h2 className="title">
              {tr("about.titleBefore", "Small details,", "ছোট খুঁটিনাটি,")}{" "}
              <em>{tr("about.titleEm", "big sparkle", "বড় উজ্জ্বলতা")}</em>
            </h2>
            <p>
              {tr(
                "about.p1",
                `${SITE.name} was created with one idea: beautiful jewelry should feel personal. Every piece is selected for its design, its finish and the way it looks when it is worn every day.`,
                `${SITE.name} তৈরি হয়েছে একটি ভাবনা থেকেই: সুন্দর জুয়েলারি হতে হবে একান্ত নিজের মতো। প্রতিদিনের ব্যবহারে কেমন মানাবে, ফিনিশিং আর ডিজাইন কেমন হবে—সব কিছু ভেবেই প্রতিটি পিস নির্বাচন করা হয়।`
              )}
            </p>
            <p>
              {tr(
                "about.p2",
                "We pack each order with care so it is ready to give as a gift, and we are always here to help you choose, exchange or simply say hello.",
                "উপহার দেওয়ার উপযোগী করে যত্ন সহকারে প্রতিটি অর্ডার প্যাক করা হয়, আর যেকোনো পছন্দ, এক্সচেঞ্জ বা সাধারণ কথা বলার জন্য আমরা সবসময় পাশে আছি।"
              )}
            </p>
            <div className="hero-cta">
              <Link to="/shop" className="btn btn-gold">{tr("about.shopNow", "Shop now", "এখনই কিনুন")}</Link>
              <Link to="/contact" className="btn btn-ghost">{tr("footer.contactUs", "Contact us", "যোগাযোগ করুন")}</Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

/* ----------------------------- HELP CENTER ----------------------------- */
const FAQ = (tr) => [
  [
    tr("faq.q1", "How do I place an order?", "কীভাবে অর্ডার করব?"),
    tr(
      "faq.a1",
      "Choose your jewelry, add it to the cart and fill in the checkout form. Your order details open in WhatsApp, and we confirm it with you right away.",
      "আপনার পছন্দের জুয়েলারি বেছে কার্টে যোগ করুন এবং চেকআউট ফর্ম পূরণ করুন। অর্ডার কনফার্ম হলে আমরা দ্রুত আপনার সাথে যোগাযোগ করি।"
    ),
  ],
  [
    tr("faq.q2", "How long does delivery take?", "ডেলিভারিতে কতদিন সময় লাগে?"),
    `${tr("faq.a2Prefix", "Orders are usually delivered in", "সাধারণত অর্ডার ডেলিভারি হতে সময় লাগে")} ${SITE.deliveryTime}. ${tr("faq.a2Fee", "Delivery is", "ডেলিভারি চার্জ")} ${money(SITE.shippingFee)}, ${tr("faq.a2Free", "and free on orders over", "এবং এর চেয়ে বেশি টাকার অর্ডারে ফ্রি")} ${money(SITE.freeShippingOver)}.`,
  ],
  [
    tr("faq.q3", "What payment methods do you accept?", "কোন কোন পেমেন্ট পদ্ধতি চালু আছে?"),
    tr(
      "faq.a3",
      "Cash on delivery, and mobile payment (bKash / Nagad). Mobile payment instructions are shown at checkout.",
      "ক্যাশ অন ডেলিভারি এবং মোবাইল পেমেন্ট (বিকাশ / নগদ) চালু আছে। চেকআউটে পেমেন্টের বিস্তারিত নির্দেশনা দেওয়া থাকে।"
    ),
  ],
  [
    tr("faq.q4", "Can I exchange or return an item?", "পণ্য এক্সচেঞ্জ বা রিটার্ন করা যাবে?"),
    `${tr("faq.a4Prefix", "Yes. You can request an exchange or return within", "হ্যাঁ। অর্ডার পাওয়ার")} ${SITE.returnDays} ${tr("faq.a4Suffix", "days of receiving your order, as long as the item is unused and in its original packaging. See our Returns & Exchange policy for details.", "দিনের মধ্যে অব্যবহৃত ও মূল প্যাকেজিং অক্ষত থাকা অবস্থায় এক্সচেঞ্জ বা রিটার্নের জন্য আবেদন করতে পারবেন। বিস্তারিত জানতে আমাদের রিটার্ন ও এক্সচেঞ্জ নীতিমালা দেখুন।")}`,
  ],
  [
    tr("faq.q5", "How do I take care of my jewelry?", "জুয়েলারির যত্ন কীভাবে নেব?"),
    tr(
      "faq.a5",
      "Keep it dry, store it in its box, and put it on after perfume or lotion. Wipe gently with a soft cloth after wearing.",
      "শুকনো রাখুন, বক্সে সংরক্ষণ করুন এবং পারফিউম বা লোশন দেওয়ার পর পরুন। ব্যবহারের পর নরম কাপড় দিয়ে আলতো করে মুছে রাখুন।"
    ),
  ],
  [
    tr("faq.q6", "Can I order jewelry as a gift?", "উপহার দেওয়ার জন্য কি জুয়েলারি অর্ডার করা যাবে?"),
    tr(
      "faq.a6",
      "Of course. Every order is packed gift-ready. Add a note at checkout if you would like us to include a message.",
      "অবশ্যই। প্রতিটি অর্ডারই গিফট-রেডি করে প্যাক করা হয়। কোনো বার্তা যুক্ত করতে চাইলে চেকআউটে নোট লিখে দিন।"
    ),
  ],
  [
    tr("faq.q7", "How can I contact you?", "কীভাবে আপনাদের সাথে যোগাযোগ করব?"),
    `${SITE.email ? `${tr("faq.a7MsgEmailPrefix", "Message us on WhatsApp, call", "WhatsApp-এ মেসেজ দিন, কল করুন")} ${SITE.phone}, ${tr("faq.a7OrEmail", "or email", "অথবা ইমেইল করুন")} ${SITE.email}.` : `${tr("faq.a7MsgPrefix", "Message us on WhatsApp or call", "WhatsApp-এ মেসেজ দিন বা কল করুন")} ${SITE.phone}.`} ${tr("faq.a7HoursPrefix", "We are available", "আমাদের সময়সূচি:")} ${SITE.hours.toLowerCase()}.`,
  ],
];

export function Help() {
  const [open, setOpen] = useState(0);
  const { tr } = useTr();
  const items = FAQ(tr);

  return (
    <>
      <PageHead
        title={tr("help.headTitle", "Help", "সাহায্য")}
        em={tr("help.headEm", "Center", "কেন্দ্র")}
        crumb={tr("nav.help", "Help Center", "সাহায্য কেন্দ্র")}
      />
      <section className="section">
        <div className="container">
          <div className="info-cards">
            <div className="info-card">
              <h4>{tr("footer.shipping", "Shipping & Delivery", "শিপিং ও ডেলিভারি")}</h4>
              <p>{tr("help.shipDesc", "Delivery times, charges and tracking.", "ডেলিভারির সময়, চার্জ ও তথ্য।")}</p>
              <p><Link to="/policy/shipping">{tr("help.readMore", "Read more →", "বিস্তারিত দেখুন →")}</Link></p>
            </div>
            <div className="info-card">
              <h4>{tr("footer.returns", "Returns & Exchange", "রিটার্ন ও এক্সচেঞ্জ")}</h4>
              <p>{SITE.returnDays}-{tr("help.returnDesc", "day exchange and returns.", "দিনের এক্সচেঞ্জ ও রিটার্ন সুবিধা।")}</p>
              <p><Link to="/policy/returns">{tr("help.readMore", "Read more →", "বিস্তারিত দেখুন →")}</Link></p>
            </div>
            <div className="info-card">
              <h4>{tr("home.talkToUs", "Talk to us", "কথা বলুন")}</h4>
              <p>{tr("help.talkDesc", "We are happy to help with any question.", "যেকোনো প্রশ্নে আমরা আনন্দের সাথে সাহায্য করব।")}</p>
              <p><Link to="/contact">{tr("help.contactLink", "Contact →", "যোগাযোগ →")}</Link></p>
            </div>
          </div>

          <div className="info-card" style={{ marginTop: 28, padding: 24 }}>
            <h3 style={{ marginBottom: 14 }}>{tr("help.rulesTitle", "শর্তাবলী ও ডেলিভারি নিয়মাবলী", "শর্তাবলী ও ডেলিভারি নিয়মাবলী")}</h3>
            <div style={{ display: "grid", gap: 14, lineHeight: 1.7 }}>
              <div>
                <b>{tr("help.rule1Title", "১. পার্সেল যদি গ্রহণ না করেন:", "১. পার্সেল যদি গ্রহণ না করেন:")}</b>
                <p style={{ marginTop: 4 }}>{tr("help.rule1Body", "পার্সেল হাতে পেয়ে যদি গ্রহণ করতে না চান, তাহলে পার্সেলটি খুলবেন না। ডেলিভারি চার্জ দিয়ে পার্সেলটি রাইডারকে ফেরত দিন।", "পার্সেল হাতে পেয়ে যদি গ্রহণ করতে না চান, তাহলে পার্সেলটি খুলবেন না। ডেলিভারি চার্জ দিয়ে পার্সেলটি রাইডারকে ফেরত দিন।")}</p>
              </div>
              <div>
                <b>{tr("help.rule2Title", "২. পার্সেল যদি ভুল হয় বা ক্ষতিগ্রস্ত থাকে:", "২. পার্সেল যদি ভুল হয় বা ক্ষতিগ্রস্ত থাকে:")}</b>
                <p style={{ marginTop: 4 }}>{tr("help.rule2Body", "পার্সেল খুলে ভুল পণ্য বা ক্ষতি দেখলে, পণ্যের একটি ছবি তুলে আমাদের WhatsApp এ পাঠান। যাচাই করে সঠিক পণ্য নতুন পার্সেলে পাঠিয়ে দেওয়া হবে।", "পার্সেল খুলে ভুল পণ্য বা ক্ষতি দেখলে, পণ্যের একটি ছবি তুলে আমাদের WhatsApp এ পাঠান। যাচাই করে সঠিক পণ্য নতুন পার্সেলে পাঠিয়ে দেওয়া হবে।")}</p>
              </div>
            </div>
          </div>

          <div className="faq">
            <h2 className="title center" style={{ marginBottom: 28 }}>
              {tr("help.faqBefore", "Frequently asked", "সচরাচর জিজ্ঞাসিত")}{" "}
              <em>{tr("help.faqEm", "questions", "প্রশ্নাবলী")}</em>
            </h2>
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
  const { tr } = useTr();
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
      <PageHead
        title={tr("contact.headTitle", "Contact", "যোগাযোগ")}
        em={tr("contact.headEm", "us", "করুন")}
        crumb={tr("nav.contact", "Contact", "যোগাযোগ")}
      />
      <div className="container contact-grid">
        <div>
          <span className="eyebrow">{tr("contact.eyebrow", "Get in touch", "যোগাযোগের মাধ্যম")}</span>
          <h2 className="title">
            {tr("contact.titleBefore", "We'd love to", "আমরা শুনতে চাই")}{" "}
            <em>{tr("contact.titleEm", "hear from you", "আপনার কথা")}</em>
          </h2>
          <p className="lead">{tr("contact.lead", "Questions about an order, a gift idea or a product? Reach us any way you like.", "অর্ডার, গিফট আইডিয়া বা যেকোনো পণ্য নিয়ে প্রশ্ন থাকলে যেকোনো মাধ্যমে যোগাযোগ করুন।")}</p>
          <div style={{ display: "grid", gap: 14, marginTop: 30 }}>
            <div className="info-card"><h4>{tr("contact.phoneLabel", "Phone", "ফোন")}</h4><a href={`tel:${SITE.phone.replace(/\s/g, "")}`}>{SITE.phone}</a></div>
            <div className="info-card"><h4>{tr("nav.whatsapp", "WhatsApp", "WhatsApp")}</h4><a href={`https://wa.me/${SITE.whatsapp}`} target="_blank" rel="noreferrer">{tr("contact.chatWithUs", "Chat with us", "চ্যাট করুন")}</a></div>
            {SITE.email && <div className="info-card"><h4>{tr("contact.emailLabel", "Email", "ইমেইল")}</h4><a href={`mailto:${SITE.email}`}>{SITE.email}</a></div>}
            <div className="info-card">
              <h4>{SITE.address ? tr("contact.visitLabel", "Visit", "ঠিকানা") : tr("contact.hoursLabel", "Hours", "সময়সূচি")}</h4>
              {SITE.address && <p>{SITE.address}</p>}
              <p>{SITE.hours}</p>
            </div>
          </div>
        </div>
        <form className="form" onSubmit={send}>
          <div className="field"><label>{tr("contact.yourName", "Your name", "আপনার নাম")}</label><input value={f.name} onChange={set("name")} required /></div>
          <div className="field"><label>{tr("contact.phoneOrEmail", "Phone or email", "ফোন বা ইমেইল")}</label><input value={f.contact} onChange={set("contact")} /></div>
          <div className="field"><label>{tr("contact.messageLabel", "Message", "মেসেজ")}</label><textarea value={f.message} onChange={set("message")} required /></div>
          <button className="btn btn-gold" type="submit">{tr("contact.sendWhatsapp", "Send via WhatsApp", "WhatsApp-এ পাঠান")}</button>
          {sent && <p className="note">{tr("contact.sentNote", "Your message opened in WhatsApp. Just press send there.", "আপনার মেসেজটি WhatsApp-এ খুলেছে। সেখানে সেন্ড চাপুন।")}</p>}
        </form>
      </div>
    </>
  );
}

/* ----------------------------- POLICIES ----------------------------- */
// These are starter templates. Review and edit them to match your real business rules.
const POLICIES = (tr) => ({
  shipping: {
    title: tr("footer.shipping", "Shipping & Delivery", "শিপিং ও ডেলিভারি"),
    body: [
      [
        tr("policy.ship1Title", "Delivery time", "ডেলিভারির সময়"),
        `${tr("policy.ship1BodyPrefix", "Orders are usually delivered within", "সাধারণত অর্ডার কনফার্ম হওয়ার")} ${SITE.deliveryTime} ${tr("policy.ship1BodySuffix", "after confirmation. Delivery times may vary during holidays or in remote areas.", "এর মধ্যে ডেলিভারি করা হয়। ছুটির দিন বা দূরের এলাকায় সময় কিছুটা বেশি লাগতে পারে।")}`,
      ],
      [
        tr("policy.ship2Title", "Delivery charge", "ডেলিভারি চার্জ"),
        `${tr("policy.ship2BodyPrefix", "Delivery costs", "ডেলিভারি চার্জ")} ${money(SITE.shippingFee)}. ${tr("policy.ship2BodyMid", "Orders over", "এর বেশি টাকার অর্ডারে")} ${money(SITE.freeShippingOver)} ${tr("policy.ship2BodySuffix", "qualify for free delivery.", "ফ্রি ডেলিভারি সুবিধা পাওয়া যায়।")}`,
      ],
      [
        tr("policy.ship3Title", "Order confirmation", "অর্ডার কনফার্মেশন"),
        tr("policy.ship3Body", "After you place an order, we confirm the details with you on WhatsApp or by phone before dispatch.", "অর্ডার করার পর পার্সেল পাঠানোর আগে আমরা WhatsApp বা ফোনের মাধ্যমে বিস্তারিত নিশ্চিত করি।"),
      ],
      [
        tr("policy.ship4Title", "Receiving your order", "পণ্য গ্রহণ"),
        tr("policy.ship4Body", "Please check the parcel when it arrives. If anything is wrong, contact us as soon as possible.", "পার্সেল পৌঁছানোর পর ভালোভাবে দেখে নিন। কোনো সমস্যা হলে দ্রুত আমাদের সাথে যোগাযোগ করুন।"),
      ],
    ],
  },
  returns: {
    title: tr("footer.returns", "Returns & Exchange", "রিটার্ন ও এক্সচেঞ্জ"),
    body: [
      [
        tr("policy.ret1Title", "Return window", "রিটার্নের সময়সীমা"),
        `${tr("policy.ret1BodyPrefix", "You may request an exchange or return within", "অর্ডার পাওয়ার")} ${SITE.returnDays} ${tr("policy.ret1BodySuffix", "days of receiving your order.", "দিনের মধ্যে এক্সচেঞ্জ বা রিটার্নের জন্য অনুরোধ করতে পারবেন।")}`,
      ],
      [
        tr("policy.ret2Title", "Condition", "শর্তাবলী"),
        tr("policy.ret2Body", "Items must be unused, in their original condition and packaging.", "পণ্য অবশ্যই অব্যবহৃত এবং আসল অবস্থায় ও মূল প্যাকেজিংয়ে থাকতে হবে।"),
      ],
      [
        tr("policy.ret3Title", "Damaged or wrong item", "ক্ষতিগ্রস্ত বা ভুল পণ্য"),
        tr("policy.ret3Body", "If you received a damaged or incorrect item, contact us right away with a photo and we will make it right.", "ক্ষতিগ্রস্ত বা ভুল পণ্য পেলে ছবি তুলে দ্রুত আমাদের জানান, আমরা সমাধান করে দেব।"),
      ],
      [
        tr("policy.ret4Title", "How to request", "আবেদনের নিয়ম"),
        `${tr("policy.ret4BodyPrefix", "Message us on WhatsApp or call", "আপনার অর্ডার নম্বরসহ WhatsApp-এ মেসেজ দিন বা কল করুন")} ${SITE.phone} ${tr("policy.ret4BodySuffix", "with your order number.", "নম্বরে।")}`,
      ],
    ],
  },
  privacy: {
    title: tr("footer.privacy", "Privacy Policy", "প্রাইভেসি পলিসি"),
    body: [
      [
        tr("policy.priv1Title", "What we collect", "আমরা কী তথ্য সংগ্রহ করি"),
        tr("policy.priv1Body", "When you order, we collect your name, phone number and delivery address so we can fulfil your order.", "অর্ডার সম্পন্ন করার জন্য আমরা আপনার নাম, ফোন নম্বর ও ডেলিভারির ঠিকানা সংগ্রহ করি।"),
      ],
      [
        tr("policy.priv2Title", "How we use it", "তথ্যের ব্যবহার"),
        tr("policy.priv2Body", "We use your details only to confirm, deliver and support your order. We do not sell your personal information.", "শুধুমাত্র অর্ডার নিশ্চিতকরণ, ডেলিভারি ও সাপোর্টের কাজে তথ্য ব্যবহার করা হয়। আপনার ব্যক্তিগত তথ্য বিক্রি করা হয় না।"),
      ],
      [
        tr("policy.priv3Title", "Your cart", "আপনার কার্ট"),
        tr("policy.priv3Body", "Your shopping cart is stored in your own browser on your device.", "আপনার শপিং কার্ট আপনার ডিভাইসের ব্রাউজারেই সংরক্ষিত থাকে।"),
      ],
      [
        tr("policy.priv4Title", "Contact", "যোগাযোগ"),
        SITE.email
          ? `${tr("policy.priv4EmailPrefix", "For any privacy question, email", "প্রাইভেসি সংক্রান্ত যেকোনো প্রশ্নে ইমেইল করুন")} ${SITE.email}.`
          : `${tr("policy.priv4PhonePrefix", "For any privacy question, message us on WhatsApp or call", "প্রাইভেসি সংক্রান্ত যেকোনো প্রশ্নে WhatsApp-এ মেসেজ দিন বা কল করুন")} ${SITE.phone}.`,
      ],
    ],
  },
  terms: {
    title: tr("footer.terms", "Terms & Conditions", "শর্তাবলী"),
    body: [
      [
        tr("policy.term1Title", "Orders", "অর্ডার"),
        tr("policy.term1Body", "All orders are subject to availability and confirmation. We may contact you to verify details before dispatch.", "সব অর্ডার স্টক থাকা ও নিশ্চিতকরণের সাপেক্ষে গৃহীত হয়। পাঠানোর আগে যাচাইয়ের জন্য আমরা যোগাযোগ করতে পারি।"),
      ],
      [
        tr("policy.term2Title", "Prices", "মূল্য"),
        `${tr("policy.term2BodyPrefix", "Prices are shown in", "মূল্য")} ${SITE.currency} ${tr("policy.term2BodySuffix", "and may change without notice. The price at the time of your confirmed order applies.", "এ দেখানো হয় এবং পূর্বঘোষণা ছাড়া পরিবর্তিত হতে পারে। নিশ্চিত হওয়া অর্ডারের সময়কার মূল্য প্রযোজ্য হবে।")}`,
      ],
      [
        tr("policy.term3Title", "Product images", "পণ্যের ছবি"),
        tr("policy.term3Body", "We try to show colours and details accurately, but small differences may occur due to screens and lighting.", "রং ও খুঁটিনাটি সঠিকভাবে তুলে ধরার চেষ্টা করা হয়, তবে স্ক্রিন ও আলোর কারণে সামান্য ভিন্নতা হতে পারে।"),
      ],
      [
        tr("policy.term4Title", "Changes", "পরিবর্তন"),
        tr("policy.term4Body", "We may update these terms from time to time. Please check this page for the latest version.", "প্রয়োজনে এই শর্তাবলী আপডেট করা হতে পারে। সর্বশেষ সংস্করণের জন্য এই পেজটি দেখুন।"),
      ],
    ],
  },
});

export function Policy() {
  const { slug } = useParams();
  const { tr } = useTr();
  const p = POLICIES(tr)[slug];
  if (!p) return <NotFound />;
  return (
    <>
      <PageHead title={p.title} em="" crumb={p.title} />
      <div className="container prose">
        {p.body.map(([h, bodyText]) => (
          <div key={h}>
            <h2>{h}</h2>
            <p>{bodyText}</p>
          </div>
        ))}
        <p style={{ marginTop: 30 }}>
          {tr("product.questions", "Questions?", "কোনো প্রশ্ন আছে?")}{" "}
          <Link to="/contact" style={{ color: "var(--gold-light)" }}>{tr("footer.contactUs", "Contact us", "যোগাযোগ করুন")}</Link>.
        </p>
      </div>
    </>
  );
}

export function NotFound() {
  const { tr } = useTr();

  return (
    <div className="container empty">
      <h2>{tr("notFound.title", "Page not found", "পেজটি পাওয়া যায়নি")}</h2>
      <p>{tr("notFound.desc", "The page you are looking for does not exist.", "আপনি যে পেজটি খুঁজছেন সেটি নেই।")}</p>
      <Link to="/" className="btn btn-gold">{tr("notFound.backHome", "Back to home", "হোমে ফিরে যান")}</Link>
    </div>
  );
}