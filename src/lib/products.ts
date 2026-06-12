export const PAYSTACK_URL = "https://paystack.shop/pay/axyswear";
export const TIKTOK_URL = "https://www.tiktok.com/@axys.co?_r=1&_t=ZS-9779B8nWd8v";
export const CONTACT_EMAIL = "Axysclothin@gmail.com";

export type Product = {
  id: string;
  name: string;
  price: number;
  colors: string[];
  tagline: string;
  shortDescription: string;
  longDescription: string;
  features: string[];
};

export const SIZES = ["S", "M", "L", "XL"] as const;
export type Size = typeof SIZES[number];

export const SIZE_CHART: { size: Size; chest: number; length: number }[] = [
  { size: "S", chest: 54, length: 70 },
  { size: "M", chest: 57, length: 73 },
  { size: "L", chest: 60, length: 76 },
  { size: "XL", chest: 63, length: 79 },
];

export const FIT_NOTES = [
  "Relaxed oversized silhouette",
  "Premium heavyweight cotton",
  "True-to-size oversized fit",
  "Size down for a more fitted look",
  "Size up for an extra oversized streetwear fit",
];

export const SHIPPING_INFO = [
  "Processing Time: 1–3 Business Days",
  "Delivery Time: 2–7 Business Days",
  "Tracking Provided After Dispatch",
  "Secure Checkout Available",
];

export const PRODUCTS: Product[] = [
  {
    id: "signature-tee",
    name: "AXYS Signature Tee",
    price: 500,
    colors: ["Black", "White"],
    tagline: "Built From Pressure. Driven By Vision.",
    shortDescription:
      "Premium heavyweight cotton with the iconic AXYS Signature back graphic.",
    longDescription:
      "The AXYS Signature Tee is crafted from premium heavyweight cotton and designed for those building something bigger than themselves. Featuring the iconic AXYS Signature back graphic, this piece combines bold identity with everyday versatility.\n\nEvery detail has been considered to deliver structure, comfort, and a premium streetwear silhouette that stands out without chasing trends.\n\nWhether worn as a statement piece or part of your daily uniform, the Signature Tee represents ambition, resilience, and forward movement.",
    features: [
      "Premium heavyweight cotton construction",
      "Relaxed oversized fit",
      "Signature AXYS back graphic",
      "Soft-touch premium finish",
      "Durable high-quality print",
      "Reinforced stitching",
      "Made in South Africa",
      "Limited first release",
    ],
  },
  {
    id: "barcode-tee",
    name: "AXYS Barcode Tee",
    price: 500,
    colors: ["Black", "White", "Dusty Pink"],
    tagline: "Identity. Ambition. Progress.",
    shortDescription:
      "Clean premium silhouette finished with exclusive AXYS Barcode artwork.",
    longDescription:
      "The AXYS Barcode Tee represents the journey of individuals creating their own path. Designed with a clean premium silhouette and finished with exclusive AXYS Barcode artwork, this piece reflects modern streetwear through simplicity and purpose.\n\nConstructed from heavyweight cotton for superior comfort and durability, it is designed to become an everyday essential while maintaining a premium feel.",
    features: [
      "Premium heavyweight cotton construction",
      "Relaxed oversized fit",
      "Exclusive AXYS Barcode artwork",
      "Soft-touch premium finish",
      "Durable high-quality print",
      "Reinforced stitching",
      "Made in South Africa",
      "Limited first release",
    ],
  },
];

export const DELIVERY_FEE = 80;
