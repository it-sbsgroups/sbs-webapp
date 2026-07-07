'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Search, Plus, Mail, Edit, Trash2, Users, UserCheck, UserX,
  ChevronLeft, ChevronRight, X, CheckCircle, Upload, Link as LinkIcon, Image as ImageIcon,
} from 'lucide-react';
import { api } from '@/lib/employees/api';
import EmployeeImageCropper from '@/components/admin/employees/EmployeeImageCropper';
import toast from 'react-hot-toast';

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function AdminEmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, topDepartments: [] });
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [filters, setFilters] = useState({
    search: '', department: '', designation: '', isActive: '',
    page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'desc',
  });

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getEmployees(filters);
      if (data && data.data) { setEmployees(data.data); setMeta(data.meta); }
      else if (Array.isArray(data)) { setEmployees(data); setMeta(null); }
      else { setEmployees([]); setMeta(null); }
    } catch (error) {
      console.error('Failed to fetch employees:', error);
      toast.error(error.message || 'Failed to load employees');
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchStats = async () => {
    try { setStats(await api.getStats()); } catch { /* silent */ }
  };

  // Debounce the search box so we don't fire a request per keystroke
  useEffect(() => {
    const t = setTimeout(fetchEmployees, 300);
    return () => clearTimeout(t);
  }, [fetchEmployees]);

  useEffect(() => { fetchStats(); }, []);

  const handleCreate = async (data) => {
    await api.createEmployee(data);
    toast.success('Employee created successfully!');
    setShowForm(false);
    fetchEmployees();
    fetchStats();
  };

  const handleUpdate = async (id, data) => {
    await api.updateEmployee(id, data);
    toast.success('Employee updated successfully!');
    setShowForm(false);
    setSelectedEmployee(null);
    fetchEmployees();
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteEmployee(id);
      toast.success('Employee deleted!');
      fetchEmployees();
      fetchStats();
    } catch (e) { toast.error(e.message || 'Delete failed'); }
  };

  const handleToggleActive = async (id) => {
    try {
      const result = await api.toggleActive(id);
      toast.success(`Employee ${result.isActive ? 'activated' : 'deactivated'}!`);
      fetchEmployees();
      fetchStats();
    } catch { toast.error('Failed to toggle status'); }
  };

  const handleSendEmail = async (emailData) => {
    try {
      await api.sendTestEmail(emailData.to);
      toast.success('Email sent successfully!');
      setShowEmail(false);
      setSelectedEmployee(null);
    } catch { toast.error('Failed to send email'); }
  };

  const setFilter = (key, value) => setFilters((p) => ({ ...p, [key]: value, page: 1 }));
  const setPage = (page) => setFilters((p) => ({ ...p, page }));
  const clearFilters = () => setFilters((p) => ({
    ...p, search: '', department: '', designation: '', isActive: '', page: 1,
  }));

  const hasActiveFilters =
    filters.search || filters.department || filters.designation || filters.isActive !== '';

  // toggle sort when clicking a sortable column header
  const sortByCol = (col) => setFilters((p) => ({
    ...p,
    sortBy: col,
    sortOrder: p.sortBy === col && p.sortOrder === 'asc' ? 'desc' : 'asc',
    page: 1,
  }));

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Employee Management</h1>
        <p className="text-gray-500 mt-1">Manage your team members and their roles</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard label="Total Employees" value={stats.total} icon={<Users className="w-6 h-6 text-blue-600" />} bg="bg-blue-50" />
        <StatCard label="Active" value={stats.active} icon={<UserCheck className="w-6 h-6 text-green-600" />} bg="bg-green-50" valueColor="text-green-600" />
        <StatCard label="Inactive" value={stats.inactive} icon={<UserX className="w-6 h-6 text-red-600" />} bg="bg-red-50" valueColor="text-red-600" />
      </div>

      {/* Top filter bar */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm mb-6">
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text" placeholder="Search name, email, mobile…"
                value={filters.search}
                onChange={(e) => setFilter('search', e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-56"
              />
            </div>

            <select
              value={filters.isActive === '' ? '' : String(filters.isActive)}
              onChange={(e) => { const v = e.target.value; setFilter('isActive', v === '' ? '' : v === 'true'); }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>

            {hasActiveFilters && (
              <button onClick={clearFilters}
                className="flex items-center gap-1 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50">
                <X className="w-3.5 h-3.5" /> Clear
              </button>
            )}
          </div>

          <button
            onClick={() => { setSelectedEmployee(null); setShowForm(true); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" /> Add Employee
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
          </div>
        ) : employees.length === 0 ? (
          <div className="text-center p-16">
            <Users className="w-14 h-14 text-gray-200 mx-auto mb-4" />
            <h3 className="text-base font-medium text-gray-700 mb-1">No Employees Found</h3>
            <p className="text-sm text-gray-400">
              {hasActiveFilters ? 'No employees match your filters.' : 'Get started by adding your first employee.'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <Th label="Employee" col="name" filters={filters} onSort={sortByCol} />
                    <Th label="Designation" col="designation" filters={filters} onSort={sortByCol} />
                    <Th label="Department" col="department" filters={filters} onSort={sortByCol} />
                    <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Contact</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="text-right p-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                  </tr>
                  {/* Column filter row */}
                  <tr className="bg-white border-b border-gray-100">
                    <td className="px-4 py-2" />
                    <td className="px-4 py-2">
                      <input value={filters.designation} onChange={(e) => setFilter('designation', e.target.value)}
                        placeholder="Filter…" className="w-full text-xs border border-gray-200 rounded-md px-2 py-1 text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-400" />
                    </td>
                    <td className="px-4 py-2">
                      <input value={filters.department} onChange={(e) => setFilter('department', e.target.value)}
                        placeholder="Filter…" className="w-full text-xs border border-gray-200 rounded-md px-2 py-1 text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-400" />
                    </td>
                    <td className="px-4 py-2" />
                    <td className="px-4 py-2">
                      <select value={filters.isActive === '' ? '' : String(filters.isActive)}
                        onChange={(e) => { const v = e.target.value; setFilter('isActive', v === '' ? '' : v === 'true'); }}
                        className="w-full text-xs border border-gray-200 rounded-md px-2 py-1 text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-400">
                        <option value="">All</option>
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                    </td>
                    <td className="px-4 py-2" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {emp.image ? (
                            <img src={emp.image} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm shrink-0">
                              {emp.name?.[0]}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900">{emp.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-gray-500">{emp.designation || '—'}</td>
                      <td className="p-4 text-gray-500">{emp.department || '—'}</td>
                      <td className="p-4">
                        <p className="text-gray-800">{emp.email}</p>
                        <p className="text-xs text-gray-400">{emp.mobile}</p>
                      </td>
                      <td className="p-4">
                        <button onClick={() => handleToggleActive(emp.id)}
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                            emp.isActive ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-red-50 text-red-700 hover:bg-red-100'}`}>
                          {emp.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => { setSelectedEmployee(emp); setShowEmail(true); }}
                            className="p-2 hover:bg-blue-50 rounded-lg text-blue-500" title="Send Email"><Mail className="w-4 h-4" /></button>
                          <button onClick={() => { setSelectedEmployee(emp); setShowForm(true); }}
                            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500" title="Edit"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => { if (window.confirm('Delete this employee?')) handleDelete(emp.id); }}
                            className="p-2 hover:bg-red-50 rounded-lg text-red-500" title="Delete"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {meta && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
                <p className="text-sm text-gray-500">
                  {meta.total === 0 ? 'No results'
                    : `Showing ${(meta.page - 1) * meta.limit + 1}–${Math.min(meta.page * meta.limit, meta.total)} of ${meta.total}`}
                </p>
                <div className="flex items-center gap-2">
                  <button onClick={() => setPage(meta.page - 1)} disabled={!meta.hasPreviousPage}
                    className="p-1.5 border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-100 disabled:cursor-not-allowed">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: meta.totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === meta.totalPages || Math.abs(p - meta.page) <= 1)
                    .reduce((acc, p, idx, arr) => {
                      if (idx > 0 && p - arr[idx - 1] > 1) acc.push('…');
                      acc.push(p); return acc;
                    }, [])
                    .map((item, idx) => item === '…'
                      ? <span key={`e-${idx}`} className="px-2 text-gray-400 text-sm">…</span>
                      : <button key={item} onClick={() => setPage(item)}
                          className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                            item === meta.page ? 'bg-blue-600 text-white' : 'border border-gray-300 text-gray-600 hover:bg-gray-100'}`}>
                          {item}
                        </button>)}
                  <button onClick={() => setPage(meta.page + 1)} disabled={!meta.hasNextPage}
                    className="p-1.5 border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-100 disabled:cursor-not-allowed">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <select value={filters.limit}
                  onChange={(e) => setFilters((p) => ({ ...p, limit: Number(e.target.value), page: 1 }))}
                  className="text-sm border border-gray-300 rounded-lg px-2 py-1.5 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {[10, 25, 50, 100].map((n) => <option key={n} value={n}>{n} / page</option>)}
                </select>
              </div>
            )}
          </>
        )}
      </div>

      {showForm && (
        <EmployeeFormModal
          employee={selectedEmployee}
          onClose={() => { setShowForm(false); setSelectedEmployee(null); }}
          onSubmit={selectedEmployee ? (data) => handleUpdate(selectedEmployee.id, data) : handleCreate}
        />
      )}

      {showEmail && selectedEmployee && (
        <EmailModal employee={selectedEmployee}
          onClose={() => { setShowEmail(false); setSelectedEmployee(null); }}
          onSend={handleSendEmail} />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function Th({ label, col, filters, onSort }) {
  const active = filters.sortBy === col;
  return (
    <th onClick={() => onSort(col)}
      className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer select-none hover:text-gray-700">
      <span className="inline-flex items-center gap-1">
        {label}
        {active && <span className="text-blue-500">{filters.sortOrder === 'asc' ? '▲' : '▼'}</span>}
      </span>
    </th>
  );
}

function StatCard({ label, value, icon, bg, valueColor = 'text-gray-900' }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <h3 className={`text-3xl font-bold mt-1 ${valueColor}`}>{value ?? 0}</h3>
        </div>
        <div className={`p-3 ${bg} rounded-lg`}>{icon}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP-WISE FORM
// Required: name, mobile, email, image
// ─────────────────────────────────────────────────────────────────────────────
const STEPS = [
  { id: 'photo',   label: 'Photo' },
  { id: 'details', label: 'Details' },
];

// Matches the real Employee model exactly — name, email, mobile, image,
// designation, department, isActive. Nothing else is ever persisted, so
// nothing else is collected here (previously this form also asked for
// Aadhar/bank account/IFSC/full address/social links, none of which the
// backend has a column for — it was silently discarded on every save).
const EMPTY_FORM = {
  image: '',
  name: '',
  designation: '',
  department: '',
  email: '',
  mobile: '',
  isActive: true,
};

function validateStep(stepId, f) {
  switch (stepId) {
    case 'photo':
      if (!f.image) return 'Employee photo is required.';
      return '';
    case 'details':
      if (!f.name.trim()) return 'Full name is required.';
      if (f.name.trim().length < 2) return 'Full name must be at least 2 characters.';
      if (!f.email.trim()) return 'Email is required.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) return 'Please enter a valid email.';
      if (!f.mobile.trim()) return 'Mobile number is required.';
      if (!/^[0-9]{10}$/.test(f.mobile)) return 'Mobile must be exactly 10 digits.';
      return '';
    default:
      return '';
  }
}

function EmployeeFormModal({ employee, onClose, onSubmit }) {
  const [formData, setFormData] = useState(
    employee ? { ...EMPTY_FORM, ...employee } : { ...EMPTY_FORM }
  );
  const [stepIndex, setStepIndex] = useState(0);
  const [stepError, setStepError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const currentStep = STEPS[stepIndex];
  const isLast = stepIndex === STEPS.length - 1;
  const isFirst = stepIndex === 0;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
    if (stepError) setStepError('');
  };
  const setImage = (url) => { setFormData((p) => ({ ...p, image: url })); if (stepError) setStepError(''); };

  const goNext = () => {
    const err = validateStep(currentStep.id, formData);
    if (err) { setStepError(err); return; }
    setStepError(''); setStepIndex((i) => i + 1);
  };
  const goPrev = () => { setStepError(''); setStepIndex((i) => i - 1); };

  const handleSubmit = async () => {
    for (const step of STEPS) {
      const err = validateStep(step.id, formData);
      if (err) {
        setStepIndex(STEPS.findIndex((s) => s.id === step.id));
        setStepError(err);
        return;
      }
    }
    setSubmitting(true);
    try {
      // Only send fields the DB knows; drop id/createdAt/updatedAt for edits.
      const { id, createdAt, updatedAt, ...payload } = formData;
      await onSubmit(payload);
    } catch (error) {
      toast.error(error.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[92vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{employee ? 'Edit Employee' : 'Add New Employee'}</h2>
            <p className="text-xs text-gray-400 mt-0.5">Step {stepIndex + 1} of {STEPS.length} — {currentStep.label}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>

        {/* Progress */}
        <div className="px-6 pt-4 shrink-0">
          <div className="flex items-center gap-0">
            {STEPS.map((step, idx) => {
              const done = idx < stepIndex, active = idx === stepIndex;
              return (
                <React.Fragment key={step.id}>
                  <button type="button"
                    onClick={() => {
                      if (idx < stepIndex) { setStepError(''); setStepIndex(idx); }
                      else if (idx > stepIndex) {
                        const err = validateStep(currentStep.id, formData);
                        if (!err) { setStepError(''); setStepIndex(idx); } else setStepError(err);
                      }
                    }}
                    className="flex flex-col items-center gap-1 group" style={{ minWidth: 0 }}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                      ${done ? 'bg-green-500 text-white' : active ? 'bg-blue-600 text-white ring-4 ring-blue-100' : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'}`}>
                      {done ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                    </div>
                    <span className={`text-[10px] font-medium hidden sm:block ${active ? 'text-blue-600' : done ? 'text-green-600' : 'text-gray-400'}`}>{step.label}</span>
                  </button>
                  {idx < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-1 transition-colors ${idx < stepIndex ? 'bg-green-400' : 'bg-gray-200'}`} />}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {stepError && (
          <div className="mx-6 mt-3 px-4 py-2.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 shrink-0">⚠️ {stepError}</div>
        )}

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {currentStep.id === 'photo' && (
            <ImageUploadStep value={formData.image} onChange={setImage} />
          )}

          {currentStep.id === 'details' && (
            <div className="grid grid-cols-2 gap-4">
              <Field label="Full Name *" className="col-span-2">
                <input type="text" name="name" value={formData.name} onChange={handleChange}
                  className={inputClass(stepError && !formData.name.trim())} placeholder="e.g. Rohan Mehta" />
              </Field>
              <Field label="Designation"><input type="text" name="designation" value={formData.designation} onChange={handleChange} className={inputClass()} placeholder="e.g. Senior Developer" /></Field>
              <Field label="Department"><input type="text" name="department" value={formData.department} onChange={handleChange} className={inputClass()} placeholder="e.g. Information Technology" /></Field>
              <Field label="Email *">
                <input type="email" name="email" value={formData.email} onChange={handleChange}
                  className={inputClass(stepError && (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)))} placeholder="name@company.com" />
              </Field>
              <Field label="Mobile * (10 digits)">
                <input type="text" name="mobile" value={formData.mobile} onChange={handleChange}
                  className={inputClass(stepError && !/^[0-9]{10}$/.test(formData.mobile))} placeholder="9876543210" maxLength={10} />
              </Field>
              <Field label="Active Status" className="col-span-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className={`relative w-11 h-6 rounded-full transition-colors ${formData.isActive ? 'bg-blue-600' : 'bg-gray-300'}`}>
                    <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} className="sr-only" />
                    <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${formData.isActive ? 'translate-x-5' : ''}`} />
                  </div>
                  <span className="text-sm text-gray-700">{formData.isActive ? 'Active' : 'Inactive'}</span>
                </label>
              </Field>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl shrink-0">
          <button type="button" onClick={isFirst ? onClose : goPrev}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors">
            {isFirst ? 'Cancel' : '← Previous'}
          </button>
          <span className="text-xs text-gray-400">{stepIndex + 1} / {STEPS.length}</span>
          {isLast ? (
            <button type="button" onClick={handleSubmit} disabled={submitting}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {submitting ? 'Saving…' : employee ? 'Update Employee' : 'Create Employee'}
            </button>
          ) : (
            <button type="button" onClick={goNext}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">Next →</button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// IMAGE UPLOAD STEP — file picker, drag & drop, or paste URL.
// Uploads via backend → compressed webp → Cloudinary → url stored in form.
// ─────────────────────────────────────────────────────────────────────────────
function ImageUploadStep({ value, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [cropFile, setCropFile] = useState(null);
  const fileRef = useRef(null);

  // Validate, then open the cropper instead of uploading immediately.
  const pickFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please choose an image file'); return; }
    setCropFile(file);
  };

  const upload = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please choose an image file'); return; }
    setUploading(true); setProgress(0);
    try {
      const { url } = await api.uploadEmployeeImage(file, setProgress);
      onChange(url);
      toast.success('Photo uploaded');
    } catch (e) {
      toast.error(e.message || 'Upload failed');
    } finally {
      setUploading(false); setProgress(0);
    }
  };

  const onDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    pickFile(file);
  };

  return (
    <div className="space-y-4">
      {cropFile && (
        <EmployeeImageCropper
          file={cropFile}
          onCancel={() => setCropFile(null)}
          onCropped={(croppedFile) => { setCropFile(null); upload(croppedFile); }}
        />
      )}
      {value ? (
        <div className="flex flex-col items-center gap-3">
          <img src={value} alt="Employee" className="max-w-[12rem] max-h-48 rounded-xl object-contain ring-4 ring-blue-100 bg-gray-50" />
          <button type="button" onClick={() => onChange('')}
            className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1">
            <X className="w-4 h-4" /> Remove photo
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
            dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}`}>
          {uploading ? (
            <div className="space-y-2">
              <div className="w-10 h-10 mx-auto animate-spin rounded-full border-b-2 border-blue-600" />
              <p className="text-sm text-gray-500">Uploading… {progress}%</p>
              <div className="w-full max-w-xs mx-auto h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          ) : (
            <>
              <Upload className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700">Drag & drop a photo, or click to browse</p>
              <p className="text-xs text-gray-400 mt-1">JPG / PNG / WebP — auto-compressed to WebP</p>
            </>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => pickFile(e.target.files?.[0])} />
        </div>
      )}

      {/* Paste URL alternative */}
      {!value && (
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <LinkIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="url" value={urlInput} onChange={(e) => setUrlInput(e.target.value)}
              placeholder="…or paste an image URL" className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <button type="button" disabled={!urlInput.trim()}
            onClick={() => { onChange(urlInput.trim()); setUrlInput(''); }}
            className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-40 flex items-center gap-1">
            <ImageIcon className="w-4 h-4" /> Use
          </button>
        </div>
      )}
    </div>
  );
}

function Field({ label, children, className = '' }) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function inputClass(hasError = false) {
  return `w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
    hasError ? 'border-red-400 focus:ring-red-300 bg-red-50' : 'border-gray-300 focus:ring-blue-500'}`;
}

// ─────────────────────────────────────────────────────────────────────────────
function EmailModal({ employee, onClose, onSend }) {
  const [subject, setSubject] = useState(`Hello ${employee.name}!`);
  const [body, setBody] = useState(`Dear ${employee.name},\n\nWe hope this email finds you well.\n\nBest regards,\nSBS Groups`);
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Send Email</h2>
            <p className="text-sm text-gray-400">To: {employee.email}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm" />
          </div>
        </div>
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
          <button onClick={() => onSend({ to: employee.email, subject, body })}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2">
            <Mail className="w-4 h-4" /> Send
          </button>
        </div>
      </div>
    </div>
  );
}