"use client";

// =============================================================================
// FILE: src/components/shared/RichTextEditor.jsx
//
// Drop-in rich text editor for any "description"-style field. Renders an
// EditorJS instance with headings, bold/italic/underline/link (built into
// EditorJS's native inline toolbar), ordered & unordered lists, checklists,
// images (uploaded straight to Cloudinary via the existing /uploads/image
// endpoint), quotes, code blocks, tables, delimiters, and highlight marker.
//
// USAGE — this component does NOT call any API itself. It just gives you
// clean HTML; you save it to whichever table/field it belongs to:
//
//   const [description, setDescription] = useState(product.description || "");
//   <RichTextEditor value={description} onChange={setDescription} />
//   ...
//   await productsApi.update(id, { description });
//
// =============================================================================

import { useEffect, useRef, useState, useCallback } from "react";
import { editorjsToHtml } from "@/lib/richText/editorjsToHtml";
import { htmlToEditorBlocks } from "@/lib/richText/htmlToEditorBlocks";

/**
 * @param {string} value - Current HTML (e.g. product.description). Only read on mount / when `resetKey` changes.
 * @param {(html: string) => void} onChange - Fired (debounced) with sanitized HTML on every edit.
 * @param {string} [placeholder]
 * @param {string} [uploadFolder] - Cloudinary folder for images added in this editor instance.
 * @param {boolean} [readOnly]
 * @param {string|number} [resetKey] - Change this (e.g. the record's id) to force the editor to reload `value` — needed when reusing one <RichTextEditor> across different records (e.g. switching which product you're editing in a modal).
 */
export default function RichTextEditor({
  value = "",
  onChange,
  placeholder = "Start writing…",
  uploadFolder = "rich-text",
  readOnly = false,
  resetKey,
}) {
  const holderRef = useRef(null);
  const editorRef = useRef(null);
  const debounceRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);

  const emitChange = useCallback(async () => {
    if (!editorRef.current || !onChange) return;
    try {
      const output = await editorRef.current.save();
      onChange(editorjsToHtml(output));
    } catch {
      // EditorJS occasionally throws if save() is called mid-destroy; safe to ignore.
    }
  }, [onChange]);

  const scheduleEmit = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(emitChange, 400);
  }, [emitChange]);

  useEffect(() => {
    let destroyed = false;

    (async () => {
      // EditorJS + its tools touch the DOM directly — must load client-side only.
      const [{ default: EditorJS }, { buildEditorTools }] = await Promise.all([
        import("@editorjs/editorjs"),
        import("@/lib/richText/editorTools"),
      ]);
      if (destroyed) return;

      const initialData = htmlToEditorBlocks(value);

      const instance = new EditorJS({
        holder: holderRef.current,
        placeholder,
        readOnly,
        data: initialData,
        tools: buildEditorTools({ uploadFolder }),
        onChange: scheduleEmit,
        onReady: () => setReady(true),
      });
      editorRef.current = instance;
    })().catch((e) => setError(e?.message || "Failed to load the editor."));

    return () => {
      destroyed = true;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (editorRef.current?.destroy) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
      setReady(false);
    };
    // Re-mount the whole editor when switching records (resetKey) — EditorJS
    // has no clean "replace all content" API, so a fresh instance is safest.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  return (
    <div className="rounded-xl border border-slate-300 bg-white overflow-hidden">
      <div className="flex items-center gap-1.5 border-b border-slate-200 bg-slate-50 px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-slate-400">
        <span>Rich Text</span>
        <span className="text-slate-300">·</span>
        <span className="font-normal normal-case text-slate-400">
          Headings, bold/italic, links, lists, images, quotes, code, tables — select text or press "+" for the block menu
        </span>
      </div>

      {error && (
        <div className="px-4 py-3 text-xs text-red-600 bg-red-50">{error}</div>
      )}
      {!ready && !error && (
        <div className="px-4 py-6 text-xs text-slate-400">Loading editor…</div>
      )}

      <div
        ref={holderRef}
        className="richtext-surface px-4 py-3 min-h-[180px]
          [&_.ce-block]:mb-3
          [&_h1]:text-2xl [&_h1]:font-black [&_h1]:mb-2
          [&_h2]:text-xl [&_h2]:font-black [&_h2]:mb-2
          [&_h3]:text-lg [&_h3]:font-bold [&_h3]:mb-1.5
          [&_h4]:text-base [&_h4]:font-bold [&_h4]:mb-1.5
          [&_p]:text-sm [&_p]:leading-relaxed [&_p]:text-slate-700
          [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:text-sm [&_li]:mb-1
          [&_a]:text-blue-700 [&_a]:underline
          [&_blockquote]:border-l-4 [&_blockquote]:border-slate-300 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-slate-600
          [&_code]:bg-slate-100 [&_code]:rounded [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-xs [&_code]:font-mono
          [&_pre]:bg-slate-900 [&_pre]:text-slate-100 [&_pre]:rounded-lg [&_pre]:p-3 [&_pre]:overflow-x-auto
          [&_img]:rounded-lg [&_img]:max-w-full
          [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_th]:border [&_td]:border-slate-200 [&_th]:border-slate-200 [&_td]:p-2 [&_th]:p-2"
        style={{ display: ready || error ? "block" : "none" }}
      />
    </div>
  );
}
