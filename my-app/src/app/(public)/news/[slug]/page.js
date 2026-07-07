"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import publicNewsApi from "@/lib/news/publicNewsApi";
import productsApi from "@/lib/productsApi";
// import breadcrumb from "@/components/shared/Breadcrumb";

const fmtDate = (iso) => {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const firstProductImage = (p) => {
  const img = Array.isArray(p?.images) ? p.images.find((i) => i?.url) : null;
  return img?.url || "";
};

// ─── Lightbox for full-size gallery viewing ───────────────────────────────────
function Lightbox({ images, index, onClose, onNav }) {
  if (index === null) return null;
  const img = images[index];
  return (
    <div className="fixed inset-0 z-[999] bg-black/90 flex items-center justify-center p-4" onClick={onClose}>
      <button onClick={onClose} className="absolute top-5 right-5 text-white/70 hover:text-white text-2xl font-bold">✕</button>
      {index > 0 && (
        <button onClick={(e) => { e.stopPropagation(); onNav(index - 1); }}
          className="absolute left-3 sm:left-6 text-white/60 hover:text-white text-3xl font-bold px-2">‹</button>
      )}
      <div className="max-w-4xl max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
        <img loading="lazy" src={img.src} alt={img.caption || ""} className="max-h-[80vh] max-w-full object-contain rounded-lg mx-auto" />
        {img.caption && <p className="text-white/80 text-sm text-center mt-3 font-medium">{img.caption}</p>}
        <p className="text-white/40 text-xs text-center mt-1">{index + 1} / {images.length}</p>
      </div>
      {index < images.length - 1 && (
        <button onClick={(e) => { e.stopPropagation(); onNav(index + 1); }}
          className="absolute right-3 sm:right-6 text-white/60 hover:text-white text-3xl font-bold px-2">›</button>
      )}
    </div>
  );
}

// ─── Social share bar ──────────────────────────────────────────────────────────
function ShareBar({ title, url }) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const links = [
    { name: "WhatsApp", icon: "💬", href: `https://wa.me/?text=${encodedTitle}%20-%20${encodedUrl}`, color: "hover:bg-green-50 hover:text-green-700 hover:border-green-200" },
    { name: "Facebook", icon: "📘", href: `https://www.facebook.com/sharer.php?u=${encodedUrl}`, color: "hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200" },
    { name: "Twitter / X", icon: "🐦", href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`, color: "hover:bg-slate-100 hover:text-slate-900 hover:border-slate-300" },
    { name: "LinkedIn", icon: "💼", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, color: "hover:bg-blue-50 hover:text-blue-800 hover:border-blue-200" },
    { name: "Email", icon: "✉️", href: `mailto:?subject=${encodedTitle}&body=Check this out: ${encodedUrl}`, color: "hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200" },
  ];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest mr-1">Share:</span>
      {links.map((l) => (
        <a key={l.name} href={l.href} target="_blank" rel="noopener noreferrer" title={`Share on ${l.name}`}
          className={`w-9 h-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-sm transition-all ${l.color}`}>
          {l.icon}
        </a>
      ))}
    </div>
  );
}

// ─── localStorage helpers for comment form persistence ───────────────────────
const STORAGE_PREFIX = "news_comment_";

function loadFormFromStorage(postId) {
  if (typeof window === "undefined" || !postId) return null;
  try {
    const name = localStorage.getItem(`${STORAGE_PREFIX}${postId}_name`);
    const email = localStorage.getItem(`${STORAGE_PREFIX}${postId}_email`);
    const body = localStorage.getItem(`${STORAGE_PREFIX}${postId}_body`);
    return { name: name || "", email: email || "", body: body || "" };
  } catch {
    return null;
  }
}

function saveFormToStorage(postId, form) {
  if (typeof window === "undefined" || !postId) return;
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${postId}_name`, form.name);
    localStorage.setItem(`${STORAGE_PREFIX}${postId}_email`, form.email);
    localStorage.setItem(`${STORAGE_PREFIX}${postId}_body`, form.body);
  } catch { /* ignore */ }
}

function clearFormStorage(postId) {
  if (typeof window === "undefined" || !postId) return;
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${postId}_name`);
    localStorage.removeItem(`${STORAGE_PREFIX}${postId}_email`);
    localStorage.removeItem(`${STORAGE_PREFIX}${postId}_body`);
  } catch { /* ignore */ }
}

export default function PublicNewsDetailPage() {
  const params = useParams();
  const slug = params.slug;

  const [article, setArticle] = useState(null);
  const [comments, setComments] = useState([]);
  const [settings, setSettings] = useState({});
  const [adProducts, setAdProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({ name: "", email: "", body: "" });
  const [replyForm, setReplyForm] = useState({ name: "", email: "", body: "" });
  const [activeReplyBox, setActiveReplyBox] = useState(null);
  const [notice, setNotice] = useState("");
  const [hasLiked, setHasLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [lightboxIdx, setLightboxIdx] = useState(null);

  const pageUrl = typeof window !== "undefined" ? window.location.href : "";
  const nameInputRef = useRef(null);

  // Load article data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [articleData, settingsData, productsRes] = await Promise.all([
          publicNewsApi.getPostBySlug(slug),
          publicNewsApi.getSettings(),
          productsApi.getAll({ pageSize: 500 }),
        ]);

        setArticle(articleData);
        setComments(articleData?.comments || []);
        setLikeCount(articleData?.likes || 0);

        // Restore saved comment form for this article
        const saved = loadFormFromStorage(articleData?.id);
        if (saved) {
          setForm(saved);
        }

        if (settingsData) {
          setSettings(settingsData);
          if (settingsData.productSuggestionMode === "selected" && settingsData.selectedProductIds) {
            const products = (productsRes?.data || []).filter((p) => settingsData.selectedProductIds.includes(p.id));
            setAdProducts(products.slice(0, settingsData.adsMaxProducts || 4));
          } else if (settingsData.productSuggestionMode === "random") {
            const shuffled = [...(productsRes?.data || [])].sort(() => 0.5 - Math.random());
            setAdProducts(shuffled.slice(0, settingsData.adsMaxProducts || 4));
          } else {
            setAdProducts((productsRes?.data || []).slice(0, settingsData.adsMaxProducts || 4));
          }
        }
      } catch (error) {
        console.error("Failed to load article:", error);
      } finally {
        setLoading(false);
      }
    };
    if (slug) loadData();
  }, [slug]);

  // Persist comment form to localStorage whenever it changes
  useEffect(() => {
    if (article?.id) {
      saveFormToStorage(article.id, form);
    }
  }, [form, article?.id]);

  // Ctrl + '+' shortcut to focus first input in comment section
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === "+") {
        e.preventDefault();
        if (nameInputRef.current) {
          nameInputRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
          nameInputRef.current.focus();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLike = () => {
    setLikeCount((c) => (hasLiked ? c - 1 : c + 1));
    setHasLiked((v) => !v);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.body.trim()) return;
    try {
      await publicNewsApi.submitComment({ postId: article.id, name: form.name.trim(), email: form.email.trim(), body: form.body.trim() });
      setNotice(settings.commentsRequireApproval ? "Thanks! Your comment was submitted and is awaiting approval." : "Thanks! Your comment has been posted.");
      setForm({ name: "", email: "", body: "" });
      clearFormStorage(article.id);
    } catch (error) {
      alert("Failed to submit comment: " + error.message);
    }
  };

  const handleAddReply = async (parentId) => {
    if (!replyForm.name.trim() || !replyForm.email.trim() || !replyForm.body.trim()) return;
    try {
      await publicNewsApi.submitComment({ postId: article.id, parentId, name: replyForm.name.trim(), email: replyForm.email.trim(), body: replyForm.body.trim() });
      setNotice("Reply submitted!");
      setReplyForm({ name: "", email: "", body: "" });
      setActiveReplyBox(null);
    } catch (error) {
      alert("Failed to submit reply: " + error.message);
    }
  };

  const CommentNode = ({ node, indent = 0 }) => (
    <div className={indent ? "pl-5 border-l-2 border-slate-200" : ""}>
      <div className="space-y-1.5 py-3">
        <div className="flex justify-between text-[11px] font-bold text-slate-400">
          <span className="text-slate-900 font-black">{node.name}</span>
          <span>{fmtDate(node.createdAt)}</span>
        </div>
        <p className="text-xs text-slate-700 font-medium leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">{node.body}</p>
        {settings.commentsAllowReplies && (
          <button onClick={() => setActiveReplyBox(activeReplyBox === node.id ? null : node.id)}
            className="text-[10px] font-black uppercase text-blue-900 tracking-wider hover:underline pl-1">↳ Reply</button>
        )}
        {activeReplyBox === node.id && (
          <div className="pt-2 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <input type="text" placeholder="Your name" value={replyForm.name} onChange={(e) => setReplyForm({ ...replyForm, name: e.target.value })} className="text-xs px-3 py-1.5 border rounded-lg" />
              <input type="email" placeholder="Your email" value={replyForm.email} onChange={(e) => setReplyForm({ ...replyForm, email: e.target.value })} className="text-xs px-3 py-1.5 border rounded-lg" />
            </div>
            <div className="flex gap-2">
              <input type="text" placeholder="Write a reply..." value={replyForm.body} onChange={(e) => setReplyForm({ ...replyForm, body: e.target.value })} className="flex-1 text-xs px-3 py-1.5 border rounded-lg" />
              <button onClick={() => handleAddReply(node.id)} className="bg-slate-800 text-white font-bold text-[10px] px-3 rounded-lg uppercase">Send</button>
            </div>
          </div>
        )}
      </div>
      {node.replies?.length > 0 && (
        <div className="space-y-1">{node.replies.map((child) => <CommentNode key={child.id} node={child} indent={indent + 1} />)}</div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center">
          <span className="text-3xl">📰</span>
          <h1 className="text-xl font-black text-slate-900 mt-3">Article Not Found</h1>
          <p className="text-xs text-slate-400 mt-1">This news item may have been moved or unpublished.</p>
          <Link href="/news" className="inline-block mt-4 text-xs font-black text-blue-700 uppercase tracking-wider">← Back to Newsroom</Link>
        </div>
      </div>
    );
  }

  const category = article.category;
  const blocks = article.blocks || [];

  const textBlocks = blocks.filter((b) => b.type === "text");
  const allGalleryImages = blocks
    .filter((b) => b.type === "imageRow")
    .flatMap((b) => b.images || [])
    .filter((img) => img?.src);

  const headImage = article.coverImage || allGalleryImages[0]?.src || "";
  const galleryImages = article.coverImage
    ? allGalleryImages
    : allGalleryImages.slice(1);

  return (
    <div className="bg-slate-50 min-h-screen p-4 md:p-12 font-sans text-slate-800 antialiased">
      {/* <breadcrumb items={[{ label: "News" }]} /> */}
      <div className="max-w-7xl mx-auto">
        {/* ─── NEW: Full-width breadcrumb header with title (5vh) ─── */}
        <div className="relative w-full bg-white border border-slate-200 rounded-xl shadow-sm flex items-center justify-center mb-8"
             style={{ minHeight: "30vh", backgroundImage: "linear-gradient(135deg, #042058, #0070f0)" }}>
          {/* Breadcrumb navigation at left-bottom corner */}
          <div className="absolute bottom-5 left-5 text-xs text-white font-medium">
            <Link href="/news" className="font-bold text-white hover:text-blue-900">Newsroom</Link>
            {" ➔ "}{category?.name || "News"}
          </div>
          {/* Centered article title */}
          <h1 className="text-lg md:text-xl font-bold text-white tracking-tight px-6 py-4 text-center leading-tight">
            {article.title}
          </h1>
        </div>

        {/* Grid for main content and sidebar */}
        <div className="grid gap-8 lg:gap-[5%] lg:grid-cols-[75%_20%] items-start">
          {/* MAIN COLUMN */}
          <div className="space-y-8 min-w-0">
            <article className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
              {/* ── HEAD IMAGE (Udyogi-style large banner) ──────────────────── */}
              {headImage && (
                <div className="w-full">
                  <img loading="lazy" src={headImage} alt={article.title} className="w-full max-h-[480px] object-cover" />
                </div>
              )}

              <div className="p-6 md:p-10 space-y-6">
                {/* Meta info (no title here anymore) */}
                <div className="space-y-3 border-b border-slate-100 pb-5">
                  <span className="text-[10px] font-black tracking-widest text-blue-900 uppercase bg-blue-50 px-3 py-1 rounded-md">
                    {category?.name || "News"}
                  </span>
                  <p className="text-xs text-slate-400 font-medium">
                    Published: <span className="font-bold text-slate-600">{fmtDate(article.publishedAt || article.createdAt)}</span>
                  </p>
                </div>

                {/* ── DESCRIPTION (text blocks) ── */}
                {textBlocks.length > 0 && (
                  <div className="space-y-4">
                    {textBlocks.map((block, index) => (
                      <p key={index}
                        style={{ fontFamily: block.style?.fontFamily || "serif", color: block.style?.color || "#1e293b", fontSize: block.style?.fontSize || "16px" }}
                        className="leading-relaxed whitespace-pre-line">
                        {block.content}
                      </p>
                    ))}
                  </div>
                )}

                {/* ── BOTTOM GALLERY GRID (unlimited images, lightbox on click) ── */}
                {galleryImages.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                      Gallery ({galleryImages.length} photo{galleryImages.length !== 1 ? "s" : ""})
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {galleryImages.map((img, i) => (
                        <button
                          key={i}
                          onClick={() => setLightboxIdx(i)}
                          className="group relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100"
                        >
                          <img loading="lazy" src={img.src} alt={img.caption || ""} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <span className="opacity-0 group-hover:opacity-100 text-white text-lg transition-opacity">🔍</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Like bar + share bar */}
                <div className="border-t border-slate-100 pt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <button onClick={handleLike}
                      className={`flex items-center space-x-2 text-xs font-black uppercase tracking-wider px-4 py-2 rounded-xl transition-all ${
                        hasLiked ? "bg-rose-50 text-rose-600 border border-rose-200" : "bg-slate-50 hover:bg-slate-100 text-slate-600 border"
                      }`}>
                      <span>{hasLiked ? "❤️ Liked" : "🤍 Like"}</span>
                      <span className="bg-slate-900 text-white rounded px-1.5 py-0.5 text-[10px] font-mono">{likeCount}</span>
                    </button>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{comments.length} Comment{comments.length !== 1 ? "s" : ""}</span>
                  </div>
                  <ShareBar title={article.title} url={pageUrl} />
                </div>
              </div>
            </article>

            {/* Comments */}
            <section className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b pb-2">Public Comments</h2>
              {notice && <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl px-4 py-2.5 text-xs font-semibold">{notice}</div>}
              <form onSubmit={handleAddComment} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    ref={nameInputRef}
                    type="text"
                    required
                    placeholder="Your name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="text-xs p-3 border rounded-xl bg-slate-50/50"
                  />
                  <input type="email" required placeholder="Your email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="text-xs p-3 border rounded-xl bg-slate-50/50" />
                </div>
                <textarea rows="3" required value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="Share your feedback..." className="w-full text-xs p-3 border rounded-xl bg-slate-50/50" />
                <button type="submit" className="bg-slate-900 text-white font-black text-[10px] uppercase px-4 py-2 rounded-lg">Post Comment</button>
              </form>
              <div className="divide-y divide-slate-100">
                {comments.length > 0 ? comments.map((node) => <CommentNode key={node.id} node={node} />) : <p className="text-xs text-slate-400 py-4">No comments yet.</p>}
              </div>
            </section>
          </div>

          {/* AD PRODUCTS SIDEBAR */}
          {adProducts.length > 0 && settings.adsEnabled && (
            <aside className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-4 sticky top-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Sponsored Products</p>
                <div className="space-y-3">
                  {adProducts.map((p) => (
                    <Link key={p.id} href={`/products/${p.id}`} className="flex gap-3 items-center p-2 rounded-xl border hover:border-blue-300 hover:shadow-sm transition-all group">
                      <div className="w-14 h-14 shrink-0 bg-slate-50 rounded-lg border flex items-center justify-center p-1">
                        {firstProductImage(p) ? <img loading="lazy" src={firstProductImage(p)} alt={p.name} className="max-w-full max-h-full object-contain" /> : <span className="text-xl">📦</span>}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-black text-slate-900 line-clamp-2 group-hover:text-blue-900">{p.name}</p>
                        <span className="text-[9px] font-bold text-blue-600 uppercase">View →</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>

      {/* Lightbox overlay */}
      {lightboxIdx !== null && (
        <Lightbox images={galleryImages} index={lightboxIdx} onClose={() => setLightboxIdx(null)} onNav={setLightboxIdx} />
      )}
    </div>
  );
}