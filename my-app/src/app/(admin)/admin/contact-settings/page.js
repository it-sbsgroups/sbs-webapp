"use client";

import { useState } from "react";

export default function AdminContactSettingsPage() {
  // Database Form Engine Dynamic Field configurations State Synchronization mock
  const [fields, setFields] = useState([
    { id: "1", fieldName: "fullName", label: "Full Enterprise Name", fieldType: "TEXT", gridWidth: "FULL", isRequired: true, sortOrder: 1, prefixIcon: "🏢" },
    { id: "2", fieldName: "email", label: "Official Communication Email", fieldType: "EMAIL", gridWidth: "HALF", isRequired: true, sortOrder: 2, prefixIcon: "📧" }
  ]);

  const [systemSettings, setSystemSettings] = useState({
    pageMaxWidth: "max-w-6xl",
    companyMailId: "procurement.desk@sbsgroups.com",
    notifyCompany: true,
    notifyUser: true,
    alertSuccessMessage: "Dhanyawad Bhai! Enquiry log saved securely.",
    mapEmbedUrl: "https://google.com/maps..."
  });

  const [newField, setNewField] = useState({
    fieldName: "", label: "", fieldType: "TEXT", gridWidth: "FULL", isRequired: true, sortOrder: fields.length + 1, prefixIcon: "", postfixText: ""
  });

  const handleAddNewField = (e) => {
    e.preventDefault();
    if (!newField.fieldName || !newField.label) return;
    setFields([...fields, { ...newField, id: Date.now().toString() }]);
    setNewField({ fieldName: "", label: "", fieldType: "TEXT", gridWidth: "FULL", isRequired: true, sortOrder: fields.length + 2, prefixIcon: "", postfixText: "" });
    alert("New custom dynamic input matrix initialized successfully!");
  };

  const handleRemoveField = (id) => {
    setFields(fields.filter(f => f.id !== id));
  };

  return (
    <div className="bg-slate-900 min-h-screen text-slate-100 p-4 md:p-10 font-sans antialiased">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* TOP COMMAND PANEL STRIP */}
        <div className="border-b border-slate-800 pb-5">
          <span className="text-[10px] font-mono bg-blue-950 text-blue-400 border border-blue-900 px-2 py-0.5 rounded font-bold uppercase tracking-widest">Master Dashboard Terminal</span>
          <h1 className="text-2xl font-black tracking-tight mt-2 text-white">Dynamic Form Configurator Engine</h1>
          <p className="text-xs text-slate-400 font-medium">Re-order positions matrices, construct relational tracking nodes, or alter notification broadcast rule structures globally instantly.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* REGULATORY LOGIC SETTINGS FRAME */}
          <div className="lg:col-span-5 bg-slate-850 border border-slate-800 p-6 rounded-2xl space-y-4 bg-slate-800/40">
            <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest">Global Notification Rules Matrix</h3>
            
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center bg-slate-800/80 p-3 rounded-xl border border-slate-700/50">
                <div>
                  <p className="font-bold">Broadcast Pipeline to Company Mail</p>
                  <p className="text-[10px] text-slate-400">Routes payload data to enterprise logs immediately.</p>
                </div>
                <input type="checkbox" checked={systemSettings.notifyCompany} onChange={e => setSystemSettings({...systemSettings, notifyCompany: e.target.checked})} className="w-4 h-4 accent-emerald-500 cursor-pointer" />
              </div>

              <div className="flex justify-between items-center bg-slate-800/80 p-3 rounded-xl border border-slate-700/50">
                <div>
                  <p className="font-bold">Dispatch Auto Thank You Mail to User</p>
                  <p className="text-[10px] text-slate-400">Generates instant digital acknowledgement validation token.</p>
                </div>
                <input type="checkbox" checked={systemSettings.notifyUser} onChange={e => setSystemSettings({...systemSettings, notifyUser: e.target.checked})} className="w-4 h-4 accent-emerald-500 cursor-pointer" />
              </div>

              <div className="space-y-1 pt-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Primary Enterprise Inbound Mail Routing Endpoint</label>
                <input type="email" value={systemSettings.companyMailId} onChange={e => setSystemSettings({...systemSettings, companyMailId: e.target.value})} className="w-full bg-slate-900 border border-slate-700 px-3 py-2 text-xs rounded-lg text-slate-200 focus:outline-none" />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Frontend Page Layout Outer Containment Width</label>
                <select value={systemSettings.pageMaxWidth} onChange={e => setSystemSettings({...systemSettings, pageMaxWidth: e.target.value})} className="w-full bg-slate-900 border border-slate-700 px-3 py-2 text-xs rounded-lg text-slate-200 focus:outline-none">
                  <option value="max-w-4xl">Narrow Structural Grid (4xl - 896px)</option>
                  <option value="max-w-6xl">Standard Production Matrix (6xl - 1152px)</option>
                  <option value="max-w-7xl">Expansive Operations Viewport (7xl - 1280px)</option>
                </select>
              </div>
            </div>
          </div>

          {/* DYNAMIC FORM ENGINE SCHEMA INTERACTION SCHEME */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* LIVE SYSTEM RECONCILIATION BUILDER VIEW */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Current Active Ingestion Array Sequence</h3>
              
              <div className="space-y-2">
                {fields.map((f, index) => (
                  <div key={f.id} className="flex justify-between items-center bg-slate-900 border border-slate-800 p-3 rounded-xl hover:border-slate-700 transition-all">
                    <div className="flex items-center gap-3 text-xs">
                      <span className="bg-slate-800 text-slate-400 font-mono font-bold w-5 h-5 flex items-center justify-center rounded text-[10px]">#{index + 1}</span>
                      <div>
                        <p className="font-bold text-white">{f.label} <span className="text-[10px] text-slate-500 font-mono">({f.fieldName})</span></p>
                        <p className="text-[9px] font-bold font-mono tracking-wide text-blue-400 uppercase mt-0.5">{f.fieldType} • {f.gridWidth} WIDTH • {f.isRequired ? "REQUIRED" : "OPTIONAL"}</p>
                      </div>
                    </div>
                    <button onClick={() => handleRemoveField(f.id)} className="text-[10px] font-black text-red-400 bg-red-950/40 border border-red-900/60 px-2.5 py-1 rounded-lg hover:bg-red-900 hover:text-white transition-all">
                      Delete Node
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* FIELD APPENDING MATRIX SYSTEM */}
            <form onSubmit={handleAddNewField} className="bg-slate-800/20 border border-slate-800 p-6 rounded-2xl space-y-4">
              <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest">Inject New Input Metric Row Configuration</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase font-bold">Field Identifier Token (Prisma DB Target)</label>
                  <input type="text" placeholder="e.g. tracking_id" value={newField.fieldName} onChange={e => setNewField({...newField, fieldName: e.target.value})} className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded-lg text-slate-200 focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase font-bold">Public Label Text</label>
                  <input type="text" placeholder="e.g. Internal Audit Token" value={newField.label} onChange={e => setNewField({...newField, label: e.target.value})} className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded-lg text-slate-200 focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase font-bold">Data Component Engine Type</label>
                  <select value={newField.fieldType} onChange={e => setNewField({...newField, fieldType: e.target.value})} className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded-lg text-slate-200 focus:outline-none">
                    <option value="TEXT">Short Text (TEXT)</option>
                    <option value="EMAIL">Email Address Endpoint (EMAIL)</option>
                    <option value="NUMBER">Numeric Value Vector (NUMBER)</option>
                    <option value="TEXTAREA">Multi-line Text (TEXTAREA)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase font-bold">Grid Layout Width Span Alignment</label>
                  <select value={newField.gridWidth} onChange={e => setNewField({...newField, gridWidth: e.target.value})} className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded-lg text-slate-200 focus:outline-none">
                    <option value="HALF">50% Width Matrix Block (HALF)</option>
                    <option value="FULL">100% Full Width Strip Block (FULL)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase font-bold">Prefix Icon Emoji</label>
                  <input type="text" placeholder="e.g. 🛠️, 🏗️" value={newField.prefixIcon} onChange={e => setNewField({...newField, prefixIcon: e.target.value})} className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded-lg text-slate-200 focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase font-bold">Postfix Metric Text Units</label>
                  <input type="text" placeholder="e.g. kN/m, MM" value={newField.postfixText} onChange={e => setNewField({...newField, postfixText: e.target.value})} className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded-lg text-slate-200 focus:outline-none" />
                </div>
              </div>

              <button type="submit" className="w-full bg-emerald-600 font-black text-xs py-3 text-white rounded-xl uppercase tracking-wider hover:bg-emerald-500 shadow-lg shadow-emerald-950/20 transition-all">
                📥 Commit Node Parameters Array Sequence
              </button>
            </form>

          </div>
        </div>

      </div>
    </div>
  );
}