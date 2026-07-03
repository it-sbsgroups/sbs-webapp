"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import toast from "react-hot-toast";
import siteConfigApi from "@/lib/siteConfigApi";
import { uploadImage } from "@/lib/uploadApi";

// ─── Icons (Material Symbols via <link> in layout) ───────────────────────────
const Icon = ({ n, cls = "" }) => (
  <span className={`material-symbols-outlined leading-none ${cls}`}>{n}</span>
);

// ─── Shared UI atoms ──────────────────────────────────────────────────────────
const inputCls =
  "w-full text-sm px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-slate-800 font-medium placeholder:font-normal placeholder:text-slate-400 transition-colors";
const labelCls = "text-[10px] font-black text-slate-500 uppercase tracking-wider";
const cardCls = "bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm";

function Label({ children }) { return <label className={labelCls}>{children}</label>; }
function Field({ label, children }) {
  return <div className="space-y-1.5"><Label>{label}</Label>{children}</div>;
}
function SaveBtn({ saving, onClick }) {
  return (
    <div className="flex justify-end pt-2">
      <button onClick={onClick} disabled={saving}
        className="flex items-center gap-2 px-6 py-2.5 bg-blue-950 text-white text-xs font-black rounded-xl hover:bg-blue-900 disabled:opacity-60 shadow-md transition-colors">
        {saving
          ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          : <Icon n="save" cls="text-base" />}
        {saving ? "Saving…" : "Save Changes"}
      </button>
    </div>
  );
}
function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
        className={`relative w-10 h-5.5 rounded-full transition-colors flex-shrink-0 ${checked ? "bg-blue-950" : "bg-slate-300"}`}>
        <span className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-white rounded-full shadow transition-transform ${checked ? "translate-x-4.5" : ""}`} />
      </button>
      <span className="text-sm font-semibold text-slate-700">{label}</span>
    </label>
  );
}
function FileUploadBtn({ label, accept, onFile, loading, icon = "upload" }) {
  const ref = useRef(null);
  return (
    <>
      <input ref={ref} type="file" accept={accept} className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) onFile(f); }} />
      <button type="button" disabled={loading} onClick={() => ref.current?.click()}
        className="flex items-center gap-1.5 text-xs font-black px-3.5 py-2 rounded-xl border border-blue-200 text-blue-800 hover:bg-blue-50 disabled:opacity-60 transition-colors">
        {loading
          ? <span className="w-3.5 h-3.5 border-2 border-blue-300 border-t-blue-800 rounded-full animate-spin" />
          : <Icon n={icon} cls="text-base" />}
        {loading ? "Uploading…" : label}
      </button>
    </>
  );
}
function ArrayEditor({ items, onChange, emptyItem, renderRow, addLabel = "Add" }) {
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2">
          <div className="flex-1">{renderRow(item, i, (patch) => onChange(items.map((x, j) => j === i ? { ...x, ...patch } : x)))}</div>
          <button onClick={() => onChange(items.filter((_, j) => j !== i))}
            className="mt-1 p-1.5 rounded-lg text-red-400 hover:text-red-700 hover:bg-red-50 transition-colors flex-shrink-0">
            <Icon n="delete" cls="text-base" />
          </button>
        </div>
      ))}
      <button onClick={() => onChange([...items, typeof emptyItem === "function" ? emptyItem() : { ...emptyItem }])}
        className="flex items-center gap-1.5 text-xs font-black text-blue-800 hover:text-blue-950 py-1 transition-colors">
        <Icon n="add_circle" cls="text-base" /> {addLabel}
      </button>
    </div>
  );
}

// ─── TAB DEFINITIONS ─────────────────────────────────────────────────────────
const TABS = [
  { key: "branding",   label: "Branding",      icon: "image"          },
  { key: "navigation", label: "Navigation",    icon: "menu"           },
  { key: "contact",    label: "Contact",       icon: "contact_phone"  },
  { key: "footer",     label: "Footer Links",  icon: "footer"         },
  { key: "social",     label: "Social Media",  icon: "share"          },
  { key: "newsletter", label: "Newsletter",    icon: "mail"           },
  { key: "about",      label: "About Us",      icon: "info"           },
  { key: "founders",   label: "Founders",      icon: "person"         },
  { key: "font",       label: "Font",          icon: "text_fields"    },
];

// ─── SECTION: Branding ────────────────────────────────────────────────────────
function BrandingTab() {
  const [d, setD] = useState({ companyName: "", tagline: "", logoUrl: "", faviconUrl: "" });
  const [saving, setSaving] = useState(false);
  const [logoUpl, setLogoUpl] = useState(false);

  useEffect(() => { siteConfigApi.getBranding().then((r) => setD((p) => ({ ...p, ...r }))); }, []);

  const handleLogo = async (file) => {
    setLogoUpl(true);
    try { const url = await uploadImage(file, "branding"); setD((p) => ({ ...p, logoUrl: url })); toast.success("Logo uploaded"); }
    catch (e) { toast.error(e.message); } finally { setLogoUpl(false); }
  };

  const save = async () => {
    setSaving(true);
    try { await siteConfigApi.saveBranding(d); toast.success("Branding saved"); }
    catch (e) { toast.error(e.message); } finally { setSaving(false); }
  };

  return (
    <div className="space-y-5">
      <div className={cardCls}>
        <h3 className="text-sm font-black text-slate-900">Company Identity</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Company Name"><input className={inputCls} value={d.companyName} onChange={(e) => setD((p) => ({ ...p, companyName: e.target.value }))} /></Field>
          <Field label="Tagline"><input className={inputCls} value={d.tagline} onChange={(e) => setD((p) => ({ ...p, tagline: e.target.value }))} /></Field>
        </div>
      </div>

      <div className={cardCls}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-black text-slate-900">Logo</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">PNG, SVG, WebP. Uploaded uncompressed.</p>
          </div>
          <FileUploadBtn label="Upload" accept="image/*" onFile={handleLogo} loading={logoUpl} icon="add_photo_alternate" />
        </div>
        {d.logoUrl && <img src={d.logoUrl} alt="logo" className="max-h-14 max-w-[180px] object-contain rounded-xl border border-slate-100 p-2 bg-slate-50" />}
        <Field label="Or paste URL"><input className={inputCls} value={d.logoUrl} onChange={(e) => setD((p) => ({ ...p, logoUrl: e.target.value }))} placeholder="https://…" /></Field>
      </div>

      <div className={cardCls}>
        <h3 className="text-sm font-black text-slate-900">Favicon URL</h3>
        <p className="text-[11px] text-slate-400">.ico or .png, 32×32 or 64×64 recommended.</p>
        <Field label="Favicon URL"><input className={inputCls} value={d.faviconUrl} onChange={(e) => setD((p) => ({ ...p, faviconUrl: e.target.value }))} placeholder="https://…/favicon.ico" /></Field>
      </div>
      <SaveBtn saving={saving} onClick={save} />
    </div>
  );
}

// ─── SECTION: Navigation ──────────────────────────────────────────────────────
function NavigationTab() {
  const [navs,      setNavs]      = useState([]);
  const [loginBtn,  setLoginBtn]  = useState({ enabled: true, label: "Login", link: "/login" });
  const [saving,    setSaving]    = useState(false);
  const [editIdx,   setEditIdx]   = useState(null);

  useEffect(() => {
    siteConfigApi.getNavigation().then((r) => {
      if (r.navs) setNavs(r.navs);
      if (r.loginButton) setLoginBtn(r.loginButton);
    });
  }, []);

  const blankNav = () => ({ id: Date.now(), name: "", link: "/", enabled: true, hasDropdown: false, dropdownType: "custom", dropdownItems: [] });
  const upd = (i, patch) => setNavs((p) => p.map((n, j) => j === i ? { ...n, ...patch } : n));
  const move = (i, dir) => { const a = [...navs]; const t = i + dir; if (t < 0 || t >= a.length) return; [a[i], a[t]] = [a[t], a[i]]; setNavs(a); };

  const save = async () => {
    setSaving(true);
    try { await siteConfigApi.saveNavigation({ navs, loginButton: loginBtn }); toast.success("Navigation saved"); }
    catch (e) { toast.error(e.message); } finally { setSaving(false); }
  };

  return (
    <div className="space-y-5">
      <div className={cardCls}>
        <h3 className="text-sm font-black text-slate-900">Login Button</h3>
        <Toggle checked={loginBtn.enabled} onChange={(v) => setLoginBtn((p) => ({ ...p, enabled: v }))} label={loginBtn.enabled ? "Shown in header" : "Hidden"} />
        {loginBtn.enabled && (
          <div className="grid grid-cols-2 gap-3 pt-1">
            <Field label="Label"><input className={inputCls} value={loginBtn.label} onChange={(e) => setLoginBtn((p) => ({ ...p, label: e.target.value }))} /></Field>
            <Field label="Link"><input className={inputCls} value={loginBtn.link} onChange={(e) => setLoginBtn((p) => ({ ...p, link: e.target.value }))} /></Field>
          </div>
        )}
      </div>

      <div className={cardCls}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-900">Nav Items ({navs.length})</h3>
          <button onClick={() => setNavs((p) => [...p, blankNav()])}
            className="flex items-center gap-1.5 text-xs font-black px-3 py-2 bg-blue-950 text-white rounded-xl hover:bg-blue-900">
            <Icon n="add" cls="text-base" /> Add Nav
          </button>
        </div>
        <div className="space-y-2">
          {navs.map((nav, i) => (
            <div key={nav.id || i} className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50">
                <div className="flex flex-col gap-0.5">
                  <button onClick={() => move(i, -1)} disabled={i === 0} className="text-[10px] text-slate-400 hover:text-slate-700 disabled:opacity-30 leading-none">▲</button>
                  <button onClick={() => move(i, 1)} disabled={i === navs.length - 1} className="text-[10px] text-slate-400 hover:text-slate-700 disabled:opacity-30 leading-none">▼</button>
                </div>
                <input className="flex-1 text-xs font-black bg-transparent outline-none text-slate-800 placeholder:font-normal" placeholder="Label" value={nav.name} onChange={(e) => upd(i, { name: e.target.value })} />
                <input className="w-36 text-xs border border-slate-200 bg-white rounded-lg px-2 py-1 outline-none" placeholder="/link" value={nav.link} onChange={(e) => upd(i, { link: e.target.value })} />
                <button onClick={() => upd(i, { enabled: !nav.enabled })} className={`text-[10px] font-black px-2 py-1 rounded-md ${nav.enabled ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-500"}`}>{nav.enabled ? "ON" : "OFF"}</button>
                <button onClick={() => upd(i, { hasDropdown: !nav.hasDropdown })} className={`text-[10px] font-black px-2 py-1 rounded-md ${nav.hasDropdown ? "bg-blue-100 text-blue-800" : "bg-slate-100 text-slate-500"}`}>▾ Drop</button>
                <button onClick={() => setEditIdx(editIdx === i ? null : i)} className="text-[10px] font-black px-2 py-1 rounded-md bg-slate-100 text-slate-600">{editIdx === i ? "Close" : "Edit"}</button>
                <button onClick={() => setNavs((p) => p.filter((_, j) => j !== i))} className="p-1.5 text-red-400 hover:text-red-700 hover:bg-red-50 rounded-lg"><Icon n="delete" cls="text-sm" /></button>
              </div>
              {editIdx === i && nav.hasDropdown && (
                <div className="px-4 py-3 border-t border-slate-100 space-y-3">
                  <Field label="Dropdown type">
                    <select className={inputCls} value={nav.dropdownType || "custom"} onChange={(e) => upd(i, { dropdownType: e.target.value })}>
                      <option value="custom">Custom links</option>
                      <option value="categories">Product categories (auto)</option>
                    </select>
                  </Field>
                  {(nav.dropdownType || "custom") === "custom" && (
                    <ArrayEditor items={nav.dropdownItems || []} onChange={(items) => upd(i, { dropdownItems: items })} emptyItem={{ name: "", link: "" }} addLabel="Add link"
                      renderRow={(item, _, patch) => (
                        <div className="grid grid-cols-2 gap-2">
                          <input className={inputCls} placeholder="Label" value={item.name || ""} onChange={(e) => patch({ name: e.target.value })} />
                          <input className={inputCls} placeholder="/url" value={item.link || ""} onChange={(e) => patch({ link: e.target.value })} />
                        </div>
                      )}
                    />
                  )}
                  {nav.dropdownType === "categories" && (
                    <p className="text-xs text-blue-800 font-semibold bg-blue-50 p-3 rounded-xl">Auto-populated from product categories. No manual links needed.</p>
                  )}
                </div>
              )}
            </div>
          ))}
          {navs.length === 0 && <p className="text-xs text-slate-400 text-center py-6">No nav items. Click "Add Nav" to start.</p>}
        </div>
      </div>
      <SaveBtn saving={saving} onClick={save} />
    </div>
  );
}

// ─── SECTION: Contact ─────────────────────────────────────────────────────────
function ContactTab() {
  const [d, setD] = useState({ address: { line1: "", city: "", state: "", country: "India", pincode: "" }, phones: [], emails: [] });
  const [saving, setSaving] = useState(false);
  useEffect(() => { siteConfigApi.getContact().then((r) => setD((p) => ({ ...p, ...r }))); }, []);
  const setAddr = (k, v) => setD((p) => ({ ...p, address: { ...p.address, [k]: v } }));
  const save = async () => { setSaving(true); try { await siteConfigApi.saveContact(d); toast.success("Contact saved"); } catch (e) { toast.error(e.message); } finally { setSaving(false); } };
  return (
    <div className="space-y-5">
      <div className={cardCls}>
        <h3 className="text-sm font-black text-slate-900">📍 Address</h3>
        <Field label="Street / Line 1"><input className={inputCls} value={d.address?.line1 || ""} onChange={(e) => setAddr("line1", e.target.value)} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="City"><input className={inputCls} value={d.address?.city || ""} onChange={(e) => setAddr("city", e.target.value)} /></Field>
          <Field label="State"><input className={inputCls} value={d.address?.state || ""} onChange={(e) => setAddr("state", e.target.value)} /></Field>
          <Field label="Country"><input className={inputCls} value={d.address?.country || "India"} onChange={(e) => setAddr("country", e.target.value)} /></Field>
          <Field label="Pincode"><input className={inputCls} value={d.address?.pincode || ""} onChange={(e) => setAddr("pincode", e.target.value)} maxLength={6} /></Field>
        </div>
      </div>
      <div className={cardCls}>
        <h3 className="text-sm font-black text-slate-900">📞 Phone Numbers</h3>
        <ArrayEditor items={d.phones || []} onChange={(phones) => setD((p) => ({ ...p, phones }))} emptyItem={{ label: "", number: "", isTel: true }} addLabel="Add phone"
          renderRow={(item, _, patch) => (
            <div className="grid grid-cols-3 gap-2">
              <input className={inputCls} placeholder="Owner (e.g. Sales)" value={item.label || ""} onChange={(e) => patch({ label: e.target.value })} />
              <input className={inputCls} placeholder="+91 9876543210" value={item.number || ""} onChange={(e) => patch({ number: e.target.value })} />
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer">
                <input type="checkbox" checked={item.isTel !== false} onChange={(e) => patch({ isTel: e.target.checked })} /> tel: link
              </label>
            </div>
          )}
        />
      </div>
      <div className={cardCls}>
        <h3 className="text-sm font-black text-slate-900">✉️ Email Addresses</h3>
        <ArrayEditor items={d.emails || []} onChange={(emails) => setD((p) => ({ ...p, emails }))} emptyItem={{ label: "", address: "", isMailto: true }} addLabel="Add email"
          renderRow={(item, _, patch) => (
            <div className="grid grid-cols-3 gap-2">
              <input className={inputCls} placeholder="Label (e.g. Procurement)" value={item.label || ""} onChange={(e) => patch({ label: e.target.value })} />
              <input className={inputCls} placeholder="info@company.com" value={item.address || ""} onChange={(e) => patch({ address: e.target.value })} />
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer">
                <input type="checkbox" checked={item.isMailto !== false} onChange={(e) => patch({ isMailto: e.target.checked })} /> mailto: link
              </label>
            </div>
          )}
        />
      </div>
      <SaveBtn saving={saving} onClick={save} />
    </div>
  );
}

// ─── SECTION: Footer Links ────────────────────────────────────────────────────
function FooterTab() {
  const [d, setD] = useState({ quickLinks: [], servicesLinks: [], copyright: "© {year} SBS Groups. All rights reserved." });
  const [saving, setSaving] = useState(false);
  useEffect(() => { siteConfigApi.getFooter().then((r) => setD((p) => ({ ...p, ...r }))); }, []);
  const save = async () => { setSaving(true); try { await siteConfigApi.saveFooter(d); toast.success("Footer links saved"); } catch (e) { toast.error(e.message); } finally { setSaving(false); } };
  const LinkEditor = ({ title, key }) => (
    <div className={cardCls}>
      <h3 className="text-sm font-black text-slate-900">{title}</h3>
      <ArrayEditor items={d[key] || []} onChange={(v) => setD((p) => ({ ...p, [key]: v }))} emptyItem={{ name: "", link: "" }} addLabel="Add link"
        renderRow={(item, _, patch) => (
          <div className="grid grid-cols-2 gap-2">
            <input className={inputCls} placeholder="Label" value={item.name || ""} onChange={(e) => patch({ name: e.target.value })} />
            <input className={inputCls} placeholder="/url" value={item.link || ""} onChange={(e) => patch({ link: e.target.value })} />
          </div>
        )}
      />
    </div>
  );
  return (
    <div className="space-y-5">
      <LinkEditor title="🔗 Quick Links" key="quickLinks" />
      <LinkEditor title="⚙️ Services Links" key="servicesLinks" />
      <div className={cardCls}>
        <h3 className="text-sm font-black text-slate-900">© Copyright</h3>
        <p className="text-[11px] text-slate-400">Use <code className="bg-slate-100 px-1 rounded">{"{year}"}</code> for current year.</p>
        <Field label="Copyright text"><input className={inputCls} value={d.copyright || ""} onChange={(e) => setD((p) => ({ ...p, copyright: e.target.value }))} /></Field>
        {d.copyright && <p className="text-xs text-slate-500 bg-slate-50 rounded-xl px-3 py-2">Preview: {d.copyright.replace("{year}", new Date().getFullYear())}</p>}
      </div>
      <SaveBtn saving={saving} onClick={save} />
    </div>
  );
}

// ─── SECTION: Social ──────────────────────────────────────────────────────────
const SOCIALS = ["Facebook","Instagram","Twitter / X","YouTube","LinkedIn","WhatsApp","Telegram","Pinterest","Custom"];
function SocialTab() {
  const [items, setItems] = useState([]);
  const [saving, setSaving] = useState(false);
  useEffect(() => { siteConfigApi.getSocial().then((r) => setItems(Array.isArray(r) ? r : r?.handles || [])); }, []);
  const save = async () => { setSaving(true); try { await siteConfigApi.saveSocial(items); toast.success("Social media saved"); } catch (e) { toast.error(e.message); } finally { setSaving(false); } };
  return (
    <div className="space-y-5">
      <div className={cardCls}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-900">📱 Social Media Handles</h3>
          <button onClick={() => setItems((p) => [...p, { platform: "Custom", link: "" }])} className="flex items-center gap-1.5 text-xs font-black px-3 py-2 bg-blue-950 text-white rounded-xl hover:bg-blue-900"><Icon n="add" cls="text-base" /> Add</button>
        </div>
        <ArrayEditor items={items} onChange={setItems} emptyItem={{ platform: "Custom", link: "" }} addLabel="Add handle"
          renderRow={(item, _, patch) => (
            <div className="grid grid-cols-2 gap-2">
              <select className={inputCls} value={item.platform || "Custom"} onChange={(e) => patch({ platform: e.target.value })}>
                {SOCIALS.map((s) => <option key={s}>{s}</option>)}
              </select>
              <input className={inputCls} placeholder="https://…" value={item.link || ""} onChange={(e) => patch({ link: e.target.value })} />
            </div>
          )}
        />
      </div>
      <SaveBtn saving={saving} onClick={save} />
    </div>
  );
}

// ─── SECTION: Newsletter ──────────────────────────────────────────────────────
function NewsletterTab() {
  const [d, setD] = useState({ enabled: true, triggerWaitTime: 15, triggerClicks: 3, triggerScrollPercentage: 50, title: "Stay in the Loop", description: "Get the latest product updates and industry news." });
  const [saving, setSaving] = useState(false);
  useEffect(() => { siteConfigApi.getNewsletter().then((r) => setD((p) => ({ ...p, ...r }))); }, []);
  const set = (k, v) => setD((p) => ({ ...p, [k]: v }));
  const save = async () => { setSaving(true); try { await siteConfigApi.saveNewsletter(d); toast.success("Newsletter settings saved"); } catch (e) { toast.error(e.message); } finally { setSaving(false); } };
  return (
    <div className="space-y-5">
      <div className={cardCls}>
        <Toggle checked={d.enabled} onChange={(v) => set("enabled", v)} label={d.enabled ? "Newsletter popup is enabled" : "Newsletter popup is disabled"} />
      </div>
      {d.enabled && (
        <>
          <div className={cardCls}>
            <h3 className="text-sm font-black text-slate-900">Popup Content</h3>
            <Field label="Title"><input className={inputCls} value={d.title || ""} onChange={(e) => set("title", e.target.value)} /></Field>
            <Field label="Description"><textarea className={`${inputCls} min-h-[70px] resize-none`} value={d.description || ""} onChange={(e) => set("description", e.target.value)} /></Field>
          </div>
          <div className={cardCls}>
            <h3 className="text-sm font-black text-slate-900">Trigger Rules</h3>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Wait time (seconds)"><input type="number" className={inputCls} value={d.triggerWaitTime || 15} onChange={(e) => set("triggerWaitTime", Number(e.target.value))} min={5} max={120} /></Field>
              <Field label="After N clicks"><input type="number" className={inputCls} value={d.triggerClicks || 3} onChange={(e) => set("triggerClicks", Number(e.target.value))} min={1} max={20} /></Field>
              <Field label="Scroll depth %"><input type="number" className={inputCls} value={d.triggerScrollPercentage || 50} onChange={(e) => set("triggerScrollPercentage", Number(e.target.value))} min={10} max={100} /></Field>
            </div>
          </div>
        </>
      )}
      <SaveBtn saving={saving} onClick={save} />
    </div>
  );
}

// ─── SECTION: About ───────────────────────────────────────────────────────────
function AboutTab() {
  const [d, setD] = useState({ richContent: "", journey: { images: [] }, coreValues: [] });
  const [saving, setSaving] = useState(false);
  useEffect(() => { siteConfigApi.getAbout().then((r) => setD((p) => ({ ...p, ...r }))); }, []);
  const save = async () => { setSaving(true); try { await siteConfigApi.saveAbout(d); toast.success("About Us saved"); } catch (e) { toast.error(e.message); } finally { setSaving(false); } };
  const MAX_CV = d._maxCv || 5;
  return (
    <div className="space-y-5">
      <div className={cardCls}>
        <h3 className="text-sm font-black text-slate-900">About Us — Main Content</h3>
        <p className="text-[11px] text-slate-400">Plain text or HTML. No word limit.</p>
        <textarea className={`${inputCls} min-h-[180px] resize-y`} value={d.richContent || ""} onChange={(e) => setD((p) => ({ ...p, richContent: e.target.value }))} placeholder="Write About Us content here…" />
      </div>
      <div className={cardCls}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-900">Core Values (max {MAX_CV})</h3>
          <div className="flex gap-2">
            {(d.coreValues?.length || 0) >= MAX_CV && (
              <button onClick={() => setD((p) => ({ ...p, _maxCv: MAX_CV + 3 }))} className="text-[10px] font-black px-2 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">+3 slots</button>
            )}
            {(d.coreValues?.length || 0) < MAX_CV && (
              <button onClick={() => setD((p) => ({ ...p, coreValues: [...(p.coreValues || []), { title: "", description: "" }] }))} className="flex items-center gap-1 text-xs font-black px-3 py-2 bg-blue-950 text-white rounded-xl hover:bg-blue-900"><Icon n="add" cls="text-base" /> Add Value</button>
            )}
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {(d.coreValues || []).map((cv, i) => (
            <div key={i} className="border border-slate-200 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase">Value {i + 1}</span>
                <button onClick={() => setD((p) => ({ ...p, coreValues: p.coreValues.filter((_, j) => j !== i) }))} className="p-1 text-red-400 hover:text-red-700"><Icon n="close" cls="text-sm" /></button>
              </div>
              <input className={inputCls} placeholder="Title" value={cv.title || ""} onChange={(e) => { const a = [...d.coreValues]; a[i] = { ...cv, title: e.target.value }; setD((p) => ({ ...p, coreValues: a })); }} />
              <textarea className={`${inputCls} min-h-[70px] resize-none`} placeholder="Description" value={cv.description || ""} onChange={(e) => { const a = [...d.coreValues]; a[i] = { ...cv, description: e.target.value }; setD((p) => ({ ...p, coreValues: a })); }} />
            </div>
          ))}
        </div>
      </div>
      <SaveBtn saving={saving} onClick={save} />
    </div>
  );
}

// ─── SECTION: Founders ────────────────────────────────────────────────────────
function FoundersTab() {
  const [d, setD] = useState({ founder: { name: "", designation: "Founder", photoUrl: "", phones: [], emails: [] }, coFounder: { name: "", designation: "Co-Founder", photoUrl: "", phones: [], emails: [] } });
  const [saving, setSaving] = useState(false);
  const [upl, setUpl] = useState({});
  useEffect(() => { siteConfigApi.getFounders().then((r) => setD((p) => ({ ...p, ...r }))); }, []);
  const setF = (who, k, v) => setD((p) => ({ ...p, [who]: { ...p[who], [k]: v } }));
  const handlePhoto = async (who, file) => {
    setUpl((p) => ({ ...p, [who]: true }));
    try { const url = await uploadImage(file, `branding/${who}`); setF(who, "photoUrl", url); toast.success("Photo uploaded"); }
    catch (e) { toast.error(e.message); } finally { setUpl((p) => ({ ...p, [who]: false })); }
  };
  const save = async () => { setSaving(true); try { await siteConfigApi.saveFounders(d); toast.success("Founders saved"); } catch (e) { toast.error(e.message); } finally { setSaving(false); } };
  const Card = ({ who, title }) => {
    const f = d[who] || {};
    return (
      <div className={cardCls}>
        <h3 className="text-sm font-black text-slate-900">{title}</h3>
        <div className="flex gap-4">
          <div className="shrink-0 flex flex-col items-center gap-2">
            {f.photoUrl ? <img src={f.photoUrl} alt="" className="w-20 h-24 object-cover rounded-xl border border-slate-200" /> : <div className="w-20 h-24 bg-slate-100 rounded-xl border border-dashed border-slate-300 flex items-center justify-center"><Icon n="person" cls="text-3xl text-slate-300" /></div>}
            <FileUploadBtn label="Photo" accept="image/*" onFile={(f) => handlePhoto(who, f)} loading={upl[who]} icon="add_photo_alternate" />
          </div>
          <div className="flex-1 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Name"><input className={inputCls} value={f.name || ""} onChange={(e) => setF(who, "name", e.target.value)} /></Field>
              <Field label="Designation"><input className={inputCls} value={f.designation || ""} onChange={(e) => setF(who, "designation", e.target.value)} /></Field>
            </div>
            <div>
              <Label>Phone Numbers</Label>
              <ArrayEditor items={f.phones || []} onChange={(v) => setF(who, "phones", v)} emptyItem="" addLabel="Add phone"
                renderRow={(item, _, patch) => <input className={inputCls} value={item || ""} placeholder="+91 …" onChange={(e) => patch(e.target.value)} />} />
            </div>
            <div>
              <Label>Emails</Label>
              <ArrayEditor items={f.emails || []} onChange={(v) => setF(who, "emails", v)} emptyItem="" addLabel="Add email"
                renderRow={(item, _, patch) => <input className={inputCls} value={item || ""} placeholder="name@company.com" onChange={(e) => patch(e.target.value)} />} />
            </div>
          </div>
        </div>
      </div>
    );
  };
  return <div className="space-y-5"><Card who="founder" title="👤 Founder" /><Card who="coFounder" title="👤 Co-Founder" /><SaveBtn saving={saving} onClick={save} /></div>;
}

// ─── SECTION: Font ────────────────────────────────────────────────────────────
const FONTS = ["Inter","Roboto","Poppins","Nunito","Lato","Montserrat","Open Sans","Raleway","Outfit","DM Sans","Plus Jakarta Sans"];
function FontTab() {
  const [d, setD] = useState({ family: "Inter", googleUrl: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" });
  const [saving, setSaving] = useState(false);
  useEffect(() => { siteConfigApi.getFont().then((r) => setD((p) => ({ ...p, ...r }))); }, []);
  const save = async () => { setSaving(true); try { await siteConfigApi.saveFont(d); toast.success("Font saved — reload to see change"); } catch (e) { toast.error(e.message); } finally { setSaving(false); } };
  return (
    <div className="space-y-5">
      <div className={cardCls}>
        <h3 className="text-sm font-black text-slate-900">App-wide Font</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {FONTS.map((f) => (
            <button key={f} onClick={() => setD({ family: f, googleUrl: `https://fonts.googleapis.com/css2?family=${f.replace(/ /g,"+")}:wght@400;500;600;700;800;900&display=swap` })}
              className={`p-3 rounded-xl border-2 text-left ${d.family === f ? "border-blue-950 bg-blue-50" : "border-slate-200 hover:border-blue-300"}`}
              style={{ fontFamily: `"${f}", sans-serif` }}>
              <span className={`text-xs font-black ${d.family === f ? "text-blue-950" : "text-slate-700"}`}>{f}</span>
              <p className="text-[10px] text-slate-400 mt-0.5" style={{ fontFamily: `"${f}", sans-serif` }}>The quick brown fox</p>
            </button>
          ))}
        </div>
        <Field label="Custom Google Fonts URL"><input className={inputCls} value={d.googleUrl || ""} onChange={(e) => setD((p) => ({ ...p, googleUrl: e.target.value }))} /></Field>
      </div>
      <SaveBtn saving={saving} onClick={save} />
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function SiteSettingsPage() {
  const [tab, setTab] = useState("branding");

  const content = {
    branding:   <BrandingTab />,
    navigation: <NavigationTab />,
    contact:    <ContactTab />,
    footer:     <FooterTab />,
    social:     <SocialTab />,
    newsletter: <NewsletterTab />,
    about:      <AboutTab />,
    founders:   <FoundersTab />,
    font:       <FontTab />,
  };

  return (
    <div className="min-h-full bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <h1 className="text-base font-black text-slate-900 tracking-tight">⚙️ Site Settings</h1>
        <p className="text-[11px] text-slate-500 font-medium mt-0.5">Branding · Navigation · Contact · Footer · Social · Newsletter · About · Founders · Font</p>
      </div>
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-69px)]">
        <aside className="w-full lg:w-52 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 shrink-0">
          <nav className="p-2 space-y-0.5">
            {TABS.map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-black transition-all text-left ${tab === t.key ? "bg-blue-950 text-white" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}>
                <Icon n={t.icon} cls="text-base" /> {t.label}
              </button>
            ))}
          </nav>
        </aside>
        <main className="flex-1 p-5 lg:p-7 overflow-y-auto">
          <div className="max-w-3xl mx-auto">{content[tab]}</div>
        </main>
      </div>
    </div>
  );
}