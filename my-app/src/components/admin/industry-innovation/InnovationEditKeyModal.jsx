"use client";

import { useState } from 'react';
import { updateKey, deleteKey } from '@/lib/industry-innovation/api';

export default function InnovationEditKeyModal({ keyData, onClose, onKeyChanged }) {
  const [title, setTitle] = useState(keyData.title);
  const [saving, setSaving] = useState(false);

  const handleUpdate = async () => {
    setSaving(true);
    try {
      await updateKey(keyData.id, { title });
      onKeyChanged();
    } catch (err) {
      alert('Error updating key: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this key point?')) return;
    setSaving(true);
    try {
      await deleteKey(keyData.id);
      onKeyChanged();
    } catch (err) {
      alert('Error deleting key: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-transparent bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Edit Key Point</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div className="flex justify-between">
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Delete
          </button>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 border rounded">Cancel</button>
            <button
              onClick={handleUpdate}
              disabled={saving || !title.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}