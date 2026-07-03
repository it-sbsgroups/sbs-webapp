"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";

function apiBase() {
  const env = process.env.NEXT_PUBLIC_API_URL;
  if (env) return env.replace(/\/$/, "");
  if (typeof window !== "undefined") {
    return `${window.location.protocol}//${window.location.hostname}:4000/api`;
  }
  return "http://localhost:4000/api";
}

function Bubble({ msg }) {
  const isUser = msg.role === "user";
  const isSystem = msg.role === "system";

  if (isSystem) {
    return (
      <div className="flex justify-center my-2">
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 text-xs text-amber-800 font-medium max-w-[90%] text-center">
          {msg.content}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} gap-2`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-blue-950 flex items-center justify-center shrink-0 mt-0.5">
          <span className="text-white text-[10px] font-black">AI</span>
        </div>
      )}
      <div className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
        isUser ? "bg-blue-950 text-white rounded-br-sm" : "bg-slate-100 text-slate-800 rounded-bl-sm"
      }`}>
        {msg.content}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start gap-2">
      <div className="w-7 h-7 rounded-full bg-blue-950 flex items-center justify-center shrink-0">
        <span className="text-white text-[10px] font-black">AI</span>
      </div>
      <div className="bg-slate-100 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <span key={i} className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </div>
  );
}

// RFQ Collection Form Component
function RfqCollectionForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    fullName: "",
    companyName: "",
    email: "",
    mobile: "",
    remarks: "",
    items: [{ productId: "", quantity: 1 }],
  });

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { productId: "", quantity: 1 }]
    }));
  };

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = field === "quantity" ? (parseInt(value) || 1) : value;
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const removeItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const isValid = formData.fullName && formData.email && formData.mobile && formData.items.length > 0 && formData.items.every(i => i.productId);

  return (
    <div className="bg-white border border-blue-200 rounded-xl p-4 my-2 shadow-sm">
      <h4 className="text-sm font-bold text-blue-950 mb-3">Request for Quote</h4>
      <div className="space-y-2">
        <input
          type="text"
          placeholder="Full Name *"
          value={formData.fullName}
          onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
          className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 outline-none"
        />
        <input
          type="text"
          placeholder="Company Name"
          value={formData.companyName}
          onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
          className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 outline-none"
        />
        <input
          type="email"
          placeholder="Email *"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 outline-none"
        />
        <input
          type="tel"
          placeholder="Mobile *"
          value={formData.mobile}
          onChange={(e) => setFormData(prev => ({ ...prev, mobile: e.target.value }))}
          className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 outline-none"
        />

        <div className="border-t border-slate-100 pt-2">
          <p className="text-xs font-semibold text-slate-600 mb-2">Products:</p>
          {formData.items.map((item, idx) => (
            <div key={idx} className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Product ID"
                value={item.productId}
                onChange={(e) => updateItem(idx, "productId", e.target.value)}
                className="flex-1 px-3 py-1.5 text-sm border border-slate-200 rounded-lg"
              />
              <input
                type="number"
                placeholder="Qty"
                value={item.quantity}
                onChange={(e) => updateItem(idx, "quantity", e.target.value)}
                className="w-20 px-3 py-1.5 text-sm border border-slate-200 rounded-lg"
              />
              {formData.items.length > 1 && (
                <button onClick={() => removeItem(idx)} className="text-red-500 hover:text-red-700 text-sm px-2">x</button>
              )}
            </div>
          ))}
          <button onClick={addItem} className="text-xs text-blue-600 hover:text-blue-800 font-medium">+ Add Product</button>
        </div>

        <textarea
          placeholder="Remarks (optional)"
          value={formData.remarks}
          onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
          className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 outline-none resize-none"
          rows={2}
        />

        <div className="flex gap-2 pt-2">
          <button
            onClick={() => onSubmit(formData)}
            disabled={!isValid}
            className="flex-1 bg-blue-950 text-white text-sm font-medium py-2 rounded-lg hover:bg-blue-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Submit RFQ
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

const PUBLIC_SUGGESTIONS = [
  "Show me bearing products",
  "I want to request a quote",
  "What brands do you carry?",
  "Any recent company news?",
];

const ADMIN_SUGGESTIONS = [
  "Show dashboard stats",
  "How many pending RFQs?",
  "List all employees",
  "Explain the project architecture",
  "Show subscriber count",
];

export default function GeminiChat() {
  const pathname = usePathname();
  // Detect admin mode purely from pathname - no useAuth needed
  const isAdmin = pathname?.startsWith("/admin");

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("sbs_ai_chat") : null;
    if (saved) {
      try { return JSON.parse(saved); } catch { /* fallthrough */ }
    }
    return [{
      role: "model",
      content: isAdmin
        ? "Welcome back, Admin! I am your AI assistant with full access to all data. Ask me about dashboard stats, RFQs, employees, or technical questions about the project."
        : "Hi! I am the SBS Groups AI assistant. I can help you find products, check our brands and news, or even submit a quote request for you. What do you need?"
    }];
  });

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showRfqForm, setShowRfqForm] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Persist chat history
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("sbs_ai_chat", JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading, showRfqForm]);
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 150); }, [open]);

  const sendMessage = useCallback(async (text) => {
    const content = (text || input).trim();
    if (!content || loading) return;
    setInput("");
    setError("");

    const userMsg = { role: "user", content };
    const history = [...messages, userMsg];
    setMessages(history);
    setLoading(true);

    try {
      const apiMessages = history
        .filter(m => m.role === "user" || m.role === "model")
        .slice(-20)
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch(`${apiBase()}/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          messages: apiMessages,
          siteContext: pathname,
          isAdmin: isAdmin
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || "The assistant could not respond right now.");
      }

      const data = await res.json();
      const reply = data?.reply ?? "I am sorry, I could not get a response right now.";

      // Check if AI wants to show RFQ form
      if (reply.includes("[SHOW_RFQ_FORM]")) {
        setShowRfqForm(true);
        const cleanReply = reply.replace("[SHOW_RFQ_FORM]", "").trim();
        setMessages((p) => [...p, { role: "model", content: cleanReply || "Please fill in your details to submit the RFQ:" }]);
      } else {
        setMessages((p) => [...p, { role: "model", content: reply }]);
      }
    } catch (e) {
      setError(e.message || "Failed to get a response. Please try again.");
      setMessages((p) => p.slice(0, -1));
    } finally {
      setLoading(false);
    }
  }, [input, messages, loading, pathname, isAdmin]);

  const handleRfqSubmit = async (formData) => {
    setShowRfqForm(false);
    setLoading(true);

    try {
      const res = await fetch(`${apiBase()}/rfq`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to submit RFQ");

      const data = await res.json();
      setMessages((p) => [...p, {
        role: "model",
        content: `RFQ submitted successfully! Reference ID: ${data.id || "N/A"}. Our team will contact you shortly at ${formData.email} or ${formData.mobile}.`
      }]);
    } catch (e) {
      setError("Failed to submit RFQ. Please try again or contact us directly.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const clearChat = () => {
    setMessages([{
      role: "model",
      content: isAdmin
        ? "Welcome back, Admin! How can I help you today?"
        : "Hi! I am the SBS Groups AI assistant. How can I help you today?"
    }]);
    setError("");
    setShowRfqForm(false);
    if (typeof window !== "undefined") {
      localStorage.removeItem("sbs_ai_chat");
    }
  };

  // Do not show on login page
  if (pathname === "/login") return null;

  return (
    <>
      <button
        onClick={() => setOpen((p) => !p)}
        aria-label={open ? "Close AI chat" : "Open AI assistant"}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 ${
          open ? "bg-slate-700 rotate-45" : isAdmin ? "bg-amber-600 hover:bg-amber-700" : "bg-blue-950 hover:bg-blue-900"
        }`}
      >
        {open ? (
          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>

      {!open && (
        <span className={`fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full opacity-30 animate-ping pointer-events-none ${isAdmin ? "bg-amber-400" : "bg-blue-400"}`} />
      )}

      <div className={`fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-24px)] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right ${
        open ? "scale-100 opacity-100 pointer-events-auto" : "scale-90 opacity-0 pointer-events-none"
      }`} style={{ maxHeight: "calc(100vh - 120px)", height: "560px" }}>

        <div className={`px-4 py-3.5 flex items-center justify-between shrink-0 ${isAdmin ? "bg-amber-700" : "bg-blue-950"}`}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-white text-xs font-black">{isAdmin ? "A" : "AI"}</span>
            </div>
            <div>
              <p className="text-xs font-black text-white">
                {isAdmin ? "SBS Admin AI" : "SBS AI Assistant"}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                <span className="text-[10px] text-blue-200 font-medium">
                  {isAdmin ? "Full Access" : "Online"}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={clearChat} className="text-white/60 hover:text-white text-[10px] font-bold transition-colors">Clear</button>
            <button onClick={() => setOpen(false)} className="text-white/60 hover:text-white transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
          {messages.map((msg, i) => <Bubble key={i} msg={msg} />)}
          {showRfqForm && (
            <RfqCollectionForm
              onSubmit={handleRfqSubmit}
              onCancel={() => setShowRfqForm(false)}
            />
          )}
          {loading && <TypingIndicator />}
          {error && <div className="text-xs text-red-600 font-semibold bg-red-50 border border-red-100 rounded-xl px-3 py-2">{error}</div>}
          <div ref={bottomRef} />
        </div>

        {messages.length === 1 && !showRfqForm && (
          <div className="px-4 pb-2 flex flex-wrap gap-1.5 shrink-0">
            {(isAdmin ? ADMIN_SUGGESTIONS : PUBLIC_SUGGESTIONS).map((s) => (
              <button key={s} onClick={() => sendMessage(s)}
                className="text-[11px] font-semibold px-2.5 py-1 rounded-full border border-blue-200 text-blue-800 bg-blue-50 hover:bg-blue-100 transition-colors">
                {s}
              </button>
            ))}
          </div>
        )}

        <div className="p-3 border-t border-slate-100 shrink-0">
          <div className="flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isAdmin ? "Ask anything about the project..." : "Ask me anything..."}
              rows={1}
              disabled={loading || showRfqForm}
              className="flex-1 bg-transparent text-sm text-slate-800 font-medium placeholder:text-slate-400 resize-none outline-none leading-relaxed disabled:opacity-50 max-h-28"
              style={{ minHeight: "24px" }}
            />
            <button onClick={() => sendMessage()} disabled={!input.trim() || loading || showRfqForm}
              className="w-8 h-8 rounded-xl bg-blue-950 text-white flex items-center justify-center hover:bg-blue-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0">
              {loading ? (
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
              )}
            </button>
          </div>
          <p className="text-[10px] text-slate-300 font-medium text-center mt-1.5">
            {isAdmin ? "Admin Mode - Full Data Access" : "Powered by Gemini AI - SBS Groups"}
          </p>
        </div>
      </div>
    </>
  );
}
