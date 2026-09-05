import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Same fallback shape as DEFAULT_BRANDING in lib/siteConfig/siteConfigApi.js.
const FALLBACK_BRANDING = {
  companyName: "Superb Bearing Store",
  tagline: "Industrial Solutions",
  faviconUrl: "",
};

async function fetchBranding() {
  try {
    const base = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
    // The admin "Company Branding" page (LogoManager.jsx) saves into the
    // single `header` config blob's `branding` section — via /site/header,
    // see src/lib/headerSections.js. It does NOT write to /site/branding
    // (that route exists on the backend but nothing on the frontend ever
    // calls its PUT), so reading from /site/branding here always returned
    // nothing and the favicon/company name silently fell back to the
    // hardcoded defaults below. Read from the same place the admin panel
    // actually writes to instead.
    const res = await fetch(`${base}/site/header`, {
      // Revalidate every 5 min — dynamic without hitting the backend on every request.
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    const header = json?.data ?? json ?? null;
    return header?.branding ?? null;
  } catch {
    // Backend unreachable at build/request time — fall back gracefully rather
    // than breaking the whole site's <head>.
    return null;
  }
}

export async function generateMetadata() {
  const branding = await fetchBranding();
  const companyName = branding?.companyName || FALLBACK_BRANDING.companyName;
  const tagline = branding?.tagline || FALLBACK_BRANDING.tagline;
  const faviconUrl = branding?.faviconUrl || FALLBACK_BRANDING.faviconUrl;

  return {
    title: {
      default: `${companyName} — ${tagline}`,
      template: `%s | ${companyName}`,
    },
    description: `${companyName} is a B2B industrial supplier — ${tagline}.`,
    ...(faviconUrl ? { icons: { icon: faviconUrl } } : {}),
  };
}

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}