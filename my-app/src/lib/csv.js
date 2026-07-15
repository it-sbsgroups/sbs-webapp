// Minimal, dependency-free CSV helpers used by the admin Export/Import toolbar.
// Handles quoted fields, embedded commas, embedded quotes ("") and newlines —
// unlike a naive `line.split(",")` parser.

export function toCsv(rows, columns) {
  const escape = (val) => {
    const s = val === null || val === undefined ? "" : String(val);
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const header = columns.map((c) => escape(c.label || c.key)).join(",");
  const lines = rows.map((row) =>
    columns
      .map((c) => escape(typeof c.exportValue === "function" ? c.exportValue(row) : row[c.key]))
      .join(",")
  );
  return [header, ...lines].join("\r\n");
}

export function downloadCsv(filename, csvString) {
  const blob = new Blob(["\uFEFF" + csvString], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Parses CSV text (RFC4180: quoted fields, "" escaped quotes, commas/newlines
// inside quotes) into an array of objects keyed by the header row.
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  const pushField = () => { row.push(field); field = ""; };
  const pushRow = () => { rows.push(row); row = []; };

  // Normalize line endings, strip BOM
  const src = text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      pushField();
    } else if (ch === "\n") {
      pushField();
      pushRow();
    } else {
      field += ch;
    }
  }
  // Final field/row (file may or may not end with a newline)
  if (field.length > 0 || row.length > 0) { pushField(); pushRow(); }

  const nonEmpty = rows.filter((r) => r.some((c) => c !== ""));
  if (nonEmpty.length < 2) return [];

  const headers = nonEmpty[0].map((h) => h.trim());
  return nonEmpty.slice(1).map((cols) => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = cols[i] !== undefined ? cols[i] : ""; });
    return obj;
  });
}
