'use client';
import React from 'react';

export default function EmployeeTable({ 
  employees = [], // Add default empty array
  loading = false, 
  meta = null, 
  filters = {}, 
  setFilters = () => {},
  onEdit = () => {},
  onDelete = () => {},
  onToggleActive = () => {},
  onSendEmail = () => {} 
}) {
  
  // Show loading state
  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-12">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="text-gray-400">Loading employees...</p>
        </div>
      </div>
    );
  }

  // Show empty state when no employees
  if (!employees || employees.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-12">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="text-6xl">👥</div>
          <h3 className="text-xl font-semibold text-white">No Employees Found</h3>
          <p className="text-gray-400 text-center max-w-md">
            {filters.search || filters.role || filters.department 
              ? 'No employees match your search criteria. Try adjusting your filters.'
              : 'Get started by adding your first employee!'}
          </p>
          {filters.search && (
            <button
              onClick={() => setFilters({ ...filters, search: '', role: '', department: '', isActive: '', page: 1 })}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left p-4 text-gray-400 font-medium">Employee</th>
              <th className="text-left p-4 text-gray-400 font-medium">Role</th>
              <th className="text-left p-4 text-gray-400 font-medium">Department</th>
              <th className="text-left p-4 text-gray-400 font-medium">Contact</th>
              <th className="text-left p-4 text-gray-400 font-medium">Location</th>
              <th className="text-left p-4 text-gray-400 font-medium">Status</th>
              <th className="text-right p-4 text-gray-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr key={employee.id || Math.random()} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                      {employee.firstName?.[0] || '?'}{employee.lastName?.[0] || '?'}
                    </div>
                    <div>
                      <p className="text-white font-medium">
                        {employee.firstName || ''} {employee.lastName || ''}
                      </p>
                      <p className="text-gray-500 text-sm">{employee.designation || 'N/A'}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm border border-purple-500/20 capitalize">
                    {(employee.role || 'employee').replace('_', ' ')}
                  </span>
                </td>
                <td className="p-4 text-gray-300">{employee.department || 'N/A'}</td>
                <td className="p-4">
                  <p className="text-gray-300 text-sm">{employee.email || 'N/A'}</p>
                  <p className="text-gray-500 text-xs">{employee.mobile || 'N/A'}</p>
                </td>
                <td className="p-4 text-gray-300 text-sm">
                  {[employee.city, employee.state].filter(Boolean).join(', ') || 'N/A'}
                </td>
                <td className="p-4">
                  <button
                    onClick={() => onToggleActive(employee.id)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      employee.isActive
                        ? 'bg-green-500/20 text-green-400 border border-green-500/20'
                        : 'bg-red-500/20 text-red-400 border border-red-500/20'
                    }`}
                  >
                    {employee.isActive ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onSendEmail(employee)}
                      className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors text-blue-400"
                      title="Send Email"
                    >
                      📧
                    </button>
                    <button
                      onClick={() => onEdit(employee)}
                      className="p-2 hover:bg-purple-500/20 rounded-lg transition-colors text-purple-400"
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this employee?')) {
                          onDelete(employee.id);
                        }
                      }}
                      className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-400"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between p-4 border-t border-white/10">
          <p className="text-gray-400 text-sm">
            Showing {((meta.page - 1) * meta.limit) + 1} to {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} employees
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setFilters({ ...filters, page: meta.page - 1 })}
              disabled={!meta.hasPreviousPage}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-all"
            >
              ← Previous
            </button>
            <span className="px-4 py-2 text-gray-400 text-sm">
              Page {meta.page} of {meta.totalPages}
            </span>
            <button
              onClick={() => setFilters({ ...filters, page: meta.page + 1 })}
              disabled={!meta.hasNextPage}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-all"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}