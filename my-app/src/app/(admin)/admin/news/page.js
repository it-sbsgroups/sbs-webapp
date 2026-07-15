"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import newsApi from "@/lib/news/newsApi";
import productsApi from "@/lib/productsApi";
import { uploadImage } from "@/lib/uploadApi";
import RichTextEditor from "@/components/shared/RichTextEditor";
import { Plus, Edit, Trash2, X, Save, Search, Eye, EyeOff, RefreshCw, ChevronDown, ChevronRight, CheckCircle, XCircle, Archive, Upload, GripVertical, Loader2, Settings } from "lucide-react";

const slugify = (text) =>
  text?.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/-+/g, '-') || '';

// ─── Multi-image Gallery Block Editor ──────────────────────────────────────────
// Replaces the old single-image-only editor. Supports unlimited images,
// multi-file batch upload, per-image captions, drag-to-reorder, and removal.
function GalleryBlockEditor({ block, onChange }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const images = block.images || [];

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    setError("");
    setUploading(true);
    try {
      // Upload all selected files in parallel — no count limit
      const uploaded = await Promise.all(
        files.map((file) => uploadImage(file, "news").then((url) => ({ src: url, caption: "" })))
      );
      onChange([...images, ...uploaded]);
    } catch (err) {
      setError(err.message || "Some images failed to upload.");
    } finally {
      setUploading(false);
    }
  };

  const updateCaption = (i, caption) => {
    onChange(images.map((img, j) => (j === i ? { ...img, caption } : img)));
  };

  const removeImage = (i) => {
    onChange(images.filter((_, j) => j !== i));
  };

  const moveImage = (i, dir) => {
    const arr = [...images];
    const to = i + dir;
    if (to < 0 || to >= arr.length) return;
    [arr[i], arr[to]] = [arr[to], arr[i]];
    onChange(arr);
  };

  return (
    <div className="bg-white p-3 rounded-lg border space-y-3">
      {/* Upload zone */}
      <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
        onChange={(e) => { handleFiles(e.target.files); e.target.value = ""; }} />
      <button type="button" disabled={uploading} onClick={() => fileRef.current?.click()}
        className="w-full flex items-center justify-center gap-2 text-xs font-black py-3 rounded-xl border-2 border-dashed border-slate-300 text-slate-500 hover:border-blue-400 hover:text-blue-700 hover:bg-blue-50/50 transition-colors disabled:opacity-60">
        {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
        {uploading ? "Uploading…" : "Upload Images (select multiple at once)"}
      </button>
      {error && <p className="text-[11px] text-red-600 font-semibold">{error}</p>}

      {/* Or paste a URL directly */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Or paste an image URL and press Enter…"
          className="flex-1 text-xs p-2 border rounded focus:outline-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.currentTarget.value.trim()) {
              onChange([...images, { src: e.currentTarget.value.trim(), caption: "" }]);
              e.currentTarget.value = "";
            }
          }}
        />
      </div>

      {/* Gallery grid — unlimited images */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
          {images.map((img, i) => (
            <div key={i} className="relative group border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
              <img src={img.src} alt="" className="w-full h-28 object-cover"
                onError={(e) => { e.currentTarget.style.opacity = "0.2"; }} />
              {/* Reorder + remove controls */}
              <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button type="button" onClick={() => moveImage(i, -1)} disabled={i === 0}
                  className="w-5 h-5 rounded bg-black/60 text-white text-[10px] flex items-center justify-center disabled:opacity-30">‹</button>
                <button type="button" onClick={() => moveImage(i, 1)} disabled={i === images.length - 1}
                  className="w-5 h-5 rounded bg-black/60 text-white text-[10px] flex items-center justify-center disabled:opacity-30">›</button>
                <button type="button" onClick={() => removeImage(i)}
                  className="w-5 h-5 rounded bg-red-600 text-white text-[10px] flex items-center justify-center">✕</button>
              </div>
              <input
                type="text"
                placeholder="Caption…"
                value={img.caption || ""}
                onChange={(e) => updateCaption(i, e.target.value)}
                className="w-full text-[10px] px-2 py-1.5 border-t border-slate-200 focus:outline-none bg-white"
              />
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <p className="text-[11px] text-slate-400 text-center py-2">No images yet. Upload as many as you need — there's no limit.</p>
      )}
      {images.length > 0 && (
        <p className="text-[10px] text-slate-400 font-semibold text-center">{images.length} image{images.length !== 1 ? "s" : ""} in this gallery block</p>
      )}
    </div>
  );
}

// ============================================
// DEFAULT SETTINGS
// ============================================
const defaultSettings = {
  cardsPerRow: 3,
  cardsPerPage: 9,
  showSearch: true,
  showCategoryFilter: true,
  showSubcategoryFilter: true,
  carouselVisibleCards: 4,
  carouselTotalToPull: 10,
  carouselAutoPlay: true,
  carouselPauseOnHover: true,
  carouselIntervalMs: 3000,
  adsEnabled: true,
  adsMaxProducts: 4,
  adsPlacement: "sidebar",
  commentsRequireApproval: true,
  commentsAllowReplies: true,
  // New: Product suggestion settings
  productSuggestionMode: "latest", // "latest" | "random" | "selected"
  selectedProductIds: [],
};

export default function AdminNewsManage() {
  // ============================================
  // DATA STATES
  // ============================================
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("composer"); // composer | posts | categories | settings | comments | ads

  // ============================================
  // COMPOSER STATE
  // ============================================
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");
  const [allowVersioning, setAllowVersioning] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [blocks, setBlocks] = useState([
    { type: "text", content: "", style: { fontFamily: "serif", color: "#1e293b", fontSize: "16px" } },
  ]);
  const [editingPostId, setEditingPostId] = useState(null);
  const [publishStatus, setPublishStatus] = useState("DRAFT"); // DRAFT or PUBLISHED

  // ============================================
  // CATEGORY FORM STATE
  // ============================================
  const [showCatForm, setShowCatForm] = useState(false);
  const [editingCatId, setEditingCatId] = useState(null);
  const [catForm, setCatForm] = useState({ name: "", icon: "" });
  const [showSubForm, setShowSubForm] = useState(false);
  const [editingSubId, setEditingSubId] = useState(null);
  const [subForm, setSubForm] = useState({ name: "", categoryId: "" });

  // ============================================
  // AD PRODUCT STATE
  // ============================================
  const [selectedPostForAds, setSelectedPostForAds] = useState("__all__"); // "__all__" for global, or post ID
  const [adProductIds, setAdProductIds] = useState([]);

  // Comments and the (legacy) products list are heavy and only needed once
  // their respective tabs are opened — loading them eagerly on every page
  // load was a big chunk of the admin news page's slowness.
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [productsLoaded, setProductsLoaded] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const [editLoadingId, setEditLoadingId] = useState(null);

  // ============================================
  // LOAD ALL DATA (lightweight — posts list no longer carries block content,
  // and comments/products are deferred to when their tabs are opened)
  // ============================================
  const loadAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [catData, subData, postsRes, settingsData] = await Promise.all([
        newsApi.getCategories(),
        newsApi.getSubcategories(),
        newsApi.getPosts({ pageSize: 100 }),
        newsApi.getSettings(),
      ]);

      setCategories(Array.isArray(catData) ? catData : []);
      setSubcategories(Array.isArray(subData) ? subData : []);
      setPosts(postsRes?.data || []);

      // In loadAllData function, update the settings loading:
      if (settingsData && typeof settingsData === 'object') {
          setSettings((prev) => ({
            ...prev,
            cardsPerRow: settingsData.cardsPerRow ?? prev.cardsPerRow,
            cardsPerPage: settingsData.cardsPerPage ?? prev.cardsPerPage,
            showSearch: settingsData.showSearch ?? prev.showSearch,
            showCategoryFilter: settingsData.showCategoryFilter ?? prev.showCategoryFilter,
            showSubcategoryFilter: settingsData.showSubcategoryFilter ?? prev.showSubcategoryFilter,
            carouselVisibleCards: settingsData.carouselVisibleCards ?? prev.carouselVisibleCards,
            carouselTotalToPull: settingsData.carouselTotalToPull ?? prev.carouselTotalToPull,
            carouselAutoPlay: settingsData.carouselAutoPlay ?? prev.carouselAutoPlay,
            carouselPauseOnHover: settingsData.carouselPauseOnHover ?? prev.carouselPauseOnHover,
            carouselIntervalMs: settingsData.carouselIntervalMs ?? prev.carouselIntervalMs,
            adsEnabled: settingsData.adsEnabled ?? prev.adsEnabled,
            adsMaxProducts: settingsData.adsMaxProducts ?? prev.adsMaxProducts,
            adsPlacement: settingsData.adsPlacement ?? prev.adsPlacement,
            commentsRequireApproval: settingsData.commentsRequireApproval ?? prev.commentsRequireApproval,
            commentsAllowReplies: settingsData.commentsAllowReplies ?? prev.commentsAllowReplies,
            productSuggestionMode: settingsData.productSuggestionMode ?? prev.productSuggestionMode,
            selectedProductIds: settingsData.selectedProductIds ?? prev.selectedProductIds,
          }));

          // Load selected product IDs
          if (settingsData.selectedProductIds && Array.isArray(settingsData.selectedProductIds)) {
            setAdProductIds(settingsData.selectedProductIds);
          }
      }

      if (catData.length > 0 && !categoryId) {
        setCategoryId(catData[0].id);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Lazy-load comments the first time the Comments tab is opened
  const loadComments = useCallback(async () => {
    setCommentsLoading(true);
    try {
      const commentsRes = await newsApi.getComments({ pageSize: 200 });
      setComments(commentsRes?.data || []);
      setCommentsLoaded(true);
    } catch (error) {
      console.error("Failed to load comments:", error);
    } finally {
      setCommentsLoading(false);
    }
  }, []);

  // Lazy-load the (legacy) product catalog the first time the Suggested
  // Products tab is opened
  const loadProducts = useCallback(async () => {
    setProductsLoading(true);
    try {
      const productsRes = await productsApi.getAll({ pageSize: 500 });
      setAllProducts(productsRes?.data || []);
      setProductsLoaded(true);
    } catch (error) {
      console.error("Failed to load products:", error);
    } finally {
      setProductsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "comments" && !commentsLoaded && !commentsLoading) loadComments();
    if (activeTab === "ads" && !productsLoaded && !productsLoading) loadProducts();
  }, [activeTab, commentsLoaded, commentsLoading, productsLoaded, productsLoading, loadComments, loadProducts]);

  // ============================================
  // FILTERED DATA
  // ============================================
  const subOptions = useMemo(() => {
    return subcategories.filter((s) => s.categoryId === categoryId);
  }, [subcategories, categoryId]);

  const getCategoryName = (id) => categories.find((c) => c.id === id)?.name || "—";
  const getSubcategoryName = (id) => subcategories.find((s) => s.id === id)?.name || "—";

  // ============================================
  // CATEGORY CRUD
  // ============================================
  const openCreateCategory = () => {
    setEditingCatId(null);
    setCatForm({ name: "", icon: "" });
    setShowCatForm(true);
  };

  const openEditCategory = (cat) => {
    setEditingCatId(cat.id);
    setCatForm({ name: cat.name || "", icon: cat.icon || "" });
    setShowCatForm(true);
  };

  const saveCategory = async () => {
    if (!catForm.name.trim()) return alert("Category name required");
    try {
      if (editingCatId) {
        await newsApi.updateCategory(editingCatId, catForm);
      } else {
        await newsApi.createCategory(catForm);
      }
      setShowCatForm(false);
      await loadAllData();
    } catch (error) {
      alert("Failed to save category: " + error.message);
    }
  };

  const deleteCategory = async (id) => {
    if (!confirm("Delete this category? All posts under it will be affected.")) return;
    try {
      await newsApi.deleteCategory(id);
      await loadAllData();
    } catch (error) {
      alert("Failed to delete: " + error.message);
    }
  };

  // ============================================
  // SUBCATEGORY CRUD
  // ============================================
  const openCreateSubcategory = () => {
    setEditingSubId(null);
    setSubForm({ name: "", categoryId: categories[0]?.id || "" });
    setShowSubForm(true);
  };

  const openEditSubcategory = (sub) => {
    setEditingSubId(sub.id);
    setSubForm({ name: sub.name || "", categoryId: sub.categoryId || "" });
    setShowSubForm(true);
  };

  const saveSubcategory = async () => {
    if (!subForm.name.trim()) return alert("Subcategory name required");
    if (!subForm.categoryId) return alert("Select a parent category");
    try {
      if (editingSubId) {
        await newsApi.updateSubcategory(editingSubId, subForm);
      } else {
        await newsApi.createSubcategory(subForm);
      }
      setShowSubForm(false);
      await loadAllData();
    } catch (error) {
      alert("Failed to save: " + error.message);
    }
  };

  const deleteSubcategory = async (id) => {
    if (!confirm("Delete this subcategory?")) return;
    try {
      await newsApi.deleteSubcategory(id);
      await loadAllData();
    } catch (error) {
      alert("Failed to delete: " + error.message);
    }
  };

  // ============================================
  // POST CRUD
  // ============================================
  const resetComposer = () => {
    setTitle("");
    setCategoryId(categories[0]?.id || "");
    setSubcategoryId("");
    setAllowVersioning(true);
    setIsFeatured(false);
    setPublishStatus("DRAFT");
    setBlocks([{ type: "text", content: "", style: { fontFamily: "serif", color: "#1e293b", fontSize: "16px" } }]);
    setEditingPostId(null);
  };

  const openEditPost = async (post) => {
    setEditingPostId(post.id);
    setTitle(post.title || "");
    setCategoryId(post.categoryId || "");
    setSubcategoryId(post.subcategoryId || "");
    setAllowVersioning(post.allowVersioning !== false);
    setIsFeatured(post.isFeatured || false);
    setPublishStatus(post.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT");
    setActiveTab("composer");

    // The posts list is now lightweight (no block content) for speed, so
    // fetch the full post — including its blocks — right before editing.
    setEditLoadingId(post.id);
    try {
      const full = await newsApi.getPost(post.id);
      const sourceBlocks = full?.blocks?.length ? full.blocks : post.blocks;
      setBlocks(sourceBlocks?.length ? sourceBlocks.map((b) => ({
        type: b.type || "text",
        content: b.content || "",
        style: b.style || { fontFamily: "serif", color: "#1e293b", fontSize: "16px" },
        images: b.images || [],
      })) : [{ type: "text", content: "", style: { fontFamily: "serif", color: "#1e293b", fontSize: "16px" } }]);
    } catch (error) {
      console.error("Failed to load full post for editing:", error);
      alert("Couldn't load this post's content. Please try again.");
    } finally {
      setEditLoadingId(null);
    }
  };

  const savePost = async (e) => {
    e?.preventDefault();
    if (!title.trim()) return alert("Please enter a headline");
    if (!categoryId) return alert("Please select a category");

    try {
      const payload = {
        title: title.trim(),
        categoryId,
        subcategoryId: subcategoryId || null,
        allowVersioning,
        isFeatured,
        status: publishStatus,
        blocks: blocks.map((block) => ({
          type: block.type,
          content: block.content || "",
          style: block.style || {},
          images: block.images || [],
        })),
      };

      if (editingPostId) {
        await newsApi.updatePost(editingPostId, payload);
        alert("✅ Post updated!");
      } else {
        await newsApi.createPost(payload);
        alert("✅ Post created!");
      }
      resetComposer();
      await loadAllData();
    } catch (error) {
      alert("❌ Failed to save post: " + error.message);
    }
  };

  const deletePost = async (id) => {
    if (!confirm("Delete this post permanently?")) return;
    try {
      await newsApi.deletePost(id);
      await loadAllData();
    } catch (error) {
      alert("Failed to delete: " + error.message);
    }
  };

  const togglePostStatus = async (post) => {
    try {
      const newStatus = post.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
      await newsApi.updatePost(post.id, { status: newStatus });
      await loadAllData();
    } catch (error) {
      alert("Failed to update: " + error.message);
    }
  };

  const toggleFeatured = async (post) => {
    try {
      await newsApi.updatePost(post.id, { isFeatured: !post.isFeatured });
      await loadAllData();
    } catch (error) {
      alert("Failed to update: " + error.message);
    }
  };

  // ============================================
  // BLOCK HELPERS
  // ============================================
  const addTextBlock = () => setBlocks((b) => [...b, { type: "text", content: "", style: { fontFamily: "sans-serif", color: "#000", fontSize: "14px" } }]);
  const addImageBlock = () => setBlocks((b) => [...b, { type: "imageRow", images: [{ src: "", caption: "" }] }]);
  const updateBlockContent = (i, v) => setBlocks((b) => b.map((blk, idx) => (idx === i ? { ...blk, content: v } : blk)));
  const updateBlockStyle = (i, prop, v) => setBlocks((b) => b.map((blk, idx) => (idx === i ? { ...blk, style: { ...blk.style, [prop]: v } } : blk)));
  const removeBlock = (i) => setBlocks((b) => b.filter((_, idx) => idx !== i));

  // ============================================
  // SETTINGS
  // ============================================
  const updateSetting = (key, value) => setSettings((prev) => ({ ...prev, [key]: value }));
  const num = (val) => parseInt(val) || 0;

  const saveSettings = async () => {
    try {
      // Only send fields that exist in the database
      const data = {
        cardsPerRow: Number(settings.cardsPerRow),
        cardsPerPage: Number(settings.cardsPerPage),
        showSearch: settings.showSearch,
        showCategoryFilter: settings.showCategoryFilter,
        showSubcategoryFilter: settings.showSubcategoryFilter,
        carouselVisibleCards: Number(settings.carouselVisibleCards),
        carouselTotalToPull: Number(settings.carouselTotalToPull),
        carouselAutoPlay: settings.carouselAutoPlay,
        carouselPauseOnHover: settings.carouselPauseOnHover,
        carouselIntervalMs: Number(settings.carouselIntervalMs),
        adsEnabled: settings.adsEnabled,
        adsMaxProducts: Number(settings.adsMaxProducts),
        adsPlacement: settings.adsPlacement,
        commentsRequireApproval: settings.commentsRequireApproval,
        commentsAllowReplies: settings.commentsAllowReplies,
        productSuggestionMode: settings.productSuggestionMode || "latest",
        selectedProductIds: settings.productSuggestionMode === "selected" ? adProductIds : [],
      };
      
      console.log("Saving settings:", data); // Debug log
      await newsApi.updateSettings(data);
      alert("✅ Settings saved!");
    } catch (error) {
      console.error("Save settings error:", error);
      alert("❌ Failed: " + error.message);
    }
  };

  // ============================================
  // AD / SUGGESTED PRODUCTS
  // ============================================
  const toggleAdProduct = (id) => {
    setAdProductIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const saveAdProducts = async () => {
    try {
      if (selectedPostForAds === "__all__") {
        // Save as global settings
        await newsApi.updateSettings({
          ...settings,
          productSuggestionMode: settings.productSuggestionMode,
          selectedProductIds: adProductIds,
        });
      } else {
        // Save for specific post
        await newsApi.updateAdProducts(selectedPostForAds, adProductIds);
      }
      alert("✅ Ad products saved!");
    } catch (error) {
      alert("Failed: " + error.message);
    }
  };

  // ============================================
  // COMMENT MODERATION
  // ============================================
  const approveComment = async (id) => {
    try {
      await newsApi.updateCommentStatus(id, "APPROVED");
      setComments((prev) => prev.map((c) => (c.id === id ? { ...c, status: "APPROVED" } : c)));
    } catch (error) { alert("Failed: " + error.message); }
  };

  const rejectComment = async (id) => {
    try {
      await newsApi.updateCommentStatus(id, "REJECTED");
      setComments((prev) => prev.map((c) => (c.id === id ? { ...c, status: "REJECTED" } : c)));
    } catch (error) { alert("Failed: " + error.message); }
  };

  const softDeleteComment = async (id) => {
    try {
      await newsApi.softDeleteComment(id);
      setComments((prev) => prev.map((c) => (c.id === id ? { ...c, isDeleted: true } : c)));
    } catch (error) { alert("Failed: " + error.message); }
  };

  const restoreComment = async (id) => {
    try {
      await newsApi.restoreComment(id);
      setComments((prev) => prev.map((c) => (c.id === id ? { ...c, isDeleted: false } : c)));
    } catch (error) { alert("Failed: " + error.message); }
  };

  const hardDeleteComment = async (id) => {
    if (!confirm("Permanently delete?")) return;
    try {
      await newsApi.hardDeleteComment(id);
      setComments((prev) => prev.filter((c) => c.id !== id));
    } catch (error) { alert("Failed: " + error.message); }
  };

  // ============================================
  // STATUS BADGE
  // ============================================
  const statusBadge = (r) => {
    if (r.isHardDeleted) return ["Deleted", "bg-slate-200 text-slate-500"];
    if (r.isDeleted) return ["Soft-deleted", "bg-amber-100 text-amber-700"];
    if (r.status === "APPROVED") return ["Approved", "bg-emerald-100 text-emerald-700"];
    if (r.status === "REJECTED") return ["Rejected", "bg-rose-100 text-rose-700"];
    return ["Pending", "bg-blue-100 text-blue-700"];
  };

  // ============================================
  // TABS
  // ============================================
  const tabs = [
    { id: "composer", label: "Composer", icon: "✍️" },
    { id: "posts", label: "All Posts", icon: "📰" },
    { id: "categories", label: "Categories", icon: "📁" },
    { id: "settings", label: "Settings", icon: "⚙️" },
    { id: "comments", label: "Comments", icon: "💬" },
    { id: "ads", label: "Suggested Products", icon: "🎯" },
  ];

  // ============================================
  // LOADING
  // ============================================
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border shadow-sm">
        <div>
          <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">News & Media Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            {posts.length} posts · {categories.length} categories · {comments.length} comments
          </p>
        </div>
        <button onClick={loadAllData} className="flex items-center gap-2 text-xs border px-4 py-2 rounded-xl hover:bg-slate-50">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === tab.id ? "bg-blue-600 text-white shadow-md" : "bg-white border text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span>{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      {/* ============================================ */}
      {/* COMPOSER TAB */}
      {/* ============================================ */}
      {activeTab === "composer" && (
        <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              {editingPostId ? "Edit Article" : "Compose New Article"}
            </h2>
            <div className="flex items-center gap-3">
              {editingPostId && (
                <button onClick={resetComposer} className="text-xs text-blue-600 hover:underline">Create New Instead</button>
              )}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowSettingsMenu((v) => !v)}
                  className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
                  title="Post settings"
                >
                  <Settings size={14} /> Settings
                </button>
                {showSettingsMenu && (
                  <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border bg-white shadow-lg p-3 z-20 space-y-3">
                    <label className="flex items-center justify-between gap-2 text-xs font-bold">
                      Version Auditing
                      <input type="checkbox" checked={allowVersioning} onChange={(e) => setAllowVersioning(e.target.checked)} className="h-4 w-4" />
                    </label>
                    <label className="flex items-center justify-between gap-2 text-xs font-bold">
                      Featured Post
                      <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="h-4 w-4" />
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-xl">
            <input
              type="text" required placeholder="Article Headline..." value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-sm font-bold px-4 py-3 rounded-xl border bg-white focus:outline-none focus:border-blue-500"
            />
            {title && <p className="text-[10px] text-slate-400 font-mono">Slug: /news/{slugify(title)}</p>}

            <div className="grid grid-cols-2 gap-3">
              <select value={categoryId} onChange={(e) => { setCategoryId(e.target.value); setSubcategoryId(""); }}
                className="text-xs font-bold px-3 py-2.5 border rounded-xl bg-white">
                <option value="">Select Category</option>
                {categories.map((c) => (<option key={c.id} value={c.id}>{c.icon} {c.name}</option>))}
              </select>
              <select value={subcategoryId} onChange={(e) => setSubcategoryId(e.target.value)}
                className="text-xs font-bold px-3 py-2.5 border rounded-xl bg-white">
                <option value="">Select Subcategory (optional)</option>
                {subOptions.map((s) => (<option key={s.id} value={s.id}>{s.name}</option>))}
              </select>
            </div>

            <label className="flex items-center gap-2 text-xs font-bold w-fit">
              <span>Status:</span>
              <select value={publishStatus} onChange={(e) => setPublishStatus(e.target.value)}
                className="border rounded-lg px-2 py-1 text-xs font-bold">
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
              </select>
            </label>
          </div>

          {/* Content Blocks */}
          <div className="space-y-4">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Content Blocks</p>
            {blocks.map((block, idx) => (
              <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase">
                  <span>Block #{idx + 1} · {block.type}</span>
                  {blocks.length > 1 && (
                    <button type="button" onClick={() => removeBlock(idx)} className="text-rose-500 font-black hover:bg-rose-50 px-2 py-1 rounded">Remove</button>
                  )}
                </div>

                {block.type === "text" && (
                  <RichTextEditor
                    value={block.content || ""}
                    onChange={(html) => updateBlockContent(idx, html)}
                    placeholder="Write your paragraph content…"
                    uploadFolder="news-content"
                    resetKey={`${editingPostId || "new-post"}-block-${idx}`}
                  />
                )}

                {block.type === "imageRow" && (
                  <GalleryBlockEditor
                    block={block}
                    onChange={(images) => setBlocks((prev) => prev.map((b, i) => i === idx ? { ...b, images } : b))}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Add Block Buttons */}
          <div className="flex gap-3 pt-2 border-t border-dashed">
            <button type="button" onClick={addTextBlock}
              className="flex-1 text-xs font-black bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl uppercase border">＋ Text Block</button>
            <button type="button" onClick={addImageBlock}
              className="flex-1 text-xs font-black bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl uppercase border">＋ Image Block</button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {editingPostId && (
              <button type="button" onClick={resetComposer}
                className="flex-1 text-xs font-black border border-slate-300 py-3 rounded-xl uppercase text-slate-500 hover:bg-slate-50">
                Cancel Editing
              </button>
            )}
            <button type="button" onClick={savePost}
              className="flex-1 bg-slate-900 text-white font-black text-xs py-3 rounded-xl uppercase tracking-wider hover:bg-slate-800">
              {editingPostId ? "💾 Update Article" : "🚀 Publish Article"}
            </button>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* POSTS TAB */}
      {/* ============================================ */}
      {activeTab === "posts" && (
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <div className="p-5 border-b flex justify-between items-center">
            <h2 className="text-sm font-black text-slate-900 uppercase">All Posts ({posts.length})</h2>
            <button onClick={() => { resetComposer(); setActiveTab("composer"); }}
              className="flex items-center gap-1 bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-blue-700">
              <Plus size={14} /> New Post
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-black uppercase text-slate-400">
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Featured</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y text-xs">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-800 truncate max-w-xs">{post.title}</p>
                      <p className="text-[10px] text-slate-400">/{post.slug}</p>
                    </td>
                    <td className="py-3 px-4">{getCategoryName(post.categoryId)}</td>
                    <td className="py-3 px-4">
                      <button onClick={() => togglePostStatus(post)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          post.status === "PUBLISHED" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                        }`}>
                        {post.status || "DRAFT"}
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <button onClick={() => toggleFeatured(post)}
                        className={post.isFeatured ? "text-yellow-500" : "text-slate-300"}>
                        {post.isFeatured ? "⭐" : "☆"}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : new Date(post.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => openEditPost(post)} disabled={editLoadingId === post.id}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 disabled:opacity-50" title="Edit">
                          {editLoadingId === post.id ? <Loader2 size={14} className="animate-spin" /> : <Edit size={14} />}
                        </button>
                        <button onClick={() => deletePost(post.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-600" title="Delete"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {posts.length === 0 && (
                  <tr><td colSpan={6} className="py-12 text-center text-slate-400">No posts yet. Create your first article!</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* CATEGORIES TAB */}
      {/* ============================================ */}
      {activeTab === "categories" && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Categories */}
          <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="text-sm font-black text-slate-900 uppercase">Categories ({categories.length})</h2>
              <button onClick={openCreateCategory} className="flex items-center gap-1 bg-blue-600 text-white text-xs font-bold px-3 py-2 rounded-xl hover:bg-blue-700">
                <Plus size={14} /> Add
              </button>
            </div>

            {showCatForm && (
              <div className="bg-slate-50 p-4 rounded-xl space-y-3 border-2 border-dashed border-blue-200">
                <input type="text" value={catForm.name} onChange={(e) => setCatForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Category name" className="w-full text-xs px-3 py-2 rounded-lg border" />
                <input type="text" value={catForm.icon} onChange={(e) => setCatForm((p) => ({ ...p, icon: e.target.value }))}
                  placeholder="Icon emoji (e.g. 📰)" className="w-full text-xs px-3 py-2 rounded-lg border" />
                <div className="flex gap-2">
                  <button onClick={saveCategory} className="flex-1 bg-green-600 text-white text-xs font-bold py-2 rounded-lg"><Save size={14} className="inline mr-1" />Save</button>
                  <button onClick={() => setShowCatForm(false)} className="px-4 border text-xs font-bold py-2 rounded-lg">Cancel</button>
                </div>
              </div>
            )}

            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{cat.icon || "📁"}</span>
                    <div>
                      <p className="text-sm font-bold">{cat.name}</p>
                      <p className="text-[10px] text-slate-400">{subcategories.filter((s) => s.categoryId === cat.id).length} subcategories</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEditCategory(cat)} className="p-1.5 hover:bg-blue-50 rounded text-blue-600"><Edit size={14} /></button>
                    <button onClick={() => deleteCategory(cat.id)} className="p-1.5 hover:bg-red-50 rounded text-red-600"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Subcategories */}
          <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="text-sm font-black text-slate-900 uppercase">Subcategories ({subcategories.length})</h2>
              <button onClick={openCreateSubcategory} className="flex items-center gap-1 bg-purple-600 text-white text-xs font-bold px-3 py-2 rounded-xl hover:bg-purple-700">
                <Plus size={14} /> Add
              </button>
            </div>

            {showSubForm && (
              <div className="bg-slate-50 p-4 rounded-xl space-y-3 border-2 border-dashed border-purple-200">
                <select value={subForm.categoryId} onChange={(e) => setSubForm((p) => ({ ...p, categoryId: e.target.value }))}
                  className="w-full text-xs px-3 py-2 rounded-lg border">
                  <option value="">Select Parent Category</option>
                  {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                </select>
                <input type="text" value={subForm.name} onChange={(e) => setSubForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Subcategory name" className="w-full text-xs px-3 py-2 rounded-lg border" />
                <div className="flex gap-2">
                  <button onClick={saveSubcategory} className="flex-1 bg-green-600 text-white text-xs font-bold py-2 rounded-lg"><Save size={14} className="inline mr-1" />Save</button>
                  <button onClick={() => setShowSubForm(false)} className="px-4 border text-xs font-bold py-2 rounded-lg">Cancel</button>
                </div>
              </div>
            )}

            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {categories.map((cat) => {
                const catSubs = subcategories.filter((s) => s.categoryId === cat.id);
                if (catSubs.length === 0) return null;
                return (
                  <div key={cat.id}>
                    <p className="text-[10px] font-bold text-slate-400 uppercase px-2 py-1">{cat.icon} {cat.name}</p>
                    {catSubs.map((sub) => (
                      <div key={sub.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border ml-4 mb-1">
                        <p className="text-sm font-bold">{sub.name}</p>
                        <div className="flex gap-1">
                          <button onClick={() => openEditSubcategory(sub)} className="p-1.5 hover:bg-blue-50 rounded text-blue-600"><Edit size={14} /></button>
                          <button onClick={() => deleteSubcategory(sub.id)} className="p-1.5 hover:bg-red-50 rounded text-red-600"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* SETTINGS TAB */}
      {/* ============================================ */}
      {activeTab === "settings" && (
        <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b pb-3">
            <h2 className="text-sm font-black text-slate-900 uppercase">Display & Behavior Settings</h2>
            <button onClick={saveSettings} className="flex items-center gap-1 bg-green-600 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-green-700">
              <Save size={14} /> Save Settings
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* List Page */}
            <div className="space-y-3">
              <h3 className="text-xs font-black text-slate-400 uppercase border-b pb-2">📰 List Page</h3>
              <label className="flex justify-between text-xs font-bold">
                Cards per row
                <select value={settings.cardsPerRow} onChange={(e) => updateSetting("cardsPerRow", num(e.target.value))} className="border rounded px-2 py-1 text-xs">
                  {[1,2,3,4].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </label>
              <label className="flex justify-between text-xs font-bold">
                Cards per page
                <input type="number" value={settings.cardsPerPage} onChange={(e) => updateSetting("cardsPerPage", num(e.target.value))} className="border rounded px-2 py-1 w-16 text-center text-xs" />
              </label>
              <label className="flex justify-between text-xs font-bold">
                Show search
                <input type="checkbox" checked={settings.showSearch} onChange={(e) => updateSetting("showSearch", e.target.checked)} />
              </label>
              <label className="flex justify-between text-xs font-bold">
                Category filter
                <input type="checkbox" checked={settings.showCategoryFilter} onChange={(e) => updateSetting("showCategoryFilter", e.target.checked)} />
              </label>
              <label className="flex justify-between text-xs font-bold">
                Subcategory filter
                <input type="checkbox" checked={settings.showSubcategoryFilter} onChange={(e) => updateSetting("showSubcategoryFilter", e.target.checked)} />
              </label>
            </div>

            {/* Carousel */}
            <div className="space-y-3">
              <h3 className="text-xs font-black text-slate-400 uppercase border-b pb-2">🎠 Home Carousel</h3>
              <label className="flex justify-between text-xs font-bold">
                Visible cards
                <input type="number" min="1" max="6" value={settings.carouselVisibleCards} onChange={(e) => updateSetting("carouselVisibleCards", num(e.target.value))} className="border rounded px-2 py-1 w-16 text-center text-xs" />
              </label>
              <label className="flex justify-between text-xs font-bold">
                Pull recent
                <input type="number" min="1" value={settings.carouselTotalToPull} onChange={(e) => updateSetting("carouselTotalToPull", num(e.target.value))} className="border rounded px-2 py-1 w-16 text-center text-xs" />
              </label>
              <label className="flex justify-between text-xs font-bold">
                Auto-play
                <input type="checkbox" checked={settings.carouselAutoPlay} onChange={(e) => updateSetting("carouselAutoPlay", e.target.checked)} />
              </label>
              <label className="flex justify-between text-xs font-bold">
                Pause on hover
                <input type="checkbox" checked={settings.carouselPauseOnHover} onChange={(e) => updateSetting("carouselPauseOnHover", e.target.checked)} />
              </label>
              <label className="flex justify-between text-xs font-bold">
                Interval (ms)
                <input type="number" min="1000" step="500" value={settings.carouselIntervalMs} onChange={(e) => updateSetting("carouselIntervalMs", num(e.target.value))} className="border rounded px-2 py-1 w-20 text-center text-xs" />
              </label>
            </div>

            {/* Ads & Comments */}
            <div className="space-y-3">
              <h3 className="text-xs font-black text-slate-400 uppercase border-b pb-2">💬 Ads & Comments</h3>
              <label className="flex justify-between text-xs font-bold">
                Show product ads
                <input type="checkbox" checked={settings.adsEnabled} onChange={(e) => updateSetting("adsEnabled", e.target.checked)} />
              </label>
              <label className="flex justify-between text-xs font-bold">
                Max products
                <input type="number" min="1" max="6" value={settings.adsMaxProducts} onChange={(e) => updateSetting("adsMaxProducts", num(e.target.value))} className="border rounded px-2 py-1 w-16 text-center text-xs" />
              </label>
              <label className="flex justify-between text-xs font-bold">
                Placement
                <select value={settings.adsPlacement} onChange={(e) => updateSetting("adsPlacement", e.target.value)} className="border rounded px-2 py-1 text-xs">
                  <option value="sidebar">Sidebar</option>
                  <option value="inline">Inline</option>
                  <option value="both">Both</option>
                </select>
              </label>
              <label className="flex justify-between text-xs font-bold">
                Require approval
                <input type="checkbox" checked={settings.commentsRequireApproval} onChange={(e) => updateSetting("commentsRequireApproval", e.target.checked)} />
              </label>
              <label className="flex justify-between text-xs font-bold">
                Allow replies
                <input type="checkbox" checked={settings.commentsAllowReplies} onChange={(e) => updateSetting("commentsAllowReplies", e.target.checked)} />
              </label>
            </div>
          </div>

          {/* Product Suggestion Mode */}
          <div className="border-t pt-4 space-y-3">
            <h3 className="text-xs font-black text-slate-400 uppercase">🎯 Product Suggestion Mode (for all news pages)</h3>
            <div className="flex gap-4">
              {["latest", "random", "selected"].map((mode) => (
                <label key={mode} className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                  <input type="radio" name="suggestionMode" value={mode} checked={settings.productSuggestionMode === mode}
                    onChange={() => updateSetting("productSuggestionMode", mode)} className="h-4 w-4" />
                  {mode === "latest" && "Latest 5 Products"}
                  {mode === "random" && "Random 5 Products"}
                  {mode === "selected" && "Choose Manually"}
                </label>
              ))}
            </div>
            {settings.productSuggestionMode === "selected" && (
              <p className="text-[10px] text-slate-400">Go to "Suggested Products" tab to choose which products to display.</p>
            )}
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* COMMENTS TAB */}
      {/* ============================================ */}
      {activeTab === "comments" && (
        <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b pb-3">
            <h2 className="text-sm font-black text-slate-900 uppercase">Comment Moderation ({comments.length})</h2>
          </div>
          {commentsLoading ? (
            <div className="flex items-center justify-center py-16 text-slate-400 gap-2">
              <Loader2 size={18} className="animate-spin" /> <span className="text-xs font-bold">Loading comments…</span>
            </div>
          ) : (
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {comments.map((r) => {
              const [label, cls] = statusBadge(r);
              return (
                <div key={r.id} className="p-4 bg-slate-50 border rounded-xl space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-sm font-black">{r.name}</span>
                      <span className="text-[10px] text-slate-400 ml-2">· {r.email}</span>
                      <span className="text-[10px] text-slate-400 ml-2">· depth {r.depth}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${cls}`}>{label}</span>
                  </div>
                  <p className="text-sm text-slate-600">{r.body}</p>
                  {!r.isHardDeleted && (
                    <div className="flex gap-2 pt-1 flex-wrap">
                      {r.status !== "APPROVED" && (
                        <button onClick={() => approveComment(r.id)} className="text-[10px] font-black bg-emerald-50 text-emerald-700 px-3 py-1 rounded hover:bg-emerald-600 hover:text-white">✓ Approve</button>
                      )}
                      {r.status !== "REJECTED" && (
                        <button onClick={() => rejectComment(r.id)} className="text-[10px] font-black bg-amber-50 text-amber-700 px-3 py-1 rounded hover:bg-amber-600 hover:text-white">✕ Reject</button>
                      )}
                      {!r.isDeleted ? (
                        <button onClick={() => softDeleteComment(r.id)} className="text-[10px] font-black bg-slate-100 text-slate-600 px-3 py-1 rounded hover:bg-slate-600 hover:text-white">Soft Delete</button>
                      ) : (
                        <button onClick={() => restoreComment(r.id)} className="text-[10px] font-black bg-blue-50 text-blue-700 px-3 py-1 rounded hover:bg-blue-600 hover:text-white">Restore</button>
                      )}
                      <button onClick={() => hardDeleteComment(r.id)} className="text-[10px] font-black bg-rose-50 text-rose-600 px-3 py-1 rounded hover:bg-rose-600 hover:text-white">🗑️ Hard Delete</button>
                    </div>
                  )}
                </div>
              );
            })}
            {comments.length === 0 && <p className="text-center text-slate-400 py-8">No comments to moderate</p>}
          </div>
          )}
        </div>
      )}

      {/* ============================================ */}
      {/* SUGGESTED PRODUCTS TAB */}
      {/* ============================================ */}
      {activeTab === "ads" && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1 bg-white p-6 rounded-2xl border shadow-sm space-y-4">
            <h2 className="text-sm font-black text-slate-900 uppercase border-b pb-3">Select Target</h2>
            <label className="block text-xs font-bold text-slate-500">Apply products to:</label>
            <select value={selectedPostForAds} onChange={(e) => setSelectedPostForAds(e.target.value)}
              className="w-full text-xs border rounded-xl px-3 py-2.5">
              <option value="__all__">🌐 All News Pages (Global)</option>
              {posts.map((p) => (
                <option key={p.id} value={p.id}>📄 {p.title?.substring(0, 50)}</option>
              ))}
            </select>
            <button onClick={saveAdProducts} className="w-full bg-blue-600 text-white text-xs font-bold py-2.5 rounded-xl hover:bg-blue-700">
              💾 Save Product Selection
            </button>
          </div>

          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="text-sm font-black text-slate-900 uppercase">Products ({adProductIds.length} selected)</h2>
              <span className="text-xs text-slate-400">Click to toggle selection</span>
            </div>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {productsLoading ? (
                <div className="flex items-center justify-center py-16 text-slate-400 gap-2">
                  <Loader2 size={18} className="animate-spin" /> <span className="text-xs font-bold">Loading products…</span>
                </div>
              ) : allProducts.map((p) => {
                const on = adProductIds.includes(p.id);
                return (
                  <button key={p.id} type="button" onClick={() => toggleAdProduct(p.id)}
                    className={`w-full text-left flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      on ? "border-blue-500 bg-blue-50 shadow-sm" : "border-slate-200 hover:border-slate-300"
                    }`}>
                    <span className={`h-5 w-5 rounded-lg border-2 flex items-center justify-center text-[10px] font-black shrink-0 ${
                      on ? "bg-blue-600 text-white border-blue-600" : "border-slate-300 text-transparent"
                    }`}>
                      {on ? "✓" : ""}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-700 truncate">{p.name}</p>
                      <p className="text-[10px] text-slate-400">{p.id} · {p.brand}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}