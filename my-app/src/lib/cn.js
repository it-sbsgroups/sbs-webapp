// src/lib/cn.js
//
// Standard clsx + tailwind-merge combinator. Both packages are already
// in package.json (clsx, tailwind-merge) but nothing in the repo wires
// them together yet — every shared component below uses this so that
// callers can override default classes (e.g. <Card className="p-0">)
// without fighting Tailwind's class-order specificity.

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
