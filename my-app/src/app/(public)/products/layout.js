export const metadata = {
  title: "Industrial Products Catalog",
  description:
    "Browse SBS Groups' full catalog of industrial hardware, safety equipment, and B2B supplies. Request quotes, download brochures, and find products by category or brand.",
  alternates: { canonical: "/products" },
  openGraph: {
    title: "Industrial Products Catalog | SBS Groups",
    description:
      "Browse SBS Groups' full catalog of industrial hardware, safety equipment, and B2B supplies.",
    type: "website",
  },
};

export default function ProductsLayout({ children }) {
  return children;
}
