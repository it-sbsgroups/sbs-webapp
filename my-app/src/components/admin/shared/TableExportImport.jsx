"use client";

import { useRef, useState } from "react";
import { Download, Upload, X, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { toCsv, downloadCsv, parseCsv } from "@/lib/csv";

/**
 * <TableExportImport />
 *
 * Drop-in export/import toolbar for any admin table page — works purely off
 * the data + columns already loaded on the page, so it needs no new backend
 * endpoints to plug into a table.
 *
 * Props:
 *  - data:            array of row objects currently shown in the table
 *  - columns:         [{ key, label, exportValue?(row) }] — same shape used
 *                      to render the table, reused here for the CSV header
 *  - filenamePrefix:  e.g. "subscribers" → subscribers-2026-07-15.csv
 *  - onImportRow:     async (parsedCsvRowObject) => void — called once per
 *                      row from the imported file; throw to mark that row
 *                      as failed (its error is shown in the results list)
 *  - onImported:      called once after all rows have been processed, so the
 *                      parent can refresh its list from the server
 *  - sampleColumns:   optional override of which columns appear in the
 *                      "Download template" sample CSV (defaults to `columns`)
 */
export default function TableExportImport({
  data = [],
  columns = [],
  filenamePrefix = "export",
  onImportRow,
  onImported,
  sampleColumns,
}) {
  const fileRef = useRef(null);
  const [preview, setPreview] = useState(null); // parsed rows pending confirmation
  const [fileName, setFileName] = useState("");
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null); // { success, errors: [{row, message}] }

  const handleExport = () => {
    const csv = toCsv(data, columns);
    const date = new Date().toISOString().slice(0, 10);
    downloadCsv(`${filenamePrefix}-${date}.csv`, csv);
  };

  const handleDownloadTemplate = () => {
    const cols = sampleColumns || columns;
    const csv = toCsv([], cols);
    downloadCsv(`${filenamePrefix}-template.csv`, csv);
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setResult(null);
    try {
      const text = await file.text();
      const rows = parseCsv(text);
      setPreview(rows);
    } catch {
      alert("Couldn't read that file — please make sure it's a valid CSV.");
    } finally {
      e.target.value = ""; // allow re-selecting the same file later
    }
  };

  const confirmImport = async () => {
    if (!preview?.length || !onImportRow) return;
    setImporting(true);
    const errors = [];
    let success = 0;
    for (let i = 0; i < preview.length; i++) {
      try {
        await onImportRow(preview[i]);
        success++;
      } catch (err) {
        errors.push({ row: i + 2, message: err?.message || "Import failed" }); // +2: header row + 1-index
      }
    }
    setImporting(false);
    setResult({ success, errors });
    setPreview(null);
    if (onImported) onImported();
  };

  const cancelPreview = () => {
    setPreview(null);
    setFileName("");
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        type="button"
        onClick={handleExport}
        disabled={!data.length}
        title="Export the current table to CSV"
        className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40"
      >
        <Download size={14} /> Export CSV
      </button>

      {onImportRow && (
        <>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            title="Import rows from a CSV file"
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          >
            <Upload size={14} /> Import CSV
          </button>
          <button
            type="button"
            onClick={handleDownloadTemplate}
            title="Download a blank CSV with the right column headers"
            className="text-[11px] font-semibold text-blue-600 hover:underline"
          >
            Download template
          </button>
          <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleFileSelect} />
        </>
      )}

      {/* Preview / confirm modal */}
      {preview && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={cancelPreview}>
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <div>
                <h3 className="text-sm font-black text-slate-900">Import Preview</h3>
                <p className="text-[11px] text-slate-400 font-medium">{fileName} — {preview.length} row{preview.length !== 1 ? "s" : ""} found</p>
              </div>
              <button onClick={cancelPreview} className="p-1.5 text-slate-400 hover:text-slate-700"><X size={18} /></button>
            </div>

            <div className="overflow-auto p-5 flex-1">
              {preview.length === 0 ? (
                <p className="text-xs text-slate-400">No rows found. Make sure the file has a header row and at least one data row.</p>
              ) : (
                <table className="w-full text-[11px] border-collapse">
                  <thead>
                    <tr>
                      {Object.keys(preview[0]).map((h) => (
                        <th key={h} className="text-left font-black text-slate-500 uppercase border-b border-slate-200 px-2 py-1.5 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.slice(0, 8).map((row, i) => (
                      <tr key={i} className="border-b border-slate-100">
                        {Object.keys(preview[0]).map((h) => (
                          <td key={h} className="px-2 py-1.5 text-slate-700 whitespace-nowrap max-w-[160px] truncate">{row[h]}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {preview.length > 8 && (
                <p className="text-[10px] text-slate-400 mt-2">…and {preview.length - 8} more row(s), not shown.</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-slate-200">
              <button onClick={cancelPreview} className="text-xs font-bold px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50">Cancel</button>
              <button
                onClick={confirmImport}
                disabled={importing || preview.length === 0}
                className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {importing && <Loader2 size={14} className="animate-spin" />}
                {importing ? "Importing…" : `Import ${preview.length} row${preview.length !== 1 ? "s" : ""}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Result summary toast */}
      {result && (
        <div className="fixed bottom-5 right-5 z-50 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 max-w-sm w-full">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2">
              {result.errors.length === 0 ? (
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="text-xs font-black text-slate-900">
                  Imported {result.success} of {result.success + result.errors.length} row{result.success + result.errors.length !== 1 ? "s" : ""}
                </p>
                {result.errors.length > 0 && (
                  <ul className="mt-1.5 space-y-0.5 max-h-28 overflow-auto">
                    {result.errors.slice(0, 5).map((e, i) => (
                      <li key={i} className="text-[10px] text-slate-500">Row {e.row}: {e.message}</li>
                    ))}
                    {result.errors.length > 5 && (
                      <li className="text-[10px] text-slate-400">…and {result.errors.length - 5} more</li>
                    )}
                  </ul>
                )}
              </div>
            </div>
            <button onClick={() => setResult(null)} className="p-1 text-slate-400 hover:text-slate-700"><X size={14} /></button>
          </div>
        </div>
      )}
    </div>
  );
}
