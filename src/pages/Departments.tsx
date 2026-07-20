import React, { useState, useEffect } from 'react';
import { Briefcase, Search, Plus, Trash2, Edit, X, Download } from 'lucide-react';
import { Database } from '../services/db';
import { Department, Employee, UserRole } from '../types';

interface DepartmentsProps {
  currentRole: UserRole;
  addToast: (msg: string, type: 'success' | 'danger' | 'warning' | 'info') => void;
}

export default function Departments({ currentRole, addToast }: DepartmentsProps) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [head, setHead] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');

  useEffect(() => {
    setDepartments(Database.getDepartments());
    setEmployees(Database.getEmployees());
  }, []);

  const isAdminOrAuditor = currentRole === 'Administrator' || currentRole === 'Internal Auditor';

  const openAddModal = () => {
    setEditingDept(null);
    setName('');
    setHead('');
    setDescription('');
    setStatus('Active');
    setIsModalOpen(true);
  };

  const openEditModal = (dept: Department) => {
    setEditingDept(dept);
    setName(dept.name);
    setHead(dept.head);
    setDescription(dept.description);
    setStatus(dept.status);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      addToast('Please fill out Department Name.', 'warning');
      return;
    }

    const newDept: Department = {
      id: editingDept ? editingDept.id : `dept-${Date.now()}`,
      name: name.trim(),
      head: head || 'Unassigned',
      description: description.trim(),
      status: status,
      dateCreated: editingDept ? editingDept.dateCreated : new Date().toISOString().split('T')[0]
    };

    Database.saveDepartment(newDept);
    setDepartments(Database.getDepartments());
    setIsModalOpen(false);
    addToast(
      editingDept ? `Successfully updated department ${name}` : `Successfully registered department ${name}`,
      'success'
    );
  };

  const handleDelete = (id: string) => {
    const success = Database.deleteDepartment(id);
    if (success) {
      setDepartments(Database.getDepartments());
      setConfirmDeleteId(null);
      addToast('Department was successfully archived.', 'success');
    } else {
      addToast('Archival failed.', 'danger');
    }
  };

  const handleExportCSV = () => {
    if (departments.length === 0) {
      addToast('No records available for export.', 'warning');
      return;
    }
    const headers = 'ID,Department Name,Department Head,Description,Status,Date Created\n';
    const rows = departments
      .map(
        (d) =>
          `"${d.id}","${d.name}","${d.head}","${d.description.replace(/"/g, '""')}","${d.status}","${d.dateCreated}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Departments_Audit_Export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    addToast('Department list CSV download completed.', 'success');
  };

  const filteredDepartments = departments.filter((d) => {
    return (
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.head.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
            Departments Register
          </h1>
          <p className="text-xs text-gray-400">Configure organizational boundaries, management heads, and logs.</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-2.5">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center space-x-1.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 shadow-xs hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>
          {isAdminOrAuditor && (
            <button
              onClick={openAddModal}
              className="inline-flex items-center space-x-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add Department</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
        <div className="relative w-full max-w-xs">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            id="dept-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search department name, head..."
            className="block w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40 py-2 pl-9 pr-3 text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* Grid List of Departments (Bento Card Style) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredDepartments.length === 0 ? (
          <div className="sm:col-span-3 py-16 text-center text-xs text-gray-400 flex flex-col items-center justify-center space-y-2">
            <Briefcase className="h-10 w-10 text-gray-300" />
            <p className="font-semibold text-gray-500">No departments found</p>
          </div>
        ) : (
          filteredDepartments.map((d) => (
            <div
              key={d.id}
              className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-500">
                    <Briefcase className="h-4 w-4" />
                  </div>
                  <span
                    className={`inline-flex items-center rounded-sm px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                      d.status === 'Active'
                        ? 'bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400'
                        : 'bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400'
                    }`}
                  >
                    {d.status}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-950 dark:text-gray-50">{d.name}</h3>
                  <p className="text-[10px] text-gray-400 mt-0.5">Created on: {d.dateCreated}</p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-normal line-clamp-2">
                  {d.description || 'No formal description mapped.'}
                </p>
              </div>

              <div className="border-t border-gray-50 dark:border-gray-800 mt-4 pt-3.5 flex items-center justify-between">
                <div>
                  <span className="block text-[9px] font-bold text-gray-400 uppercase">Department Head</span>
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{d.head}</span>
                </div>
                <div className="flex items-center space-x-1">
                  {isAdminOrAuditor ? (
                    <>
                      <button
                        onClick={() => openEditModal(d)}
                        className="rounded-md p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-500 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(d.id)}
                        className="rounded-md p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <span className="text-[10px] text-gray-400 italic">Read-only</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Confirmation Delete Dialog */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-sm w-full p-5 border border-gray-100 dark:border-gray-800 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-gray-950 dark:text-gray-50">Confirm Archival</h3>
            <p className="text-xs text-gray-500">Are you sure you want to archive this department?</p>
            <div className="flex items-center justify-end space-x-2">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-3 py-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg"
              >
                Archive
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Slide-over Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/35 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-900 h-full max-w-md w-full p-6 border-l border-gray-100 dark:border-gray-800 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3 mb-4">
                <h2 className="text-sm font-extrabold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                  {editingDept ? 'Edit Department Profile' : 'Add New Department'}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label htmlFor="dept-name" className="block text-[11px] font-bold text-gray-500 uppercase">Department Name *</label>
                  <input
                    id="dept-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. IT Operations"
                    className="block w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-xs focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="dept-head" className="block text-[11px] font-bold text-gray-500 uppercase">Department Head / Manager</label>
                  <select
                    id="dept-head"
                    value={head}
                    onChange={(e) => setHead(e.target.value)}
                    className="block w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-xs focus:border-blue-500"
                  >
                    <option value="">-- Unassigned --</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.fullName}>
                        {emp.fullName} ({emp.position})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label htmlFor="dept-desc" className="block text-[11px] font-bold text-gray-500 uppercase">Description</label>
                  <textarea
                    id="dept-desc"
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide overview of duties, focus areas, and audit scope guidelines..."
                    className="block w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-xs focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="dept-status" className="block text-[11px] font-bold text-gray-500 uppercase">Status</label>
                  <select
                    id="dept-status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="block w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-xs focus:border-blue-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </form>
            </div>

            <div className="border-t border-gray-100 dark:border-gray-800 pt-4 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
              >
                {editingDept ? 'Save Changes' : 'Create Department'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
