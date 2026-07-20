import React, { useState, useEffect } from 'react';
import { Users, Search, Plus, Trash2, Edit, X, Download } from 'lucide-react';
import { Database } from '../services/db';
import { Employee, Department, UserRole } from '../types';

interface EmployeesProps {
  currentRole: UserRole;
  addToast: (msg: string, type: 'success' | 'danger' | 'warning' | 'info') => void;
}

export default function Employees({ currentRole, addToast }: EmployeesProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState<string>('All');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Form states
  const [employeeId, setEmployeeId] = useState('');
  const [fullName, setFullName] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [position, setPosition] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');

  useEffect(() => {
    setEmployees(Database.getEmployees());
    setDepartments(Database.getDepartments());
  }, []);

  const isAdminOrAuditor = currentRole === 'Administrator' || currentRole === 'Internal Auditor';

  const openAddModal = () => {
    setEditingEmp(null);
    setEmployeeId(`EMP-${Math.floor(100 + Math.random() * 900)}`);
    setFullName('');
    setDepartmentId(departments[0]?.id || '');
    setPosition('');
    setEmail('');
    setPhone('');
    setStatus('Active');
    setIsModalOpen(true);
  };

  const openEditModal = (emp: Employee) => {
    setEditingEmp(emp);
    setEmployeeId(emp.employeeId);
    setFullName(emp.fullName);
    setDepartmentId(emp.departmentId);
    setPosition(emp.position);
    setEmail(emp.email);
    setPhone(emp.phone);
    setStatus(emp.status);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !position.trim() || !employeeId.trim()) {
      addToast('Please fill out Employee ID, Name and Position fields.', 'warning');
      return;
    }

    const newEmp: Employee = {
      id: editingEmp ? editingEmp.id : `emp-${Date.now()}`,
      employeeId: employeeId.trim().toUpperCase(),
      fullName: fullName.trim(),
      departmentId,
      position: position.trim(),
      email: email.trim(),
      phone: phone.trim(),
      status: status
    };

    Database.saveEmployee(newEmp);
    setEmployees(Database.getEmployees());
    setIsModalOpen(false);
    addToast(
      editingEmp ? `Successfully updated profile of ${fullName}` : `Successfully enrolled employee ${fullName}`,
      'success'
    );
  };

  const handleDelete = (id: string) => {
    const success = Database.deleteEmployee(id);
    if (success) {
      setEmployees(Database.getEmployees());
      setConfirmDeleteId(null);
      addToast('Employee record was archived successfully.', 'success');
    } else {
      addToast('Archival failed.', 'danger');
    }
  };

  const handleExportCSV = () => {
    if (employees.length === 0) {
      addToast('No records available for export.', 'warning');
      return;
    }
    const headers = 'ID,Employee ID,Full Name,Department,Position,Email,Phone,Status\n';
    const rows = employees
      .map((e) => {
        const deptName = departments.find((d) => d.id === e.departmentId)?.name || 'Unassigned';
        return `"${e.id}","${e.employeeId}","${e.fullName}","${deptName}","${e.position}","${e.email}","${e.phone}","${e.status}"`;
      })
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Employees_Audit_Export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    addToast('Employee registry CSV downloaded.', 'success');
  };

  const filteredEmployees = employees.filter((e) => {
    const matchesSearch =
      e.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = deptFilter === 'All' || e.departmentId === deptFilter;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
            Employee Directory
          </h1>
          <p className="text-xs text-gray-400">Manage internal profiles, departmental roles, and authentication hooks.</p>
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
              <span>Enroll Employee</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
        <div className="relative w-full sm:max-w-xs">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            id="employee-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search employee name, ID, position..."
            className="block w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40 py-2 pl-9 pr-3 text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-gray-400">Department:</span>
          <select
            id="employee-dept-filter"
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-850 px-3 py-1.5 text-xs text-gray-700 dark:text-gray-300 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="All">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Directory Grid Table */}
      <div className="overflow-hidden rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
        {filteredEmployees.length === 0 ? (
          <div className="py-16 text-center text-xs text-gray-400 flex flex-col items-center justify-center space-y-2">
            <Users className="h-10 w-10 text-gray-300" />
            <p className="font-semibold text-gray-500">No employees found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/45">
                  <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">Employee ID / Name</th>
                  <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">Department</th>
                  <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">Position</th>
                  <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">Email & Contact</th>
                  <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">Status</th>
                  <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-gray-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredEmployees.map((e) => {
                  const dept = departments.find((d) => d.id === e.departmentId);
                  return (
                    <tr key={e.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 text-xs">
                      <td className="p-3">
                        <div className="flex items-center space-x-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-tr from-blue-600 to-indigo-600 text-white font-bold text-[10px]">
                            {e.fullName.split(' ').map((n) => n[0]).join('')}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-950 dark:text-gray-100">{e.fullName}</p>
                            <span className="font-mono text-[9px] text-gray-400 bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded-sm">{e.employeeId}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 font-semibold text-gray-700 dark:text-gray-300">
                        {dept ? dept.name : 'Unassigned'}
                      </td>
                      <td className="p-3 text-gray-500 dark:text-gray-400">{e.position}</td>
                      <td className="p-3">
                        <p className="font-semibold text-gray-700 dark:text-gray-300">{e.email}</p>
                        <p className="text-[10px] text-gray-400">{e.phone}</p>
                      </td>
                      <td className="p-3">
                        <span
                          className={`inline-flex items-center rounded-sm px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            e.status === 'Active'
                              ? 'bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400'
                              : 'bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400'
                          }`}
                        >
                          {e.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {isAdminOrAuditor ? (
                            <>
                              <button
                                onClick={() => openEditModal(e)}
                                className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-500 transition-colors"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(e.id)}
                                className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          ) : (
                            <span className="text-[10px] text-gray-400 italic">Read-only</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Delete Dialog */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-sm w-full p-5 border border-gray-100 dark:border-gray-800 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-gray-950 dark:text-gray-50">Archive Record</h3>
            <p className="text-xs text-gray-500">Are you sure you want to archive this employee record?</p>
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
                  {editingEmp ? 'Modify Profile' : 'Enroll New Profile'}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label htmlFor="employee-id" className="block text-[11px] font-bold text-gray-500 uppercase">Employee ID *</label>
                    <input
                      id="employee-id"
                      type="text"
                      required
                      value={employeeId}
                      onChange={(e) => setEmployeeId(e.target.value)}
                      placeholder="e.g. EMP-101"
                      className="block w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-xs focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="employee-status" className="block text-[11px] font-bold text-gray-500 uppercase">Status</label>
                    <select
                      id="employee-status"
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="block w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-xs focus:border-blue-500"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="employee-name" className="block text-[11px] font-bold text-gray-500 uppercase">Full Name *</label>
                  <input
                    id="employee-name"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Eleanor Vance"
                    className="block w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-xs focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label htmlFor="employee-dept" className="block text-[11px] font-bold text-gray-500 uppercase">Department</label>
                    <select
                      id="employee-dept"
                      value={departmentId}
                      onChange={(e) => setDepartmentId(e.target.value)}
                      className="block w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-xs focus:border-blue-500"
                    >
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="employee-position" className="block text-[11px] font-bold text-gray-500 uppercase">Position / Job Title *</label>
                    <input
                      id="employee-position"
                      type="text"
                      required
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      placeholder="e.g. Senior Accountant"
                      className="block w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-xs focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label htmlFor="employee-email" className="block text-[11px] font-bold text-gray-500 uppercase">Work Email</label>
                    <input
                      id="employee-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="eleanor@acme.com"
                      className="block w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-xs focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="employee-phone" className="block text-[11px] font-bold text-gray-500 uppercase">Phone Line</label>
                    <input
                      id="employee-phone"
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 012-3456"
                      className="block w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-xs focus:border-blue-500"
                    />
                  </div>
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
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
              >
                {editingEmp ? 'Save Changes' : 'Enroll'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
