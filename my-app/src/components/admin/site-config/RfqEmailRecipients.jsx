"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Mail, Plus, Trash2, Save, ToggleLeft, ToggleRight } from "lucide-react";
import rfqApi from "@/lib/rfqApi";

// Manages RfqSettings.forwardToEmails — the backend (mail.service.ts →
// sendTeamNotification) already reads this list and CCs every address on it
// whenever a new RFQ comes in. This component is the missing admin UI for
// adding/editing/removing those recipients.
export default function RfqEmailRecipients() {
  const [emails, setEmails] = useState([]);
  const [teamNotifyEnabled, setTeamNotifyEnabled] = useState(true);
  const [newEmail, setNewEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await rfqApi.getSettings();
        const data = res?.data || res || {};
        const list = Array.isArray(data.forwardToEmails) ? data.forwardToEmails : [];
        setEmails(list);
        setTeamNotifyEnabled(data.teamNotifyEnabled !== false);
      } catch {
        toast.error("Failed to load RFQ email settings");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const addEmail = () => {
    const value = newEmail.trim();
    if (!value) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      toast.error("Enter a valid email address");
      return;
    }
    if (emails.includes(value)) {
      toast.error("Already in the list");
      return;
    }
    setEmails((e) => [...e, value]);
    setNewEmail("");
  };

  const removeEmail = (email) => setEmails((e) => e.filter((x) => x !== email));

  const save = async () => {
    setSaving(true);
    try {
      await rfqApi.updateSettings({ forwardToEmails: emails, teamNotifyEnabled });
      toast.success("RFQ notification recipients saved");
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
    <div className="max-w-2xl space-y-5">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-sm font-black text-slate-900 flex items-center gap-2"><Mail size={16} className="text-blue-600" /> RFQ Notification Recipients</h2>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Every address below is emailed whenever a new RFQ (Request for Quote) is submitted on the public site.
        </p>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <button
          onClick={() => setTeamNotifyEnabled((v) => !v)}
          className="flex items-center gap-2 text-xs font-bold text-slate-700"
        >
          {teamNotifyEnabled ? <ToggleRight size={28} className="text-blue-600" /> : <ToggleLeft size={28} className="text-slate-300" />}
          Team notifications {teamNotifyEnabled ? "enabled" : "disabled"}
        </button>

        <div className="flex gap-2">
          <input
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addEmail())}
            placeholder="procurement@sbsgroups.com"
            className="flex-1 text-sm px-3 py-2.5 rounded-xl border bg-slate-50 focus:outline-none focus:border-blue-500"
          />
          <button onClick={addEmail} className="flex items-center gap-1 rounded-xl bg-blue-950 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-900">
            <Plus size={14} /> Add
          </button>
        </div>

        {emails.length === 0 && <p className="text-xs text-slate-400 italic">No recipients yet — add at least one email above.</p>}

        <div className="space-y-2">
          {emails.map((email) => (
            <div key={email} className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-2.5">
              <span className="text-sm font-semibold text-slate-700">{email}</span>
              <button onClick={() => removeEmail(email)} className="text-slate-300 hover:text-red-600">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={save} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
          <Save size={14} /> {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
