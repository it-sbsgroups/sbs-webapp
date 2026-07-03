"use client";

import { useState, useEffect } from "react";
import rfqApi from "@/lib/rfqApi";
import { 
  Save, Plus, Trash2, X, Key, 
  User, Users, Building2, Eye
} from "lucide-react";
import RfqApiKeys from "./RfqApiKeys";

// Default settings (fallback if API fails)
const defaultRfq = {
  enabled: true,
  buttonText: "Quote Bucket",
  buttonColor: "#172554",
  submitText: "🚀 Dispatch Quotation Slip",
  autoReply: {
    enabled: true,
  },
  fields: [
    { key: "fullName", label: "Contact Full Name", placeholder: "e.g. John Doe", type: "text", show: true, required: true },
    { key: "companyName", label: "Company/Enterprise Entity", placeholder: "e.g. ABC Corp Ltd", type: "text", show: true, required: true },
    { key: "email", label: "Official Email Address", placeholder: "procurement@company.com", type: "email", show: true, required: true },
    { key: "mobile", label: "Mobile Coordinate Number", placeholder: "+91 98765 43210", type: "tel", show: true, required: true },
    { key: "remarks", label: "Specific Dispatch Requirements", placeholder: "Any special instructions...", type: "textarea", show: true, required: false },
  ],
};

export default function RfqSettings() {
  // Main settings state
  const [rfqSettings, setRfqSettings] = useState(defaultRfq);
  const [loading, setLoading] = useState(true);
  
  // UI states
  const [showApiKeys, setShowApiKeys] = useState(false);
  const [activeSection, setActiveSection] = useState("customer");
  const [showPreview, setShowPreview] = useState(false);
  const [previewType, setPreviewType] = useState("customer");

  // Forward emails
  const [forwardEmails, setForwardEmails] = useState([
    { id: 1, email: "hr@sbsgroups.co.in", department: "HR Department", active: true },
    { id: 2, email: "sales@sbsgroups.co.in", department: "Sales Team", active: true },
    { id: 3, email: "purchase@sbsgroups.co.in", department: "Purchase Department", active: true },
  ]);
  const [newForwardEmail, setNewForwardEmail] = useState("");
  const [newForwardDept, setNewForwardDept] = useState("");

  // Team email template
  const [teamEmailSubject, setTeamEmailSubject] = useState(
    "🔔 New RFQ: {clientName} ({companyName}) — {itemCount} Items | RFQ: {rfqId}"
  );
  const [teamEmailBody, setTeamEmailBody] = useState(
    `Dear Team,\n\nA new quotation request has been received.\n\nCLIENT: {fullName} ({companyName})\nEMAIL: {email} | MOBILE: {mobile}\n\nREQUESTED PRODUCTS:\n{productTable}\n\nSUMMARY: {itemCount} items | Date: {date} | RFQ: {rfqId}\n\nPlease process at the earliest.\n\n- SBS Groups Automated System`
  );

  // Customer email template
  const [customerEmailSubject, setCustomerEmailSubject] = useState(
    "✅ RFQ Received: Thank you {fullName} — SBS Groups"
  );
  const [customerEmailBody, setCustomerEmailBody] = useState(
    `Dear {fullName},\n\nThank you for your quotation request.\n\nWe have received your RFQ for {itemCount} item(s). Reference: {rfqId}\n\nOur team will respond within 24 hours.\n\nRegards,\nSBS Groups Team`
  );

  // New field form state
  const [newFieldForm, setNewFieldForm] = useState({
    label: "",
    placeholder: "",
    key: "",
    type: "text",
    show: true,
    required: false,
  });

  // ============================================
  // LOAD SETTINGS FROM API
  // ============================================
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await rfqApi.getSettings();
        const data = response?.data || response;
        
        if (data && typeof data === 'object' && !Array.isArray(data)) {
          setRfqSettings((prev) => ({
            ...prev,
            enabled: data.enabled ?? prev.enabled,
            buttonText: data.buttonText || prev.buttonText,
            buttonColor: data.buttonColor || prev.buttonColor,
            submitText: data.submitText || prev.submitText,
            autoReply: {
              enabled: data.autoReplyEnabled ?? prev.autoReply.enabled,
            },
            fields: data.customFields || prev.fields,
          }));

          if (data.customerEmailSubject) setCustomerEmailSubject(data.customerEmailSubject);
          if (data.customerEmailBody) setCustomerEmailBody(data.customerEmailBody);
          if (data.teamEmailSubject) setTeamEmailSubject(data.teamEmailSubject);
          if (data.teamEmailBody) setTeamEmailBody(data.teamEmailBody);

          if (data.forwardToEmails && Array.isArray(data.forwardToEmails)) {
            setForwardEmails(
              data.forwardToEmails.map((item, i) => ({
                id: i + 1,
                email: typeof item === 'string' ? item : item.email,
                department: typeof item === 'string' ? 'Team Member' : (item.department || 'Team Member'),
                active: typeof item === 'string' ? true : (item.active !== false),
              }))
            );
          }
        }
      } catch (error) {
        console.error("Failed to load RFQ settings:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadSettings();
  }, []);

  // ============================================
  // HELPER FUNCTIONS
  // ============================================
  const updateRfq = (key, value) => {
    setRfqSettings((prev) => ({ ...prev, [key]: value }));
  };

  const updateAutoReply = (key, value) => {
    setRfqSettings((prev) => ({
      ...prev,
      autoReply: { ...prev.autoReply, [key]: value },
    }));
  };

  const updateField = (index, key, value) => {
    setRfqSettings((prev) => {
      const fields = [...prev.fields];
      fields[index] = { ...fields[index], [key]: value };
      return { ...prev, fields };
    });
  };

  const handleLabelChange = (label) => {
    setNewFieldForm((prev) => ({
      ...prev,
      label,
      key: label.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, ""),
    }));
  };

  const addField = () => {
    if (!newFieldForm.label.trim()) {
      alert("Please enter a field label so users know what to fill");
      return;
    }
    if (!newFieldForm.key.trim()) {
      alert("Please enter a field key for data storage");
      return;
    }

    setRfqSettings((prev) => ({
      ...prev,
      fields: [
        ...prev.fields,
        {
          key: newFieldForm.key.trim().toLowerCase().replace(/\s+/g, "_"),
          label: newFieldForm.label.trim(),
          placeholder: newFieldForm.placeholder.trim(),
          type: newFieldForm.type,
          show: newFieldForm.show,
          required: newFieldForm.required,
        },
      ],
    }));

    setNewFieldForm({
      label: "",
      placeholder: "",
      key: "",
      type: "text",
      show: true,
      required: false,
    });
  };

  const removeField = (index) => {
    setRfqSettings((prev) => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== index),
    }));
  };

  // Forward emails
  const addForwardEmail = () => {
    if (!newForwardEmail.trim() || !newForwardEmail.includes("@")) return;
    setForwardEmails((prev) => [
      ...prev,
      { id: Date.now(), email: newForwardEmail.trim(), department: newForwardDept.trim() || "Team Member", active: true },
    ]);
    setNewForwardEmail("");
    setNewForwardDept("");
  };

  const removeForwardEmail = (id) => {
    setForwardEmails((prev) => prev.filter((e) => e.id !== id));
  };

  const toggleForwardEmail = (id) => {
    setForwardEmails((prev) => prev.map((e) => e.id === id ? { ...e, active: !e.active } : e));
  };

  // ============================================
  // SAVE SETTINGS TO API
  // ============================================
  const handleSave = async () => {
    try {
      const data = {
        enabled: rfqSettings.enabled,
        buttonText: rfqSettings.buttonText,
        buttonColor: rfqSettings.buttonColor,
        submitText: rfqSettings.submitText,
        autoReplyEnabled: rfqSettings.autoReply?.enabled ?? true,
        customerEmailSubject,
        customerEmailBody,
        teamNotifyEnabled: true,
        teamEmailSubject,
        teamEmailBody,
        forwardToEmails: forwardEmails
          .filter((e) => e.active)
          .map((e) => ({
            email: e.email,
            department: e.department,
            active: e.active,
          })),
        customFields: rfqSettings.fields,
      };
      
      await rfqApi.updateSettings(data);
      alert("✅ RFQ settings saved successfully!");
    } catch (error) {
      console.error("Failed to save RFQ settings:", error);
      alert("❌ Failed to save RFQ settings: " + error.message);
    }
  };

  // ============================================
  // PREVIEW HELPERS
  // ============================================
  const getPreviewContent = () => {
    if (previewType === "customer") {
      return {
        subject: customerEmailSubject.replace("{fullName}", "John Doe").replace("{companyName}", "ABC Corp").replace("{itemCount}", "3").replace("{rfqId}", "RFQ-001"),
        body: customerEmailBody.replace("{fullName}", "John Doe").replace("{itemCount}", "3").replace("{rfqId}", "RFQ-001"),
      };
    }
    return {
      subject: teamEmailSubject.replace("{clientName}", "John Doe").replace("{companyName}", "ABC Corp").replace("{itemCount}", "3").replace("{rfqId}", "RFQ-001"),
      body: teamEmailBody
        .replace("{fullName}", "John Doe").replace("{companyName}", "ABC Corp").replace("{email}", "john@abc.com")
        .replace("{mobile}", "+91 9876543210").replace("{remarks}", "Urgent delivery")
        .replace("{productTable}", "1. Drill Set | Model: E-11689 | Hand Tools > Drill Bits | Makita | Qty: 5\n2. Grinder | Model: GA-950 | Power Tools > Grinders | Makita | Qty: 2")
        .replace("{itemCount}", "2").replace("{date}", new Date().toLocaleDateString()).replace("{rfqId}", "RFQ-001"),
    };
  };

  // ============================================
  // LOADING STATE
  // ============================================
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  // ============================================
  // API KEYS VIEW
  // ============================================
  if (showApiKeys) {
    return (
      <div>
        <button onClick={() => setShowApiKeys(false)} className="flex items-center gap-2 text-sm text-blue-600 hover:underline mb-4">
          ← Back to RFQ Settings
        </button>
        <RfqApiKeys />
      </div>
    );
  }

  const { autoReply, fields } = rfqSettings;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">RFQ Email Settings</h2>
          <p className="mt-1 text-sm text-slate-500">Configure customer auto-reply, team notifications, and form fields.</p>
        </div>
        <button onClick={handleSave}
          className="flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700 shadow-lg">
          <Save size={18} /> Save All Settings
        </button>
      </div>

      {/* ============================================ */}
      {/* SECTION 1: RFQ FORM FIELDS */}
      {/* ============================================ */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">📝 RFQ Form Fields</h3>
        <p className="text-xs text-slate-500 mb-4">Customize fields on the public RFQ form. Each field needs a Label, Placeholder, and Key.</p>

        {/* Existing Fields */}
        <div className="space-y-2 max-h-[350px] overflow-y-auto mb-6">
          {(fields || []).map((field, i) => (
            <div key={i} className="rounded-xl border p-4 hover:bg-slate-50 transition-all">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-2">
                  {/* Label */}
                  <input
                    type="text"
                    value={field.label || ""}
                    onChange={(e) => updateField(i, "label", e.target.value)}
                    placeholder="Field Label (shown to user)"
                    className="w-full text-sm font-semibold bg-transparent border-b border-dashed border-slate-200 focus:border-blue-400 outline-none px-1 py-0.5"
                  />
                  {/* Placeholder */}
                  <input
                    type="text"
                    value={field.placeholder || ""}
                    onChange={(e) => updateField(i, "placeholder", e.target.value)}
                    placeholder="Placeholder text (hint inside input)"
                    className="w-full text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-1.5 border border-slate-100 focus:border-blue-400 outline-none"
                  />
                  {/* Meta */}
                  <div className="flex items-center gap-3 text-[10px] text-slate-400">
                    <span className="font-mono">Key: {field.key}</span>
                    <span>Type: {field.type}</span>
                    <span className={field.required ? "text-red-500 font-bold" : ""}>
                      {field.required ? "Required" : "Optional"}
                    </span>
                  </div>
                </div>
                {/* Actions */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <select
                    value={field.type || "text"}
                    onChange={(e) => updateField(i, "type", e.target.value)}
                    className="text-[10px] border rounded px-1.5 py-1 bg-white"
                  >
                    <option value="text">Text</option>
                    <option value="email">Email</option>
                    <option value="tel">Phone</option>
                    <option value="textarea">Textarea</option>
                  </select>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1 text-[10px] cursor-pointer">
                      <input type="checkbox" checked={field.show !== false} onChange={(e) => updateField(i, "show", e.target.checked)} className="h-3 w-3" /> Show
                    </label>
                    <label className="flex items-center gap-1 text-[10px] cursor-pointer">
                      <input type="checkbox" checked={field.required === true} onChange={(e) => updateField(i, "required", e.target.checked)} className="h-3 w-3" /> Req
                    </label>
                  </div>
                  <button onClick={() => removeField(i)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Live Preview */}
              <div className="mt-3 pt-3 border-t border-slate-100">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Preview:</p>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">
                  {field.label || "Field Label"}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {field.type === "textarea" ? (
                  <textarea disabled placeholder={field.placeholder || "Placeholder..."}
                    className="w-full text-xs rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 resize-none opacity-60" rows={2} />
                ) : (
                  <input type={field.type === "tel" ? "text" : field.type} disabled
                    placeholder={field.placeholder || "Placeholder..."}
                    className="w-full text-xs rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 opacity-60" />
                )}
              </div>
            </div>
          ))}
          {(!fields || fields.length === 0) && (
            <div className="text-center py-8 text-slate-400">
              <p className="text-sm font-semibold">No custom fields added yet</p>
              <p className="text-xs mt-1">Use the form below to add fields to your RFQ form</p>
            </div>
          )}
        </div>

        {/* Add New Field Form */}
        <div className="rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/30 p-5">
          <h4 className="text-sm font-bold text-blue-900 mb-4 flex items-center gap-2">
            <Plus size={16} /> Add New Field
          </h4>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                Field Label <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newFieldForm.label}
                onChange={(e) => handleLabelChange(e.target.value)}
                placeholder="e.g. Company Address, GST Number"
                className="w-full rounded-xl border px-4 py-3 text-sm focus:border-blue-500 focus:outline-none"
              />
              <p className="text-[10px] text-slate-400 mt-1">This is what the user will see above the input</p>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                Field Key <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newFieldForm.key}
                onChange={(e) => setNewFieldForm((p) => ({ ...p, key: e.target.value }))}
                placeholder="Auto-generated from label"
                className="w-full rounded-xl border px-4 py-3 text-sm font-mono bg-slate-50 focus:border-blue-500 focus:outline-none"
              />
              <p className="text-[10px] text-slate-400 mt-1">Used for data storage. Use underscores, no spaces.</p>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">Placeholder Text</label>
              <input
                type="text"
                value={newFieldForm.placeholder}
                onChange={(e) => setNewFieldForm((p) => ({ ...p, placeholder: e.target.value }))}
                placeholder="e.g. Enter your address here..."
                className="w-full rounded-xl border px-4 py-3 text-sm focus:border-blue-500 focus:outline-none"
              />
              <p className="text-[10px] text-slate-400 mt-1">Hint text shown inside the empty input box</p>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">Input Type</label>
              <select
                value={newFieldForm.type}
                onChange={(e) => setNewFieldForm((p) => ({ ...p, type: e.target.value }))}
                className="w-full rounded-xl border px-4 py-3 text-sm focus:border-blue-500 focus:outline-none bg-white"
              >
                <option value="text">Text Input (Single line)</option>
                <option value="email">Email Input</option>
                <option value="tel">Phone Number Input</option>
                <option value="textarea">Text Area (Multi-line)</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-6 mt-4 pt-4 border-t border-blue-100">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={newFieldForm.show} onChange={(e) => setNewFieldForm((p) => ({ ...p, show: e.target.checked }))} className="h-4 w-4 rounded accent-blue-600" />
              Visible on Form
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={newFieldForm.required} onChange={(e) => setNewFieldForm((p) => ({ ...p, required: e.target.checked }))} className="h-4 w-4 rounded accent-red-600" />
              Required Field
            </label>
          </div>
          <button
            onClick={addField}
            className="mt-4 flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-all w-full justify-center"
          >
            <Plus size={16} /> Add This Field to Form
          </button>
        </div>
      </div>

      {/* ============================================ */}
      {/* SECTION 2: EMAIL NOTIFICATIONS */}
      {/* ============================================ */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">✉️ Email Notifications</h3>
        <p className="text-xs text-slate-500 mb-6">Configure auto-reply to customers and team notifications.</p>

        <div className="flex gap-2 mb-6 bg-slate-100 rounded-xl p-1.5">
          <button onClick={() => setActiveSection("customer")}
            className={`flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${activeSection === "customer" ? "bg-white text-blue-700 shadow-sm" : "text-slate-600"}`}>
            <User size={16} /> Customer Auto-Reply
          </button>
          <button onClick={() => setActiveSection("team")}
            className={`flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${activeSection === "team" ? "bg-white text-blue-700 shadow-sm" : "text-slate-600"}`}>
            <Users size={16} /> Team Notification
          </button>
        </div>

        {/* CUSTOMER AUTO-REPLY */}
        {activeSection === "customer" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div>
                <p className="text-sm font-bold text-blue-900">Enable Customer Auto-Reply</p>
                <p className="text-xs text-blue-600 mt-0.5">Send automatic confirmation to the person who submitted RFQ</p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input type="checkbox" checked={autoReply?.enabled !== false} onChange={(e) => updateAutoReply("enabled", e.target.checked)} className="peer sr-only" />
                <div className="h-6 w-11 rounded-full bg-green-500 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all" />
              </label>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">📧 Email Subject</label>
              <input type="text" value={customerEmailSubject} onChange={(e) => setCustomerEmailSubject(e.target.value)} className="w-full rounded-xl border px-4 py-3 text-sm" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">📄 Email Body</label>
              <textarea rows={8} value={customerEmailBody} onChange={(e) => setCustomerEmailBody(e.target.value)} className="w-full rounded-xl border px-4 py-3 text-sm resize-none font-mono" />
            </div>
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-3">
              <p className="text-xs font-bold text-amber-800 mb-1">Available Placeholders:</p>
              <code className="text-[10px]">{`{fullName} {companyName} {email} {mobile} {itemCount} {productList} {date} {rfqId} {remarks}`}</code>
            </div>
          </div>
        )}

        {/* TEAM NOTIFICATION */}
        {activeSection === "team" && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2"><Building2 size={16} /> Team Recipients</label>
                <span className="text-xs text-slate-400">{forwardEmails.filter((e) => e.active).length} active</span>
              </div>
              <div className="space-y-2 max-h-[200px] overflow-y-auto mb-4">
                {forwardEmails.map((item) => (
                  <div key={item.id} className={`flex items-center justify-between rounded-xl border p-3 ${item.active ? "bg-white" : "bg-slate-50 opacity-60"}`}>
                    <div className="flex items-center gap-3 min-w-0">
                      <button onClick={() => toggleForwardEmail(item.id)} className={item.active ? "text-green-500" : "text-slate-400"}>
                        <div className={`h-2.5 w-2.5 rounded-full ${item.active ? "bg-green-500" : "bg-slate-300"}`} />
                      </button>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">{item.email}</p>
                        <p className="text-[10px] text-slate-400">{item.department}</p>
                      </div>
                    </div>
                    <button onClick={() => removeForwardEmail(item.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input type="email" value={newForwardEmail} onChange={(e) => setNewForwardEmail(e.target.value)} placeholder="email@company.com" className="flex-1 rounded-xl border px-4 py-3 text-sm" />
                <input type="text" value={newForwardDept} onChange={(e) => setNewForwardDept(e.target.value)} placeholder="Department" className="w-40 rounded-xl border px-4 py-3 text-sm" />
                <button onClick={addForwardEmail} className="flex items-center gap-1 rounded-xl bg-blue-600 px-4 py-3 text-sm text-white hover:bg-blue-700 shrink-0"><Plus size={14} /> Add</button>
              </div>
            </div>
            <div className="border-t pt-5 space-y-4">
              <h4 className="text-sm font-bold text-slate-700">📧 Team Email Template</h4>
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-600">Subject</label>
                <input type="text" value={teamEmailSubject} onChange={(e) => setTeamEmailSubject(e.target.value)} className="w-full rounded-xl border px-4 py-3 text-sm" />
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-600">Body</label>
                <textarea rows={10} value={teamEmailBody} onChange={(e) => setTeamEmailBody(e.target.value)} className="w-full rounded-xl border px-4 py-3 text-sm resize-none font-mono" />
              </div>
              <div className="rounded-xl bg-green-50 border border-green-200 p-3">
                <p className="text-xs font-bold text-green-800 mb-1">Available Placeholders:</p>
                <code className="text-[10px]">{`{fullName} {clientName} {companyName} {email} {mobile} {remarks} {productTable} {productList} {itemCount} {date} {rfqId}`}</code>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Preview Buttons */}
      <div className="flex gap-3">
        <button onClick={() => { setPreviewType("customer"); setShowPreview(true); }}
          className="flex items-center gap-2 rounded-xl border-2 border-blue-200 px-5 py-3 text-sm font-medium text-blue-700 hover:bg-blue-50">
          <Eye size={16} /> Preview Customer Email
        </button>
        <button onClick={() => { setPreviewType("team"); setShowPreview(true); }}
          className="flex items-center gap-2 rounded-xl border-2 border-green-200 px-5 py-3 text-sm font-medium text-green-700 hover:bg-green-50">
          <Eye size={16} /> Preview Team Email
        </button>
      </div>

      {/* API Keys */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2"><Key size={18} /> API Keys</h3>
            <p className="text-xs text-slate-500 mt-1">Manage API keys for external integration.</p>
          </div>
          <button onClick={() => setShowApiKeys(true)}
            className="flex items-center gap-2 rounded-xl border-2 border-dashed border-slate-300 px-5 py-3 text-sm font-medium text-slate-600 hover:border-blue-400 hover:text-blue-600">
            <Key size={16} /> Manage API Keys
          </button>
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <button onClick={handleSave}
          className="flex items-center gap-2 rounded-xl bg-green-600 px-8 py-3.5 font-bold text-white hover:bg-green-700 shadow-lg">
          <Save size={18} /> Save All RFQ Settings
        </button>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl overflow-hidden">
            <div className={`px-6 py-4 flex items-center justify-between ${previewType === "customer" ? "bg-blue-600" : "bg-green-600"} text-white`}>
              <h3 className="font-bold">{previewType === "customer" ? "Customer Email Preview" : "Team Email Preview"}</h3>
              <button onClick={() => setShowPreview(false)} className="text-white/70 hover:text-white"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              {(() => {
                const p = getPreviewContent();
                return (
                  <>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Subject</p>
                      <div className="rounded-xl border bg-slate-50 p-3"><p className="text-sm font-semibold">{p.subject}</p></div>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Body</p>
                      <div className="rounded-xl border bg-slate-50 p-4"><pre className="text-sm whitespace-pre-wrap font-sans">{p.body}</pre></div>
                    </div>
                  </>
                );
              })()}
            </div>
            <div className="border-t px-6 py-4 flex justify-end">
              <button onClick={() => setShowPreview(false)} className="rounded-xl bg-slate-800 px-6 py-2.5 text-sm font-medium text-white">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}