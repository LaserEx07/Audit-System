import React, { useState, useEffect } from 'react';
import { AlertCircle, Search, Trash2, Edit, X, Download, FileSpreadsheet, ShieldCheck, PenTool } from 'lucide-react';
import { Database } from '../services/db';
import { NCR, Finding, Department, Employee, UserRole } from '../types';

interface NcrReportsProps {
  currentRole: UserRole;
  addToast: (msg: string, type: 'success' | 'danger' | 'warning' | 'info') => void;
}

export default function NcrReports({ currentRole, addToast }: NcrReportsProps) {
  const [ncrs, setNcrs] = useState<NCR[]>([]);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingNcr, setViewingNcr] = useState<NCR | null>(null);
  const [editingNcr, setEditingNcr] = useState<NCR | null>(null);

  // Form states
  const [ncrNumber, setNcrNumber] = useState('');
  const [findingId, setFindingId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [description, setDescription] = useState('');
  const [rootCause, setRootCause] = useState('');
  const [correctiveAction, setCorrectiveAction] = useState('');
  const [preventiveAction, setPreventiveAction] = useState('');
  const [closedById, setClosedById] = useState('');
  const [dateClosed, setDateClosed] = useState('');
  const [status, setStatus] = useState<'Open' | 'Closed'>('Open');
  const [auditorSignature, setAuditorSignature] = useState('');

  useEffect(() => {
    setNcrs(Database.getNCRs());
    setFindings(Database.getFindings());
    setDepartments(Database.getDepartments());
    setEmployees(Database.getEmployees());
  }, []);

  const isAuditorOrAdmin = currentRole === 'Administrator' || currentRole === 'Internal Auditor';

  const openAddModal = () => {
    setEditingNcr(null);
    setNcrNumber(`NCR-2026-${Math.floor(100 + Math.random() * 900)}`);
    setFindingId('');
    setDepartmentId('');
    setDescription('');
    setRootCause('');
    setCorrectiveAction('');
    setPreventiveAction('');
    setClosedById('');
    setDateClosed('');
    setStatus('Open');
    setAuditorSignature('');
    setIsModalOpen(true);
  };

  const openEditModal = (n: NCR) => {
    setEditingNcr(n);
    setNcrNumber(n.ncrNumber);
    setFindingId(n.findingId);
    setDepartmentId(n.departmentId);
    setDescription(n.description);
    setRootCause(n.rootCause || '');
    setCorrectiveAction(n.correctiveAction || '');
    setPreventiveAction(n.preventiveAction || '');
    setClosedById(n.closedById || '');
    setDateClosed(n.dateClosed || '');
    setStatus(n.status);
    setAuditorSignature('');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!findingId || !departmentId || !description.trim()) {
      addToast('Please select a Finding, Department, and input Description.', 'warning');
      return;
    }

    if (status === 'Closed' && !auditorSignature.trim()) {
      addToast('An auditor signature description is required to close out an official NCR.', 'warning');
      return;
    }

    const newNcr: NCR = {
      id: editingNcr ? editingNcr.id : `ncr-${Date.now()}`,
      ncrNumber,
      findingId,
      departmentId,
      description: description.trim(),
      rootCause: rootCause.trim(),
      correctiveAction: correctiveAction.trim(),
      preventiveAction: preventiveAction.trim(),
      closedById: closedById || undefined,
      dateClosed: dateClosed || undefined,
      status
    };

    Database.saveNCR(newNcr);
    setNcrs(Database.getNCRs());
    setIsModalOpen(false);
    addToast(
      editingNcr ? `Successfully compiled NCR ${ncrNumber}` : `Successfully issued official NCR ${ncrNumber}`,
      'success'
    );
  };

  const handleDelete = (id: string) => {
    const success = Database.deleteNCR(id);
    if (success) {
      setNcrs(Database.getNCRs());
      addToast('NCR record deleted from repository.', 'success');
    }
  };

  const handleExportCSV = () => {
    if (ncrs.length === 0) {
      addToast('No NCR reports available to export.', 'warning');
      return;
    }
    const headers = 'ID,NCR Number,Finding,Department,Description,Preventive Action,Status,Closed Date\n';
    const rows = ncrs
      .map((n) => {
        const findRef = findings.find(f => f.id === n.findingId)?.findingNumber || 'Manual';
        const dept = departments.find(d => d.id === n.departmentId)?.name || 'Unknown';
        return `"${n.id}","${n.ncrNumber}","${findRef}","${dept}","${n.description.replace(/"/g, '""')}","${n.preventiveAction?.replace(/"/g, '""') || ''}","${n.status}","${n.dateClosed || 'Open'}"`;
      })
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `NCR_Log_Report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
    addToast('Non-Conformance Report log exported as CSV.', 'success');
  };

  const filteredNcrs = ncrs.filter((n) => {
    const findRef = findings.find(f => f.id === n.findingId);
    const matchesSearch =
      n.ncrNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (findRef && findRef.findingNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'All' || n.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
            Non-Conformance Reports (NCR)
          </h1>
          <p className="text-xs text-gray-400">Formalize and sign regulatory deviations under ISO, compliance, or financial directives.</p>
        </div>
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center space-x-1.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 shadow-2xs hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
          {isAuditorOrAdmin && (
            <button
              onClick={openAddModal}
              className="inline-flex items-center space-x-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow-xs"
            >
              <span>Draft NCR</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter panel */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
        <div className="relative w-full sm:max-w-xs">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            id="ncr-search-box"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search NCR numbers, findings..."
            className="block w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40 py-2 pl-9 pr-3 text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:bg-white focus:outline-hidden"
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-gray-400">Status:</span>
          {(['All', 'Open', 'Closed'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                statusFilter === st
                  ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-semibold'
                  : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* NCR Grid Listing */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredNcrs.map((n) => {
          const findRef = findings.find(f => f.id === n.findingId);
          const dept = departments.find(d => d.id === n.departmentId);

          return (
            <div
              key={n.id}
              className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-black text-gray-900 dark:text-gray-100">
                    {n.ncrNumber}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-sm px-2 py-0.5 text-[10px] font-bold font-mono uppercase ${
                      n.status === 'Closed'
                        ? 'bg-green-50 text-green-700 border border-green-25'
                        : 'bg-red-50 text-red-700 border border-red-25'
                    }`}
                  >
                    {n.status}
                  </span>
                </div>

                <div className="text-xs space-y-1.5">
                  <p className="text-gray-400">
                    Department: <strong className="text-gray-800 dark:text-gray-250 font-bold">{dept?.name || 'Manual'}</strong>
                  </p>
                  <p className="text-gray-400">
                    Associated Finding: <strong className="text-gray-800 dark:text-gray-250 font-mono font-bold">{findRef?.findingNumber || 'N/A'}</strong>
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 leading-normal line-clamp-3 italic">
                    "{n.description}"
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-55 dark:border-gray-800 pt-3 flex items-center justify-between text-[11px] font-semibold">
                <button
                  onClick={() => setViewingNcr(n)}
                  className="text-blue-600 hover:underline"
                >
                  View PDF Slip
                </button>
                <div className="flex items-center space-x-1">
                  {isAuditorOrAdmin && (
                    <>
                      <button
                        onClick={() => openEditModal(n)}
                        className="p-1 rounded hover:bg-gray-50 text-gray-500 hover:text-blue-600"
                        title="Update details"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(n.id)}
                        className="p-1 rounded hover:bg-gray-50 text-gray-400 hover:text-red-500"
                        title="Delete NCR"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* PDF View Slip Modal */}
      {viewingNcr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-2xl w-full p-6 border border-gray-100 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-sm font-black text-gray-900 dark:text-gray-50 uppercase tracking-widest">Official ISO NCR Printout</h3>
                <p className="text-[10px] text-gray-400 font-mono">ID: {viewingNcr.id}</p>
              </div>
              <button onClick={() => setViewingNcr(null)} className="text-gray-400 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="border border-gray-200 p-6 rounded-lg text-xs space-y-4 font-sans bg-gray-50/20 dark:bg-gray-850/30">
              <div className="flex justify-between items-start border-b pb-4">
                <div className="space-y-1">
                  <h4 className="text-base font-black text-blue-600">{viewingNcr.ncrNumber}</h4>
                  <p className="text-gray-500">Corporate Internal Audit Division</p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-0.5 rounded-sm font-mono text-[10px] font-bold ${viewingNcr.status === 'Closed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {viewingNcr.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-gray-600">
                <div>
                  <p className="font-bold text-gray-400 uppercase text-[9px]">Department</p>
                  <p className="text-gray-900 font-semibold mt-0.5">{departments.find(d => d.id === viewingNcr.departmentId)?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="font-bold text-gray-400 uppercase text-[9px]">Reference Finding</p>
                  <p className="text-gray-900 font-mono font-semibold mt-0.5">{findings.find(f => f.id === viewingNcr.findingId)?.findingNumber || 'Manual entry'}</p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="font-bold text-gray-400 uppercase text-[9px]">Description of Non-Compliance</p>
                <p className="bg-white dark:bg-gray-800 p-2.5 rounded border italic text-gray-700 leading-normal">
                  "{viewingNcr.description}"
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-bold text-gray-400 uppercase text-[9px]">Root Cause</p>
                  <p className="mt-0.5 text-gray-800 font-medium">{viewingNcr.rootCause || 'Under investigation.'}</p>
                </div>
                <div>
                  <p className="font-bold text-gray-400 uppercase text-[9px]">Preventive Action Plan</p>
                  <p className="mt-0.5 text-gray-800 font-medium">{viewingNcr.preventiveAction || 'No preventive controls specified yet.'}</p>
                </div>
              </div>

              {viewingNcr.status === 'Closed' && (
                <div className="border-t pt-4 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-400 uppercase text-[9px]">Closed Out By (ID)</p>
                    <p className="mt-0.5 text-gray-900 font-bold">{employees.find(e => e.id === viewingNcr.closedById)?.fullName || 'Lead Auditor'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-400 uppercase text-[9px]">Digital Sign-off Timestamp</p>
                    <p className="mt-0.5 text-green-600 font-bold font-mono">{viewingNcr.dateClosed || 'Verified Closeout'}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  addToast('Exporting printable system snapshot...', 'info');
                  window.print();
                }}
                className="px-4 py-2 text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
              >
                Download PDF
              </button>
              <button
                onClick={() => setViewingNcr(null)}
                className="px-4 py-2 text-xs border rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit NCR Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full p-6 border border-gray-100 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                {editingNcr ? `Edit Non-Conformance Report` : `Issue New Non-Conformance Report (NCR)`}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="form-ncr-number" className="block text-[11px] font-bold text-gray-500 uppercase">NCR Number</label>
                  <input
                    id="form-ncr-number"
                    type="text"
                    disabled
                    value={ncrNumber}
                    className="block w-full border bg-gray-50 px-3 py-1.5 rounded-lg text-xs font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="form-finding-id" className="block text-[11px] font-bold text-gray-500 uppercase">Source Finding *</label>
                  <select
                    id="form-finding-id"
                    required
                    value={findingId}
                    onChange={(e) => setFindingId(e.target.value)}
                    className="block w-full border px-3 py-1.5 rounded-lg text-xs"
                  >
                    <option value="">-- Choose Finding --</option>
                    {findings.map(f => (
                      <option key={f.id} value={f.id}>{f.findingNumber} - {f.category}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="form-dept-id" className="block text-[11px] font-bold text-gray-500 uppercase">Target Department *</label>
                  <select
                    id="form-dept-id"
                    required
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="block w-full border px-3 py-1.5 rounded-lg text-xs"
                  >
                    <option value="">-- Choose Department --</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label htmlFor="form-status" className="block text-[11px] font-bold text-gray-500 uppercase">Status</label>
                  <select
                    id="form-status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="block w-full border px-3 py-1.5 rounded-lg text-xs"
                  >
                    <option value="Open">Open (In investigation)</option>
                    <option value="Closed">Closed (Signed off)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="form-description" className="block text-[11px] font-bold text-gray-500 uppercase">Non-Compliance Description *</label>
                <textarea
                  id="form-description"
                  required
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed observations of deviations..."
                  className="block w-full border px-3 py-1.5 rounded-lg text-xs"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="form-root-cause" className="block text-[11px] font-bold text-gray-500 uppercase">Root Cause Analysis</label>
                <input
                  id="form-root-cause"
                  type="text"
                  value={rootCause}
                  onChange={(e) => setRootCause(e.target.value)}
                  placeholder="Why did this deviation occur?"
                  className="block w-full border px-3 py-1.5 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="form-corrective" className="block text-[11px] font-bold text-gray-500 uppercase">Corrective Actions</label>
                  <input
                    id="form-corrective"
                    type="text"
                    value={correctiveAction}
                    onChange={(e) => setCorrectiveAction(e.target.value)}
                    placeholder="Short term remedy"
                    className="block w-full border px-3 py-1.5 rounded-lg text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="form-preventive" className="block text-[11px] font-bold text-gray-500 uppercase">Preventive Actions</label>
                  <input
                    id="form-preventive"
                    type="text"
                    value={preventiveAction}
                    onChange={(e) => setPreventiveAction(e.target.value)}
                    placeholder="Controls to prevent recurrence"
                    className="block w-full border px-3 py-1.5 rounded-lg text-xs"
                  />
                </div>
              </div>

              {status === 'Closed' && (
                <div className="grid grid-cols-2 gap-3 bg-green-50/40 p-3 rounded-lg border border-green-100">
                  <div className="space-y-1">
                    <label htmlFor="form-closed-by" className="block text-[10px] font-bold text-green-700 uppercase">Signed Off By</label>
                    <select
                      id="form-closed-by"
                      value={closedById}
                      onChange={(e) => setClosedById(e.target.value)}
                      className="block w-full border bg-white px-2 py-1.5 rounded text-xs"
                    >
                      <option value="">-- Choose Staff --</option>
                      {employees.map(e => (
                        <option key={e.id} value={e.id}>{e.fullName}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="form-date-closed" className="block text-[10px] font-bold text-green-700 uppercase">Date Closed</label>
                    <input
                      id="form-date-closed"
                      type="date"
                      value={dateClosed}
                      onChange={(e) => setDateClosed(e.target.value)}
                      className="block w-full border bg-white px-2 py-1 text-xs"
                    />
                  </div>
                  <div className="col-span-2 space-y-1 mt-1">
                    <label htmlFor="form-auditor-sig" className="block text-[10px] font-bold text-green-700 uppercase">Lead Auditor Digital Sign-off *</label>
                    <input
                      id="form-auditor-sig"
                      type="text"
                      required
                      value={auditorSignature}
                      onChange={(e) => setAuditorSignature(e.target.value)}
                      placeholder="e.g. Approved and closed by Alice Smith"
                      className="block w-full border bg-white px-2 py-1 text-xs font-mono"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold shadow-xs"
                >
                  Save NCR Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
