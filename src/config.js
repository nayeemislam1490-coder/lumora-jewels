// ============================================================
//  SITE SETTINGS  –  edit everything here. The whole site updates.
// ============================================================
export const SITE = {
  name: "VELORIA HOUSE",              // <-- change your website name here
  tagline: "Timeless pieces, made to be treasured",

  // Contact details. Email, address and social links stay hidden on the site until you fill them in.
  phone: "+880 1822908002",
  whatsapp: "8801822908002",          // digits only, with country code, no + or spaces
  email: "veloriahouse.store@gmail.com",
  address: "Dhaka,Bangladesh",
  hours: "Every day, 10:00 am – 9:00 pm",

  // Social links
  facebook: "https://www.facebook.com/share/1APZerdMuN/",                      // e.g. your Facebook page link
  instagram: "https://www.instagram.com/veloriahouse.store?knvt=MXM3dnp3anUwbm84cA==",                     // e.g. your Instagram profile link

  // Money & delivery
  currency: "৳",
  shippingFee: 80,                   // delivery charge (Inside Dhaka)
  outsideDhakaFee: 120,              // delivery charge (Outside Dhaka)
  freeShippingOver: 999,             // free delivery above this order total
  deliveryTime: "2–4 working days",
  returnDays: 3,                      // exchange / return window in days

  // Mobile payment instruction shown at checkout (bKash / Nagad etc.)
  mobilePayment: "Send money to 01314415659 (bKash / Nagad), then share the transaction ID on WhatsApp.",
};

export const BD_DISTRICTS = [
  "Dhaka",
  "Bagerhat", "Bandarban", "Barguna", "Barishal", "Bhola", "Bogura", "Brahmanbaria",
  "Chandpur", "Chapainawabganj", "Chattogram", "Chuadanga", "Cox's Bazar", "Cumilla",
  "Dinajpur", "Faridpur", "Feni", "Gaibandha", "Gazipur", "Gopalganj", "Habiganj",
  "Jamalpur", "Jashore", "Jhalokati", "Jhenaidah", "Joypurhat", "Khagrachhari", "Khulna",
  "Kishoreganj", "Kurigram", "Kushtia", "Lakshmipur", "Lalmonirhat", "Madaripur", "Magura",
  "Manikganj", "Meherpur", "Moulvibazar", "Munshiganj", "Mymensingh", "Naogaon", "Narail",
  "Narayanganj", "Narsingdi", "Natore", "Netrokona", "Nilphamari", "Noakhali", "Pabna",
  "Panchagarh", "Patuakhali", "Pirojpur", "Rajbari", "Rajshahi", "Rangamati", "Rangpur",
  "Satkhira", "Shariatpur", "Sherpur", "Sirajganj", "Sunamganj", "Sylhet", "Tangail",
  "Thakurgaon",
];

export const getShippingFee = (district = "Dhaka", subtotal = 0) => {
  const cleanSubtotal = Math.max(0, Number(subtotal) || 0);
  if (cleanSubtotal > Number(SITE.freeShippingOver || 0)) return 0;
  const normalized = String(district || "Dhaka").trim().toLowerCase();
  return normalized === "dhaka"
    ? Number(SITE.shippingFee) || 80
    : Number(SITE.outsideDhakaFee) || 120;
};

export const money = (n) => `${SITE.currency} ${Number(n).toLocaleString("en-US")}`;

export const hasPlaceholderWhatsapp = () => SITE.whatsapp.toUpperCase().includes("X");