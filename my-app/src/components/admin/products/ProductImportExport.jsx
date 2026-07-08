// src/components/admin/products/ProductImportExport.jsx
"use client";

import { useState, useRef, useEffect } from "react";
import productsApi from "@/lib/productsApi";
import { Download, Upload, FileSpreadsheet, FileText, CheckCircle, X } from "lucide-react";

const STORAGE_KEY = "sbs_admin_import_state";

export default function ProductImportExport({ products, setProducts }) {
  const fileInputRef = useRef(null);
  const [importStatus, setImportStatus] = useState(null);
  const [importPreview, setImportPreview] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [importing, setImporting] = useState(false);
  const [fileName, setFileName] = useState("");

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
      } catch {}
    }
  }, []);

  useEffect(() => {
    const state = { importPreview, showPreview, fileName, importStatus };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [importPreview, showPreview, fileName, importStatus]);

  const handleExportCSV = async () => {
    try {
      await productsApi.downloadCSV();
    } catch (error) {
      alert("Failed to export: " + error.message);
    }
  };

  const parseCSV = (text) => {
    const lines = text.split("\n").filter((line) => line.trim());
    if (lines.length < 2) return [];
    const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || "";
      });
      if (row["Name"]) rows.push(row);
    }
    return rows;
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const parsed = parseCSV(event.target.result);
      setImportPreview(parsed);
      setShowPreview(true);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const confirmImport = async () => {
    setImporting(true);
    try {
      const productsToImport = importPreview.map((row) => ({
        name: row["Name"] || "Imported Product",
        model: row["Model"] || "",
        categoryId: row["Category ID"] || "",
        brandId: row["Brand ID"] || "",
        keyFeatures: row["Key Features"] || "",
        manufacturer: row["Manufacturer"] || "",
        material: row["Material"] || "",
      }));
      const result = await productsApi.bulkImport(productsToImport);
      setImportStatus({ type: "success", message: `${result?.success || importPreview.length} products imported!` });
      setShowPreview(false);
      setImportPreview([]);
      setFileName("");
      sessionStorage.removeItem(STORAGE_KEY);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      setImportStatus({ type: "error", message: "Import failed: " + error.message });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Import & Export</h2>
        <p className="mt-1 text-sm text-slate-500">Export catalog or import products from CSV.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2"><Download size={20} className="text-blue-600" /><h3 className="text-lg font-semibold">Export</h3></div>
          <button onClick={handleExportCSV} className="flex items-center justify-center gap-2 rounded-xl border-2 border-slate-200 px-5 py-4 font-medium hover:bg-slate-50 w-full">
            <FileText size={20} className="text-green-600" /> Export CSV
          </button>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2"><Upload size={20} className="text-purple-600" /><h3 className="text-lg font-semibold">Import</h3></div>
          <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
          <button onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 px-5 py-6 font-medium text-slate-500 hover:border-blue-400 w-full">
            <Upload size={20} /> Upload CSV File
          </button>
          {fileName && <p className="text-xs text-slate-500 text-center">📄 {fileName}</p>}
        </div>
      </div>

      {importStatus && (
        <div className={`rounded-2xl border p-4 flex items-center gap-3 ${importStatus.type === "success" ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"}`}>
          <CheckCircle size={20} /> {importStatus.message}
        </div>
      )}

      {showPreview && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-3xl rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h3 className="text-lg font-bold">Import Preview ({importPreview.length} products)</h3>
              <button onClick={() => { setShowPreview(false); setImportPreview([]); setFileName(""); sessionStorage.removeItem(STORAGE_KEY); }} className="rounded-lg p-2 hover:bg-slate-100">
                <X size={20} />
              </button>
            </div>
            <div className="max-h-[50vh] overflow-y-auto p-6">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50"><tr><th className="px-3 py-2 text-left text-xs">Name</th><th className="px-3 py-2 text-left text-xs">Model</th></tr></thead>
                <tbody>
                  {importPreview.map((row, i) => (
                    <tr key={i} className="border-t"><td className="px-3 py-2 text-xs">{row["Name"]}</td><td className="px-3 py-2 text-xs">{row["Model"] || "—"}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-end gap-3 border-t px-6 py-4">
              <button onClick={() => { setShowPreview(false); setImportPreview([]); setFileName(""); sessionStorage.removeItem(STORAGE_KEY); }} className="rounded-xl border px-5 py-3 text-sm">Cancel</button>
              <button onClick={confirmImport} disabled={importing} className="rounded-xl bg-green-600 px-6 py-3 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50">
                {importing ? "Importing..." : `Import ${importPreview.length} Products`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}