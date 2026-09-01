import sanitizeHtml from 'sanitize-html';

// Minimal entity decode so stripped plain-text stays human-readable
// (sanitize-html escapes stray <, >, & — we restore them after tags are gone).
const ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&#x27;': "'",
  '&nbsp;': ' ',
};
function decodeEntities(s: string): string {
  return s.replace(/&amp;|&lt;|&gt;|&quot;|&#39;|&#x27;|&nbsp;/g, (m) => ENTITIES[m]);
}

/**
 * Plain-text sanitizer: removes ALL tags (and the contents of script/style),
 * neutralizing XSS while keeping readable text. Use for names, emails, remarks,
 * comments, testimony, addresses, config values — anything not rendered as HTML.
 */
export function stripToText(input: string): string {
  if (typeof input !== 'string') return input;
  const clean = sanitizeHtml(input, {
    allowedTags: [],
    allowedAttributes: {},
    disallowedTagsMode: 'discard',
  });
  return decodeEntities(clean).trim();
}

/**
 * Rich-text sanitizer: keeps a safe formatting subset, drops scripts, event
 * handlers, iframes, and dangerous URL schemes. Use only for fields that are
 * intentionally rendered as HTML (e.g. a CMS body / FAQ answerHtml).
 */
export function sanitizeRich(input: string): string {
  if (typeof input !== 'string') return input;
  return sanitizeHtml(input, {
    allowedTags: [
      'p', 'br', 'b', 'i', 'strong', 'em', 'u', 's', 'ul', 'ol', 'li',
      'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre', 'span',
    ],
    allowedAttributes: { a: ['href', 'target', 'rel'] },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }),
    },
  });
}
