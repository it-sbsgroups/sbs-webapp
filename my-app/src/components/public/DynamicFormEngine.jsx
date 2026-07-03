"use client";

import { useState } from "react";

export default function DynamicFormEngine({ fieldsConfig, alertSuccessMessage }) {
  const [formData, setFormData] = useState({});

  const handleChange = (fieldName, value) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Simulate API Response processing user metadata logic trigger
    console.log("Transmitting Form Array payload data to API Node...", formData);
    
    // Custom database injected messaging popups
    alert(alertSuccessMessage);
    
    // Reset Form System values
    setFormData({});
  };

  // Sort settings index sequentially
  const sortedFields = [...fieldsConfig].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 md:p-10 rounded-[2rem] border border-slate-200/60 shadow-xl shadow-slate-100/50 space-y-6">
      <div>
        <h2 className="text-base font-black uppercase text-slate-900 tracking-tight flex items-center gap-2">
          <span>⚡</span> Transmit Sourcing RFQ / Query
        </h2>
        <p className="text-xs text-slate-400 font-medium mt-0.5">Every filed ticket logs immediately into the central admin CRM grid pipeline.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sortedFields.map((field) => {
          const isFullWidth = field.gridWidth === "FULL";
          return (
            <div key={field.id} className={`${isFullWidth ? "sm:col-span-2" : "sm:col-span-1"} space-y-1.5`}>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                {field.label} {field.isRequired && <span className="text-red-500">*</span>}
              </label>
              
              <div className="relative flex items-center rounded-xl transition-all border border-slate-200 bg-slate-50/50 focus-within:border-slate-900 focus-within:bg-white overflow-hidden">
                {field.prefixIcon && (
                  <span className="pl-3.5 pr-1 text-sm text-slate-400 select-none">{field.prefixIcon}</span>
                )}
                
                {field.fieldType === "TEXTAREA" ? (
                  <textarea
                    rows={4}
                    required={field.isRequired}
                    placeholder={field.placeholder}
                    value={formData[field.fieldName] || ""}
                    onChange={(e) => handleChange(field.fieldName, e.target.value)}
                    className="w-full text-xs p-3 bg-transparent focus:outline-none text-slate-800 font-medium"
                  />
                ) : field.fieldType === "SELECT" ? (
                  <select
                    required={field.isRequired}
                    value={formData[field.fieldName] || ""}
                    onChange={(e) => handleChange(field.fieldName, e.target.value)}
                    className="w-full text-xs px-3 py-3 bg-transparent focus:outline-none text-slate-800 font-bold tracking-wide appearance-none cursor-pointer"
                  >
                    <option value="">-- Choose Priority Department Options --</option>
                    {field.options?.map((opt, oIdx) => (
                      <option key={oIdx} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.fieldType.toLowerCase()}
                    required={field.isRequired}
                    placeholder={field.placeholder}
                    value={formData[field.fieldName] || ""}
                    onChange={(e) => handleChange(field.fieldName, e.target.value)}
                    className="w-full text-xs px-3.5 py-3 bg-transparent focus:outline-none text-slate-800 font-semibold"
                  />
                )}

                {field.postfixText && (
                  <span className="pr-3.5 pl-1 text-[10px] font-mono font-bold text-slate-400 select-none">{field.postfixText}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <button type="submit" className="w-full bg-slate-900 text-white font-black text-xs py-4 rounded-xl uppercase tracking-widest hover:bg-slate-800 shadow-lg shadow-slate-900/10 transition-all hover:-translate-y-0.5 active:translate-y-0">
        Dispatch Token Matrix to Central CRM Engine ➔
      </button>
    </form>
  );
}