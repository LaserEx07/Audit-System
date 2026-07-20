import React, { useState, useEffect } from 'react';
import { AlertOctagon, Search, Plus, Trash2, Edit, X, Download, ShieldAlert } from 'lucide-react';
import { Database } from '../services/db';
import { Finding, AuditPlan, Employee, FindingSeverity, FindingStatus, RiskLevel, UserRole } from '../types';

interface AuditFindingsProps {
  currentRole: UserRole;
  addToast: (msg: string, type: 'success' | 'danger' | 'warning' | 'info') => void;
}

export default function AuditFindings({ currentRole, addToast }: AuditFindingsProps) {
  const [findings, setFindings] = useState<Finding[]>([]);
  const [plans, setPlans] = useState<AuditPlan[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('All');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFinding, setEditingFinding] = useState<Finding | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Form states
  const [findingNumber, setFindingNumber] = useState('');
  const [auditPlanId, setAuditPlanId] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [evidenceName, setEvidenceName] = useState('');
  const [rootCause, setRootCause] = useState('');
  const [impact, setImpact] = useState('');
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('Medium');
  const [severity, setSeverity] = useState<FindingSeverity>('Major');
  const [recommendation, setRecommendation] = useState('');
  const [auditorId, setAuditorId] = useState('');
  const [status, setStatus] = useState<FindingStatus>('Open');

  useEffect(() => {
    setFindings(Database.getFindings());
    setPlans(Database.getAuditPlans());
    setEmployees(Database.getEmployees());
  }, []);

  const isAuditorOrAdmin = currentRole === 'Administrator' || currentRole === 'Internal Auditor';

  const openAddModal = () => {
    setEditingFinding(null);
    setFindingNumber(`FND-2026-${Math.floor(100 + Math.random() * 900)}`);
    setAuditPlanId(plans[0]?.id || '');
    setCategory('Operational Inefficiency');
    setDescription('');
    setEvidenceName('');
    setRootCause('');
    setImpact('');
    setRiskLevel('Medium');
    setSeverity('Major');
    setRecommendation('');
    setAuditorId(employees[0]?.id || '');
    setStatus('Open');
    setIsModalOpen(true);
  };

  const openEditModal = (f: Finding) => {
    setEditingFinding(f);
    setFindingNumber(f.findingNumber);
    setAuditPlanId(f.auditPlanId);
    setCategory(f.category);
    setDescription(f.description);
    setEvidenceName(f.evidenceName || '');
    setRootCause(f.rootCause);
    setImpact(f.impact);
    setRiskLevel(f.riskLevel);
    setSeverity(f.severity);
    setRecommendation(f.recommendation);
    setAuditorId(f.auditorId);
    setStatus(f.status);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !category.trim()) {
      addToast('Please fill out Category and Description.', 'warning');
      return;
    }

    const newFinding: Finding = {
      id: editingFinding ? editingFinding.id : `find-${Date.now()}`,
      findingNumber,
      auditPlanId,
      category,
      description: description.trim(),
      evidenceName: evidenceName.trim() || undefined,
      rootCause: rootCause.trim(),
      impact: impact.trim(),
      riskLevel,
      severity,
      recommendation: recommendation.trim(),
      auditorId,
      date: editingFinding ? editingFinding.date : new Date().toISOString().split('T')[0],
      status
    };

    Database.saveFinding(newFinding);
    setFindings(Database.getFindings());
    setIsModalOpen(false);
    addToast(
      editingFinding ? `Successfully updated ${findingNumber}` : `Successfully logged finding ${findingNumber}`,
      'success'
    );
  };

  const handleDelete = (id: string) => {
    const success = Database.deleteFinding(id);
    if (success) {
      setFindings(Database.getFindings());
      setConfirmDeleteId(null);
      addToast('Finding record successfully removed.', 'success');
    }
  };

  const handleExportCSV = () => {
    if (findings.length === 0) {
      addToast('No findings available to export.', 'warning');
      return;
    }
    const headers = 'ID,Finding Number,Audit Plan,Category,Description,Severity,Risk,Root Cause,Auditor,Status\n';
    const rows = findings
      .map((f) => {
        const auditNum = plans.find(p => p.id === f.auditPlanId)?.auditNumber || 'AUD-Unknown';
        const audName = employees.find(e => e.id === f.auditorId)?.fullName || 'Unknown';
        return `"${f.id}","${f.findingNumber}","${auditNum}","${f.category}","${f.description.replace(/"/g, '""')}","${f.severity}","${f.riskLevel}","${f.rootCause.replace(/"/g, '""')}","${audName}","${f.status}"`;
      })
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Audit_Findings_Export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredFindings = findings.filter((f) => {
    const matchesSearch =
      f.findingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSev = severityFilter === 'All' || f.severity === severityFilter;
    return matchesSearch && matchesSev;
  });

  const getSeverityStyle = (s: FindingSeverity) => {
    switch (s) {
      case 'Critical':
        return 'bg-red-100 text-red-700 font-bold dark:bg-red-950 dark:text-red-400';
      case 'Major':
        return 'bg-amber-100 text-amber-700 font-bold dark:bg-amber-950 dark:text-amber-400';
      default:
        return 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
            Audit Findings & Non-Conformances
          </h1>
          <p className="text-xs text-gray-400">Review non-conforming conditions, log root-causes, and direct mitigation plans.</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-2.5">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center space-x-1.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 shadow-xs hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>
          {isAuditorOrAdmin && (
            <button
              onClick={openAddModal}
              className="inline-flex items-center space-x-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Log Finding</span>
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
            id="finding-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search finding #, description..."
            className="block w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40 py-2 pl-9 pr-3 text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:bg-white focus:outline-hidden"
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-gray-400">Severity:</span>
          {(['All', 'Critical', 'Major', 'Minor'] as const).map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                severityFilter === sev
                  ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-semibold'
                  : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Findings Table List */}
      <div className="overflow-hidden rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
        {filteredFindings.length === 0 ? (
          <div className="py-16 text-center text-xs text-gray-400 flex flex-col items-center justify-center space-y-2">
            <AlertOctagon className="h-10 w-10 text-gray-300" />
            <p className="font-semibold text-gray-500">No findings registered</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/45">
                  <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">Finding Number</th>
                  <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">Associated Scope</th>
                  <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">Severity / Risk</th>
                  <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">Description</th>
                  <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">Assessor</th>
                  <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">Status</th>
                  <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-gray-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredFindings.map((f) => {
                  const plan = plans.find(p => p.id === f.auditPlanId);
                  const auditor = employees.find(e => e.id === f.auditorId);
                  return (
                    <tr key={f.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 text-xs">
                      <td className="p-3">
                        <span className="font-mono font-bold text-[10px] bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded-sm">
                          {f.findingNumber}
                        </span>
                      </td>
                      <td className="p-3 font-semibold text-gray-700 dark:text-gray-300">
                        {plan ? `${plan.auditNumber} - ${plan.title.slice(0, 20)}...` : 'General Audit'}
                      </td>
                      <td className="p-3">
                        <span className={`inline-block rounded-xs px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider ${getSeverityStyle(f.severity)}`}>
                          {f.severity}
                        </span>
                        <p className="text-[10px] text-gray-400 mt-0.5">{f.riskLevel} Risk rating</p>
                      </td>
                      <td className="p-3 max-w-xs truncate text-gray-500 dark:text-gray-400" title={f.description}>
                        <p className="font-bold text-gray-800 dark:text-gray-200">{f.category}</p>
                        <span>{f.description}</span>
                      </td>
                      <td className="p-3 text-gray-700 dark:text-gray-300 font-medium">
                        {auditor?.fullName || 'Alice Auditor'}
                      </td>
                      <td className="p-3">
                        <span
                          className={`inline-flex items-center rounded-sm px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            f.status === 'Open'
                              ? 'bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400'
                              : f.status === 'In Progress'
                              ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400'
                              : 'bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400'
                          }`}
                        >
                          {f.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {isAuditorOrAdmin ? (
                            <>
                              <button
                                onClick={() => openEditModal(f)}
                                className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-500 transition-colors"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(f.id)}
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

      {/* Confirmation delete */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-sm w-full p-5 shadow-xl space-y-4 border">
            <h3 className="text-sm font-bold text-gray-950">Remove Finding</h3>
            <p className="text-xs text-gray-500">Are you sure you want to delete this non-conformity finding?</p>
            <div className="flex justify-end space-x-2">
              <button onClick={() => setConfirmDeleteId(null)} className="px-3 py-1.5 text-xs text-gray-600">Cancel</button>
              <button onClick={() => handleDelete(confirmDeleteId)} className="px-3 py-1.5 text-xs text-white bg-red-600">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Slider Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/35">
          <div className="bg-white dark:bg-gray-900 h-full max-w-lg w-full p-6 border-l shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between border-b pb-3 mb-4">
                <h2 className="text-sm font-extrabold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                  {editingFinding ? 'Modify Compliance Finding' : 'Log Audit non-conformity'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400"><X className="h-4 w-4" /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label htmlFor="finding-number" className="block text-[11px] font-bold text-gray-500 uppercase">Finding Number *</label>
                    <input id="finding-number" type="text" required value={findingNumber} onChange={(e) => setFindingNumber(e.target.value)} className="block w-full rounded-lg border px-3 py-1.5 text-xs" />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="finding-status" className="block text-[11px] font-bold text-gray-500 uppercase">Status</label>
                    <select id="finding-status" value={status} onChange={(e) => setStatus(e.target.value as any)} className="block w-full rounded-lg border px-3 py-1.5 text-xs">
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label htmlFor="finding-audit-plan" className="block text-[11px] font-bold text-gray-500 uppercase">Associated Audit Plan</label>
                    <select id="finding-audit-plan" value={auditPlanId} onChange={(e) => setAuditPlanId(e.target.value)} className="block w-full rounded-lg border px-3 py-1.5 text-xs">
                      {plans.map(p => <option key={p.id} value={p.id}>{p.auditNumber} - {p.title}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="finding-category" className="block text-[11px] font-bold text-gray-500 uppercase">Finding Category *</label>
                    <input id="finding-category" type="text" required value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Asset Security, Cash Leakage" className="block w-full rounded-lg border px-3 py-1.5 text-xs" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label htmlFor="finding-severity" className="block text-[11px] font-bold text-gray-500 uppercase">Severity Matrix</label>
                    <select id="finding-severity" value={severity} onChange={(e) => setSeverity(e.target.value as any)} className="block w-full rounded-lg border px-3 py-1.5 text-xs">
                      <option value="Critical">Critical (Autodrafts NCR)</option>
                      <option value="Major">Major (Autodrafts NCR)</option>
                      <option value="Minor">Minor</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="finding-risk" className="block text-[11px] font-bold text-gray-500 uppercase">Risk Rating</label>
                    <select id="finding-risk" value={riskLevel} onChange={(e) => setRiskLevel(e.target.value as any)} className="block w-full rounded-lg border px-3 py-1.5 text-xs">
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="finding-desc" className="block text-[11px] font-bold text-gray-500 uppercase">Factual Description of non-conformity *</label>
                  <textarea id="finding-desc" required rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Provide detailed audit proof evidence..." className="block w-full rounded-lg border px-3 py-1.5 text-xs focus:border-blue-500" />
                </div>

                <div className="space-y-1">
                  <label htmlFor="finding-evidence" className="block text-[11px] font-bold text-gray-500 uppercase">Attached Evidence File (e.g. image name or pdf)</label>
                  <input id="finding-evidence" type="text" value={evidenceName} onChange={(e) => setEvidenceName(e.target.value)} placeholder="cage_unlocked.jpg" className="block w-full rounded-lg border px-3 py-1.5 text-xs" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label htmlFor="finding-rootcause" className="block text-[11px] font-bold text-gray-500 uppercase">Root Cause Analysis</label>
                    <textarea id="finding-rootcause" rows={2} value={rootCause} onChange={(e) => setRootCause(e.target.value)} placeholder="Operator bypassed standard procedures to expedite shipment..." className="block w-full rounded-lg border px-3 py-1.5 text-xs" />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="finding-impact" className="block text-[11px] font-bold text-gray-500 uppercase">Compliance / Financial Impact</label>
                    <textarea id="finding-impact" rows={2} value={impact} onChange={(e) => setImpact(e.target.value)} placeholder="Exposes high value inventory to major threat of internal theft..." className="block w-full rounded-lg border px-3 py-1.5 text-xs" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="finding-reco" className="block text-[11px] font-bold text-gray-500 uppercase">Auditor Recommendation *</label>
                  <textarea id="finding-reco" required rows={2} value={recommendation} onChange={(e) => setRecommendation(e.target.value)} placeholder="Replace manual locks with proximity logging magnetic gates..." className="block w-full rounded-lg border px-3 py-1.5 text-xs focus:border-blue-500" />
                </div>

                <div className="space-y-1">
                  <label htmlFor="finding-assessor" className="block text-[11px] font-bold text-gray-500 uppercase">Assessing Auditor</label>
                  <select id="finding-assessor" value={auditorId} onChange={(e) => setAuditorId(e.target.value)} className="block w-full rounded-lg border px-3 py-1.5 text-xs">
                    {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.fullName}</option>)}
                  </select>
                </div>
              </form>
            </div>

            <div className="border-t pt-4 flex justify-end space-x-2 mt-4">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs text-gray-600">Cancel</button>
              <button type="button" onClick={handleSubmit} className="px-4 py-2 text-xs text-white bg-blue-600 rounded-lg">Save Finding</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
