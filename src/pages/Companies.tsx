import React, { useState, useEffect } from 'react';
import { Building2, Search, Plus, Trash2, Edit, X, Download, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Database } from '../services/db';
import { Company, UserRole } from '../types';

interface CompaniesProps {
  currentRole: UserRole;
  addToast: (msg: string, type: 'success' | 'danger' | 'warning' | 'info') => void;
}

export default function Companies({ currentRole, addToast }: CompaniesProps) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [address, setAddress] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');

  useEffect(() => {
    setCompanies(Database.getCompanies());
  }, []);

  const isAdminOrAuditor = currentRole === 'Administrator' || currentRole === 'Internal Auditor';

  const openAddModal = () => {
    setEditingCompany(null);
    setName('');
    setCode('');
    setAddress('');
    setContactPerson('');
    setPhone('');
    setEmail('');
    setStatus('Active');
    setIsModalOpen(true);
  };

  const openEditModal = (comp: Company) => {
    setEditingCompany(comp);
    setName(comp.name);
    setCode(comp.code);
    setAddress(comp.address);
    setContactPerson(comp.contactPerson);
    setPhone(comp.phone);
    setEmail(comp.email);
    setStatus(comp.status);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      addToast('Please fill out Name and Code fields.', 'warning');
      return;
    }

    const newComp: Company = {
      id: editingCompany ? editingCompany.id : `comp-${Date.now()}`,
      name: name.trim(),
      code: code.trim().toUpperCase(),
      address: address.trim(),
      contactPerson: contactPerson.trim(),
      phone: phone.trim(),
      email: email.trim(),
      status: status,
      dateCreated: editingCompany ? editingCompany.dateCreated : new Date().toISOString().split('T')[0]
    };

    Database.saveCompany(newComp);
    setCompanies(Database.getCompanies());
    setIsModalOpen(false);
    addToast(
      editingCompany ? `Successfully updated company ${name}` : `Successfully registered company ${name}`,
      'success'
    );
  };

  const handleDelete = (id: string) => {
    const success = Database.deleteCompany(id);
    if (success) {
      setCompanies(Database.getCompanies());
      setConfirmDeleteId(null);
      addToast('Company was successfully archived.', 'success');
    } else {
      addToast('Archival failed. Entity may be linked with external references.', 'danger');
    }
  };

  // CSV Export Utility
  const handleExportCSV = () => {
    if (companies.length === 0) {
      addToast('No records available for export.', 'warning');
      return;
    }
    const headers = 'ID,Company Name,Code,Address,Contact Person,Phone,Email,Status,Date Created\n';
    const rows = companies
      .map(
        (c) =>
          `"${c.id}","${c.name}","${c.code}","${c.address.replace(/"/g, '""')}","${c.contactPerson}","${c.phone}","${c.email}","${c.status}","${c.dateCreated}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Companies_Audit_Export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    addToast('Company registry CSV download completed.', 'success');
  };

  const filteredCompanies = companies.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.contactPerson.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
            Enterprise Register
          </h1>
          <p className="text-xs text-gray-400">Manage legal entities, corporate details, and operational status.</p>
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
              <span>Add Company</span>
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
            id="company-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search company name, code..."
            className="block w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40 py-2 pl-9 pr-3 text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-gray-400">Status:</span>
          {(['All', 'Active', 'Inactive'] as const).map((statusVal) => (
            <button
              key={statusVal}
              onClick={() => setStatusFilter(statusVal)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                statusFilter === statusVal
                  ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-semibold border border-blue-200 dark:border-blue-900'
                  : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-transparent hover:bg-gray-100'
              }`}
            >
              {statusVal}
            </button>
          ))}
        </div>
      </div>

      {/* Companies Grid Table */}
      <div className="overflow-hidden rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
        {filteredCompanies.length === 0 ? (
          <div className="py-16 text-center text-xs text-gray-400 flex flex-col items-center justify-center space-y-2">
            <Building2 className="h-10 w-10 text-gray-300" />
            <p className="font-semibold text-gray-500">No companies found</p>
            <p className="text-[11px] text-gray-400">Adjust your criteria or register a new corporate entity.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/45">
                  <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">Code / Name</th>
                  <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">Address</th>
                  <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">Contact Person</th>
                  <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">Email & Phone</th>
                  <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">Status</th>
                  <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-gray-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredCompanies.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 text-xs">
                    <td className="p-3">
                      <div className="flex items-center space-x-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-500 font-bold">
                          {c.code}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-950 dark:text-gray-100">{c.name}</p>
                          <span className="text-[10px] text-gray-400">Reg date: {c.dateCreated}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 max-w-xs truncate text-gray-500 dark:text-gray-400" title={c.address}>
                      {c.address || 'Not Provided'}
                    </td>
                    <td className="p-3 font-medium text-gray-700 dark:text-gray-300">{c.contactPerson}</td>
                    <td className="p-3">
                      <p className="text-gray-700 dark:text-gray-300 font-semibold">{c.email}</p>
                      <p className="text-[10px] text-gray-400">{c.phone}</p>
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center rounded-sm px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          c.status === 'Active'
                            ? 'bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400'
                            : 'bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        {isAdminOrAuditor ? (
                          <>
                            <button
                              onClick={() => openEditModal(c)}
                              className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-500 transition-all"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(c.id)}
                              className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-red-500 transition-all"
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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Delete Dialog */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-sm w-full p-5 border border-gray-100 dark:border-gray-800 shadow-xl space-y-4 animate-scale-up">
            <h3 className="text-sm font-bold text-gray-950 dark:text-gray-50">Confirm Archival</h3>
            <p className="text-xs text-gray-500">
              Are you sure you want to archive this company? This is an irreversible operation in audit registries.
            </p>
            <div className="flex items-center justify-end space-x-2">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-3 py-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all"
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
          <div className="bg-white dark:bg-gray-900 h-full max-w-md w-full p-6 border-l border-gray-100 dark:border-gray-800 shadow-2xl flex flex-col justify-between animate-slide-left">
            <div>
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3 mb-4">
                <h2 className="text-sm font-extrabold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                  {editingCompany ? 'Edit Corporate Profile' : 'Register Corporate Entity'}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label htmlFor="company-name" className="block text-[11px] font-bold text-gray-500 uppercase">Company Name *</label>
                  <input
                    id="company-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Acme Industries Ltd"
                    className="block w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="company-code" className="block text-[11px] font-bold text-gray-500 uppercase">Company Code *</label>
                  <input
                    id="company-code"
                    type="text"
                    required
                    maxLength={5}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. ACM"
                    className="block w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-xs uppercase focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="company-address" className="block text-[11px] font-bold text-gray-500 uppercase">Registered Address</label>
                  <textarea
                    id="company-address"
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="St. Avenue Corporate Hub..."
                    className="block w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label htmlFor="company-contact" className="block text-[11px] font-bold text-gray-500 uppercase">Contact Person</label>
                    <input
                      id="company-contact"
                      type="text"
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      placeholder="David Wallace"
                      className="block w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-xs focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="company-status" className="block text-[11px] font-bold text-gray-500 uppercase">Status</label>
                    <select
                      id="company-status"
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="block w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-xs focus:border-blue-500"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label htmlFor="company-email" className="block text-[11px] font-bold text-gray-500 uppercase">Email Address</label>
                    <input
                      id="company-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="compliance@acme.com"
                      className="block w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-xs focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="company-phone" className="block text-[11px] font-bold text-gray-500 uppercase">Phone Line</label>
                    <input
                      id="company-phone"
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 002-3392"
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
                {editingCompany ? 'Save Changes' : 'Register Profile'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
