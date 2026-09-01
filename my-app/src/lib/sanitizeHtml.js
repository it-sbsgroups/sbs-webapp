import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitize an HTML string before injecting via dangerouslySetInnerHTML.
 * Keeps a safe formatting subset (including what RichTextEditor produces:
 * images, tables, headings, lists, marker highlights) — strips scripts,
 * event handlers, iframes/embeds/forms, and dangerous URL schemes.
 * Works on both server (SSR) and client.
 */
export function sanitizeHtml(dirty) {
  if (!dirty || typeof dirty !== "string") return "";
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      "p", "br", "b", "i", "strong", "em", "u", "s", "del", "mark",
      "ul", "ol", "li", "a", "h1", "h2", "h3", "h4", "h5", "h6",
      "blockquote", "code", "pre", "span", "hr",
      "img", "figure", "figcaption",
      "table", "thead", "tbody", "tr", "th", "td",
    ],
    ALLOWED_ATTR: ["href", "target", "rel", "src", "alt", "loading", "class", "width", "height"],
    FORBID_TAGS: ["script", "style", "iframe", "object", "embed", "form", "input", "button"],
    FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover", "style"],
  });
}

export default sanitizeHtml;
