import React, { useState, useEffect } from 'react';
import { CheckSquare, Search, Plus, Trash2, Edit, X, Download } from 'lucide-react';
import { Database } from '../services/db';
import { CorrectiveAction, Finding, Employee, Department, CorrectiveActionStatus, PriorityLevel, UserRole } from '../types';

interface CorrectiveActionsProps {
  currentRole: UserRole;
  addToast: (msg: string, type: 'success' | 'danger' | 'warning' | 'info') => void;
}

export default function CorrectiveActions({ currentRole, addToast }: CorrectiveActionsProps) {
  const [actions, setActions] = useState<CorrectiveAction[]>([]);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAction, setEditingAction] = useState<CorrectiveAction | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Form states
  const [actionNumber, setActionNumber] = useState('');
  const [findingId, setFindingId] = useState('');
  const [assignedToId, setAssignedToId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('Medium');
  const [progress, setProgress] = useState(0);
  const [completionDate, setCompletionDate] = useState('');
  const [verifiedById, setVerifiedById] = useState('');
  const [status, setStatus] = useState<CorrectiveActionStatus>('Pending');
  const [evidenceName, setEvidenceName] = useState('');

  useEffect(() => {
    setActions(Database.getCorrectiveActions());
    setFindings(Database.getFindings());
    setEmployees(Database.getEmployees());
    setDepartments(Database.getDepartments());
  }, []);

  const isAuditorAdminOrManager = currentRole === 'Administrator' || currentRole === 'Internal Auditor' || currentRole === 'Manager';

  const openAddModal = () => {
    setEditingAction(null);
    setActionNumber(`CAP-2026-${Math.floor(100 + Math.random() * 900)}`);
    setFindingId(findings[0]?.id || '');
    setAssignedToId(employees[0]?.id || '');
    setDepartmentId(departments[0]?.id || '');
    setDueDate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setPriority('Medium');
    setProgress(0);
    setCompletionDate('');
    setVerifiedById('');
    setStatus('Pending');
    setEvidenceName('');
    setIsModalOpen(true);
  };

  const openEditModal = (a: CorrectiveAction) => {
    setEditingAction(a);
    setActionNumber(a.actionNumber);
    setFindingId(a.findingId);
    setAssignedToId(a.assignedToId);
    setDepartmentId(a.departmentId);
    setDueDate(a.dueDate);
    setPriority(a.priority);
    setProgress(a.progress);
    setCompletionDate(a.completionDate || '');
    setVerifiedById(a.verifiedById || '');
    setStatus(a.status);
    setEvidenceName(a.evidenceName || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionNumber.trim()) {
      addToast('Please input an action reference number.', 'warning');
      return;
    }

    // Determine status automatically if progress is 100
    let finalStatus = status;
    if (progress === 100 && status === 'In Progress') {
      finalStatus = 'Under Review';
    }

    const newAction: CorrectiveAction = {
      id: editingAction ? editingAction.id : `ca-${Date.now()}`,
      actionNumber,
      findingId,
      assignedToId,
      departmentId,
      dueDate,
      priority,
      progress: Number(progress),
      completionDate: completionDate || undefined,
      verifiedById: verifiedById || undefined,
      status: finalStatus,
      evidenceName: evidenceName || undefined
    };

    Database.saveCorrectiveAction(newAction);
    setActions(Database.getCorrectiveActions());
    setIsModalOpen(false);
    addToast(
      editingAction ? `Successfully updated CAP ${actionNumber}` : `Successfully logged CAP ${actionNumber}`,
      'success'
    );
  };

  const handleDelete = (id: string) => {
    const success = Database.deleteCorrectiveAction(id);
    if (success) {
      setActions(Database.getCorrectiveActions());
      setConfirmDeleteId(null);
      addToast('Corrective Action removed.', 'success');
    }
  };

  const handleExportCSV = () => {
    if (actions.length === 0) {
      addToast('No records available.', 'warning');
      return;
    }
    const headers = 'ID,CAP Number,Finding Ref,Assigned Employee,Department,Due Date,Priority,Progress,Status\n';
    const rows = actions
      .map((a) => {
        const fNum = findings.find(f => f.id === a.findingId)?.findingNumber || 'FND-Unknown';
        const emp = employees.find(e => e.id === a.assignedToId)?.fullName || 'Unknown';
        const deptName = departments.find(d => d.id === a.departmentId)?.name || 'Unknown';
        return `"${a.id}","${a.actionNumber}","${fNum}","${emp}","${deptName}","${a.dueDate}","${a.priority}","${a.progress}%","${a.status}"`;
      })
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = `Corrective_Actions_Audit_Export_${new Date().toISOString().split('T')[0]}.csv`;
    downloadLink.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredActions = actions.filter((a) => {
    const fNum = findings.find(f => f.id === a.findingId)?.findingNumber || '';
    const emp = employees.find(e => e.id === a.assignedToId)?.fullName || '';
    const matchesSearch =
      a.actionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fNum.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusStyle = (s: CorrectiveActionStatus) => {
    switch (s) {
      case 'Verified':
        return 'bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400';
      case 'Under Review':
        return 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400';
      case 'In Progress':
        return 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400';
      case 'Overdue':
        return 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
            Corrective Action Plan (CAP) Tracking
          </h1>
          <p className="text-xs text-gray-400">Log standard corrective plans, follow up resolutions, and track audit verifications.</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-2.5">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center space-x-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>
          {isAuditorAdminOrManager && (
            <button
              onClick={openAddModal}
              className="inline-flex items-center space-x-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Log Action Plan</span>
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
            id="cap-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search CAP #, finding #, owner..."
            className="block w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40 py-2 pl-9 pr-3 text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:bg-white"
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-semibold text-gray-400">Status:</span>
          {(['All', 'Pending', 'In Progress', 'Under Review', 'Verified', 'Overdue'] as const).map((st) => (
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

      {/* Grid of Action Plans */}
      <div className="overflow-hidden rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
        {filteredActions.length === 0 ? (
          <div className="py-16 text-center text-xs text-gray-400 flex flex-col items-center justify-center space-y-2">
            <CheckSquare className="h-10 w-10 text-gray-300" />
            <p className="font-semibold text-gray-500">No corrective actions logged</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b bg-gray-50 dark:bg-gray-900/45 text-gray-500">
                  <th className="p-3 text-[10px] font-bold uppercase tracking-wider">CAP Number</th>
                  <th className="p-3 text-[10px] font-bold uppercase tracking-wider">Finding details</th>
                  <th className="p-3 text-[10px] font-bold uppercase tracking-wider">Assigned Owner</th>
                  <th className="p-3 text-[10px] font-bold uppercase tracking-wider">Due Date</th>
                  <th className="p-3 text-[10px] font-bold uppercase tracking-wider">Progress</th>
                  <th className="p-3 text-[10px] font-bold uppercase tracking-wider">Status</th>
                  <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y text-xs">
                {filteredActions.map((a) => {
                  const finding = findings.find(f => f.id === a.findingId);
                  const employee = employees.find(e => e.id === a.assignedToId);
                  return (
                    <tr key={a.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-850/10">
                      <td className="p-3">
                        <span className="font-mono font-bold bg-amber-50 dark:bg-amber-950/25 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded-sm">
                          {a.actionNumber}
                        </span>
                      </td>
                      <td className="p-3">
                        <p className="font-semibold text-gray-800 dark:text-gray-200">
                          {finding ? finding.findingNumber : 'FND-Manual'}
                        </p>
                        <p className="text-[10px] text-gray-400 truncate max-w-xs">{finding?.description || 'Operational standard error correction.'}</p>
                      </td>
                      <td className="p-3">
                        <p className="font-semibold text-gray-800 dark:text-gray-200">{employee?.fullName || 'Manager Assigned'}</p>
                        <p className="text-[9px] text-gray-400 uppercase">{departments.find(d => d.id === a.departmentId)?.name || 'Operations'}</p>
                      </td>
                      <td className="p-3">
                        <p className="font-semibold text-gray-800 dark:text-gray-200">{a.dueDate}</p>
                        <span className={`text-[9px] font-semibold ${a.priority === 'High' ? 'text-red-500' : 'text-gray-400'}`}>
                          {a.priority} Priority
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center space-x-2 w-28">
                          <div className="w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${a.progress}%` }} />
                          </div>
                          <span className="font-mono text-[10px] text-gray-500">{a.progress}%</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex items-center rounded-sm px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(a.status)}`}>
                          {a.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {isAuditorAdminOrManager ? (
                            <>
                              <button
                                onClick={() => openEditModal(a)}
                                className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-blue-500 transition-colors"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(a.id)}
                                className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-500 transition-colors"
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

      {/* Confirmation delete */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-5 max-w-sm w-full shadow-lg border">
            <h3 className="text-sm font-bold">Delete Corrective Plan</h3>
            <p className="text-xs text-gray-500">Are you sure you want to delete this Corrective Action Plan (CAP) tracking?</p>
            <div className="flex justify-end space-x-2 mt-4">
              <button onClick={() => setConfirmDeleteId(null)} className="px-3 py-1.5 text-xs text-gray-600">Cancel</button>
              <button onClick={() => handleDelete(confirmDeleteId)} className="px-3 py-1.5 text-xs text-white bg-red-600">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Slide-over Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/35">
          <div className="bg-white dark:bg-gray-900 h-full max-w-lg w-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between border-b pb-3 mb-4">
                <h2 className="text-sm font-extrabold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                  {editingAction ? 'Edit CAP Track' : 'Create Corrective Action Plan'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400"><X className="h-4 w-4" /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label htmlFor="cap-num" className="block text-[11px] font-bold text-gray-500 uppercase">CAP Action Number *</label>
                    <input id="cap-num" type="text" required value={actionNumber} onChange={(e) => setActionNumber(e.target.value)} className="block w-full rounded-lg border px-3 py-1.5 text-xs" />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="cap-status" className="block text-[11px] font-bold text-gray-500 uppercase">Status</label>
                    <select id="cap-status" value={status} onChange={(e) => setStatus(e.target.value as any)} className="block w-full rounded-lg border px-3 py-1.5 text-xs">
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Verified">Verified (Signed off)</option>
                      <option value="Overdue">Overdue</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label htmlFor="cap-finding" className="block text-[11px] font-bold text-gray-500 uppercase">Associated Audit Finding</label>
                    <select id="cap-finding" value={findingId} onChange={(e) => setFindingId(e.target.value)} className="block w-full rounded-lg border px-3 py-1.5 text-xs">
                      {findings.map(f => <option key={f.id} value={f.id}>{f.findingNumber} - {f.category}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="cap-dept" className="block text-[11px] font-bold text-gray-500 uppercase">Remediation Department</label>
                    <select id="cap-dept" value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} className="block w-full rounded-lg border px-3 py-1.5 text-xs">
                      {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label htmlFor="cap-owner" className="block text-[11px] font-bold text-gray-500 uppercase">Assigned Owner</label>
                    <select id="cap-owner" value={assignedToId} onChange={(e) => setAssignedToId(e.target.value)} className="block w-full rounded-lg border px-3 py-1.5 text-xs">
                      {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.fullName}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="cap-priority" className="block text-[11px] font-bold text-gray-500 uppercase">Priority</label>
                    <select id="cap-priority" value={priority} onChange={(e) => setPriority(e.target.value as any)} className="block w-full rounded-lg border px-3 py-1.5 text-xs">
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="cap-duedate" className="block text-[11px] font-bold text-gray-500 uppercase">Due Date *</label>
                    <input id="cap-duedate" type="date" required value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="block w-full rounded-lg border px-2 py-1.5 text-xs" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 border border-gray-100 p-3 bg-gray-50/50 rounded-xl">
                  <div className="space-y-1">
                    <label htmlFor="cap-progress" className="block text-[11px] font-bold text-gray-500 uppercase">Completion Progress (%)</label>
                    <input id="cap-progress" type="range" min={0} max={100} value={progress} onChange={(e) => setProgress(Number(e.target.value))} className="w-full mt-2 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                    <span className="block text-right font-mono text-[11px] font-bold text-blue-600 mt-1">{progress}% Complete</span>
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="cap-compdate" className="block text-[11px] font-bold text-gray-500 uppercase">Completion Date</label>
                    <input id="cap-compdate" type="date" value={completionDate} onChange={(e) => setCompletionDate(e.target.value)} className="block w-full rounded-lg border px-2 py-1.5 text-xs" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label htmlFor="cap-verifier" className="block text-[11px] font-bold text-gray-500 uppercase">Verified / Closed By</label>
                    <select id="cap-verifier" value={verifiedById} onChange={(e) => setVerifiedById(e.target.value)} className="block w-full rounded-lg border px-3 py-1.5 text-xs">
                      <option value="">-- Unverified --</option>
                      {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.fullName}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="cap-evidence" className="block text-[11px] font-bold text-gray-500 uppercase">Evidence Document Name</label>
                    <input id="cap-evidence" type="text" value={evidenceName} onChange={(e) => setEvidenceName(e.target.value)} placeholder="safe_confirmation_log.pdf" className="block w-full rounded-lg border px-3 py-1.5 text-xs font-mono" />
                  </div>
                </div>
              </form>
            </div>

            <div className="border-t pt-4 flex justify-end space-x-2 mt-4">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs text-gray-600">Cancel</button>
              <button type="button" onClick={handleSubmit} className="px-4 py-2 text-xs text-white bg-blue-600 rounded-lg">Save Plan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
