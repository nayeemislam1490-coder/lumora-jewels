// ============================================================
//  SITE SETTINGS  –  edit everything here. The whole site updates.
// ============================================================
export const SITE = {
  name: "Lumora Jewels",              // <-- change your website name here
  tagline: "Timeless pieces, made to be treasured",

  // Contact details. Email, address and social links stay hidden on the site until you fill them in.
  phone: "+880 1822908002",
  whatsapp: "8801822908002",          // digits only, with country code, no + or spaces
  email: "",
  address: "",
  hours: "Every day, 10:00 am – 9:00 pm",

  // Social links
  facebook: "",                      // e.g. your Facebook page link
  instagram: "",                     // e.g. your Instagram profile link

  // Money & delivery
  currency: "৳",
  shippingFee: 100,                   // delivery charge
  freeShippingOver: 3000,             // free delivery above this order total
  deliveryTime: "2–4 working days",
  returnDays: 7,                      // exchange / return window in days

  // Mobile payment instruction shown at checkout (bKash / Nagad etc.)
  mobilePayment: "Send money to 01822908002 (bKash / Nagad), then share the transaction ID on WhatsApp.",
};

export const money = (n) => `${SITE.currency} ${Number(n).toLocaleString("en-US")}`;

export const hasPlaceholderWhatsapp = () => SITE.whatsapp.toUpperCase().includes("X");
