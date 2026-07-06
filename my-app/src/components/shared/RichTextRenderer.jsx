// =============================================================================
// FILE: src/components/shared/RichTextRenderer.jsx
// Renders HTML produced by <RichTextEditor> (or any legacy plain-text
// description) safely on public pages. Always sanitizes right before render,
// regardless of whether the value was already sanitized on save — defense
// in depth in case a field was ever populated another way.
// =============================================================================

import { sanitizeHtml } from "@/lib/sanitizeHtml";

export default function RichTextRenderer({ html, className = "" }) {
  if (!html) return null;
  return (
    <div
      className={`richtext-surface
        [&_h1]:text-2xl [&_h1]:font-black [&_h1]:mb-3 [&_h1]:mt-4
        [&_h2]:text-xl [&_h2]:font-black [&_h2]:mb-2.5 [&_h2]:mt-4
        [&_h3]:text-lg [&_h3]:font-bold [&_h3]:mb-2 [&_h3]:mt-3
        [&_h4]:text-base [&_h4]:font-bold [&_h4]:mb-2 [&_h4]:mt-3
        [&_p]:text-sm [&_p]:leading-relaxed [&_p]:text-slate-700 [&_p]:mb-3
        [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3 [&_li]:text-sm [&_li]:mb-1
        [&_a]:text-blue-700 [&_a]:underline hover:[&_a]:text-blue-900
        [&_blockquote]:border-l-4 [&_blockquote]:border-slate-300 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-slate-600 [&_blockquote]:mb-3
        [&_code]:bg-slate-100 [&_code]:rounded [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-xs [&_code]:font-mono
        [&_pre]:bg-slate-900 [&_pre]:text-slate-100 [&_pre]:rounded-lg [&_pre]:p-3 [&_pre]:overflow-x-auto [&_pre]:mb-3
        [&_figure]:mb-3 [&_img]:rounded-xl [&_img]:max-w-full
        [&_table]:w-full [&_table]:border-collapse [&_table]:mb-3 [&_td]:border [&_th]:border [&_td]:border-slate-200 [&_th]:border-slate-200 [&_td]:p-2 [&_th]:p-2
        [&_hr]:my-4 [&_hr]:border-slate-200
        ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
    />
  );
}
