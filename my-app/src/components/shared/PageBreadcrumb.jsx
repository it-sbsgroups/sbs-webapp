"use client";

import { useEffect, useState } from "react";
import Breadcrumb from "./Breadcrumb";
import siteConfigApi from "@/lib/siteConfig/siteConfigApi";

// Drop-in replacement for <Breadcrumb> that additionally pulls its
// background image from the admin-managed "breadcrumbBanners" site-config
// key (Site Config → Breadcrumb Banners tab). Pass the same `title`/`items`
// props as before, plus `pageKey` matching one of BREADCRUMB_PAGES in
// components/admin/site-config/BreadcrumbBannerManager.jsx.
//
// Falls back to the existing gradient (or an explicitly-passed
// backgroundImage) if no banner has been assigned for that page yet.
export default function PageBreadcrumb({ pageKey, backgroundImage, ...rest }) {
  const [bannerImage, setBannerImage] = useState(backgroundImage || null);

  useEffect(() => {
    let active = true;
    if (!pageKey) return;
    siteConfigApi.getBreadcrumbBanners().then((banners) => {
      if (!active) return;
      const img = banners?.[pageKey]?.image;
      if (img) setBannerImage(img);
    }).catch(() => {});
    return () => { active = false; };
  }, [pageKey]);

  return <Breadcrumb {...rest} backgroundImage={bannerImage} />;
}
