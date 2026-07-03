import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitize an HTML string before injecting via dangerouslySetInnerHTML.
 * Keeps a safe formatting subset; strips scripts, event handlers, and
 * dangerous URL schemes. Works on both server (SSR) and client.
 */
export function sanitizeHtml(dirty) {
  if (!dirty || typeof dirty !== "string") return "";
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      "p", "br", "b", "i", "strong", "em", "u", "s", "ul", "ol", "li",
      "a", "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "code", "pre", "span",
    ],
    ALLOWED_ATTR: ["href", "target", "rel"],
    FORBID_TAGS: ["script", "style", "iframe", "object", "embed", "form"],
    FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover", "style"],
  });
}

export default sanitizeHtml;
