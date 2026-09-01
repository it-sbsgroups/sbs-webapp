"use client";

import { useState, useEffect } from "react";
import PageBreadcrumb from "@/components/shared/PageBreadcrumb";
import Modal from "@/components/shared/Modal";
import apiClient, { toStaticUrl } from "@/lib/client";

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    apiClient.get("/certificates")
      .then((data) => setCertificates(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <PageBreadcrumb pageKey="certificates" title="Certificates" items={[{ label: "Certificates" }]} />
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-black text-slate-900 mb-4">Our Certificates</h1>
        {certificates.length === 0 ? (
          <p className="text-slate-500">No certificates uploaded yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((cert) => (
              <button
                key={cert.id}
                type="button"
                onClick={() => setSelected(cert)}
                className="text-left bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <div className="aspect-[4/3] bg-slate-100">
                  <img
                    src={toStaticUrl(cert.imageUrl)}
                    alt={cert.name}
                    className="w-full h-full object-fill"
                    loading="lazy"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-base font-bold text-slate-900 text-center">{cert.name}</h3>
                  {cert.description && (
                    <p className="text-sm text-slate-500 mt-1 text-center line-clamp-2">{cert.description}</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Click a certificate above to see its name, description, and the
          full-size certificate image in one place. */}
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.name}
        maxWidth="max-w-2xl"
      >
        {selected && (
          <div className="p-5 space-y-4">
            <div className="bg-slate-100 rounded-xl overflow-hidden">
              <img
                src={toStaticUrl(selected.imageUrl)}
                alt={selected.name}
                className="w-full h-auto object-contain max-h-[60vh] mx-auto"
              />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">{selected.name}</h3>
              {selected.description ? (
                <p className="text-sm text-slate-600 mt-1 whitespace-pre-line">{selected.description}</p>
              ) : (
                <p className="text-sm text-slate-400 mt-1 italic">No description provided.</p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}