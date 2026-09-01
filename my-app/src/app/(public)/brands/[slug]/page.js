// Server component wrapper — provides SEO metadata server-side, then renders
// the full interactive client experience unchanged. See BrandDetailClient.jsx
// (it reads the :slug param itself via useParams()).
import BrandDetailClient from "./BrandDetailClient";

async function fetchBrand(slug) {
  try {
    const base = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
    const res = await fetch(`${base}/brands/slug/${encodeURIComponent(slug)}`, {
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
  const { slug } = await params;
  const brand = await fetchBrand(slug);
  if (!brand) return { title: "Brand Not Found" };

  const title = `${brand.name} — ${brand.isOwnBrand ? "Own Brand" : "Authorized Distributor"}`;
  const description =
    stripHtml(brand.description).slice(0, 160) ||
    `Explore ${brand.name} products, catalogues and support — available through SBS Groups.`;
  const image = brand.logo;

  return {
    title,
    description,
    alternates: { canonical: `/brands/${slug}` },
    openGraph: {
      title,
      description,
      type: "website",
      ...(image ? { images: [{ url: image }] } : {}),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

export default function Page() {
  return <BrandDetailClient />;
}
