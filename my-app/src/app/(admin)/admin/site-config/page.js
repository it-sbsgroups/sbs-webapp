"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import toast from "react-hot-toast";
import siteConfigApi, {
  DEFAULT_BRANDING, DEFAULT_HEADER, DEFAULT_CONTACT, DEFAULT_ABOUT,
  DEFAULT_API_KEYS, DEFAULT_FOUNDERS, DEFAULT_FONT,
  GOOGLE_FONTS, SOCIAL_PLATFORMS,
} from "@/lib/siteConfig/siteConfigApi";
import LocationSelector from "@/components/admin/site-config/LocationSelector";

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

// ─── TAB DEFINITIONS ─────────────────────────────────────────────────────────
const TABS = [
  { key: "branding",  label: "Branding",       icon: "image"         },
  { key: "header",    label: "Header & Nav",    icon: "menu"          },
  { key: "contact",   label: "Contact & Footer",icon: "contact_phone" },
  { key: "about",     label: "About Us",        icon: "info"          },
  { key: "apiKeys",   label: "API Keys",        icon: "key"           },
  { key: "founders",  label: "Founders",        icon: "person"        },
  { key: "font",      label: "Font",            icon: "text_fields"   },
  { key: "location",  label: "Location",        icon: "location_on"   },
];

// ─── SECTION: BRANDING (tasks 1, 2) ──────────────────────────────────────────
function BrandingSection() {
  const [data,    setData]    = useState(DEFAULT_BRANDING);
  const [saving,  setSaving]  = useState(false);
  const [logoUpl, setLogoUpl] = useState(false);
  const [favUpl,  setFavUpl]  = useState(false);

  useEffect(() => {
    siteConfigApi.getBranding().then((d) => setData({ ...DEFAULT_BRANDING, ...d }));
  }, []);

  const set = (k, v) => setData((p) => ({ ...p, [k]: v }));

  const handleLogo = async (file) => {
    setLogoUpl(true);
    try {
      const url = await siteConfigApi.uploadLogo(file);
      set("logoUrl", url);
      toast.success("Logo uploaded (uncompressed)");
    } catch (e) { toast.error(e.message); } finally { setLogoUpl(false); }
  };

  const handleFavicon = async (file) => {
    setFavUpl(true);
    try {
      const url = await siteConfigApi.uploadFavicon(file);
      set("faviconUrl", url);
      toast.success("Favicon uploaded");
    } catch (e) { toast.error(e.message); } finally { setFavUpl(false); }
  };

  const save = async () => {
    setSaving(true);
    try { await siteConfigApi.saveBranding(data); toast.success("Branding saved"); }
    catch (e) { toast.error(e.message); } finally { setSaving(false); }
  };

  return (
    <div className="space-y-5">
      <div className={cardCls}>
        <h3 className="text-sm font-black text-slate-900">Company Identity</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Company Name">
            <input className={inputCls} value={data.companyName} onChange={(e) => set("companyName", e.target.value)} placeholder="SBS Groups" />
          </Field>
          <Field label="Tagline">
            <input className={inputCls} value={data.tagline} onChange={(e) => set("tagline", e.target.value)} placeholder="Industrial Solutions" />
          </Field>
        </div>
      </div>

      {/* Logo */}
      <div className={cardCls}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-900">Company Logo</h3>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              Uploaded uncompressed — PNG, SVG, WebP, JPG all accepted. Max 10 MB.
            </p>
          </div>
          <UploadBtn label="Upload Logo" accept="image/*" onFile={handleLogo} loading={logoUpl} icon="add_photo_alternate" />
        </div>
        {data.logoUrl && (
          <div className="mt-3 bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center gap-4">
            <img src={data.logoUrl} alt="logo" className="max-h-16 max-w-[180px] object-contain" />
            <div className="flex-1">
              <p className="text-xs text-slate-500 font-mono break-all">{data.logoUrl}</p>
            </div>
            <button onClick={() => set("logoUrl", "")}
              className="p-1.5 text-red-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors">
              <Icon name="delete" />
            </button>
          </div>
        )}
        <Field label="Or paste logo URL">
          <input className={inputCls} value={data.logoUrl} onChange={(e) => set("logoUrl", e.target.value)} placeholder="https://res.cloudinary.com/…" />
        </Field>
      </div>

      {/* Favicon */}
      <div className={cardCls}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-900">Favicon</h3>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              <span className="text-amber-700 font-bold">.ico files only.</span>{" "}
              Convert at <a href="https://favicon.io/favicon-converter/" target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">favicon.io</a> or <a href="https://convertio.co/png-ico/" target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">convertio.co</a>. Max 1 MB.
            </p>
          </div>
          <UploadBtn label="Upload .ico" accept=".ico,image/x-icon,image/vnd.microsoft.icon" onFile={handleFavicon} loading={favUpl} icon="add_photo_alternate" />
        </div>
        {data.faviconUrl && (
          <div className="mt-3 flex items-center gap-3 bg-slate-50 rounded-xl p-3 border border-slate-100">
            <img src={data.faviconUrl} alt="favicon" className="w-10 h-10 object-contain" onError={(e) => { e.currentTarget.style.opacity = "0.3"; }} />
            <p className="text-xs text-slate-500 font-mono break-all flex-1">{data.faviconUrl}</p>
            <button onClick={() => set("faviconUrl", "")} className="p-1.5 text-red-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors">
              <Icon name="delete" />
            </button>
          </div>
        )}
      </div>

      <div className="flex justify-end"><SaveBtn saving={saving} onClick={save} /></div>
    </div>
  );
}

// ─── SECTION: HEADER & NAVIGATION (tasks 3) ───────────────────────────────────
function HeaderSection({ categories = [] }) {
  const [data,   setData]   = useState(DEFAULT_HEADER);
  const [saving, setSaving] = useState(false);
  const [editIdx, setEditIdx] = useState(null);

  useEffect(() => {
    siteConfigApi.getHeader().then((d) => setData({ ...DEFAULT_HEADER, navs: [], ...d }));
  }, []);

  const setNavs = (navs) => setData((p) => ({ ...p, navs }));

  const blankNav = () => ({
    id: Date.now(), name: "", link: "/", enabled: true,
    hasDropdown: false, dropdownType: "custom", dropdownItems: [],
  });

  const addNav = () => setNavs([...data.navs, blankNav()]);
  const removeNav = (i) => setNavs(data.navs.filter((_, j) => j !== i));
  const updateNav = (i, patch) => setNavs(data.navs.map((n, j) => j === i ? { ...n, ...patch } : n));
  const moveNav = (i, dir) => {
    const arr = [...data.navs];
    const to = i + dir;
    if (to < 0 || to >= arr.length) return;
    [arr[i], arr[to]] = [arr[to], arr[i]];
    setNavs(arr);
  };

  const save = async () => {
    setSaving(true);
    try { await siteConfigApi.saveHeader(data); toast.success("Header saved"); }
    catch (e) { toast.error(e.message); } finally { setSaving(false); }
  };

  return (
    <div className="space-y-5">
      {/* Login button toggle */}
      <div className={cardCls}>
        <h3 className="text-sm font-black text-slate-900">Login Button</h3>
        <label className="flex items-center gap-3 cursor-pointer">
          <div onClick={() => setData((p) => ({ ...p, loginButton: { ...p.loginButton, enabled: !p.loginButton?.enabled } }))}
            className={`relative w-10 h-5.5 rounded-full transition-colors cursor-pointer ${data.loginButton?.enabled ? "bg-blue-950" : "bg-slate-300"}`}>
            <span className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-white rounded-full shadow transition-transform ${data.loginButton?.enabled ? "translate-x-4.5" : ""}`} />
          </div>
          <span className="text-sm font-semibold text-slate-700">
            {data.loginButton?.enabled ? "Login button is shown in header" : "Login button is hidden"}
          </span>
        </label>
        {data.loginButton?.enabled && (
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Field label="Button Label">
              <input className={inputCls} value={data.loginButton?.label || "Login"}
                onChange={(e) => setData((p) => ({ ...p, loginButton: { ...p.loginButton, label: e.target.value } }))} />
            </Field>
            <Field label="Button Link">
              <input className={inputCls} value={data.loginButton?.link || "/login"}
                onChange={(e) => setData((p) => ({ ...p, loginButton: { ...p.loginButton, link: e.target.value } }))} />
            </Field>
          </div>
        )}
      </div>

      {/* Navigation items */}
      <div className={cardCls}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-900">Navigation Items ({data.navs.length})</h3>
          <button onClick={addNav}
            className="flex items-center gap-1.5 text-xs font-black px-3 py-2 bg-blue-950 text-white rounded-xl hover:bg-blue-900">
            <Icon name="add" /> Add Nav
          </button>
        </div>

        <div className="space-y-3">
          {data.navs.map((nav, i) => (
            <div key={nav.id || i} className="border border-slate-200 rounded-xl overflow-hidden">
              {/* Nav row header */}
              <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50">
                <div className="flex flex-col gap-0.5">
                  <button onClick={() => moveNav(i, -1)} disabled={i === 0}
                    className="text-slate-400 hover:text-slate-700 disabled:opacity-30 leading-none text-xs">▲</button>
                  <button onClick={() => moveNav(i, 1)} disabled={i === data.navs.length - 1}
                    className="text-slate-400 hover:text-slate-700 disabled:opacity-30 leading-none text-xs">▼</button>
                </div>
                <input className="flex-1 text-xs font-black bg-transparent border-none outline-none text-slate-800"
                  placeholder="Nav name (e.g. Products)" value={nav.name}
                  onChange={(e) => updateNav(i, { name: e.target.value })} />
                <input className="w-40 text-xs bg-transparent border border-slate-200 rounded-lg px-2 py-1 outline-none text-slate-600"
                  placeholder="/link" value={nav.link}
                  onChange={(e) => updateNav(i, { link: e.target.value })} />
                {/* Enable/disable toggle */}
                <button onClick={() => updateNav(i, { enabled: !nav.enabled })}
                  className={`text-[10px] font-black px-2 py-1 rounded-md ${nav.enabled ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-500"}`}>
                  {nav.enabled ? "ON" : "OFF"}
                </button>
                {/* Dropdown toggle */}
                <button onClick={() => updateNav(i, { hasDropdown: !nav.hasDropdown })}
                  className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-md ${nav.hasDropdown ? "bg-blue-100 text-blue-800" : "bg-slate-100 text-slate-500"}`}>
                  <Icon name="arrow_drop_down" className="text-sm" />
                  {nav.hasDropdown ? "Dropdown ON" : "Dropdown"}
                </button>
                <button onClick={() => setEditIdx(editIdx === i ? null : i)}
                  className="text-[10px] font-black px-2 py-1 rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200">
                  {editIdx === i ? "Close" : "Edit"}
                </button>
                <button onClick={() => removeNav(i)}
                  className="p-1.5 text-red-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors">
                  <Icon name="delete" className="text-base" />
                </button>
              </div>

              {/* Expanded dropdown editor */}
              {editIdx === i && nav.hasDropdown && (
                <div className="px-4 py-3 border-t border-slate-100 bg-white space-y-3">
                  <Field label="Dropdown Type">
                    <select className={inputCls} value={nav.dropdownType || "custom"}
                      onChange={(e) => updateNav(i, { dropdownType: e.target.value })}>
                      <option value="custom">Custom Links</option>
                      <option value="categories">Product Categories (auto from DB)</option>
                    </select>
                  </Field>

                  {(nav.dropdownType || "custom") === "custom" && (
                    <div className="space-y-2">
                      <p className={labelCls}>Dropdown Items</p>
                      {(nav.dropdownItems || []).map((item, di) => (
                        <div key={di} className="flex items-center gap-2">
                          <input className={`${inputCls} flex-1`} placeholder="Label" value={item.name || ""}
                            onChange={(e) => { const items = [...nav.dropdownItems]; items[di] = { ...item, name: e.target.value }; updateNav(i, { dropdownItems: items }); }} />
                          <input className={`${inputCls} flex-1`} placeholder="/link" value={item.link || ""}
                            onChange={(e) => { const items = [...nav.dropdownItems]; items[di] = { ...item, link: e.target.value }; updateNav(i, { dropdownItems: items }); }} />
                          <button onClick={() => updateNav(i, { dropdownItems: nav.dropdownItems.filter((_, k) => k !== di) })}
                            className="p-1.5 text-red-400 hover:text-red-700"><Icon name="close" className="text-sm" /></button>
                        </div>
                      ))}
                      <button onClick={() => updateNav(i, { dropdownItems: [...(nav.dropdownItems || []), { name: "", link: "" }] })}
                        className="text-[10px] font-black text-blue-800 hover:text-blue-950 flex items-center gap-1">
                        <Icon name="add_circle" className="text-sm" /> Add Link
                      </button>
                    </div>
                  )}

                  {(nav.dropdownType) === "categories" && (
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                      <p className="text-[11px] text-blue-800 font-semibold">
                        This dropdown will auto-populate from your product categories and their subcategories.
                        No manual links needed — the frontend renders them dynamically.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          {data.navs.length === 0 && (
            <p className="text-xs text-slate-400 font-medium py-4 text-center">No navigation items yet. Click "Add Nav" to create one.</p>
          )}
        </div>
      </div>

      <div className="flex justify-end"><SaveBtn saving={saving} onClick={save} /></div>
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

// ─── SECTION: ABOUT US (tasks 12-15) ─────────────────────────────────────────
function AboutSection() {
  const [data,      setData]      = useState(DEFAULT_ABOUT);
  const [saving,    setSaving]    = useState(false);
  const [journeyUpl, setJourneyUpl] = useState(false);
  const MAX_CORE_VALUES = (data.coreValues?.length || 0) < 5 ? 5 :
    Math.ceil((data.coreValues?.length || 5) / 5) * 5;

  useEffect(() => {
    siteConfigApi.getAbout().then((d) => setData({ ...DEFAULT_ABOUT, ...d }));
  }, []);

  const addJourneyImage = async (file) => {
    setJourneyUpl(true);
    try {
      const url = await siteConfigApi.uploadJourney(file);
      const img = { url, caption: "", year: new Date().getFullYear().toString() };
      setData((p) => ({ ...p, journey: { images: [...(p.journey?.images || []), img] } }));
      toast.success("Journey image uploaded (uncompressed)");
    } catch (e) { toast.error(e.message); } finally { setJourneyUpl(false); }
  };

  const canAddCoreValue = (data.coreValues?.length || 0) < MAX_CORE_VALUES;

  const save = async () => {
    setSaving(true);
    try { await siteConfigApi.saveAbout(data); toast.success("About Us saved"); }
    catch (e) { toast.error(e.message); } finally { setSaving(false); }
  };

  return (
    <div className="space-y-5">
      {/* 12 — Rich text content (text only, no images) */}
      <div className={cardCls}>
        <div>
          <h3 className="text-sm font-black text-slate-900">About Us — Main Content</h3>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">
            Plain or HTML text only — no image blocks here. No word limit.
          </p>
        </div>
        <textarea
          className={`${inputCls} min-h-[200px] resize-y`}
          value={data.richContent || ""}
          onChange={(e) => setData((p) => ({ ...p, richContent: e.target.value }))}
          placeholder="Write your About Us content here. HTML is supported for formatting (bold, italic, headings, lists)…"
        />
        <p className="text-[10px] text-slate-400">
          {(data.richContent || "").length} characters
        </p>
      </div>

      {/* 13 — Our Journey images (uncompressed) */}
      <div className={cardCls}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-900">Our Journey</h3>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              Upload timeline/journey images without compression. Like the PNG on your current site.
            </p>
          </div>
          <UploadBtn label="Upload Image" accept="image/*" onFile={addJourneyImage} loading={journeyUpl} icon="add_photo_alternate" />
        </div>

        <div className="space-y-3">
          {(data.journey?.images || []).map((img, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <img src={img.url} alt="" className="w-20 h-16 object-cover rounded-lg border border-slate-200 shrink-0" onError={(e) => { e.currentTarget.style.opacity = "0.3"; }} />
              <div className="flex-1 grid grid-cols-2 gap-2">
                <input className={inputCls} placeholder="Caption" value={img.caption || ""}
                  onChange={(e) => { const imgs = [...data.journey.images]; imgs[i] = { ...img, caption: e.target.value }; setData((p) => ({ ...p, journey: { images: imgs } })); }} />
                <input className={inputCls} placeholder="Year (e.g. 2018)" value={img.year || ""}
                  onChange={(e) => { const imgs = [...data.journey.images]; imgs[i] = { ...img, year: e.target.value }; setData((p) => ({ ...p, journey: { images: imgs } })); }} />
              </div>
              <button onClick={() => { const imgs = data.journey.images.filter((_, j) => j !== i); setData((p) => ({ ...p, journey: { images: imgs } })); }}
                className="p-1.5 text-red-400 hover:text-red-700 hover:bg-red-50 rounded-lg"><Icon name="delete" /></button>
            </div>
          ))}
          {(data.journey?.images || []).length === 0 && (
            <p className="text-xs text-slate-400 font-medium text-center py-4">No journey images yet. Upload one above.</p>
          )}
        </div>
      </div>

      {/* 14 — Vision & Mission */}
      <div className={cardCls}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-900">Vision & Mission</h3>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              Select type, pick a Material Symbol icon, add a heading + description. Max 250 chars per description point.
            </p>
          </div>
          <button onClick={() => setData((p) => ({ ...p, visionMission: [...(p.visionMission || []), { type: "vision", icon: "visibility", points: [{ heading: "", description: "" }] }] }))}
            className="flex items-center gap-1.5 text-xs font-black px-3 py-2 bg-blue-950 text-white rounded-xl hover:bg-blue-900">
            <Icon name="add" /> Add
          </button>
        </div>

        <div className="space-y-4">
          {(data.visionMission || []).map((vm, vi) => (
            <div key={vi} className="border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-3">
                <select className={`${inputCls} w-32`} value={vm.type}
                  onChange={(e) => { const arr = [...data.visionMission]; arr[vi] = { ...vm, type: e.target.value }; setData((p) => ({ ...p, visionMission: arr })); }}>
                  <option value="vision">Vision</option>
                  <option value="mission">Mission</option>
                </select>
                <div className="flex items-center gap-2 flex-1">
                  <span className="material-symbols-outlined text-blue-700" style={{ fontSize: "22px" }}>{vm.icon || "star"}</span>
                  <input className={`${inputCls} flex-1`} placeholder="Material Symbol icon name (e.g. visibility, flag, rocket_launch)" value={vm.icon || ""}
                    onChange={(e) => { const arr = [...data.visionMission]; arr[vi] = { ...vm, icon: e.target.value }; setData((p) => ({ ...p, visionMission: arr })); }} />
                </div>
                <button onClick={() => setData((p) => ({ ...p, visionMission: p.visionMission.filter((_, j) => j !== vi) }))}
                  className="p-1.5 text-red-400 hover:text-red-700 hover:bg-red-50 rounded-lg"><Icon name="delete" /></button>
              </div>

              <div className="space-y-2">
                <p className={labelCls}>Points</p>
                {(vm.points || []).map((pt, pi) => (
                  <div key={pi} className="flex items-start gap-2">
                    <div className="flex-1 space-y-1.5">
                      <input className={inputCls} placeholder="Heading (optional)" value={pt.heading || ""}
                        onChange={(e) => { const arr = [...data.visionMission]; arr[vi].points[pi] = { ...pt, heading: e.target.value }; setData((p) => ({ ...p, visionMission: arr })); }} />
                      <div className="relative">
                        <textarea className={`${inputCls} min-h-[60px] resize-none`} placeholder="Description (max 250 chars)" maxLength={250} value={pt.description || ""}
                          onChange={(e) => { const arr = [...data.visionMission]; arr[vi].points[pi] = { ...pt, description: e.target.value }; setData((p) => ({ ...p, visionMission: arr })); }} />
                        <span className={`absolute bottom-2 right-2 text-[10px] font-mono ${(pt.description || "").length > 220 ? "text-amber-600" : "text-slate-300"}`}>
                          {(pt.description || "").length}/250
                        </span>
                      </div>
                    </div>
                    <button onClick={() => { const arr = [...data.visionMission]; arr[vi].points = arr[vi].points.filter((_, k) => k !== pi); setData((p) => ({ ...p, visionMission: arr })); }}
                      className="p-1.5 mt-1 text-red-400 hover:text-red-700 hover:bg-red-50 rounded-lg"><Icon name="close" className="text-sm" /></button>
                  </div>
                ))}
                <button onClick={() => { const arr = [...data.visionMission]; arr[vi].points = [...(arr[vi].points || []), { heading: "", description: "" }]; setData((p) => ({ ...p, visionMission: arr })); }}
                  className="text-[10px] font-black text-blue-800 hover:text-blue-950 flex items-center gap-1">
                  <Icon name="add_circle" className="text-sm" /> Add Point
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 15 — Core Values (max 5, extendable by 3 or 5) */}
      <div className={cardCls}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-900">Core Values</h3>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              Max {MAX_CORE_VALUES} values. Extend in batches of +3 or +5.
              {(data.coreValues?.length || 0) >= MAX_CORE_VALUES && " Increase limit below to add more."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {(data.coreValues?.length || 0) >= MAX_CORE_VALUES && (
              <>
                <button onClick={() => setData((p) => ({ ...p, _maxCoreValues: (p._maxCoreValues || 5) + 3 }))}
                  className="text-[10px] font-black px-2 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">+3 slots</button>
                <button onClick={() => setData((p) => ({ ...p, _maxCoreValues: (p._maxCoreValues || 5) + 5 }))}
                  className="text-[10px] font-black px-2 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">+5 slots</button>
              </>
            )}
            {(data.coreValues?.length || 0) < (data._maxCoreValues || 5) && (
              <button onClick={() => setData((p) => ({ ...p, coreValues: [...(p.coreValues || []), { title: "", description: "" }] }))}
                className="flex items-center gap-1.5 text-xs font-black px-3 py-2 bg-blue-950 text-white rounded-xl hover:bg-blue-900">
                <Icon name="add" /> Add Value
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(data.coreValues || []).map((cv, i) => (
            <div key={i} className="border border-slate-200 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase">Value {i + 1}</span>
                <button onClick={() => setData((p) => ({ ...p, coreValues: p.coreValues.filter((_, j) => j !== i) }))}
                  className="p-1 text-red-400 hover:text-red-700"><Icon name="close" className="text-sm" /></button>
              </div>
              <input className={inputCls} placeholder="Title (e.g. Integrity)" value={cv.title || ""}
                onChange={(e) => { const arr = [...data.coreValues]; arr[i] = { ...cv, title: e.target.value }; setData((p) => ({ ...p, coreValues: arr })); }} />
              <textarea className={`${inputCls} min-h-[80px] resize-none`} placeholder="Description — supports headings, bullets, bold, etc."
                value={cv.description || ""}
                onChange={(e) => { const arr = [...data.coreValues]; arr[i] = { ...cv, description: e.target.value }; setData((p) => ({ ...p, coreValues: arr })); }} />
            </div>
          ))}
        </div>
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

// ─── SECTION: FOUNDERS (task 17) ─────────────────────────────────────────────
function FoundersSection() {
  const [data,     setData]     = useState(DEFAULT_FOUNDERS);
  const [saving,   setSaving]   = useState(false);
  const [uploading, setUploading] = useState({ founder: false, coFounder: false });

  useEffect(() => {
    siteConfigApi.getFounders().then((d) => setData({ ...DEFAULT_FOUNDERS, ...d }));
  }, []);

  const setF = (who, k, v) => setData((p) => ({ ...p, [who]: { ...p[who], [k]: v } }));

  const handlePhoto = async (who, file) => {
    setUploading((p) => ({ ...p, [who]: true }));
    try {
      const url = who === "founder" ? await siteConfigApi.uploadFounder(file) : await siteConfigApi.uploadCoFounder(file);
      setF(who, "photoUrl", url);
      toast.success("Photo uploaded (uncompressed)");
    } catch (e) { toast.error(e.message); } finally { setUploading((p) => ({ ...p, [who]: false })); }
  };

  const save = async () => {
    setSaving(true);
    try { await siteConfigApi.saveFounders(data); toast.success("Founder details saved"); }
    catch (e) { toast.error(e.message); } finally { setSaving(false); }
  };

  const FounderCard = ({ who, title }) => {
    const f = data[who] || {};
    return (
      <div className={cardCls}>
        <h3 className="text-sm font-black text-slate-900">{title}</h3>
        <div className="flex items-start gap-4">
          {/* Photo */}
          <div className="shrink-0">
            {f.photoUrl ? (
              <img src={f.photoUrl} alt={who} className="w-24 h-28 object-cover rounded-xl border border-slate-200" />
            ) : (
              <div className="w-24 h-28 bg-slate-100 rounded-xl border border-dashed border-slate-300 flex items-center justify-center">
                <Icon name="person" className="text-3xl text-slate-400" />
              </div>
            )}
            <div className="mt-2 flex flex-col gap-1">
              <UploadBtn label="Upload Photo" accept="image/*" onFile={(file) => handlePhoto(who, file)} loading={uploading[who]} icon="add_photo_alternate" />
              {f.photoUrl && <button onClick={() => setF(who, "photoUrl", "")} className="text-[10px] text-red-500 font-bold text-center hover:text-red-700">Remove</button>}
            </div>
          </div>

          <div className="flex-1 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Full Name"><input className={inputCls} value={f.name || ""} onChange={(e) => setF(who, "name", e.target.value)} /></Field>
              <Field label="Designation"><input className={inputCls} value={f.designation || ""} onChange={(e) => setF(who, "designation", e.target.value)} /></Field>
            </div>
            {/* Phones */}
            <div>
              <p className={`${labelCls} mb-1.5`}>Phone Numbers</p>
              <AddRemoveList
                items={f.phones || []}
                setItems={(phones) => setF(who, "phones", phones)}
                newItem={() => ""}
                renderItem={(item, i, upd) => (
                  <input className={inputCls} value={item || ""} placeholder="+91 9876543210" onChange={(e) => upd(e.target.value)} />
                )}
              />
            </div>
            {/* Emails */}
            <div>
              <p className={`${labelCls} mb-1.5`}>Email Addresses</p>
              <AddRemoveList
                items={f.emails || []}
                setItems={(emails) => setF(who, "emails", emails)}
                newItem={() => ""}
                renderItem={(item, i, upd) => (
                  <input className={inputCls} value={item || ""} placeholder="founder@company.com" onChange={(e) => upd(e.target.value)} />
                )}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      <FounderCard who="founder" title="👤 Founder" />
      <FounderCard who="coFounder" title="👤 Co-Founder" />
      <div className="flex justify-end"><SaveBtn saving={saving} onClick={save} /></div>
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
  const [tab, setTab] = useState("branding");

  const renderSection = () => {
    switch (tab) {
      case "branding":  return <BrandingSection />;
      case "header":    return <HeaderSection />;
      case "contact":   return <ContactSection />;
      case "about":     return <AboutSection />;
      case "apiKeys":   return <ApiKeysSection />;
      case "founders":  return <FoundersSection />;
      case "font":      return <FontSection />;
      case "location":  return <LocationSection />;
      default:          return <BrandingSection />;
    }
  };

  return (
    <div className="min-h-full bg-slate-50">
      {/* Page header */}
      <div className="bg-white border-b border-slate-200 px-6 py-5">
        <h1 className="text-lg font-black text-slate-900 tracking-tight">⚙️ Central Site Configuration</h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Branding · Navigation · Contact · About Us · API Keys · Founders · Font · Location
        </p>
      </div>

      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-80px)]">
        {/* Sidebar tabs */}
        <aside className="w-full lg:w-56 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 shrink-0">
          <nav className="p-3 space-y-0.5">
            {TABS.map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-black transition-all text-left ${
                  tab === t.key ? "bg-blue-950 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}>
                <Icon name={t.icon} className="text-base" />
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