export const PAYSTACK_URL = "https://paystack.shop/pay/axyswear";
export const TIKTOK_URL = "https://www.tiktok.com/@axys.co?_r=1&_t=ZS-9779B8nWd8v";
export const CONTACT_EMAIL = "Axysclothin@gmail.com";

export type Product = {
  id: string;
  name: string;
  price: number;
  colors: string[];
  description: string;
};

export const SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;

export const PRODUCTS: Product[] = [
  {
    id: "signature-tee",
    name: "AXYS Signature Tee",
    price: 500,
    colors: ["Black", "White"],
    description:
      "A premium heavyweight tee designed for everyday excellence. Clean, timeless, and built to represent the AXYS standard.",
  },
  {
    id: "barcode-tee",
    name: "AXYS Barcode Tee",
    price: 500,
    colors: ["Black", "White", "Dusty Pink"],
    description:
      "A statement piece combining minimal design with bold identity. Created for those who move differently.",
  },
];

export const DELIVERY_FEE = 80;
