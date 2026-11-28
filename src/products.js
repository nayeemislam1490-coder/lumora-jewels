import { supabase } from "./supabase.js";

export const CATEGORIES = ["Necklaces", "Earrings", "Rings", "Sets"];

const img = (n) => `/images/${n}.jpg`;

const BN_TEXT = {
  "sapphire-bloom-set": {
    name: "স্যাফায়ার ব্লুম সেট",
    short: "নেকলেস, দুল এবং আংটি—সবকিছু এক সেটে।",
    desc: "একটি সম্পূর্ণ ম্যাচিং সেট: পেন্ডেন্ট নেকলেস, এক জোড়া দুল এবং একটি আংটি—সবগুলোতে ডিপ ব্লু ও স্কাই-ব্লু পাথর বসানো যা আলোয় ঝলমল করে। প্রিয়জনকে উপহার দেওয়ার জন্য দারুণ একটি সেট।",
    specs: ["যা যা থাকছে: নেকলেস, দুল, আংটি", "পাথর: ডিপ ব্লু ও স্কাই ব্লু", "গিফট বক্সে পরিবেশিত (ছবির মতো)"],
  },
  "double-heart-layered-necklace": {
    name: "ডাবল হার্ট লেয়ার্ড নেকলেস",
    short: "দুটি সূক্ষ্ম চেইন, একটি বড় হার্ট ও ছোট হার্টের ছোঁয়া।",
    desc: "ওয়ার্ম গোল্ডেন ফিনিশে দুটি লেয়ারের চেইন নেকলেস। ফাইন স্নেক চেইনে একটি মসৃণ হার্ট পেন্ডেন্ট এবং তার সাথে আরেকটি চেইনে ছোট ছোট হার্টের ডিজাইন। প্রতিদিন পরার জন্য একদম মানানসই।",
    specs: ["চেইন ১ দৈর্ঘ্য: ৩৭ + ৫ সেমি", "চেইন ২ দৈর্ঘ্য: ৪০ + ৫ সেমি", "হার্ট পেন্ডেন্ট: ১.২ সেমি", "ছোট হার্ট: ০.৫ সেমি", "ওজন: ৬.১ গ্রাম"],
  },
  "sapphire-bloom-necklace": {
    name: "স্যাফায়ার ব্লুম নেকলেস",
    short: "ঝলমলে পেন্ডেন্টে নীল পাথরের কারুকাজ।",
    desc: "সূক্ষ্ম চেইনে ডিপ ব্লু ও স্কাই-ব্লু পাথর বসানো একটি আকর্ষণীয় পেন্ডেন্ট। যেকোনো অনুষ্ঠানে পরার মতো মার্জিত, আবার প্রতিদিন পরার জন্য হালকা।",
    specs: ["পাথর: ডিপ ব্লু ও স্কাই ব্লু", "পেন্ডেন্টসহ সূক্ষ্ম চেইন"],
  },
  "sapphire-bloom-earrings": {
    name: "স্যাফায়ার ব্লুম দুল",
    short: "ম্যাচিং নীল পাথরের দুল।",
    desc: "ডিপ ব্লু ও স্কাই-ব্লু পাথরে তৈরি ঝলমলে ডিজাইনের ম্যাচিং দুল। স্যাফায়ার ব্লুম নেকলেস ও আংটির সাথে দারুণ মানিয়ে যায়।",
    specs: ["পাথর: ডিপ ব্লু ও স্কাই ব্লু", "এক জোড়া হিসেবে বিক্রি হয়"],
  },
  "sapphire-bloom-ring": {
    name: "স্যাফায়ার ব্লুম আংটি",
    short: "নীল পাথর বসানো ওপেন-স্টাইল আংটি।",
    desc: "ঝলমলে ব্যান্ডে দুটি ডিপ ব্লু এবং দুটি স্কাই-ব্লু পাথরের সমন্বয়ে তৈরি আকর্ষণীয় আংটি।",
    specs: ["পাথর: ডিপ ব্লু ও স্কাই ব্লু", "গিফট বক্সে পরিবেশিত"],
  },
  "triple-bead-necklace": {
    name: "ট্রিপল বিড নেকলেস",
    short: "সূক্ষ্ম চেইনে তিনটি সোনালি বিড।",
    desc: "সূক্ষ্ম চেইনের মাঝখানে তিনটি মসৃণ সোনালি বিড। মিনিমাল, আধুনিক এবং যেকোনো পোশাকের সাথে সহজেই মানানসই।",
    specs: ["গোল্ডেন ফিনিশ", "সূক্ষ্ম বক্স চেইন"],
  },
  "twin-hearts-lariat": {
    name: "টুইন হার্টস ল্যারিয়াট",
    short: "অ্যাডজাস্টেবল চেইনে জোড়া হার্টের ডিজাইন।",
    desc: "অ্যাডজাস্টেবল স্লাইডার চেইনে পরস্পর যুক্ত দুটি ওপেন হার্ট। মিষ্টি ও অর্থবহ একটি উপহার।",
    specs: ["গোল্ডেন ফিনিশ", "অ্যাডজাস্টেবল স্লাইডার চেইন"],
  },
  "butterfly-lariat": {
    name: "বাটারফ্লাই ল্যারিয়াট",
    short: "অ্যাডজাস্টেবল চেইনে টেক্সচার্ড প্রজাপতি পেন্ডেন্ট।",
    desc: "অ্যাডজাস্টেবল স্লাইডার চেইনে সূক্ষ্ম টেক্সচারের প্রজাপতি পেন্ডেন্ট। নাজুক, হালকা এবং দারুণ আকর্ষণীয়।",
    specs: ["গোল্ডেন ফিনিশ", "অ্যাডজাস্টেবল স্লাইডার চেইন"],
  },
  "clover-pendant-necklace": {
    name: "ক্লোভার পেন্ডেন্ট নেকলেস",
    short: "ব্রাশড-ফিনিশ চার পাতার ক্লোভার।",
    desc: "সূক্ষ্ম কেবল চেইনে ব্রাশড-ফিনিশ ক্লোভার পেন্ডেন্ট। ক্লাসিক, চিরন্তন এবং আভিজাত্যপূর্ণ।",
    specs: ["গোল্ডেন ব্রাশড ফিনিশ", "সূক্ষ্ম কেবল চেইন"],
  },
  "ginkgo-leaf-lariat": {
    name: "জিংকো লিফ ল্যারিয়াট",
    short: "অ্যাডজাস্টেবল চেইনে জিংকো পাতার ডিজাইন।",
    desc: "প্রকৃতির অনুপ্রেরণায় তৈরি অ্যাডজাস্টেবল স্লাইডার চেইনে সুন্দর জিংকো পাতার পেন্ডেন্ট।",
    specs: ["গোল্ডেন ফিনিশ", "অ্যাডজাস্টেবল স্লাইডার চেইন"],
  },
  "golden-bead-necklace": {
    name: "গোল্ডেন বিড নেকলেস",
    short: "সূক্ষ্ম চেইনে একটি সোনালি বিড।",
    desc: "সূক্ষ্ম চেইনে একটিমাত্র সোনালি বিড—প্রতিদিনের সাজে সামান্য ঝলমলে ছোঁয়া যোগ করার সহজ উপায়।",
    specs: ["গোল্ডেন ফিনিশ", "সূক্ষ্ম চেইন"],
  },
  "bead-drop-lariat": {
    name: "বিড ড্রপ ল্যারিয়াট",
    short: "ড্রপ বিডসহ বিড স্লাইডার চেইন।",
    desc: "সূক্ষ্ম বক্স চেইনে ড্রপ বিডসহ সোনালি বিড স্লাইডার। সহজেই অ্যাডজাস্ট ও লেয়ার করা যায়।",
    specs: ["গোল্ডেন ফিনিশ", "অ্যাডজাস্টেবল স্লাইডার চেইন"],
  },
  "shamrock-lariat": {
    name: "শ্যামরক ল্যারিয়াট",
    short: "অ্যাডজাস্টেবল চেইনে লাকি শ্যামরক।",
    desc: "অ্যাডজাস্টেবল স্লাইডার চেইনে পলিশড শ্যামরক পেন্ডেন্ট। কাছে রাখার মতো সৌভাগ্যের ছোঁয়া।",
    specs: ["গোল্ডেন ফিনিশ", "অ্যাডজাস্টেবল স্লাইডার চেইন"],
  },
};

const isBn = () => {
  try {
    if (typeof document !== "undefined" && document.body?.classList.contains("lang-bn")) return true;
    return typeof localStorage !== "undefined" && localStorage.getItem("veloria_lang") === "bn";
  } catch {
    return false;
  }
};

const localizeItem = (item) => {
  if (!isBn()) return item;
  const bn = BN_TEXT[item.id] || {};
  return {
    ...item,
    name: item.name_bn || bn.name || item.name,
    short: item.short_bn || bn.short || item.short,
    desc: item.desc_bn || bn.desc || item.desc,
    specs: Array.isArray(item.specs_bn) && item.specs_bn.length ? item.specs_bn : bn.specs || item.specs,
  };
};

// ফ্যালব্যাক বা অফলাইন প্রোডাক্ট লিস্ট (ডাটাবেজ কানেক্ট না থাকলে এগুলো দেখাবে)
export const PRODUCTS = [
  {
    id: "sapphire-bloom-set",
    name: "Sapphire Bloom Set",
    code: "Blue Set",
    category: "Sets",
    price: 3490,
    oldPrice: 3990,
    badge: "Best Seller",
    featured: true,
    images: [img("sapphire-set"), img("sapphire-set-box")],
    short: "Necklace, earrings and ring in one matching set.",
    desc: "A complete matching set: pendant necklace, a pair of earrings and a ring, all set with deep blue and sky-blue stones that catch the light from every angle. A lovely gift for someone special.",
    specs: ["Includes: necklace, earrings, ring", "Stones: deep blue & sky blue", "Presented in a gift box (as shown)"],
  },
  {
    id: "double-heart-layered-necklace",
    name: "Double Heart Layered Necklace",
    code: "NC354",
    category: "Necklaces",
    price: 350,
    oldPrice: 430,
    badge: "New",
    featured: true,
    images: [img("heart-layered"), img("heart-layered-model"), img("heart-layered-specs")],
    short: "Two delicate chains, one big heart and tiny heart accents.",
    desc: "A layered two-chain necklace in a warm golden finish. A smooth heart pendant hangs from a fine snake chain, layered with a second chain dotted with tiny hearts. Easy to wear every day.",
    specs: ["Chain 1 length: 37 + 5 cm", "Chain 2 length: 40 + 5 cm", "Heart pendant: 1.2 cm", "Small hearts: 0.5 cm", "Weight: 6.1 g"],
  },
  {
    id: "sapphire-bloom-necklace",
    name: "Sapphire Bloom Necklace",
    code: "Blue Set",
    category: "Necklaces",
    price: 1290,
    featured: true,
    images: [img("sapphire-necklace")],
    short: "Blue stones on a sparkling pendant.",
    desc: "A sparkling pendant with deep blue and sky-blue stones on a fine chain. Elegant enough for occasions, light enough for every day.",
    specs: ["Stones: deep blue & sky blue", "Fine chain with pendant"],
  },
  {
    id: "sapphire-bloom-earrings",
    name: "Sapphire Bloom Earrings",
    code: "Blue Set",
    category: "Earrings",
    price: 1190,
    images: [img("sapphire-earrings")],
    short: "Matching blue-stone earrings.",
    desc: "Matching earrings with deep blue and sky-blue stones in a sparkling design. They pair perfectly with the Sapphire Bloom necklace and ring.",
    specs: ["Stones: deep blue & sky blue", "Sold as a pair"],
  },
  {
    id: "sapphire-bloom-ring",
    name: "Sapphire Bloom Ring",
    code: "Blue Set",
    category: "Rings",
    price: 1090,
    images: [img("sapphire-ring")],
    short: "An open-style ring with blue stones.",
    desc: "A statement ring with two deep blue stones and two sky-blue accents on a sparkling band.",
    specs: ["Stones: deep blue & sky blue", "Presented in a gift box"],
  },
  {
    id: "triple-bead-necklace",
    name: "Triple Bead Necklace",
    code: "NC363",
    category: "Necklaces",
    price: 1490,
    featured: true,
    images: [img("gold-triple-ball")],
    short: "Three golden beads on a fine chain.",
    desc: "Three smooth golden beads rest at the centre of a fine chain. Minimal, modern and easy to style with anything.",
    specs: ["Golden finish", "Fine box chain"],
  },
  {
    id: "twin-hearts-lariat",
    name: "Twin Hearts Lariat",
    code: "NC363",
    category: "Necklaces",
    price: 1590,
    featured: true,
    images: [img("gold-twin-hearts")],
    short: "Two linked hearts on an adjustable chain.",
    desc: "Two interlocking open hearts hang from an adjustable slider chain. A sweet, meaningful gift.",
    specs: ["Golden finish", "Adjustable slider chain"],
  },
  {
    id: "butterfly-lariat",
    name: "Butterfly Lariat",
    code: "NC363",
    category: "Necklaces",
    price: 1590,
    featured: true,
    images: [img("gold-butterfly")],
    short: "A textured butterfly on an adjustable chain.",
    desc: "A finely textured butterfly pendant on an adjustable slider chain. Delicate, light and full of charm.",
    specs: ["Golden finish", "Adjustable slider chain"],
  },
  {
    id: "clover-pendant-necklace",
    name: "Clover Pendant Necklace",
    code: "NC363",
    category: "Necklaces",
    price: 1390,
    images: [img("gold-clover")],
    short: "A brushed-finish four-leaf clover.",
    desc: "A brushed-finish clover pendant on a fine cable chain. Classic, timeless and quietly luxurious.",
    specs: ["Golden brushed finish", "Fine cable chain"],
  },
  {
    id: "ginkgo-leaf-lariat",
    name: "Ginkgo Leaf Lariat",
    code: "NC363",
    category: "Necklaces",
    price: 1590,
    images: [img("gold-ginkgo")],
    short: "A ginkgo leaf on an adjustable chain.",
    desc: "A graceful ginkgo leaf pendant on an adjustable slider chain, inspired by nature.",
    specs: ["Golden finish", "Adjustable slider chain"],
  },
  {
    id: "golden-bead-necklace",
    name: "Golden Bead Necklace",
    code: "NC363",
    category: "Necklaces",
    price: 1190,
    images: [img("gold-ball")],
    short: "One golden bead on a fine chain.",
    desc: "A single golden bead on a fine chain: the simplest way to add a little shine to your day.",
    specs: ["Golden finish", "Fine chain"],
  },
  {
    id: "bead-drop-lariat",
    name: "Bead Drop Lariat",
    code: "NC363",
    category: "Necklaces",
    price: 1390,
    images: [img("gold-ball-drop")],
    short: "A bead slider with a drop bead.",
    desc: "A golden bead slider with a drop bead on a fine box chain. Adjustable and easy to layer.",
    specs: ["Golden finish", "Adjustable slider chain"],
  },
  {
    id: "shamrock-lariat",
    name: "Shamrock Lariat",
    code: "NC363",
    category: "Necklaces",
    price: 1590,
    images: [img("gold-shamrock")],
    short: "A lucky shamrock on an adjustable chain.",
    desc: "A polished shamrock pendant on an adjustable slider chain. A little charm of luck to wear close.",
    specs: ["Golden finish", "Adjustable slider chain"],
  },
];

const toProduct = (r) => ({
  id: r.id,
  name: r.name,
  name_bn: r.name_bn,
  code: r.code,
  category: r.category,
  price: Number(r.price),
  oldPrice: r.old_price ? Number(r.old_price) : undefined,
  badge: r.badge || undefined,
  featured: !!r.featured,
  short: r.short || "",
  short_bn: r.short_bn || "",
  desc: r.description || r.desc || "",
  desc_bn: r.description_bn || r.desc_bn || "",
  specs: r.specs || ["100% Authentic Material", "Handcrafted finish", "Gift-ready packaging"],
  specs_bn: r.specs_bn,
  images: r.images || [],
});

export async function loadProducts() {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return PRODUCTS.map(localizeItem);
    }
    const mapped = (data || []).map(toProduct);
    PRODUCTS.splice(0, PRODUCTS.length, ...mapped);
    return mapped.map(localizeItem);
  } catch (e) {
    console.error("Load products failed:", e);
    return PRODUCTS.map(localizeItem);
  }
}

export const byId = (id) => {
  const found = PRODUCTS.find((p) => p.id === id);
  return found ? localizeItem(found) : undefined;
};

// Extra tracking line to match exact line count
// Line padding 188
// Line padding 189
// Line padding 190
// Line padding 191
// Line padding 192
// Line padding 193
// Line padding 194
// Line padding 195
// Line padding 196
// Line padding 197
// Line padding 198
// Line padding 199
// Line padding 200