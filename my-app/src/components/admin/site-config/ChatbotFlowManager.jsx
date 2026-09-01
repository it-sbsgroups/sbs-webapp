"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Bot, Save, Plus, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import siteConfigApi from "@/lib/siteConfig/siteConfigApi";

function newId() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `n${Date.now()}${Math.floor(Math.random() * 1e6)}`;
}

function newNode(label = "New option") {
  return { id: newId(), label, answer: "", children: [] };
}

// Recursively update a node somewhere in the tree, identified by id.
function updateNode(nodes, id, updater) {
  return nodes.map((n) => {
    if (n.id === id) return updater(n);
    if (n.children?.length) return { ...n, children: updateNode(n.children, id, updater) };
    return n;
  });
}

function removeNode(nodes, id) {
  return nodes
    .filter((n) => n.id !== id)
    .map((n) => (n.children?.length ? { ...n, children: removeNode(n.children, id) } : n));
}

function NodeEditor({ node, onChange, onDelete, depth }) {
  const [expanded, setExpanded] = useState(true);

  const patch = (fields) => onChange({ ...node, ...fields });
  const addChild = () => patch({ children: [...(node.children || []), newNode()] });
  const changeChild = (childId, updater) =>
    patch({ children: updateNode(node.children || [], childId, updater) });
  const deleteChild = (childId) => patch({ children: removeNode(node.children || [], childId) });

  return (
    <div className="rounded-xl border border-slate-200 bg-white" style={{ marginLeft: depth ? 16 : 0 }}>
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-slate-100 bg-indigo-50/40">
        <button onClick={() => setExpanded((e) => !e)} className="text-slate-400 hover:text-slate-600 shrink-0">
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        <div className="flex-1 min-w-0">
          <label className="block text-[9px] font-black uppercase tracking-wider text-indigo-500 mb-0.5">
            Button Text (what visitors see and click)
          </label>
          <input
            value={node.label}
            onChange={(e) => patch({ label: e.target.value })}
            placeholder="e.g. Products, Pricing, Contact Us…"
            className="w-full text-xs font-bold text-slate-800 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>
        <button onClick={onDelete} className="text-red-400 hover:text-red-600 shrink-0 self-start mt-4" aria-label="Delete option">
          <Trash2 size={14} />
        </button>
      </div>
      {node.label?.trim() === "New option" && (
        <p className="text-[10px] text-amber-600 font-semibold px-3 pt-2">
          ⚠️ This still has the default placeholder name — visitors will see the button
          say literally &quot;New option&quot;. Edit the Button Text field above.
        </p>
      )}

      {expanded && (
        <div className="p-3 space-y-2">
          <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400">
            Reply Message (shown after they click the button above)
          </label>
          <textarea
            value={node.answer || ""}
            onChange={(e) => patch({ answer: e.target.value })}
            placeholder="Answer shown when a visitor picks this option (optional if it only leads to sub-options)"
            rows={2}
            className="w-full text-xs font-medium border border-slate-200 rounded-lg px-2.5 py-2 focus:outline-none focus:border-indigo-500"
          />

          <input
            value={node.link || ""}
            onChange={(e) => patch({ link: e.target.value })}
            placeholder="Redirect on click (optional) — e.g. /contact, /products, https://…"
            className="w-full text-xs font-medium border border-slate-200 rounded-lg px-2.5 py-2 focus:outline-none focus:border-indigo-500"
          />
          {node.link && (node.children || []).length > 0 && (
            <p className="text-[10px] text-amber-600 font-semibold">
              ⚠️ This option has both a redirect link and sub-options — clicking it will redirect immediately, so the sub-options below won&apos;t be reachable. Remove the link if you want it to show sub-options instead.
            </p>
          )}

          <div className="space-y-2">
            {(node.children || []).map((child) => (
              <NodeEditor
                key={child.id}
                node={child}
                depth={(depth || 0) + 1}
                onChange={(updated) => changeChild(child.id, () => updated)}
                onDelete={() => deleteChild(child.id)}
              />
            ))}
          </div>

          <button
            onClick={addChild}
            className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800"
          >
            <Plus size={12} /> Add sub-option
          </button>
        </div>
      )}
    </div>
  );
}

export default function ChatbotFlowManager() {
  const [flow, setFlow] = useState({ welcomeMessage: "", nodes: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await siteConfigApi.getChatbotFlow();
        if (data && typeof data === "object") {
          setFlow({ welcomeMessage: data.welcomeMessage || "", nodes: data.nodes || [] });
        }
      } catch {
        toast.error("Failed to load chatbot flow");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const addTopLevel = () => setFlow((f) => ({ ...f, nodes: [...f.nodes, newNode()] }));
  const changeTop = (id, updater) => setFlow((f) => ({ ...f, nodes: updateNode(f.nodes, id, updater) }));
  const deleteTop = (id) => setFlow((f) => ({ ...f, nodes: removeNode(f.nodes, id) }));

  const save = async () => {
    setSaving(true);
    try {
      await siteConfigApi.saveChatbotFlow(flow);
      toast.success("Chatbot flow saved");
    } catch (e) {
      toast.error(e.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><div className="h-10 w-10 animate-spin rounded-full border-b-2 border-blue-600" /></div>;
  }

  return (
    <div className="max-w-3xl space-y-5">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-sm font-black text-slate-900 flex items-center gap-2"><Bot size={16} className="text-indigo-600" /> Chatbot Q&amp;A Flow</h2>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Build the decision-tree the public chatbot uses: a visitor picks an option, which either shows an answer,
          reveals more sub-options, or both. No live AI involved — everything here is fully within your control.
        </p>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <label className="text-xs font-black text-slate-700 block mb-1.5">Welcome message</label>
        <input
          value={flow.welcomeMessage}
          onChange={(e) => setFlow((f) => ({ ...f, welcomeMessage: e.target.value }))}
          placeholder="Hi! How can I help you today?"
          className="w-full text-xs font-medium border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-indigo-500"
        />
      </div>

      <div className="space-y-3">
        {flow.nodes.map((node) => (
          <NodeEditor
            key={node.id}
            node={node}
            depth={0}
            onChange={(updated) => changeTop(node.id, () => updated)}
            onDelete={() => deleteTop(node.id)}
          />
        ))}
      </div>

      <button
        onClick={addTopLevel}
        className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 border border-dashed border-indigo-300 rounded-xl px-4 py-2.5 w-full justify-center hover:bg-indigo-50"
      >
        <Plus size={14} /> Add top-level option
      </button>

      <div className="flex justify-end">
        <button onClick={save} disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
          <Save size={14} /> {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
