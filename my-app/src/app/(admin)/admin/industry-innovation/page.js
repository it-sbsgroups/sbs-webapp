"use client";

import { useState, useEffect, useCallback } from 'react';
import {
  getCurrentInnovation,
  saveInnovation,
  updateInnovation,
  addKey,
  updateKey,
  deleteKey,
} from '@/lib/industry-innovation/api';

export default function IndustryInnovationAdmin() {
  const [innovation, setInnovation] = useState(null);
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Form fields (main section)
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');

  // Key editing state
  const [editingKeyId, setEditingKeyId] = useState(null);
  const [keyForm, setKeyForm] = useState({ title: '', icon: '', sortOrder: 0 });

  // Add key inline form state
  const [showAddKey, setShowAddKey] = useState(false);
  const [newKey, setNewKey] = useState({ title: '', icon: '', sortOrder: 0 });

  // Fetch current innovation
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setMessage({ text: '', type: '' });
      const data = await getCurrentInnovation();
      setInnovation(data);
      setTitle(data.title || '');
      setDescription(data.description || '');
      setImage(data.image || '');
      setKeys(data.keys || []);
    } catch (err) {
      if (err.message.includes('not found') || err.message.includes('404')) {
        setInnovation(null);
        setTitle('');
        setDescription('');
        setImage('');
        setKeys([]);
      } else {
        setMessage({ text: err.message || 'Failed to load data.', type: 'error' });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Save innovation (create/update)
  const handleSaveInnovation = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });
    try {
      let result;
      if (innovation) {
        result = await updateInnovation(innovation.id, { title, description, image });
      } else {
        result = await saveInnovation({ title, description, image });
      }
      setInnovation(result);
      setMessage({ text: 'Innovation saved successfully.', type: 'success' });
    } catch (err) {
      setMessage({ text: err.message || 'Save failed.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // Add key via inline form
  const handleAddKeySubmit = async (e) => {
    e.preventDefault();
    if (!newKey.title.trim()) {
      setMessage({ text: 'Title is required.', type: 'error' });
      return;
    }
    if (keys.length >= 4) {
      setMessage({ text: 'Maximum 4 key points allowed.', type: 'error' });
      return;
    }
    try {
      await addKey(innovation.id, {
        title: newKey.title,
        icon: newKey.icon || undefined,
        sortOrder: parseInt(newKey.sortOrder) || 0,
      });
      setShowAddKey(false);
      setNewKey({ title: '', icon: '', sortOrder: 0 });
      await fetchData();
      setMessage({ text: 'Key added.', type: 'success' });
    } catch (err) {
      setMessage({ text: err.message || 'Failed to add key.', type: 'error' });
    }
  };

  // Delete key
  const handleDeleteKey = async (keyId) => {
    if (!confirm('Delete this key point?')) return;
    try {
      await deleteKey(keyId);
      await fetchData();
      setMessage({ text: 'Key deleted.', type: 'success' });
    } catch (err) {
      setMessage({ text: err.message || 'Delete failed.', type: 'error' });
    }
  };

  // Edit key handlers
  const startEditKey = (key) => {
    setEditingKeyId(key.id);
    setKeyForm({ title: key.title, icon: key.icon || '', sortOrder: key.sortOrder });
  };

  const cancelEditKey = () => setEditingKeyId(null);

  const handleSaveKey = async (keyId) => {
    try {
      await updateKey(keyId, {
        title: keyForm.title,
        icon: keyForm.icon || undefined,
        sortOrder: parseInt(keyForm.sortOrder) || 0,
      });
      setEditingKeyId(null);
      await fetchData();
      setMessage({ text: 'Key updated.', type: 'success' });
    } catch (err) {
      setMessage({ text: err.message || 'Update failed.', type: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-gray-900">
        <p className="text-xl">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Industry Innovation Admin</h1>

        {/* ── Main Section Form ── */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8 shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">Main Section</h2>
          <form onSubmit={handleSaveInnovation}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 placeholder-gray-400"
                required
                maxLength={255}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 placeholder-gray-400"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Image URL</label>
              <input
                type="url"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 placeholder-gray-400"
                required
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Saving…' : innovation ? 'Update Innovation' : 'Create Innovation'}
            </button>
          </form>
          {message.text && (
            <div className={`mt-4 text-sm font-medium ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {message.text}
            </div>
          )}
        </div>

        {/* ── Keys Management (with inline add form) ── */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Key Points</h2>
            <button
              onClick={() => setShowAddKey(!showAddKey)}
              disabled={keys.length >= 4 || !innovation}
              className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {showAddKey ? 'Cancel' : '+ Add Key'} ({keys.length}/4)
            </button>
          </div>

          {/* Inline Add Key Form */}
          {showAddKey && (
            <form onSubmit={handleAddKeySubmit} className="mb-6 p-4 border border-gray-200 rounded-md">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title *</label>
                  <input
                    type="text"
                    value={newKey.title}
                    onChange={(e) => setNewKey({ ...newKey, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                    placeholder="e.g. AI Automation"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Icon (optional)</label>
                  <input
                    type="text"
                    value={newKey.icon}
                    onChange={(e) => setNewKey({ ...newKey, icon: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="fa-robot (FontAwesome)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Display Order</label>
                  <input
                    type="number"
                    value={newKey.sortOrder}
                    onChange={(e) => setNewKey({ ...newKey, sortOrder: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    min="0"
                  />
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                >
                  Add Key
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddKey(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {keys.length === 0 && !showAddKey ? (
            <p className="text-gray-500">No key points yet. Add up to 4.</p>
          ) : (
            <div className="space-y-4">
              {keys.map((key) => (
                <div key={key.id} className="border border-gray-200 rounded-md p-4">
                  {editingKeyId === key.id ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={keyForm.title}
                        onChange={(e) => setKeyForm({ ...keyForm, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="Title"
                      />
                      <input
                        type="text"
                        value={keyForm.icon}
                        onChange={(e) => setKeyForm({ ...keyForm, icon: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="Icon (optional)"
                      />
                      <input
                        type="number"
                        value={keyForm.sortOrder}
                        onChange={(e) => setKeyForm({ ...keyForm, sortOrder: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="Display order"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveKey(key.id)}
                          className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEditKey}
                          className="px-3 py-1 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{key.title}</p>
                        <p className="text-sm text-gray-500">
                          Order: {key.sortOrder}{key.icon ? ` • Icon: ${key.icon}` : ''}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEditKey(key)}
                          className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteKey(key.id)}
                          className="px-3 py-1 text-sm border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Live Preview (mimics the homepage “Leading the Industry with Innovation” section) ── */}
        {innovation && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <h2 className="text-2xl font-semibold p-6 pb-0">Homepage Preview</h2>
            <div className="p-6">
              {/* Hero image with overlay title – as on sbsgroups.co.in */}
              <div className="relative rounded-lg overflow-hidden">
                <img
                  src={innovation.image}
                  alt={innovation.title}
                  className="w-full h-64 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                  <h3 className="text-white text-3xl font-bold drop-shadow-lg">{innovation.title}</h3>
                </div>
              </div>
              <p className="mt-4 text-gray-700 leading-relaxed">{innovation.description}</p>

              {/* Key points grid – mirrors the 4-column layout from the real site */}
              {keys.length > 0 && (
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {keys.map((key) => (
                    <div key={key.id} className="text-center p-4 border border-gray-100 rounded-lg hover:shadow-md transition-shadow">
                      {key.icon && (
                        <div className="text-4xl text-gray-800 mb-3">
                          <i className={key.icon}></i>
                        </div>
                      )}
                      <p className="font-semibold text-gray-900">{key.title}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}