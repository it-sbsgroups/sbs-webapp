// =============================================================================
// FILE: src/lib/richText/editorTools.js
// EditorJS tool configuration shared by every RichTextEditor instance across
// the admin panel. All packages here are already in package.json — nothing
// new to install.
//
// Deliberately NOT included: @editorjs/embed / @editorjs/raw. Both let an
// editor inject an <iframe> or arbitrary raw HTML, which sanitizeHtml()
// intentionally strips site-wide for security. Adding them back would mean
// weakening that allowlist everywhere the sanitized HTML is rendered.
// =============================================================================

import Header from "@editorjs/header";
import ListTool from "@editorjs/list";
import ImageTool from "@editorjs/image";
import Checklist from "@editorjs/checklist";
import Quote from "@editorjs/quote";
import CodeTool from "@editorjs/code";
import Delimiter from "@editorjs/delimiter";
import InlineCode from "@editorjs/inline-code";
import Marker from "@editorjs/marker";
import TableTool from "@editorjs/table";
import Warning from "@editorjs/warning";
import { uploadImage } from "@/lib/uploadApi";

/**
 * @param {object} opts
 * @param {string} [opts.uploadFolder] - Cloudinary folder for images pasted/uploaded in this editor.
 */
export function buildEditorTools({ uploadFolder = "rich-text" } = {}) {
  return {
    header: {
      class: Header,
      inlineToolbar: true,
      config: { levels: [1, 2, 3, 4], defaultLevel: 2 },
    },
    list: {
      class: ListTool,
      inlineToolbar: true,
      config: { defaultStyle: "unordered" }, // toggle to "ordered" per-block from the block's own settings
    },
    checklist: { class: Checklist, inlineToolbar: true },
    quote: { class: Quote, inlineToolbar: true },
    code: { class: CodeTool },
    delimiter: Delimiter,
    inlineCode: { class: InlineCode },
    marker: { class: Marker },
    table: { class: TableTool, inlineToolbar: true },
    warning: { class: Warning, inlineToolbar: true },
    image: {
      class: ImageTool,
      config: {
        uploader: {
          async uploadByFile(file) {
            const url = await uploadImage(file, uploadFolder);
            return { success: 1, file: { url } };
          },
          async uploadByUrl(url) {
            // Trusted admin-entered URL — pass through as-is.
            return { success: 1, file: { url } };
          },
        },
      },
    },
  };
}

export default buildEditorTools;
