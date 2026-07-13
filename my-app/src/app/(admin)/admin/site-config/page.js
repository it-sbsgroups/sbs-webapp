"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import siteConfigApi, {
  DEFAULT_CONTACT,
  DEFAULT_API_KEYS,
  DEFAULT_FOUNDERS,
  DEFAULT_FONT,
  GOOGLE_FONTS,
  SOCIAL_PLATFORMS,
} from "@/lib/siteConfig/siteConfigApi";
import LocationSelector from "@/components/admin/site-config/LocationSelector";
// Reuse the components that already correctly read/write the "navigation"
// site-config key — see the audit note above HeaderSection() below.
import LogoManager from "@/components/admin/header/LogoManager";
import NavigationManager from "@/components/admin/header/NavigationManager";
import LoginManager from "@/components/admin/header/LoginManager";
import HomeAboutManager from "@/components/admin/home/HomeAboutManager";
import HomePrinciplesManager from "@/components/admin/home/HomePrinciplesManager";
import AuthorizedNetwork from "@/components/admin/distributorComp/AuthorizedNetwork";
import IndustriesManager from "@/components/admin/clientsComp/IndustriesManager";
import ProtectionProven from "@/components/admin/clientsComp/ProtectionProven";
import WhyContact from "@/components/admin/contactComp/WhyContactUs";
import PartnershipAdvantages from "@/components/admin/distributorComp/PartnershipAdvantages";
import PartnershipWork from "@/components/admin/distributorComp/PartnershipWork";
import AboutManager from "@/components/admin/aboutComp/AboutManager";
import RichTextEditor from "@/components/shared/RichTextEditor";
import { uploadImage } from "@/lib/uploadApi";

// ─── Material Symbol icon helper ──────────────────────────────────────────────
const Icon = ({ name, className = "text-lg" }) => (
  <span className={`material-symbols-outlined ${className}`} style={{ fontSize: "inherit" }}>
    {name}
  </span>
);

// ─── Shared UI atoms ──────────────────────────────────────────────────────────
const inputCls = "w-full text-sm px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-slate-800 font-medium placeholder:font-normal placeholder:text-slate-400 transition-colors";
const labelCls = "text-[10px] font-black text-slate-500 uppercase tracking-wide";
const cardCls  = "bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm";

function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  );
}

function SaveBtn({ saving, onClick, label = "Save Changes" }) {
  return (
    <button onClick={onClick} disabled={saving}
      className="flex items-center gap-2 px-6 py-2.5 bg-blue-950 text-white text-xs font-black rounded-xl hover:bg-blue-900 disabled:opacity-60 transition-colors shadow-md">
      {saving ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Icon name="save" />}
      {saving ? "Saving…" : label}
    </button>
  );
}

function UploadBtn({ label, accept, onFile, loading, icon = "upload" }) {
  const ref = useRef(null);
  return (
    <>
      <input ref={ref} type="file" accept={accept} className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) onFile(f); }} />
      <button type="button" disabled={loading} onClick={() => ref.current?.click()}
        className="flex items-center gap-1.5 text-xs font-black px-4 py-2 rounded-xl border border-blue-200 text-blue-800 hover:bg-blue-50 disabled:opacity-60 transition-colors">
        {loading ? <span className="w-3.5 h-3.5 border-2 border-blue-300 border-t-blue-800 rounded-full animate-spin" /> : <Icon name={icon} />}
        {loading ? "Uploading…" : label}
      </button>
    </>
  );
}

function AddRemoveList({ items, setItems, renderItem, newItem }) {
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2">
          <div className="flex-1">{renderItem(item, i, (upd) => setItems(items.map((x, j) => j === i ? { ...x, ...upd } : x)))}</div>
          <button onClick={() => setItems(items.filter((_, j) => j !== i))}
            className="mt-1.5 p-1.5 rounded-lg text-red-400 hover:text-red-700 hover:bg-red-50 transition-colors">
            <Icon name="delete" className="text-base" />
          </button>
        </div>
      ))}
      <button onClick={() => setItems([...items, typeof newItem === "function" ? newItem() : { ...newItem }])}
        className="flex items-center gap-1.5 text-xs font-black text-blue-800 hover:text-blue-950 py-1.5 transition-colors">
        <Icon name="add_circle" className="text-base" /> Add
      </button>
    </div>
  );
}

// ─── TAB DEFINITIONS (Branding removed) ─────────────────────────────────────
const TABS = [
  { key: "header",                        label: "Header & Nav"            },
  { key: "contact",                       label: "Contact & Footer"        },
  { key: "about",                         label: "About Us"                },
  { key: "apiKeys",                       label: "API Keys"                },
  { key: "founders",                      label: "Founders"                },
  { key: "font",                          label: "Font"                    },
  { key: "location",                      label: "Location"                },
  { key: "homeAbout",                     label: "Home About"              },
  { key: "homePrinciples",                label: "Home Principles"         },
  { key: "AuthorizedNetwork",             label: "Authorized Network"      },
  { key: "IndustriesManager",             label: "Industries Manager"      },
  { key: "ProtectionProven",              label: "Protection Proven"       },
  { key: "WhyContact",                    label: "Why Contact"             },
  { key: "PartnershipAdvantages",         label: "Partnership Advantages"  },
  { key: "PartnershipWork",               label: "Partnership Work"        },
];

// ─── SECTION: HEADER & NAVIGATION ──────────────────────────────────────────
// NOTE (audit fix): this used to be a hand-rolled editor that read/wrote the
// "header" site-config key via siteConfigApi.getHeader()/saveHeader(). That
// key was never read anywhere else in the app — the public Header.jsx (and
// the previously-unlinked /admin/header route) actually read/write the
// "navigation" key via headerApi. The two editors could silently disagree:
// changes made here never appeared on the live site. Fix: reuse the exact
// components that already write to the correct key, so there is a single
// source of truth and this tab (which IS linked in the sidebar) actually
// works.
function HeaderSection() {
  const [subTab, setSubTab] = useState("logo");

  const subTabs = [
    { id: "logo", label: "Logo & Branding" },
    { id: "navigation", label: "Navigation Items" },
    { id: "login", label: "Login Button" },
  ];

  return (
    <div className="space-y-5">
      <div className="flex gap-1.5 border-b border-slate-200 pb-3">
        {subTabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setSubTab(t.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all ${
              subTab === t.id
                ? "bg-blue-950 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {subTab === "logo" && <LogoManager />}
      {subTab === "navigation" && <NavigationManager />}
      {subTab === "login" && <LoginManager />}
    </div>
  );
}


// ─── SECTION: CONTACT & FOOTER (tasks 4-11) ──────────────────────────────────
function ContactSection() {
  const [data,   setData]   = useState(DEFAULT_CONTACT);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    siteConfigApi.getContact().then((d) => setData({ ...DEFAULT_CONTACT, ...d }));
  }, []);

  const setAddr = (k, v) => setData((p) => ({ ...p, address: { ...p.address, [k]: v } }));

  const save = async () => {
    setSaving(true);
    try { await siteConfigApi.saveContact(data); toast.success("Contact & footer config saved"); }
    catch (e) { toast.error(e.message); } finally { setSaving(false); }
  };

  return (
    <div className="space-y-5">
      {/* 4 — Address */}
      <div className={cardCls}>
        <h3 className="text-sm font-black text-slate-900">📍 Address</h3>
        <Field label="Street / Line 1">
          <input className={inputCls} value={data.address?.line1 || ""} onChange={(e) => setAddr("line1", e.target.value)} placeholder="123 Industrial Area, Phase 2" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="City"><input className={inputCls} value={data.address?.city || ""} onChange={(e) => setAddr("city", e.target.value)} /></Field>
          <Field label="State"><input className={inputCls} value={data.address?.state || ""} onChange={(e) => setAddr("state", e.target.value)} /></Field>
          <Field label="Country"><input className={inputCls} value={data.address?.country || "India"} onChange={(e) => setAddr("country", e.target.value)} /></Field>
          <Field label="Pincode"><input className={inputCls} value={data.address?.pincode || ""} onChange={(e) => setAddr("pincode", e.target.value)} maxLength={6} /></Field>
        </div>
      </div>

      {/* 5 — Phone numbers */}
      <div className={cardCls}>
        <h3 className="text-sm font-black text-slate-900">📞 Phone Numbers</h3>
        <AddRemoveList
          items={data.phones || []}
          setItems={(phones) => setData((p) => ({ ...p, phones }))}
          newItem={() => ({ label: "", number: "", isTel: true })}
          renderItem={(item, i, upd) => (
            <div className="grid grid-cols-3 gap-2">
              <input className={inputCls} placeholder="Owner name (e.g. Sales)" value={item.label || ""} onChange={(e) => upd({ label: e.target.value })} />
              <input className={inputCls} placeholder="+91 9876543210" value={item.number || ""} onChange={(e) => upd({ number: e.target.value })} />
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer">
                <input type="checkbox" checked={item.isTel !== false} onChange={(e) => upd({ isTel: e.target.checked })} className="rounded" />
                <span>Enable tel: link</span>
              </label>
            </div>
          )}
        />
      </div>

      {/* 6 — Emails */}
      <div className={cardCls}>
        <h3 className="text-sm font-black text-slate-900">✉️ Email Addresses</h3>
        <AddRemoveList
          items={data.emails || []}
          setItems={(emails) => setData((p) => ({ ...p, emails }))}
          newItem={() => ({ label: "", address: "", isMailto: true })}
          renderItem={(item, i, upd) => (
            <div className="grid grid-cols-3 gap-2">
              <input className={inputCls} placeholder="Label (e.g. Procurement)" value={item.label || ""} onChange={(e) => upd({ label: e.target.value })} />
              <input className={inputCls} placeholder="info@company.com" value={item.address || ""} onChange={(e) => upd({ address: e.target.value })} />
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer">
                <input type="checkbox" checked={item.isMailto !== false} onChange={(e) => upd({ isMailto: e.target.checked })} className="rounded" />
                <span>Enable mailto: link</span>
              </label>
            </div>
          )}
        />
      </div>

      {/* 7 — Quick Links */}
      <div className={cardCls}>
        <h3 className="text-sm font-black text-slate-900">🔗 Quick Links (Footer)</h3>
        <AddRemoveList
          items={data.quickLinks || []}
          setItems={(quickLinks) => setData((p) => ({ ...p, quickLinks }))}
          newItem={() => ({ name: "", link: "" })}
          renderItem={(item, i, upd) => (
            <div className="grid grid-cols-2 gap-2">
              <input className={inputCls} placeholder="Link label" value={item.name || ""} onChange={(e) => upd({ name: e.target.value })} />
              <input className={inputCls} placeholder="/page-url" value={item.link || ""} onChange={(e) => upd({ link: e.target.value })} />
            </div>
          )}
        />
      </div>

      {/* 8 — Services Links */}
      <div className={cardCls}>
        <h3 className="text-sm font-black text-slate-900">⚙️ Services Links (Footer)</h3>
        <AddRemoveList
          items={data.servicesLinks || []}
          setItems={(servicesLinks) => setData((p) => ({ ...p, servicesLinks }))}
          newItem={() => ({ name: "", link: "" })}
          renderItem={(item, i, upd) => (
            <div className="grid grid-cols-2 gap-2">
              <input className={inputCls} placeholder="Service name" value={item.name || ""} onChange={(e) => upd({ name: e.target.value })} />
              <input className={inputCls} placeholder="/service-url" value={item.link || ""} onChange={(e) => upd({ link: e.target.value })} />
            </div>
          )}
        />
      </div>

      {/* 9 — Social Media */}
      <div className={cardCls}>
        <h3 className="text-sm font-black text-slate-900">📱 Social Media Handles</h3>
        <p className="text-[11px] text-slate-400 font-medium">
          Icons use Google Material Symbols (same icon set used throughout this app).
        </p>
        <AddRemoveList
          items={data.social || []}
          setItems={(social) => setData((p) => ({ ...p, social }))}
          newItem={() => ({ platform: "Custom", icon: "link", link: "" })}
          renderItem={(item, i, upd) => (
            <div className="grid grid-cols-3 gap-2">
              <select className={inputCls} value={item.platform || "Custom"}
                onChange={(e) => {
                  const found = SOCIAL_PLATFORMS.find((s) => s.name === e.target.value);
                  upd({ platform: e.target.value, icon: found?.icon || "link", link: item.link || found?.placeholder || "" });
                }}>
                {SOCIAL_PLATFORMS.map((s) => <option key={s.name} value={s.name}>{s.name}</option>)}
              </select>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-500" style={{ fontSize: "20px" }}>{item.icon || "link"}</span>
                <input className={`${inputCls} flex-1`} placeholder="icon name" value={item.icon || ""}
                  onChange={(e) => upd({ icon: e.target.value })} />
              </div>
              <input className={inputCls} placeholder="https://…" value={item.link || ""} onChange={(e) => upd({ link: e.target.value })} />
            </div>
          )}
        />
      </div>

      {/* 10 — Newsletter */}
      <div className={cardCls}>
        <h3 className="text-sm font-black text-slate-900">📰 Newsletter Subscribe Section</h3>
        <label className="flex items-center gap-3 cursor-pointer">
          <div onClick={() => setData((p) => ({ ...p, newsletter: { ...p.newsletter, enabled: !p.newsletter?.enabled } }))}
            className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${data.newsletter?.enabled !== false ? "bg-blue-950" : "bg-slate-300"}`}>
            <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${data.newsletter?.enabled !== false ? "translate-x-5" : ""}`} />
          </div>
          <span className="text-sm font-semibold text-slate-700">
            {data.newsletter?.enabled !== false ? "Newsletter section is visible in footer" : "Newsletter section is hidden"}
          </span>
        </label>
      </div>

      {/* 11 — Copyright */}
      <div className={cardCls}>
        <h3 className="text-sm font-black text-slate-900">© Copyright Text</h3>
        <p className="text-[11px] text-slate-400 font-medium">
          Use <code className="bg-slate-100 px-1 rounded">{"{year}"}</code> to auto-insert the current year.
        </p>
        <Field label="Copyright Message">
          <input className={inputCls} value={data.copyright || ""}
            onChange={(e) => setData((p) => ({ ...p, copyright: e.target.value }))}
            placeholder="© {year} SBS Groups. All rights reserved." />
        </Field>
        {data.copyright && (
          <p className="text-xs text-slate-500 font-medium bg-slate-50 rounded-xl px-3 py-2">
            Preview: {data.copyright.replace("{year}", new Date().getFullYear())}
          </p>
        )}
      </div>

      <div className="flex justify-end"><SaveBtn saving={saving} onClick={save} /></div>
    </div>
  );
}

// ─── SECTION: API KEYS (task 16) ──────────────────────────────────────────────
function ApiKeysSection() {
  const [data,   setData]   = useState(DEFAULT_API_KEYS);
  const [saving, setSaving] = useState(false);
  const [show,   setShow]   = useState({});

  useEffect(() => {
    siteConfigApi.getApiKeys().then((d) => setData({ ...DEFAULT_API_KEYS, ...d }));
  }, []);

  const set = useCallback((path, val) => {
    setData((p) => {
      const n = structuredClone(p);
      const keys = path.split(".");
      let ref = n;
      for (let i = 0; i < keys.length - 1; i++) ref = ref[keys[i]];
      ref[keys[keys.length - 1]] = val;
      return n;
    });
  }, []);

  const toggle = (k) => setShow((p) => ({ ...p, [k]: !p[k] }));

  const save = async () => {
    setSaving(true);
    try { await siteConfigApi.saveApiKeys(data); toast.success("API keys saved"); }
    catch (e) { toast.error(e.message); } finally { setSaving(false); }
  };

  const SecretField = ({ label, path }) => (
    <Field label={label}>
      <div className="relative">
        <input type={show[path] ? "text" : "password"} className={inputCls}
          value={data[path.split(".")[0]]?.[path.split(".")[1]] || ""}
          onChange={(e) => set(path, e.target.value)} placeholder="••••••••" />
        <button type="button" onClick={() => toggle(path)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
          <Icon name={show[path] ? "visibility_off" : "visibility"} />
        </button>
      </div>
    </Field>
  );

  return (
    <div className="space-y-5">
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
        <Icon name="warning" className="text-amber-600 text-xl mt-0.5" />
        <p className="text-xs text-amber-800 font-semibold">
          These keys are stored in your database. Ensure your database is secure and access is restricted.
          Never commit these keys to version control.
        </p>
      </div>

      {/* Cloudinary */}
      <div className={cardCls}>
        <h3 className="text-sm font-black text-slate-900">☁️ Cloudinary</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field label="Cloud Name"><input className={inputCls} value={data.cloudinary?.cloudName || ""} onChange={(e) => set("cloudinary.cloudName", e.target.value)} placeholder="dhrnoojwo" /></Field>
          <SecretField label="API Key" path="cloudinary.apiKey" />
          <SecretField label="API Secret" path="cloudinary.apiSecret" />
        </div>
      </div>

      {/* Gemini */}
      <div className={cardCls}>
        <h3 className="text-sm font-black text-slate-900">🤖 Gemini AI</h3>
        <SecretField label="API Key" path="gemini.apiKey" />
      </div>

      {/* JWT */}
      <div className={cardCls}>
        <h3 className="text-sm font-black text-slate-900">🔐 JWT Secret</h3>
        <SecretField label="JWT Secret Key" path="jwt.secret" />
      </div>

      {/* ERP */}
      <div className={cardCls}>
        <h3 className="text-sm font-black text-slate-900">🏭 ERP Integration</h3>
        <div className="grid grid-cols-2 gap-3">
          <SecretField label="ERP API Key" path="erp.apiKey" />
          <SecretField label="ERP API Secret" path="erp.apiSecret" />
        </div>
      </div>

      {/* WhatsApp */}
      <div className={cardCls}>
        <h3 className="text-sm font-black text-slate-900">💬 WhatsApp Business API</h3>
        <div className="grid grid-cols-2 gap-3">
          <SecretField label="Access Token (WHATSAPP_ACCESS_TOKEN)" path="whatsapp.accessToken" />
          <Field label="Phone Number ID (WHATSAPP_PHONE_NUMBER_ID)">
            <input className={inputCls} value={data.whatsapp?.phoneNumberId || ""} onChange={(e) => set("whatsapp.phoneNumberId", e.target.value)} placeholder="1234567890" />
          </Field>
        </div>
      </div>

      <div className="flex justify-end"><SaveBtn saving={saving} onClick={save} /></div>
    </div>
  );
}

// ─── FOUNDER CARD COMPONENT (stable, outside of FoundersSection) ──────────────
function FounderCard({ who, title, data, setF, uploading, handlePhoto, handleAdditionalPhoto }) {
  const f = data[who] || {};
  return (
    <div className={cardCls}>
      <h3 className="text-sm font-black text-slate-900">{title}</h3>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* ─── Images column ─── */}
        <div className="shrink-0 space-y-4">
          {/* Main Photo */}
          <div>
            <p className={labelCls}>Photo</p>
            <div className="relative">
              {f.photoUrl ? (
                <img
                  src={f.photoUrl}
                  alt={who}
                  className="w-32 h-36 object-cover rounded-xl border"
                />
              ) : (
                <div className="w-32 h-36 bg-slate-100 rounded-xl border border-dashed border-slate-300 flex items-center justify-center">
                  <Icon name="person" className="text-3xl text-slate-400" />
                </div>
              )}
            </div>
            <div className="mt-1 flex flex-col gap-1">
              <UploadBtn
                label="Upload Photo"
                accept="image/*"
                onFile={(file) => handlePhoto(who, file)}
                loading={uploading[who]}
                icon="add_photo_alternate"
              />
              {f.photoUrl && (
                <button
                  onClick={() => setF(who, "photoUrl", "")}
                  className="text-[10px] text-red-500 font-bold hover:text-red-700"
                >
                  Remove
                </button>
              )}
            </div>
          </div>

          {/* Additional PNG Image */}
          <div>
            <p className={labelCls}>Additional Image (PNG)</p>
            <div className="relative">
              {f.additionalImageUrl ? (
                <img
                  src={f.additionalImageUrl}
                  alt="Additional"
                  className="w-32 h-36 object-cover rounded-xl border"
                />
              ) : (
                <div className="w-32 h-36 bg-slate-100 rounded-xl border border-dashed border-slate-300 flex items-center justify-center">
                  <Icon name="image" className="text-3xl text-slate-400" />
                </div>
              )}
            </div>
            <div className="mt-1 flex flex-col gap-1">
              <UploadBtn
                label="Upload PNG"
                accept="image/png"
                onFile={(file) => handleAdditionalPhoto(who, file)}
                loading={uploading[who + "Add"]}
                icon="add_photo_alternate"
              />
              {f.additionalImageUrl && (
                <button
                  onClick={() => setF(who, "additionalImageUrl", "")}
                  className="text-[10px] text-red-500 font-bold hover:text-red-700"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ─── Details column ─── */}
        <div className="flex-1 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Full Name">
              <input
                className={inputCls}
                value={f.name || ""}
                onChange={(e) => setF(who, "name", e.target.value)}
              />
            </Field>
            <Field label="Designation">
              <input
                className={inputCls}
                value={f.designation || ""}
                onChange={(e) => setF(who, "designation", e.target.value)}
              />
            </Field>
          </div>

          {/* Message */}
          <div>
            <label className={labelCls}>Message / Quote</label>
            <textarea
              className={`${inputCls} min-h-[100px] resize-none`}
              placeholder="A personal message or quote from the founder"
              value={f.message || ""}
              onChange={(e) => setF(who, "message", e.target.value)}
            />
          </div>

          {/* Phone Numbers */}
          <div>
            <p className={labelCls}>Phone Numbers</p>
            <AddRemoveList
              items={f.phones || []}
              setItems={(phones) => setF(who, "phones", phones)}
              newItem={() => ({ value: "" })}
              renderItem={(item, i, upd) => (
                <input
                  className={inputCls}
                  value={item.value || ""}
                  placeholder="+91 9876543210"
                  onChange={(e) => upd({ value: e.target.value })}
                />
              )}
            />
          </div>

          {/* Email Addresses */}
          <div>
            <p className={labelCls}>Email Addresses</p>
            <AddRemoveList
              items={f.emails || []}
              setItems={(emails) => setF(who, "emails", emails)}
              newItem={() => ({ value: "" })}
              renderItem={(item, i, upd) => (
                <input
                  className={inputCls}
                  value={item.value || ""}
                  placeholder="founder@company.com"
                  onChange={(e) => upd({ value: e.target.value })}
                />
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SECTION: FOUNDERS (improved, stable) ─────────────────────────────────────
function FoundersSection() {
  const [data, setData] = useState(DEFAULT_FOUNDERS);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState({
    founder: false,
    coFounder: false,
    founderAdd: false,
    coFounderAdd: false,
  });

  useEffect(() => {
    siteConfigApi.getFounders().then((d) => {
      const normalize = (person) => ({
        ...person,
        phones: (person.phones || []).map((p) =>
          typeof p === "string" ? { value: p } : p
        ),
        emails: (person.emails || []).map((e) =>
          typeof e === "string" ? { value: e } : e
        ),
      });
      setData({
        ...DEFAULT_FOUNDERS,
        ...d,
        founder: normalize({ ...DEFAULT_FOUNDERS.founder, ...(d.founder || {}) }),
        coFounder: normalize({ ...DEFAULT_FOUNDERS.coFounder, ...(d.coFounder || {}) }),
      });
    }).catch(console.warn);
  }, []);

  const setF = (who, k, v) =>
    setData((p) => ({ ...p, [who]: { ...p[who], [k]: v } }));

  const handlePhoto = async (who, file) => {
    setUploading((p) => ({ ...p, [who]: true }));
    try {
      const url = await siteConfigApi.uploadFounder(file);
      setF(who, "photoUrl", url);
      toast.success("Photo uploaded");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setUploading((p) => ({ ...p, [who]: false }));
    }
  };

  const handleAdditionalPhoto = async (who, file) => {
    const key = who + "Add";
    setUploading((p) => ({ ...p, [key]: true }));
    try {
      const url = await uploadImage(file, "founder-additional");
      setF(who, "additionalImageUrl", url);
      toast.success("Additional image uploaded");
    } catch (e) {
      toast.error(e.message || "Upload failed");
    } finally {
      setUploading((p) => ({ ...p, [key]: false }));
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      await siteConfigApi.saveFounders(data);
      toast.success("Founder details saved");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Founders</h2>
        <p className="mt-1 text-sm text-slate-500">
          Manage founder and co‑founder details.
        </p>
      </div>
      <FounderCard
        who="founder"
        title="👤 Founder"
        data={data}
        setF={setF}
        uploading={uploading}
        handlePhoto={handlePhoto}
        handleAdditionalPhoto={handleAdditionalPhoto}
      />
      <FounderCard
        who="coFounder"
        title="👤 Co-Founder"
        data={data}
        setF={setF}
        uploading={uploading}
        handlePhoto={handlePhoto}
        handleAdditionalPhoto={handleAdditionalPhoto}
      />
      <div className="flex justify-end">
        <SaveBtn saving={saving} onClick={save} />
      </div>
    </div>
  );
}

// ─── SECTION: FONT SELECTOR (task 18) ────────────────────────────────────────
function FontSection() {
  const [data,   setData]   = useState(DEFAULT_FONT);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    siteConfigApi.getFont().then((d) => setData({ ...DEFAULT_FONT, ...d }));
  }, []);

  const save = async () => {
    setSaving(true);
    try { await siteConfigApi.saveFont(data); toast.success("Font saved — reload the site to see the change"); }
    catch (e) { toast.error(e.message); } finally { setSaving(false); }
  };

  return (
    <div className="space-y-5">
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-xs text-blue-800 font-semibold">
        The selected font is applied via a <code className="bg-white px-1 rounded">{"<link>"}</code> tag in your <code className="bg-white px-1 rounded">layout.js</code>.
        After saving, update <code className="bg-white px-1 rounded">src/app/layout.js</code> to import the Google Fonts URL from the API, or add it to your <code className="bg-white px-1 rounded">globals.css</code>.
      </div>

      <div className={cardCls}>
        <h3 className="text-sm font-black text-slate-900">Select App Font</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {GOOGLE_FONTS.map((font) => (
            <button key={font.name} onClick={() => setData({ family: font.name, googleUrl: font.url })}
              className={`p-4 rounded-xl border-2 text-left transition-all ${data.family === font.name ? "border-blue-950 bg-blue-50" : "border-slate-200 hover:border-blue-300 bg-white"}`}
              style={{ fontFamily: `"${font.name}", sans-serif` }}>
              <span className={`text-xs font-black ${data.family === font.name ? "text-blue-950" : "text-slate-700"}`}>{font.name}</span>
              <p className="text-[11px] text-slate-500 mt-1" style={{ fontFamily: `"${font.name}", sans-serif` }}>
                The quick brown fox jumps over the lazy dog
              </p>
              {data.family === font.name && (
                <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-black text-blue-950">
                  <Icon name="check_circle" className="text-sm" /> Selected
                </span>
              )}
            </button>
          ))}
        </div>

        <Field label="Custom Google Fonts URL (optional)">
          <input className={inputCls} value={data.googleUrl || ""}
            onChange={(e) => setData((p) => ({ ...p, googleUrl: e.target.value }))}
            placeholder="https://fonts.googleapis.com/css2?family=…" />
        </Field>
        <Field label="Font Family Name">
          <input className={inputCls} value={data.family || ""}
            onChange={(e) => setData((p) => ({ ...p, family: e.target.value }))}
            placeholder="Inter" />
        </Field>
      </div>

      <div className="flex justify-end"><SaveBtn saving={saving} onClick={save} /></div>
    </div>
  );
}

// ─── SECTION: LOCATION SELECTOR DEMO (task 19) ────────────────────────────────
function LocationSection() {
  const [value, setValue] = useState({});

  return (
    <div className="space-y-5">
      <div className={cardCls}>
        <h3 className="text-sm font-black text-slate-900">Smart Location Selector</h3>
        <p className="text-[11px] text-slate-400 font-medium">
          This component is pre-seeded with Indian states, cities and pincodes.
          Import <code className="bg-slate-100 px-1 rounded">LocationSelector</code> from{" "}
          <code className="bg-slate-100 px-1 rounded">@/components/admin/site-config/LocationSelector</code>{" "}
          anywhere in your project.
        </p>
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-3">
          <p className="text-xs font-black text-blue-900">Live Demo:</p>
          <LocationSelector value={value} onChange={setValue} />
          {(value.stateName || value.cityName || value.pincode) && (
            <div className="mt-3 bg-white rounded-xl p-3 border border-blue-100">
              <p className="text-[10px] font-black text-slate-500 mb-1.5 uppercase">Selected</p>
              <div className="flex gap-4 text-sm font-semibold text-slate-800">
                {value.pincode && <span>📮 {value.pincode}</span>}
                {value.cityName && <span>🏙️ {value.cityName}</span>}
                {value.stateName && <span>🗺️ {value.stateName}</span>}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={cardCls}>
        <h3 className="text-sm font-black text-slate-900">How to use LocationSelector in your forms</h3>
        <pre className="bg-slate-900 text-green-400 rounded-xl p-4 text-[11px] overflow-x-auto">{`import LocationSelector from "@/components/admin/site-config/LocationSelector";

// In your form:
const [address, setAddress] = useState({});

<LocationSelector
  value={address}
  onChange={setAddress}
/>

// address will be:
// {
//   stateId: 1, stateName: "Uttar Pradesh",
//   cityId: 3,  cityName: "Lucknow",
//   pincode: "226001"
// }`}</pre>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function SiteConfigPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Default tab is now "header" (branding removed)
  const initialTab = searchParams.get("tab") || "header";
  const validTabs = TABS.map((t) => t.key);
  const currentTab = validTabs.includes(initialTab) ? initialTab : "header";

  const changeTab = useCallback(
    (newTab) => {
      const params = new URLSearchParams(searchParams);
      params.set("tab", newTab);
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  // Keyboard navigation: Ctrl + Tab (forward), Ctrl + Shift + Tab (backward)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === "Tab") {
        e.preventDefault();
        const currentIndex = validTabs.indexOf(currentTab);
        const direction = e.shiftKey ? -1 : 1;
        const newIndex =
          (currentIndex + direction + validTabs.length) % validTabs.length;
        changeTab(validTabs[newIndex]);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentTab, validTabs, changeTab]);

  const renderSection = () => {
    switch (currentTab) {
      case "header":                       return <HeaderSection />;
      case "contact":                      return <ContactSection />;
      case "about":                        return <AboutManager />;
      case "apiKeys":                      return <ApiKeysSection />;
      case "founders":                     return <FoundersSection />;
      case "font":                         return <FontSection />;
      case "location":                     return <LocationSection />;
      case "homeAbout":                    return <HomeAboutManager />;
      case "homePrinciples":               return <HomePrinciplesManager />;
      case "AuthorizedNetwork":            return <AuthorizedNetwork />;
      case "IndustriesManager":            return <IndustriesManager />;
      case "ProtectionProven":             return <ProtectionProven />;
      case "WhyContact":                   return <WhyContact />;
      case "PartnershipAdvantages":        return <PartnershipAdvantages />;
      case "PartnershipWork":              return <PartnershipWork />;
      default:                             return <HeaderSection />;
    }
  };

  return (
    <div className="min-h-full bg-slate-50">
      {/* Page header */}
      <div className="bg-white border-b border-slate-200 px-6 py-5">
        <h1 className="text-lg font-black text-slate-900 tracking-tight">⚙️ Central Site Configuration</h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Header & Nav · Contact · About Us · API Keys · Founders · Font · Location
        </p>
      </div>

      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-80px)]">
        {/* Sidebar tabs */}
        <aside className="w-full lg:w-56 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 shrink-0">
          <nav className="p-3 space-y-0.5">
            {TABS.map((t) => (
              <button key={t.key} onClick={() => changeTab(t.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-black transition-all text-left ${
                  currentTab === t.key ? "bg-blue-950 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}>
                {t.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-5 lg:p-7 overflow-y-auto">
          <div className="max-w-3xl mx-auto">
            {renderSection()}
          </div>
        </main>
      </div>
    </div>
  );
}