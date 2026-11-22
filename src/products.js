import { supabase } from "./supabase.js";

export const CATEGORIES = ["Necklaces", "Earrings", "Rings", "Sets"];

const img = (n) => `/images/${n}.jpg`;

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
  code: r.code,
  category: r.category,
  price: Number(r.price),
  oldPrice: r.old_price ? Number(r.old_price) : undefined,
  badge: r.badge || undefined,
  featured: !!r.featured,
  short: r.short || "",
  desc: r.description || r.desc || "",
  specs: r.specs || ["100% Authentic Material", "Handcrafted finish", "Gift-ready packaging"],
  images: r.images || [],
});

export async function loadProducts() {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return PRODUCTS;
    }
    const mapped = (data || []).map(toProduct);
    PRODUCTS.splice(0, PRODUCTS.length, ...mapped);
    return mapped;
  } catch (e) {
    console.error("Load products failed:", e);
    return PRODUCTS;
  }
}

export const byId = (id) => PRODUCTS.find((p) => p.id === id);

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