"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { PRODUCTS, PRODUCT_CATEGORIES, PRODUCT_SUBCATEGORIES, PRODUCT_DISTRIBUTORS } from "@/data/products";
import {
  Save, ArrowLeft, Trash2, ImagePlus, Plus, X,
  Package, Tag, Shield, Camera, FileText, Settings,
  ChevronLeft, Eye
} from "lucide-react";

export default function SingleProductEditPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.productId;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("basic"); // basic | images | specs | certifications | seo

  const categories = PRODUCT_CATEGORIES;
  const subcategories = PRODUCT_SUBCATEGORIES;
  const brands = PRODUCT_DISTRIBUTORS;

  // Form state
  const [form, setForm] = useState(null);
  const [newCert, setNewCert] = useState("");
  const [newSpecKey, setNewSpecKey] = useState("");
  const [newSpecValue, setNewSpecValue] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newImageTitle, setNewImageTitle] = useState("");

  useEffect(() => {
    // Find product by ID
    const found = PRODUCTS.find((p) => p.id === productId);
    if (found) {
      setProduct(found);
      setForm(JSON.parse(JSON.stringify(found))); // Deep clone
    }
    setLoading(false);
  }, [productId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!product || !form) {
    return (
      <div className="text-center py-16">
        <Package className="mx-auto h-16 w-16 text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-700">Product Not Found</h2>
        <p className="text-sm text-slate-500 mt-1">The product you are looking for does not exist.</p>
        <Link
          href="/admin/products"
          className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:underline"
        >
          <ArrowLeft size={16} /> Back to Products
        </Link>
      </div>
    );
  }

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    if (!form.name?.trim()) {
      alert("Product name is required");
      return;
    }
    // In production: PUT/PATCH to API
    console.log("Saving product:", form);
    alert("Product updated successfully!");
    router.push("/admin/products");
  };

  const handleDelete = () => {
    if (!confirm("Are you sure you want to delete this product? This action cannot be undone.")) return;
    // In production: DELETE to API
    console.log("Deleting product:", productId);
    alert("Product deleted!");
    router.push("/admin/products");
  };

  const addCertification = () => {
    if (!newCert.trim()) return;
    setForm((prev) => ({
      ...prev,
      certifications: [...(prev.certifications || []), newCert.trim()],
    }));
    setNewCert("");
  };

  const removeCertification = (index) => {
    setForm((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index),
    }));
  };

  const addSpecification = () => {
    if (!newSpecKey.trim() || !newSpecValue.trim()) return;
    setForm((prev) => ({
      ...prev,
      specifications: { ...prev.specifications, [newSpecKey.trim()]: newSpecValue.trim() },
    }));
    setNewSpecKey("");
    setNewSpecValue("");
  };

  const removeSpecification = (key) => {
    setForm((prev) => {
      const updated = { ...prev.specifications };
      delete updated[key];
      return { ...prev, specifications: updated };
    });
  };

  const addImage = () => {
    if (!newImageUrl.trim()) return;
    setForm((prev) => ({
      ...prev,
      images: [
        ...(prev.images || []),
        { title: newImageTitle || "Image", url: newImageUrl.trim(), angle: "", alternateText: "" },
      ],
    }));
    setNewImageUrl("");
    setNewImageTitle("");
  };

  const removeImage = (index) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const getFilteredSubcategories = () => {
    return subcategories.filter((s) => s.categoryId === form.categoryId);
  };

  const tabs = [
    { id: "basic", label: "Basic Info", icon: Package },
    { id: "images", label: "Images", icon: Camera },
    { id: "specs", label: "Specifications", icon: FileText },
    { id: "certs", label: "Certifications", icon: Shield },
    { id: "seo", label: "SEO & Meta", icon: Tag },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/products"
            className="rounded-xl border p-2.5 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900">{product.name}</h1>
              <span className="rounded-full bg-blue-50 px-3 py-0.5 text-[10px] font-bold text-blue-700">
                {product.id}
              </span>
            </div>
            <p className="text-sm text-slate-500">
              {(typeof product.brand === "object" ? product.brand?.name : product.brand)} · {product.model || "No Model"} · Last updated: {new Date(product.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link
            href={`/products/${product.id}`}
            target="_blank"
            className="flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm hover:bg-slate-50"
          >
            <Eye size={16} /> View Public Page
          </Link>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
          >
            <Trash2 size={16} /> Delete
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Save size={16} /> Save Changes
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-1 border-b pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Icon size={16} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* BASIC INFO */}
        {activeTab === "basic" && (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-4">
              <h3 className="text-lg font-semibold">General Information</h3>
              <div>
                <label className="mb-1.5 block text-xs font-medium">Product Name *</label>
                <input type="text" value={form.name || ""} onChange={(e) => updateField("name", e.target.value)}
                  className="w-full rounded-xl border px-4 py-3 text-sm" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium">Model Number</label>
                  <input type="text" value={form.model || ""} onChange={(e) => updateField("model", e.target.value)}
                    className="w-full rounded-xl border px-4 py-3 text-sm" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium">Brand Display Name</label>
                  <input type="text" value={form.brand || ""} onChange={(e) => updateField("brand", e.target.value)}
                    className="w-full rounded-xl border px-4 py-3 text-sm" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium">Key Features</label>
                <textarea rows={4} value={form.keyFeatures || ""} onChange={(e) => updateField("keyFeatures", e.target.value)}
                  className="w-full rounded-xl border px-4 py-3 text-sm resize-none" />
              </div>
            </div>

            <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-4">
              <h3 className="text-lg font-semibold">Classification</h3>
              <div>
                <label className="mb-1.5 block text-xs font-medium">Category</label>
                <select value={form.categoryId || ""} onChange={(e) => { updateField("categoryId", e.target.value); updateField("subcategoryId", ""); }}
                  className="w-full rounded-xl border px-4 py-3 text-sm">
                  {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium">Subcategory</label>
                <select value={form.subcategoryId || ""} onChange={(e) => updateField("subcategoryId", e.target.value)}
                  className="w-full rounded-xl border px-4 py-3 text-sm">
                  <option value="">Select Subcategory</option>
                  {getFilteredSubcategories().map((s) => (<option key={s.id} value={s.id}>{s.name}</option>))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium">Brand/Distributor</label>
                <select value={form.distributorId || ""} onChange={(e) => updateField("distributorId", e.target.value)}
                  className="w-full rounded-xl border px-4 py-3 text-sm">
                  {brands.map((b) => (<option key={b.id} value={b.id}>{b.name}</option>))}
                </select>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium">Manufacturer</label>
                  <input type="text" value={form.manufacturer || ""} onChange={(e) => updateField("manufacturer", e.target.value)}
                    className="w-full rounded-xl border px-4 py-3 text-sm" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium">Material</label>
                  <input type="text" value={form.material || ""} onChange={(e) => updateField("material", e.target.value)}
                    className="w-full rounded-xl border px-4 py-3 text-sm" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* IMAGES */}
        {activeTab === "images" && (
          <div className="space-y-6">
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Product Images ({(form.images || []).length})</h3>
              
              <div className="grid gap-3 md:grid-cols-4">
                {(form.images || []).map((img, i) => (
                  <div key={i} className="relative rounded-xl border p-2 group">
                    <img src={img.url} alt={img.title} className="h-32 w-full object-cover rounded-lg" />
                    <p className="mt-1 text-xs font-medium truncate">{img.title || "Untitled"}</p>
                    <button
                      onClick={() => removeImage(i)}
                      className="absolute -top-1.5 -right-1.5 rounded-full bg-red-500 p-0.5 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-xl bg-slate-50 p-4">
                <h4 className="text-sm font-semibold mb-3">Add New Image</h4>
                <div className="flex gap-2">
                  <input type="text" value={newImageTitle} onChange={(e) => setNewImageTitle(e.target.value)}
                    placeholder="Image title" className="w-1/3 rounded-lg border px-3 py-2 text-sm" />
                  <input type="text" value={newImageUrl} onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="Image URL" className="flex-1 rounded-lg border px-3 py-2 text-sm" />
                  <button onClick={addImage}
                    className="flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
                    <ImagePlus size={14} /> Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SPECIFICATIONS */}
        {activeTab === "specs" && (
          <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-semibold">Specifications</h3>
            
            <div className="space-y-2">
              {Object.entries(form.specifications || {}).map(([key, value]) => (
                <div key={key} className="flex items-center gap-3 rounded-xl border p-3">
                  <span className="text-xs font-bold text-slate-600 min-w-[120px]">{key}</span>
                  <span className="flex-1 text-sm text-slate-800">{value}</span>
                  <button onClick={() => removeSpecification(key)} className="text-red-400 hover:text-red-600">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {(Object.keys(form.specifications || {}).length === 0) && (
                <p className="text-sm text-slate-400 py-4 text-center">No specifications added yet.</p>
              )}
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <h4 className="text-sm font-semibold mb-3">Add Specification</h4>
              <div className="flex gap-2">
                <input type="text" value={newSpecKey} onChange={(e) => setNewSpecKey(e.target.value)}
                  placeholder="Key (e.g. Weight)" className="flex-1 rounded-lg border px-3 py-2 text-sm" />
                <input type="text" value={newSpecValue} onChange={(e) => setNewSpecValue(e.target.value)}
                  placeholder="Value (e.g. 5kg)" className="flex-1 rounded-lg border px-3 py-2 text-sm" />
                <button onClick={addSpecification}
                  className="flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
                  <Plus size={14} /> Add
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CERTIFICATIONS */}
        {activeTab === "certs" && (
          <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-semibold">Certifications</h3>
            
            <div className="flex flex-wrap gap-2">
              {(form.certifications || []).map((cert, i) => (
                <span key={i} className="flex items-center gap-1 rounded-lg bg-green-50 border border-green-200 px-3 py-1.5 text-xs font-medium text-green-700">
                  <Shield size={12} /> {cert}
                  <button onClick={() => removeCertification(i)} className="ml-1 text-red-500 hover:text-red-700">
                    <X size={10} />
                  </button>
                </span>
              ))}
              {(form.certifications || []).length === 0 && (
                <p className="text-sm text-slate-400 py-4 w-full text-center">No certifications added yet.</p>
              )}
            </div>

            <div className="flex gap-2">
              <input type="text" value={newCert} onChange={(e) => setNewCert(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCertification()}
                placeholder="Add certification (e.g. ISO 9001:2015)" className="flex-1 rounded-lg border px-3 py-2 text-sm" />
              <button onClick={addCertification}
                className="flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
                <Plus size={14} /> Add
              </button>
            </div>
          </div>
        )}

        {/* SEO & META */}
        {activeTab === "seo" && (
          <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-semibold">SEO & Meta Information</h3>
            <p className="text-sm text-slate-500">Configure how this product appears in search engines.</p>
            
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium">Meta Title</label>
                <input type="text" value={form.metaTitle || form.name || ""}
                  onChange={(e) => updateField("metaTitle", e.target.value)}
                  className="w-full rounded-xl border px-4 py-3 text-sm" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium">Meta Description</label>
                <textarea rows={3} value={form.metaDescription || form.keyFeatures || ""}
                  onChange={(e) => updateField("metaDescription", e.target.value)}
                  className="w-full rounded-xl border px-4 py-3 text-sm resize-none" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium">URL Slug</label>
                <input type="text" value={form.slug || form.id?.toLowerCase() || ""}
                  onChange={(e) => updateField("slug", e.target.value)}
                  className="w-full rounded-xl border px-4 py-3 text-sm font-mono" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium">Keywords (comma separated)</label>
                <input type="text" value={(form.keywords || []).join(", ")}
                  onChange={(e) => updateField("keywords", e.target.value.split(",").map((k) => k.trim()).filter(Boolean))}
                  className="w-full rounded-xl border px-4 py-3 text-sm" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom Save Bar */}
      <div className="sticky bottom-0 -mx-6 -mb-6 px-6 py-4 bg-white border-t flex items-center justify-between rounded-b-2xl">
        <p className="text-xs text-slate-400">
          Last saved: {new Date().toLocaleString()}
        </p>
        <div className="flex gap-3">
          <Link href="/admin/products"
            className="rounded-xl border px-5 py-3 text-sm hover:bg-slate-50">
            Cancel
          </Link>
          <button onClick={handleSave}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700">
            <Save size={16} /> Save Product
          </button>
        </div>
      </div>
    </div>
  );
}