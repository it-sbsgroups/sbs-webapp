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

const FALLBACK_BRANDING = {
  companyName: "Superb Bearing Store",
  tagline: "Industrial Solutions",
  faviconUrl: "",
};

async function fetchBranding() {
  try {
    const base =
      process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
    const res = await fetch(`${base}/site/branding`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data ?? json ?? null;
  } catch {
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
