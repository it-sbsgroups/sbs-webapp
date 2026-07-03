'use client';
import React, { useState, useEffect } from 'react';

const initialFormData = {
  firstName: '', middleName: '', lastName: '', fatherName: '',
  email: '', mobile: '', whatsapp: '',
  role: 'employee', designation: '', department: '',
  region: '', state: '', district: '', city: '', address: '', landmark: '', zipCode: '',
  aadhar: '', bankAccount: '', ifsc: '', bankName: '', branchName: '',
  linkedin: '', instagram: '', facebook: '', youtube: '', twitter: '',
  isActive: true,
};

export default function EmployeeForm({ employee, onClose, onSubmit }) {
  const [formData, setFormData] = useState(initialFormData);
  const [activeTab, setActiveTab] = useState('personal');

  useEffect(() => {
    if (employee) {
      setFormData({ ...initialFormData, ...employee });
    }
  }, [employee]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const tabs = [
    { id: 'personal', label: '👤 Personal', icon: '👤' },
    { id: 'contact', label: '📞 Contact', icon: '📞' },
    { id: 'address', label: '📍 Address', icon: '📍' },
    { id: 'bank', label: '🏦 Bank', icon: '🏦' },
    { id: 'social', label: '🌐 Social', icon: '🌐' },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold text-white">
            {employee ? 'Edit Employee' : 'Add New Employee'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/10'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Personal Tab */}
          {activeTab === 'personal' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">Personal Information</h3>
              <div className="grid grid-cols-2 gap-4">
                {['firstName', 'middleName', 'lastName', 'fatherName'].map((field) => (
                  <div key={field}>
                    <label className="block text-sm text-gray-400 mb-1 capitalize">
                      {field.replace(/([A-Z])/g, ' $1').trim()}
                    </label>
                    <input
                      type="text"
                      name={field}
                      value={formData[field]}
                      onChange={handleChange}
                      required={['firstName', 'lastName', 'fatherName'].includes(field)}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-all"
                    />
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-all"
                  >
                    <option value="admin" className="bg-gray-900">Admin</option>
                    <option value="manager" className="bg-gray-900">Manager</option>
                    <option value="team_lead" className="bg-gray-900">Team Lead</option>
                    <option value="employee" className="bg-gray-900">Employee</option>
                    <option value="intern" className="bg-gray-900">Intern</option>
                    <option value="hr" className="bg-gray-900">HR</option>
                    <option value="accountant" className="bg-gray-900">Accountant</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Designation</label>
                  <input
                    type="text"
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Department</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>
            </div>
          )}

          {/* Contact Tab */}
          {activeTab === 'contact' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">Contact Details</h3>
              <div className="grid grid-cols-2 gap-4">
                {['email', 'mobile', 'whatsapp'].map((field) => (
                  <div key={field}>
                    <label className="block text-sm text-gray-400 mb-1 capitalize">{field}</label>
                    <input
                      type={field === 'email' ? 'email' : 'text'}
                      name={field}
                      value={formData[field]}
                      onChange={handleChange}
                      required={field === 'email' || field === 'mobile'}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-all"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Address Tab */}
          {activeTab === 'address' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">Address</h3>
              <div className="grid grid-cols-2 gap-4">
                {['region', 'state', 'district', 'city', 'zipCode'].map((field) => (
                  <div key={field}>
                    <label className="block text-sm text-gray-400 mb-1 capitalize">{field}</label>
                    <input
                      type="text"
                      name={field}
                      value={formData[field]}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-all"
                    />
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Landmark</label>
                <input
                  type="text"
                  name="landmark"
                  value={formData.landmark}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>
            </div>
          )}

          {/* Bank Tab */}
          {activeTab === 'bank' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">Bank Details</h3>
              <div className="grid grid-cols-2 gap-4">
                {['aadhar', 'bankAccount', 'ifsc', 'bankName', 'branchName'].map((field) => (
                  <div key={field}>
                    <label className="block text-sm text-gray-400 mb-1 capitalize">
                      {field.replace(/([A-Z])/g, ' $1').trim()}
                    </label>
                    <input
                      type="text"
                      name={field}
                      value={formData[field]}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-all"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Social Tab */}
          {activeTab === 'social' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">Social Media</h3>
              <div className="grid grid-cols-2 gap-4">
                {['linkedin', 'instagram', 'facebook', 'youtube', 'twitter'].map((field) => (
                  <div key={field}>
                    <label className="block text-sm text-gray-400 mb-1 capitalize">{field}</label>
                    <input
                      type="url"
                      name={field}
                      value={formData[field]}
                      onChange={handleChange}
                      placeholder={`https://${field}.com/username`}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-all"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
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