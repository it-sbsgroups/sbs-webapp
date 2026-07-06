// =============================================================================
// FILE: src/lib/richText/htmlToEditorBlocks.js
// Rehydrates a RichTextEditor instance from HTML that was saved to the DB
// (by editorjsToHtml, or even just plain legacy text). Only runs in the
// browser (uses DOMParser).
// =============================================================================

let blockId = 0;
const nextId = () => `b${Date.now()}${blockId++}`;

function listToBlock(el) {
  const style = el.tagName.toLowerCase() === "ol" ? "ordered" : "unordered";
  const items = Array.from(el.children)
    .filter((li) => li.tagName === "LI")
    .map((li) => li.innerHTML.trim());
  return { id: nextId(), type: "list", data: { style, items } };
}

function elementToBlock(el) {
  const tag = el.tagName.toLowerCase();

  if (/^h[1-6]$/.test(tag)) {
    return { id: nextId(), type: "header", data: { text: el.innerHTML.trim(), level: Number(tag[1]) } };
  }
  if (tag === "p") {
    return { id: nextId(), type: "paragraph", data: { text: el.innerHTML.trim() } };
  }
  if (tag === "ul" || tag === "ol") {
    return listToBlock(el);
  }
  if (tag === "blockquote") {
    const footer = el.querySelector("footer");
    const caption = footer ? footer.innerHTML.trim() : "";
    const text = el.querySelector("p")?.innerHTML.trim() ?? el.innerHTML.replace(/<footer>.*<\/footer>/, "").trim();
    return { id: nextId(), type: "quote", data: { text, caption, alignment: "left" } };
  }
  if (tag === "pre") {
    return { id: nextId(), type: "code", data: { code: el.querySelector("code")?.textContent || el.textContent || "" } };
  }
  if (tag === "hr") {
    return { id: nextId(), type: "delimiter", data: {} };
  }
  if (tag === "figure") {
    const img = el.querySelector("img");
    const caption = el.querySelector("figcaption")?.innerHTML.trim() || "";
    if (!img) return null;
    return {
      id: nextId(),
      type: "image",
      data: { file: { url: img.getAttribute("src") }, caption, withBorder: false, withBackground: false, stretched: false },
    };
  }
  if (tag === "table") {
    const rows = Array.from(el.querySelectorAll("tr")).map((tr) =>
      Array.from(tr.children).map((cell) => cell.innerHTML.trim())
    );
    return { id: nextId(), type: "table", data: { withHeadings: true, content: rows } };
  }
  // Unknown tag — fall back to a paragraph so nothing is silently lost.
  if (el.textContent?.trim()) {
    return { id: nextId(), type: "paragraph", data: { text: el.innerHTML.trim() } };
  }
  return null;
}

/** HTML string (previously saved) -> EditorJS OutputData ({ time, blocks, version }). */
export function htmlToEditorBlocks(html) {
  const empty = { time: Date.now(), blocks: [], version: "2.31.6" };
  if (!html || typeof html !== "string" || typeof window === "undefined") return empty;

  const trimmed = html.trim();
  if (!trimmed) return empty;

  // Legacy plain-text description (no HTML tags at all) — wrap as one paragraph.
  if (!/^</.test(trimmed)) {
    return { time: Date.now(), blocks: [{ id: nextId(), type: "paragraph", data: { text: trimmed } }], version: "2.31.6" };
  }

  const doc = new DOMParser().parseFromString(trimmed, "text/html");
  const blocks = Array.from(doc.body.children)
    .map(elementToBlock)
    .filter(Boolean);

  return { time: Date.now(), blocks, version: "2.31.6" };
}

export default htmlToEditorBlocks;
