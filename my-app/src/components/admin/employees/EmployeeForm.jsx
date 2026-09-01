'use client';
import React, { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/employees/api';

// Matches the real Employee model exactly (name, email, mobile, image,
// designation, department, isActive) — no fields the backend can't persist.
const initialFormData = {
  name: '',
  email: '',
  mobile: '',
  image: '',
  designation: '',
  department: '',
  isActive: true,
};

export default function EmployeeForm({ employee, onClose, onSubmit }) {
  const [formData, setFormData] = useState(initialFormData);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (employee) {
      setFormData({ ...initialFormData, ...employee });
    } else {
      setFormData(initialFormData);
    }
  }, [employee]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await api.uploadEmployeeImage(file);
      setFormData((prev) => ({ ...prev, image: url }));
    } catch (err) {
      alert(err.message || 'Photo upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">
            {employee ? 'Edit Employee' : 'Add New Employee'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[65vh] space-y-4">
          {/* Photo */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="h-16 w-16 shrink-0 rounded-xl overflow-hidden border border-white/10 bg-white/5 flex items-center justify-center"
            >
              {formData.image ? (
                <img src={formData.image} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="text-2xl">👤</span>
              )}
            </button>
            <div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="text-xs font-bold text-blue-400 hover:text-blue-300 disabled:opacity-50"
              >
                {uploading ? 'Uploading…' : formData.image ? 'Change photo' : 'Upload photo'}
              </button>
              <p className="text-[11px] text-gray-500 mt-0.5">Optional — square image recommended</p>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Full Name *</label>
            <input
              type="text" name="name" required
              value={formData.name} onChange={handleChange}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email *</label>
              <input
                type="email" name="email" required
                value={formData.email} onChange={handleChange}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Mobile *</label>
              <input
                type="text" name="mobile" required
                value={formData.mobile} onChange={handleChange}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Designation</label>
              <input
                type="text" name="designation"
                value={formData.designation} onChange={handleChange}
                placeholder="e.g. Sales Manager"
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Department</label>
              <input
                type="text" name="department"
                value={formData.department} onChange={handleChange}
                placeholder="e.g. Operations"
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-4 p-6 border-t border-white/10">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="w-4 h-4 accent-blue-500"
            />
            <label className="text-gray-400 text-sm">Active</label>
          </div>

          <button
            onClick={onClose}
            className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all"
          >
            {employee ? 'Update' : 'Create'} Employee
          </button>
        </div>
      </div>
    </div>
  );
}
