import { useState } from 'react';
import { updateInnovation } from '@/lib/industry-innovation/api';

export default function InnovationEditImageModal({ currentImage, innovationId, onClose, onSaved }) {
  const [imageUrl, setImageUrl] = useState(currentImage || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!imageUrl.trim()) return;
    setSaving(true);
    try {
      await updateInnovation(innovationId, { image: imageUrl.trim() });
      onSaved(imageUrl.trim());
    } catch (err) {
      alert('Error updating image: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-transparent bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Edit Section Image</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Image URL</label>
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="https://example.com/image.jpg"
          />
        </div>
        {imageUrl && (
          <div className="mb-4 border rounded overflow-hidden">
            <img src={imageUrl} alt="Preview" className="w-full h-32 object-cover" />
          </div>
        )}
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 border rounded">Cancel</button>
          <button
            onClick={handleSave}
            disabled={saving || !imageUrl.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}