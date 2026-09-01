// Server component wrapper — provides SEO metadata server-side, then renders
// the full interactive client experience unchanged. See ClientDetailClient.jsx
// (it reads the :slug param itself via useParams()).
import ClientDetailClient from "./ClientDetailClient";

async function fetchClient(slug) {
  try {
    const base = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
    const res = await fetch(`${base}/clients/public/${encodeURIComponent(slug)}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data ?? json ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const client = await fetchClient(slug);
  if (!client) return { title: "Client Not Found" };

  const title = `${client.companyName} — Client Story`;
  const description = `See how ${client.companyName} partners with SBS Groups${client.contactName ? ` — ${client.contactName}` : ""}.`;
  const image = client.logo;

  return {
    title,
    description,
    alternates: { canonical: `/clients/${slug}` },
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
  return <ClientDetailClient />;
}
