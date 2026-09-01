// src/components/shared/Button.jsx
//
// One button implementation for the whole app. Every page currently hand-
// writes its own button className string (gradient + shadow + hover combo
// repeated dozens of times across ContactForm, contact/page.js, product
// cards, admin modals...). This centralizes that into variants so a design
// tweak is a one-line change here instead of a find-and-replace across the
// codebase, and it ships one small component instead of N duplicated
// class strings in the bundle.
//
// USAGE
//   <Button>Send Message</Button>
//   <Button variant="outline" size="sm">Cancel</Button>
//   <Button variant="ghost" loading={submitting}>Save</Button>
//   <Button as="a" href="/products" variant="secondary">Browse</Button>

"use client";

import { forwardRef } from "react";
import { cva } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

const buttonStyles = cva(
  "inline-flex items-center justify-center gap-2 font-black transition-all disabled:opacity-60 disabled:cursor-not-allowed rounded-xl",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-r from-blue-950 to-blue-800 text-white shadow-lg hover:shadow-xl hover:opacity-90",
        secondary:
          "bg-gradient-to-r from-[#6a9a01] to-green-900 text-white shadow-lg hover:shadow-xl hover:opacity-90",
        outline:
          "border-2 border-blue-950 text-blue-950 bg-white hover:bg-blue-950 hover:text-white",
        ghost: "text-slate-600 hover:bg-slate-100",
        danger: "bg-red-600 text-white hover:bg-red-700",
      },
      size: {
        sm: "text-xs px-4 py-2",
        md: "text-sm px-6 py-3",
        lg: "text-sm py-4 px-8",
        icon: "p-2.5",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

const Button = forwardRef(function Button(
  { as: Tag = "button", className, variant, size, fullWidth, loading, disabled, children, ...props },
  ref
) {
  return (
    <Tag
      ref={ref}
      className={cn(buttonStyles({ variant, size, fullWidth }), className)}
      disabled={Tag === "button" ? disabled || loading : undefined}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <Loader2 className="animate-spin" size={16} />}
      {children}
    </Tag>
  );
});

export default Button;
