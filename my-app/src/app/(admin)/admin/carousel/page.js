"use client";

// The Hero Carousel manager moved into Site Configuration (as of this
// change) so it's grouped with the rest of the site's content blocks
// instead of sitting in its own top-level nav item. This route is kept
// as a redirect so old bookmarks/links to /admin/carousel still work.

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CarouselRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/site-config?tab=carousel");
  }, [router]);

  return (
    <div className="flex h-[60vh] items-center justify-center text-sm text-slate-500">
      Hero Carousel has moved to Site Configuration — redirecting…
    </div>
  );
}
