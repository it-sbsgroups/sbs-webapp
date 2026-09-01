import { useState } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';   // 👈 updated CSS import
import { updateInnovation } from '@/lib/industry-innovation/api';

// Dynamic import – now from the new package
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

export default function InnovationEditDescriptionModal({ currentDescription, innovationId, onClose, onSaved }) {
  const [value, setValue] = useState(currentDescription);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateInnovation(innovationId, { description: value });
      onSaved(value);
    } catch (err) {
      alert('Error updating description: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-transparent bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Edit Description/title/image</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <input type="image" src={image} alt="Innovation" />
        <ReactQuill theme="snow" value={value} onChange={setValue} />
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 border rounded">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50" >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}