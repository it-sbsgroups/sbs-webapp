// app/global-error.js
//
// Next.js App Router convention: only used when the ROOT layout.js itself
// throws (very rare — e.g. the branding fetch in layout.js's
// generateMetadata blowing up in a way that isn't already caught). Because
// it replaces the root layout entirely, it MUST render its own <html> and
// <body> — normal pages/layouts never need to do this, only this one file.
// It's automatically picked up by filename; nothing to import or register.
"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error("Critical application error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "Arial, Helvetica, sans-serif" }}>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            background: "#ffffff",
          }}
        >
          <div style={{ maxWidth: 420, width: "100%", textAlign: "center" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                height: 64,
                width: 64,
                borderRadius: 16,
                background: "#fef2f2",
                color: "#dc2626",
                fontSize: 28,
                fontWeight: 900,
                marginBottom: 20,
              }}
            >
              !
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: "#172554", margin: "0 0 8px" }}>
              Something Went Wrong
            </h1>
            <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 24px", lineHeight: 1.6 }}>
              The application hit a critical error and couldn't load. Please try again.
            </p>
            {error?.digest && (
              <p style={{ fontSize: 11, fontFamily: "monospace", color: "#94a3b8", marginBottom: 24 }}>
                Ref: {error.digest}
              </p>
            )}
            <button
              onClick={() => reset()}
              style={{
                background: "#172554",
                color: "#fff",
                fontWeight: 900,
                fontSize: 12,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                padding: "14px 28px",
                borderRadius: 12,
                border: "none",
                cursor: "pointer",
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
