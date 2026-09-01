// =============================================================================
// FILE: src/lib/richText/editorjsToHtml.js
// Converts EditorJS's block JSON into an HTML string, then runs it through
// sanitizeHtml() before it's saved. This is the string that actually gets
// written into a table's `description` (or similar) column.
// =============================================================================

import { sanitizeHtml } from "@/lib/sanitizeHtml";

function renderListItems(items = [], style) {
  return items
    .map((item) => {
      // @editorjs/list items can be plain strings or { content, items } for nesting.
      const text = typeof item === "string" ? item : item?.content || "";
      const nested =
        typeof item === "object" && Array.isArray(item.items) && item.items.length
          ? renderList(item.items, style)
          : "";
      return `<li>${text}${nested}</li>`;
    })
    .join("");
}

function renderList(items, style) {
  const tag = style === "ordered" ? "ol" : "ul";
  return `<${tag}>${renderListItems(items, style)}</${tag}>`;
}

function renderTable(content = []) {
  const rows = content
    .map((row, i) => {
      const cellTag = i === 0 ? "th" : "td";
      const cells = (row || []).map((cell) => `<${cellTag}>${cell}</${cellTag}>`).join("");
      return `<tr>${cells}</tr>`;
    })
    .join("");
  return `<table><tbody>${rows}</tbody></table>`;
}

function renderBlock(block) {
  const { type, data = {} } = block;

  switch (type) {
    case "header": {
      const level = Math.min(Math.max(data.level || 2, 1), 6);
      return `<h${level}>${data.text || ""}</h${level}>`;
    }
    case "paragraph":
      return `<p>${data.text || ""}</p>`;
    case "list":
      return renderList(data.items || [], data.style);
    case "checklist": {
      const items = (data.items || [])
        .map((it) => `<li>${it.checked ? "☑" : "☐"} ${it.text || ""}</li>`)
        .join("");
      return `<ul>${items}</ul>`;
    }
    case "quote": {
      const caption = data.caption ? `<footer>${data.caption}</footer>` : "";
      return `<blockquote><p>${data.text || ""}</p>${caption}</blockquote>`;
    }
    case "code":
      return `<pre><code>${escapeHtml(data.code || "")}</code></pre>`;
    case "delimiter":
      return "<hr/>";
    case "warning": {
      const title = data.title ? `<strong>${data.title}</strong><br/>` : "";
      return `<blockquote>${title}${data.message || ""}</blockquote>`;
    }
    case "table":
      return renderTable(data.content);
    case "image": {
      const src = data.file?.url || data.url;
      if (!src) return "";
      const alt = data.caption || "";
      const img = `<img src="${src}" alt="${escapeAttr(alt)}" loading="lazy" />`;
      return data.caption ? `<figure>${img}<figcaption>${data.caption}</figcaption></figure>` : `<figure>${img}</figure>`;
    }
    default:
      return "";
  }
}

function escapeHtml(str = "") {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttr(str = "") {
  return str.replace(/"/g, "&quot;");
}

/** EditorJS OutputData ({ blocks: [...] }) -> sanitized HTML string. */
export function editorjsToHtml(outputData) {
  if (!outputData?.blocks?.length) return "";
  const html = outputData.blocks.map(renderBlock).join("\n");
  return sanitizeHtml(html);
}

export default editorjsToHtml;
