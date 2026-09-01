// src/components/shared/Card.jsx
//
// One "card" implementation shared across BrandCard, EmployeeCard, product
// tiles, dashboard stat tiles, FAQ tiles, etc. Right now each of those
// re-declares the same border/radius/shadow/hover combo (and some also ship
// a private <style jsx> block). This is a compound component: use <Card> on
// its own for a simple tile, or pull in the sub-parts for anything richer.
// It doesn't replace the 3D-tilt logic in BrandCard.jsx (that's a genuinely
// distinct interaction) — but any *new* card, and any of the plainer
// existing ones, should build on this instead of re-writing the shell.
//
// USAGE
//   <Card hover>
//     <Card.Image src={brand.logo} alt={brand.brandName} />
//     <Card.Body>
//       <Card.Title>{brand.brandName}</Card.Title>
//       <Card.Description>{brand.tagline}</Card.Description>
//     </Card.Body>
//     <Card.Footer>{brand.website}</Card.Footer>
//   </Card>
//
//   // as a link (Next.js <Link>), same shell:
//   <Card as={Link} href={`/brands/${brand.slug}`} hover>...</Card>

"use client";

import { cn } from "@/lib/cn";

export default function Card({ as: Tag = "div", hover = false, className, children, ...props }) {
  return (
    <Tag
      className={cn(
        "group relative block bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm transition-shadow duration-300",
        hover && "hover:shadow-2xl",
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}

Card.Image = function CardImage({ src, alt = "", className, imgClassName, fallback, ...props }) {
  return (
    <div className={cn("h-36 flex items-center justify-center p-6 bg-white", className)}>
      <img
        src={src}
        alt={alt}
        className={cn("w-full h-full object-contain", imgClassName)}
        onError={(e) => {
          if (fallback) e.currentTarget.src = fallback;
        }}
        {...props}
      />
    </div>
  );
};

Card.Body = function CardBody({ className, children, ...props }) {
  return (
    <div className={cn("p-5 space-y-2", className)} {...props}>
      {children}
    </div>
  );
};

Card.Title = function CardTitle({ className, children, ...props }) {
  return (
    <h3 className={cn("text-base font-black text-slate-900 truncate", className)} {...props}>
      {children}
    </h3>
  );
};

Card.Description = function CardDescription({ className, children, ...props }) {
  return (
    <p className={cn("text-sm text-slate-500 line-clamp-2", className)} {...props}>
      {children}
    </p>
  );
};

Card.Footer = function CardFooter({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "px-3 py-2 bg-slate-50 border-t border-slate-100 text-[11px] font-bold text-slate-700 text-center truncate",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
