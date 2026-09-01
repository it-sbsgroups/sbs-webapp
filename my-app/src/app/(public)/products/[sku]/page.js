// src/app/(public)/products/[sku]/page.js

import ProductDetailClient from "./ProductDetailClient";

async function fetchProduct(sku) {
  try {
    const base = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
    const res = await fetch(`${base}/products/${encodeURIComponent(sku)}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data ?? json ?? null;
  } catch {
    return null;
  }
}

const stripHtml = (html) =>
  (html || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

export async function generateMetadata({ params }) {
  const { sku } = await params;
  const product = await fetchProduct(sku);
  if (!product) {
    return { title: "Product Not Found" };
  }

  const title = product.metaTitle?.trim() || `${product.name}${product.model ? ` – ${product.model}` : ""}`;
  const description =
    product.metaDescription?.trim() ||
    stripHtml(product.description).slice(0, 160) ||
    `${product.name} — available from SBS Groups. Request a quote today.`;

  // Fix: Ensure OG image URL is absolute
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sbsgroups.co.in";
  const ogImage = product.images?.[0]?.url
    ? product.images[0].url.startsWith("http")
      ? product.images[0].url
      : `${baseUrl}${product.images[0].url}`
    : `${baseUrl}/og-default.png`; // fallback

  return {
    title,
    description,
    alternates: { canonical: `/products/${sku}` },
    openGraph: {
      title,
      description,
      type: "website",
      url: `${baseUrl}/products/${sku}`,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default function Page() {
  return <ProductDetailClient />;
}