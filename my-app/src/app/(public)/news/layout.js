export const metadata = {
  title: "Newsroom",
  description:
    "Latest news, product launches, and industry updates from SBS Groups — your trusted B2B industrial supply partner.",
  alternates: { canonical: "/news" },
  openGraph: {
    title: "Newsroom | SBS Groups",
    description: "Latest news, product launches, and industry updates from SBS Groups.",
    type: "website",
  },
};

export default function NewsLayout({ children }) {
  return children;
}
