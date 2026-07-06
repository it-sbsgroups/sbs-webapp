'use client';

import { useState, useEffect } from 'react';
import {
  getCurrentInnovation,
  saveInnovation,
} from '@/lib/industry-innovation/api';
import InnovationEditTitleModal from '@/components/admin/industry-innovation/InnovationEditTitleModal';
import InnovationEditDescriptionModal from '@/components/admin/industry-innovation/InnovationEditDescriptionModal';
import InnovationEditImageModal from '@/components/admin/industry-innovation/InnovationEditImageModal';
import InnovationEditKeyModal from '@/components/admin/industry-innovation/InnovationEditKeyModal';
import InnovationAddKeyModal from '@/components/admin/industry-innovation/InnovationAddKeyModal';

export default function AdminInnovationPage() {
  const [innovation, setInnovation] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal visibility
  const [showTitleModal, setShowTitleModal] = useState(false);
  const [showDescModal, setShowDescModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const [showAddKey, setShowAddKey] = useState(false);

  const fetchInnovation = async () => {
    setLoading(true);
    try {
      const data = await getCurrentInnovation();
      setInnovation(data);
    } catch (err) {
      console.error('Failed to load innovation:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInnovation();
  }, []);

  const handleCreateInnovation = async () => {
    // Non‑empty description required
    const created = await saveInnovation({
      title: 'Leading the Industry with Innovation',
      description: '<p>Click here to edit the description.</p>',
      image: '/default-image.jpg',
    });
    setInnovation(created);
  };

  const refresh = () => fetchInnovation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!innovation) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-lg text-gray-600">No innovation section found.</p>
        <button
          onClick={handleCreateInnovation}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Create Innovation Section
        </button>
      </div>
    );
  }

  const keys = innovation.keys || [];
  const canAddKey = keys.length < 6;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-20">
        {/* Title – clickable */}
        <h1
          onClick={() => setShowTitleModal(true)}
          className="text-4xl font-bold text-center cursor-pointer hover:text-blue-600 transition"
        >
          {innovation.title}
        </h1>

        {/* Image – clickable banner */}
        <div
          onClick={() => setShowImageModal(true)}
          className="mt-8 mb-8 cursor-pointer relative group"
        >
          <img
            src={innovation.image || '/default-image.jpg'}
            alt="Section background"
            className="w-full max-h-96 object-cover rounded-lg"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition rounded-lg flex items-center justify-center">
            <span className="text-white opacity-0 group-hover:opacity-100 transition">
              Click to change image
            </span>
          </div>
        </div>

        {/* Description – clickable */}
        <div
          onClick={() => setShowDescModal(true)}
          className="mt-8 prose max-w-none cursor-pointer hover:bg-gray-50 rounded p-4 transition"
          dangerouslySetInnerHTML={{ __html: innovation.description }}
        />

        {/* Keys grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {keys.map((key) => (
            <div
              key={key.id}
              onClick={() => setEditingKey(key)}
              className="p-6 border rounded-lg shadow-sm hover:shadow-md cursor-pointer transition"
            >
              {key.icon && (
                <i className={`${key.icon} text-3xl text-blue-600 block mb-4`} />
              )}
              <h3 className="text-xl font-semibold">{key.title}</h3>
            </div>
          ))}

          {canAddKey && (
            <div
              onClick={() => setShowAddKey(true)}
              className="p-6 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-50 transition"
            >
              <span className="text-gray-500">+ Add key point (max 6)</span>
            </div>
          )}
        </div>
      </div>

      {/* ───── Modals ───── */}
      {showTitleModal && (
        <InnovationEditTitleModal
          currentTitle={innovation.title}
          innovationId={innovation.id}
          onClose={() => setShowTitleModal(false)}
          onSaved={(newTitle) => {
            setInnovation({ ...innovation, title: newTitle });
            setShowTitleModal(false);
          }}
        />
      )}

      {showImageModal && (
        <InnovationEditImageModal
          currentImage={innovation.image}
          innovationId={innovation.id}
          onClose={() => setShowImageModal(false)}
          onSaved={(newImage) => {
            setInnovation({ ...innovation, image: newImage });
            setShowImageModal(false);
          }}
        />
      )}

      {showDescModal && (
        <InnovationEditDescriptionModal
          currentDescription={innovation.description}
          innovationId={innovation.id}
          onClose={() => setShowDescModal(false)}
          onSaved={(newDesc) => {
            setInnovation({ ...innovation, description: newDesc });
            setShowDescModal(false);
          }}
        />
      )}

      {editingKey && (
        <InnovationEditKeyModal
          keyData={editingKey}
          onClose={() => setEditingKey(null)}
          onKeyChanged={refresh}
        />
      )}

      {showAddKey && (
        <InnovationAddKeyModal
          innovationId={innovation.id}
          onClose={() => setShowAddKey(false)}
          onKeyAdded={refresh}
        />
      )}
    </div>
  );
}