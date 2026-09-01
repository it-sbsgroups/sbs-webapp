// src/components/admin/products/ProductImportExport.jsx

"use client";

import { useState, useRef, useEffect } from "react";
import productsApi from "@/lib/productsApi";
import categoriesApi from "@/lib/categoriesApi";
import brandsApi from "@/lib/brands/Api";
import { downloadCsv, toCsv, parseCsv } from "@/lib/csv";
import { Download, Upload, FileSpreadsheet, FileText, CheckCircle, X, Info } from "lucide-react";

// All columns for CSV export/import
const TEMPLATE_COLUMNS = [
  { key: "Name", label: "Name *" },
  { key: "SKU", label: "SKU (leave blank to auto-generate)" },
  { key: "Model", label: "Model" },
  { key: "Category", label: "Category (by name)" },
  { key: "Subcategory", label: "Subcategory (by name)" },
  { key: "Brand", label: "Brand (by name)" },
  { key: "Description", label: "Description" },
  { key: "Key Features", label: "Key Features" },
  { key: "Material", label: "Material" },
  { key: "Manufacturer", label: "Manufacturer" },
  { key: "Video URL", label: "Video URL" },
  { key: "Meta Title", label: "Meta Title" },
  { key: "Meta Description", label: "Meta Description" },
  { key: "Is Active", label: "Is Active (Yes/No, default Yes)" },
  { key: "Is Featured", label: "Is Featured (Yes/No, default No)" },
  { key: "Specifications", label: "Specifications (key: value; key2: value2)" },
  { key: "Applications", label: "Applications (semicolon-separated)" },
  { key: "Certifications", label: "Certifications (semicolon-separated)" },
  { key: "Image URLs", label: "Image URLs (semicolon-separated)" },
  { key: "Brochure URL", label: "Brochure URL" },
  { key: "Brochure Name", label: "Brochure Name" },
  { key: "Design File URL", label: "Design File URL" },
  { key: "Design File Name", label: "Design File Name" },
  { key: "Variants", label: "Variants (JSON array, optional)" },
];

const TEMPLATE_EXAMPLE_ROW = {
  Name: "Industrial Safety Helmet",
  SKU: "SH-200",
  Model: "SH-200",
  Category: "Safety Equipment",
  Subcategory: "Head Protection",
  Brand: "SBS Pro",
  Description: "Impact-resistant ABS shell with adjustable ratchet suspension.",
  "Key Features": "Lightweight; ANSI Z89.1 rated; 4-point suspension",
  Material: "ABS Plastic",
  Manufacturer: "SBS Industries",
  "Video URL": "",
  "Meta Title": "",
  "Meta Description": "",
  "Is Active": "Yes",
  "Is Featured": "No",
  Specifications: "Weight: 350g; Color: Yellow; Standard: ANSI Z89.1",
  Applications: "Construction; Manufacturing; Warehousing",
  Certifications: "ISO 9001; CE Marked",
  "Image URLs": "https://example.com/helmet.jpg",
  "Brochure URL": "https://example.com/brochure.pdf",
  "Brochure Name": "Safety Helmet Brochure",
  "Design File URL": "https://example.com/helmet.dwg",
  "Design File Name": "helmet.dwg",
  Variants: JSON.stringify([
    { name: "Yellow", attributes: { Color: "Yellow" }, model: "SH-200-Y", isActive: true },
    { name: "Blue", attributes: { Color: "Blue" }, model: "SH-200-B", isActive: true }
  ])
};

const STORAGE_KEY = "sbs_admin_import_state";

// Helper utilities
const truthy = (v) => /^(y|yes|true|1)$/i.test(String(v || "").trim());
const parseList = (v) => String(v || "").split(";").map((s) => s.trim()).filter(Boolean);
const parseKeyValueList = (v) => {
  const out = {};
  for (const entry of parseList(v)) {
    const idx = entry.indexOf(":");
    if (idx === -1) continue;
    const key = entry.slice(0, idx).trim();
    const value = entry.slice(idx + 1).trim();
    if (key) out[key] = value;
  }
  return out;
};

const findIdByName = (list, name, nameKey = "name") => {
  if (!name?.trim()) return undefined;
  const match = list.find((x) => (x[nameKey] || "").trim().toLowerCase() === name.trim().toLowerCase());
  return match?.id;
};

export default function ProductImportExport({ products, setProducts }) {
  const fileInputRef = useRef(null);
  const [importStatus, setImportStatus] = useState(null);
  const [importPreview, setImportPreview] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [importing, setImporting] = useState(false);
  const [fileName, setFileName] = useState("");
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [importType, setImportType] = useState("csv"); // 'csv' or 'json'

  useEffect(() => {
    categoriesApi.getAll().then((c) => setCategories(Array.isArray(c) ? c : [])).catch(() => {});
    categoriesApi.getAllSubcategories().then((s) => setSubcategories(Array.isArray(s) ? s : [])).catch(() => {});
    brandsApi.getAll().then((b) => setBrands(Array.isArray(b) ? b : (b?.data || []))).catch(() => {});
  }, []);

  // Restore from sessionStorage
  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.importPreview) setImportPreview(parsed.importPreview);
        if (parsed.showPreview) setShowPreview(parsed.showPreview);
        if (parsed.fileName) setFileName(parsed.fileName);
        if (parsed.importStatus) setImportStatus(parsed.importStatus);
        if (parsed.importType) setImportType(parsed.importType);
      } catch {}
    }
  }, []);

  useEffect(() => {
    const state = { importPreview, showPreview, fileName, importStatus, importType };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [importPreview, showPreview, fileName, importStatus, importType]);

  // ---- Export CSV ----
  const handleExportCSV = () => {
    // Build CSV rows from the products array
    const rows = products.map((p) => ({
      Name: p.name || "",
      SKU: p.sku || "",
      Model: p.model || "",
      Category: categories.find((c) => c.id === p.categoryId)?.name || "",
      Subcategory: subcategories.find((s) => s.id === p.subcategoryId)?.name || "",
      Brand: p.brand?.name || (typeof p.brand === "string" ? p.brand : ""),
      Description: p.description || "",
      "Key Features": p.keyFeatures || "",
      Material: p.material || "",
      Manufacturer: p.manufacturer || "",
      "Video URL": p.videoUrl || "",
      "Meta Title": p.metaTitle || "",
      "Meta Description": p.metaDescription || "",
      "Is Active": p.isActive !== false ? "Yes" : "No",
      "Is Featured": p.isFeatured ? "Yes" : "No",
      Specifications: p.specifications
        ? Object.entries(p.specifications).map(([k, v]) => `${k}: ${v}`).join("; ")
        : "",
      Applications: (p.applications || []).map((a) => (typeof a === "string" ? a : a.name)).join("; "),
      Certifications: (p.certifications || []).map((c) => (typeof c === "string" ? c : c.name)).join("; "),
      "Image URLs": (p.images || []).map((img) => img.url).join("; "),
      "Brochure URL": p.brochureUrl || "",
      "Brochure Name": p.brochureName || "",
      "Design File URL": p.designFileUrl || "",
      "Design File Name": p.designFileName || "",
      Variants: JSON.stringify(p.variants || []),
    }));

    const csv = toCsv(rows, TEMPLATE_COLUMNS.map((c) => ({ key: c.key, label: c.key })));
    downloadCsv(`products-export-${new Date().toISOString().split("T")[0]}.csv`, csv);
  };

  // ---- Export JSON ----
  const handleExportJSON = () => {
    const data = products.map((p) => ({
      ...p,
      // Ensure variants are included
      variants: p.variants || [],
    }));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `products-export-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ---- Download Template ----
  const handleDownloadTemplate = () => {
    const csv = toCsv([TEMPLATE_EXAMPLE_ROW], TEMPLATE_COLUMNS.map((c) => ({ key: c.key, label: c.key })));
    downloadCsv("products-import-template.csv", csv);
  };

  // ---- File upload & parse ----
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      if (file.name.endsWith(".json")) {
        // Parse JSON
        try {
          const data = JSON.parse(content);
          if (!Array.isArray(data)) {
            alert("JSON file must contain an array of products.");
            return;
          }
          setImportPreview(data);
          setImportType("json");
        } catch (err) {
          alert("Invalid JSON file: " + err.message);
          return;
        }
      } else {
        // Parse CSV
        const parsed = parseCsv(content).filter((row) => row["Name"]?.trim());
        setImportPreview(parsed);
        setImportType("csv");
      }
      setShowPreview(true);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ---- Convert CSV row to product object ----
  const csvRowToProduct = (row) => {
    const categoryId = findIdByName(categories, row["Category"]);
    const subcategoryId = findIdByName(subcategories, row["Subcategory"]);
    const brandId = findIdByName(brands, row["Brand"], "name");

    let variants = [];
    if (row["Variants"]) {
      try {
        variants = JSON.parse(row["Variants"]);
      } catch (e) {
        // ignore invalid JSON, treat as no variants
      }
    }

    return {
      name: row["Name"],
      sku: row["SKU"]?.trim() || undefined,
      model: row["Model"] || undefined,
      categoryId: categoryId || undefined,
      subcategoryId: subcategoryId || undefined,
      brandId: brandId || undefined,
      description: row["Description"] || undefined,
      keyFeatures: row["Key Features"] || undefined,
      material: row["Material"] || undefined,
      manufacturer: row["Manufacturer"] || undefined,
      videoUrl: row["Video URL"] || undefined,
      metaTitle: row["Meta Title"] || undefined,
      metaDescription: row["Meta Description"] || undefined,
      isActive: row["Is Active"] ? truthy(row["Is Active"]) : true,
      isFeatured: row["Is Featured"] ? truthy(row["Is Featured"]) : false,
      specifications: row["Specifications"]?.trim()
        ? parseKeyValueList(row["Specifications"])
        : undefined,
      applications: parseList(row["Applications"]).length
        ? parseList(row["Applications"]).map((name) => ({ name }))
        : undefined,
      certifications: parseList(row["Certifications"]).length
        ? parseList(row["Certifications"])
        : undefined,
      images: parseList(row["Image URLs"]).length
        ? parseList(row["Image URLs"]).map((url, i) => ({ url, sortOrder: i }))
        : undefined,
      brochureUrl: row["Brochure URL"] || undefined,
      brochureName: row["Brochure Name"] || undefined,
      designFileUrl: row["Design File URL"] || undefined,
      designFileName: row["Design File Name"] || undefined,
      variants: variants.length ? variants : undefined,
    };
  };

  // ---- Confirm import ----
  const confirmImport = async () => {
    setImporting(true);
    try {
      let productsToImport;
      if (importType === "json") {
        productsToImport = importPreview; // already array of product objects
      } else {
        productsToImport = importPreview.map(csvRowToProduct);
      }

      const result = await productsApi.bulkImport(productsToImport);
      const errors = result?.errors || [];
      setImportStatus({
        type: errors.length ? "partial" : "success",
        message: `Imported ${result?.success ?? importPreview.length} of ${(result?.success ?? importPreview.length) + errors.length} product(s).`,
        errors,
      });
      setShowPreview(false);
      setImportPreview([]);
      setFileName("");
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      setImportStatus({ type: "error", message: "Import failed: " + error.message, errors: [] });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Import & Export</h2>
        <p className="mt-1 text-sm text-slate-500">
          Export your catalog (including variants, brochures, design files) or bulk-import from CSV/JSON.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Export section */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Download size={20} className="text-blue-600" />
            <h3 className="text-lg font-semibold">Export</h3>
          </div>
          <button
            onClick={handleExportCSV}
            className="flex items-center justify-center gap-2 rounded-xl border-2 border-slate-200 px-5 py-4 font-medium hover:bg-slate-50 w-full"
          >
            <FileText size={20} className="text-green-600" /> Export CSV (all fields)
          </button>
          <button
            onClick={handleExportJSON}
            className="flex items-center justify-center gap-2 rounded-xl border-2 border-slate-200 px-5 py-4 font-medium hover:bg-slate-50 w-full"
          >
            <FileSpreadsheet size={20} className="text-blue-600" /> Export JSON (complete data)
          </button>
          <button
            onClick={handleDownloadTemplate}
            className="flex items-center justify-center gap-2 rounded-xl border-2 border-slate-200 px-5 py-4 font-medium hover:bg-slate-50 w-full"
          >
            <FileSpreadsheet size={20} className="text-blue-600" /> Download Import Template
          </button>
          <p className="flex items-start gap-1.5 text-[11px] text-slate-400">
            <Info size={13} className="shrink-0 mt-0.5" />
            Only <strong>Name</strong> is required. Variants are included as JSON in a single cell (CSV) or as nested objects (JSON).
          </p>
        </div>

        {/* Import section */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Upload size={20} className="text-purple-600" />
            <h3 className="text-lg font-semibold">Import</h3>
          </div>
          <input ref={fileInputRef} type="file" accept=".csv,.json" onChange={handleFileUpload} className="hidden" />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 px-5 py-6 font-medium text-slate-500 hover:border-blue-400 w-full"
          >
            <Upload size={20} /> Upload CSV or JSON
          </button>
          {fileName && <p className="text-xs text-slate-500 text-center">📄 {fileName}</p>}
          <p className="text-[11px] text-slate-400">
            For CSV: Category/Subcategory/Brand are matched by name. Variants are expected as a JSON array string.
            For JSON: The file must contain an array of product objects.
          </p>
        </div>
      </div>

      {/* Import status */}
      {importStatus && (
        <div
          className={`rounded-2xl border p-4 space-y-2 ${
            importStatus.type === "success"
              ? "bg-green-50 border-green-200 text-green-700"
              : importStatus.type === "partial"
              ? "bg-amber-50 border-amber-200 text-amber-800"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          <div className="flex items-center gap-3">
            <CheckCircle size={20} /> {importStatus.message}
          </div>
          {importStatus.errors?.length > 0 && (
            <ul className="text-xs space-y-1 max-h-40 overflow-auto pl-7 list-disc">
              {importStatus.errors.slice(0, 20).map((e, i) => (
                <li key={i}>Row {e.row}{e.product ? ` (${e.product})` : ""}: {e.error || e.message}</li>
              ))}
              {importStatus.errors.length > 20 && <li>…and {importStatus.errors.length - 20} more</li>}
            </ul>
          )}
        </div>
      )}

      {/* Import Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-4xl rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h3 className="text-lg font-bold">
                Import Preview ({importPreview.length} products)
              </h3>
              <button
                onClick={() => { setShowPreview(false); setImportPreview([]); setFileName(""); sessionStorage.removeItem(STORAGE_KEY); }}
                className="rounded-lg p-2 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>
            <div className="max-h-[50vh] overflow-y-auto p-6">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs">Name</th>
                    <th className="px-3 py-2 text-left text-xs">Model</th>
                    <th className="px-3 py-2 text-left text-xs">Category</th>
                    <th className="px-3 py-2 text-left text-xs">Brand</th>
                    <th className="px-3 py-2 text-left text-xs">Variants</th>
                  </tr>
                </thead>
                <tbody>
                  {importPreview.map((row, i) => {
                    const productName = importType === "json" ? row.name : row["Name"];
                    const model = importType === "json" ? row.model : row["Model"];
                    const categoryName = importType === "json"
                      ? (categories.find((c) => c.id === row.categoryId)?.name || "")
                      : row["Category"];
                    const brandName = importType === "json"
                      ? (row.brand?.name || "")
                      : row["Brand"];
                    const variantCount = importType === "json"
                      ? (row.variants?.length || 0)
                      : (row["Variants"] ? JSON.parse(row["Variants"]).length : 0);
                    return (
                      <tr key={i} className="border-t">
                        <td className="px-3 py-2 text-xs">{productName}</td>
                        <td className="px-3 py-2 text-xs">{model || "—"}</td>
                        <td className="px-3 py-2 text-xs">{categoryName || "—"}</td>
                        <td className="px-3 py-2 text-xs">{brandName || "—"}</td>
                        <td className="px-3 py-2 text-xs">{variantCount}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-end gap-3 border-t px-6 py-4">
              <button
                onClick={() => { setShowPreview(false); setImportPreview([]); setFileName(""); sessionStorage.removeItem(STORAGE_KEY); }}
                className="rounded-xl border px-5 py-3 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirmImport}
                disabled={importing}
                className="rounded-xl bg-green-600 px-6 py-3 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
              >
                {importing ? "Importing..." : `Import ${importPreview.length} Products`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}