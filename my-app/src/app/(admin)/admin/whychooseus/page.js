"use client";

// This route is kept for backward compatibility (old bookmarks/links).
// The actual editor now also lives inside Site Configuration →
// "Why Choose Us" tab (/admin/site-config?tab=whyChooseUs) so it can be
// managed alongside the rest of the site's central configuration, per the
// "integrate Why Choose Us into Site Config" requirement. Both routes render
// the same underlying component so there is a single source of truth.
import WhyChooseUsManager from "@/components/admin/whychooseus/WhyChooseUsManager";

export default function AdminWhyChooseUsPage() {
  return <WhyChooseUsManager />;
}
