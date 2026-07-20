import React, { useState, useEffect } from 'react';
import { Calendar, Search, Plus, Trash2, Edit, X, Download, Eye, Play, CheckCircle } from 'lucide-react';
import { Database } from '../services/db';
import { AuditPlan, Company, Department, Employee, AuditType, RiskLevel, PriorityLevel, AuditStatus, UserRole } from '../types';

interface AuditPlanningProps {
  currentRole: UserRole;
  addToast: (msg: string, type: 'success' | 'danger' | 'warning' | 'info') => void;
  onNavigate: (page: string) => void;
}

export default function AuditPlanning({ currentRole, addToast, onNavigate }: AuditPlanningProps) {
  const [plans, setPlans] = useState<AuditPlan[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<AuditPlan | null>(null);
  const [viewingPlan, setViewingPlan] = useState<AuditPlan | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Form states
  const [auditNumber, setAuditNumber] = useState('');
  const [title, setTitle] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [auditType, setAuditType] = useState<AuditType>('Financial');
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('Medium');
  const [leadAuditorId, setLeadAuditorId] = useState('');
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([]);
  const [objective, setObjective] = useState('');
  const [scope, setScope] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<AuditStatus>('Draft');
  const [priority, setPriority] = useState<PriorityLevel>('Medium');
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    setPlans(Database.getAuditPlans());
    setCompanies(Database.getCompanies().filter(c => c.status === 'Active'));
    setDepartments(Database.getDepartments().filter(d => d.status === 'Active'));
    setEmployees(Database.getEmployees().filter(e => e.status === 'Active'));
  }, []);

  const isAuditorOrAdmin = currentRole === 'Administrator' || currentRole === 'Internal Auditor';

  const openAddModal = () => {
    setEditingPlan(null);
    setAuditNumber(`AUD-2026-${Math.floor(100 + Math.random() * 900)}`);
    setTitle('');
    setCompanyId(companies[0]?.id || '');
    setDepartmentId(departments[0]?.id || '');
    setAuditType('Financial');
    setRiskLevel('Medium');
    setLeadAuditorId(employees[0]?.id || '');
    setSelectedTeamIds([]);
    setObjective('');
    setScope('');
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setStatus('Draft');
    setPriority('Medium');
    setRemarks('');
    setIsModalOpen(true);
  };

  const openEditModal = (plan: AuditPlan) => {
    setEditingPlan(plan);
    setAuditNumber(plan.auditNumber);
    setTitle(plan.title);
    setCompanyId(plan.companyId);
    setDepartmentId(plan.departmentId);
    setAuditType(plan.auditType);
    setRiskLevel(plan.riskLevel);
    setLeadAuditorId(plan.leadAuditorId);
    setSelectedTeamIds(plan.auditTeamIds || []);
    setObjective(plan.objective);
    setScope(plan.scope);
    setStartDate(plan.startDate);
    setEndDate(plan.endDate);
    setStatus(plan.status);
    setPriority(plan.priority);
    setRemarks(plan.remarks);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !objective.trim()) {
      addToast('Please fill out Audit Title and Objective fields.', 'warning');
      return;
    }

    const newPlan: AuditPlan = {
      id: editingPlan ? editingPlan.id : `plan-${Date.now()}`,
      auditNumber,
      title: title.trim(),
      companyId,
      departmentId,
      auditType,
      riskLevel,
      leadAuditorId,
      auditTeamIds: selectedTeamIds,
      objective: objective.trim(),
      scope: scope.trim(),
      startDate,
      endDate,
      status,
      priority,
      remarks: remarks.trim(),
      dateCreated: editingPlan ? editingPlan.dateCreated : new Date().toISOString().split('T')[0]
    };

    Database.saveAuditPlan(newPlan);
    setPlans(Database.getAuditPlans());
    setIsModalOpen(false);
    addToast(
      editingPlan ? `Successfully updated ${auditNumber}` : `Successfully scheduled ${auditNumber}`,
      'success'
    );
  };

  const handleDelete = (id: string) => {
    const success = Database.deleteAuditPlan(id);
    if (success) {
      setPlans(Database.getAuditPlans());
      setConfirmDeleteId(null);
      addToast('Audit schedule deleted.', 'success');
    } else {
      addToast('Archival failed.', 'danger');
    }
  };

  const toggleTeamMember = (empId: string) => {
    if (selectedTeamIds.includes(empId)) {
      setSelectedTeamIds(selectedTeamIds.filter(id => id !== empId));
    } else {
      setSelectedTeamIds([...selectedTeamIds, empId]);
    }
  };

  const handleExportCSV = () => {
    if (plans.length === 0) {
      addToast('No records available.', 'warning');
      return;
    }
    const headers = 'ID,Audit Number,Title,Company,Department,Type,Risk,Lead Auditor,Team Count,Start Date,End Date,Status,Priority\n';
    const rows = plans
      .map((p) => {
        const comp = companies.find(c => c.id === p.companyId)?.name || 'Unknown';
        const dept = departments.find(d => d.id === p.departmentId)?.name || 'Unknown';
        const lead = employees.find(e => e.id === p.leadAuditorId)?.fullName || 'Unknown';
        return `"${p.id}","${p.auditNumber}","${p.title}","${comp}","${dept}","${p.auditType}","${p.riskLevel}","${lead}","${p.auditTeamIds?.length || 0}","${p.startDate}","${p.endDate}","${p.status}","${p.priority}"`;
      })
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Audit_Plans_Export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredPlans = plans.filter((p) => {
    const compName = companies.find(c => c.id === p.companyId)?.name || '';
    const deptName = departments.find(d => d.id === p.departmentId)?.name || '';
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.auditNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      compName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deptName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusStyle = (s: AuditStatus) => {
    switch (s) {
      case 'Completed':
        return 'bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400';
      case 'In Progress':
        return 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400';
      case 'Planned':
        return 'bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400';
      case 'Draft':
        return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
      default:
        return 'bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
            Audit Plans & Scheduling
          </h1>
          <p className="text-xs text-gray-400">Schedule enterprise compliance scopes, staff assignments, and timelines.</p>
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
              <span>Schedule Audit</span>
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
            id="audit-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search title, audit #, target company..."
            className="block w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40 py-2 pl-9 pr-3 text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-semibold text-gray-400">Status:</span>
          {(['All', 'Draft', 'Planned', 'In Progress', 'Completed'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all shrink-0 ${
                statusFilter === st
                  ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-semibold border border-blue-200 dark:border-blue-900'
                  : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-transparent hover:bg-gray-100'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Audit List Table */}
      <div className="overflow-hidden rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
        {filteredPlans.length === 0 ? (
          <div className="py-16 text-center text-xs text-gray-400 flex flex-col items-center justify-center space-y-2">
            <Calendar className="h-10 w-10 text-gray-300" />
            <p className="font-semibold text-gray-500">No audits found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/45">
                  <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">Audit details</th>
                  <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">Company & Dept</th>
                  <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">Type / Risk</th>
                  <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">Timeline</th>
                  <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">Lead Auditor</th>
                  <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">Status</th>
                  <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-gray-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredPlans.map((p) => {
                  const comp = companies.find(c => c.id === p.companyId);
                  const dept = departments.find(d => d.id === p.departmentId);
                  const lead = employees.find(e => e.id === p.leadAuditorId);
                  return (
                    <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 text-xs">
                      <td className="p-3">
                        <div className="space-y-1">
                          <span className="font-mono font-bold text-[10px] bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-sm">
                            {p.auditNumber}
                          </span>
                          <p className="font-bold text-gray-950 dark:text-gray-100">{p.title}</p>
                        </div>
                      </td>
                      <td className="p-3">
                        <p className="font-semibold text-gray-700 dark:text-gray-300">{comp?.name || 'Standard Ltd'}</p>
                        <p className="text-[10px] text-gray-400">{dept?.name || 'IT Operations'}</p>
                      </td>
                      <td className="p-3">
                        <p className="font-semibold text-gray-700 dark:text-gray-300">{p.auditType}</p>
                        <span
                          className={`inline-block mt-0.5 rounded-xs px-1 text-[9px] font-bold uppercase tracking-wider ${
                            p.riskLevel === 'High'
                              ? 'text-red-500 bg-red-50 dark:bg-red-950'
                              : p.riskLevel === 'Medium'
                              ? 'text-amber-500 bg-amber-50 dark:bg-amber-950'
                              : 'text-blue-500 bg-blue-50 dark:bg-blue-950'
                          }`}
                        >
                          {p.riskLevel} Risk
                        </span>
                      </td>
                      <td className="p-3">
                        <p className="text-gray-700 dark:text-gray-300 font-semibold">{p.startDate}</p>
                        <p className="text-[10px] text-gray-400">to {p.endDate}</p>
                      </td>
                      <td className="p-3 font-medium text-gray-700 dark:text-gray-300">
                        {lead?.fullName || 'John Auditor'}
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex items-center rounded-sm px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(p.status)}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => setViewingPlan(p)}
                            title="Preview Objective"
                            className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-950 transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {isAuditorOrAdmin ? (
                            <>
                              <button
                                onClick={() => openEditModal(p)}
                                className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-500 transition-colors"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(p.id)}
                                className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                              {p.status !== 'Completed' && (
                                <button
                                  onClick={() => onNavigate('execution')}
                                  title="Execute Checklist"
                                  className="rounded-md p-1.5 text-green-500 hover:bg-green-50 dark:hover:bg-green-950/20 transition-colors"
                                >
                                  <Play className="h-4 w-4" />
                                </button>
                              )}
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

      {/* Preview Details Dialog */}
      {viewingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-lg w-full p-6 border border-gray-100 dark:border-gray-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs bg-blue-100 dark:bg-blue-900 px-2 py-0.5 rounded-sm font-bold text-blue-700">
                  {viewingPlan.auditNumber}
                </span>
                <h3 className="text-sm font-bold text-gray-950 dark:text-gray-50">{viewingPlan.title}</h3>
              </div>
              <button onClick={() => setViewingPlan(null)} className="text-gray-400 hover:text-gray-600"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-3.5 text-xs text-gray-600 dark:text-gray-300">
              <div>
                <span className="block font-bold text-[10px] text-gray-400 uppercase">Objectives</span>
                <p className="mt-1 leading-relaxed bg-gray-50 dark:bg-gray-800/40 p-3 rounded-lg border border-gray-100 dark:border-gray-800/50">{viewingPlan.objective}</p>
              </div>
              <div>
                <span className="block font-bold text-[10px] text-gray-400 uppercase">Scope Coverages</span>
                <p className="mt-1 leading-relaxed bg-gray-50 dark:bg-gray-800/40 p-3 rounded-lg border border-gray-100 dark:border-gray-800/50">{viewingPlan.scope}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <span className="block font-bold text-[10px] text-gray-400 uppercase">Audit Priority</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{viewingPlan.priority}</span>
                </div>
                <div>
                  <span className="block font-bold text-[10px] text-gray-400 uppercase">Remarks</span>
                  <span className="text-gray-500">{viewingPlan.remarks || 'None'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-sm w-full p-5 border border-gray-100 dark:border-gray-800 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-gray-950 dark:text-gray-50">Cancel/Delete Audit</h3>
            <p className="text-xs text-gray-500">Are you sure you want to delete this scheduled audit plan?</p>
            <div className="flex items-center justify-end space-x-2">
              <button onClick={() => setConfirmDeleteId(null)} className="px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400 rounded-lg">Cancel</button>
              <button onClick={() => handleDelete(confirmDeleteId)} className="px-3 py-1.5 text-xs text-white bg-red-600 rounded-lg">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Slide-over Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/35 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-900 h-full max-w-lg w-full p-6 border-l border-gray-100 dark:border-gray-800 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3 mb-4">
                <h2 className="text-sm font-extrabold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                  {editingPlan ? 'Edit Audit Schedule' : 'Schedule Audit Scope'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"><X className="h-4 w-4" /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label htmlFor="audit-plan-number" className="block text-[11px] font-bold text-gray-500 uppercase">Audit Number *</label>
                    <input id="audit-plan-number" type="text" required value={auditNumber} onChange={(e) => setAuditNumber(e.target.value)} className="block w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-1.5 text-xs focus:border-blue-500" />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="audit-plan-status" className="block text-[11px] font-bold text-gray-500 uppercase">Status</label>
                    <select id="audit-plan-status" value={status} onChange={(e) => setStatus(e.target.value as any)} className="block w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-1.5 text-xs focus:border-blue-500">
                      <option value="Draft">Draft</option>
                      <option value="Planned">Planned</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="audit-plan-title" className="block text-[11px] font-bold text-gray-500 uppercase">Audit Title / Scope Title *</label>
                  <input id="audit-plan-title" type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Q3 Hardware and Cyber Audit" className="block w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-1.5 text-xs focus:border-blue-500" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label htmlFor="audit-plan-company" className="block text-[11px] font-bold text-gray-500 uppercase">Target Company</label>
                    <select id="audit-plan-company" value={companyId} onChange={(e) => setCompanyId(e.target.value)} className="block w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-1.5 text-xs focus:border-blue-500">
                      {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="audit-plan-dept" className="block text-[11px] font-bold text-gray-500 uppercase">Auditee Department</label>
                    <select id="audit-plan-dept" value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} className="block w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-1.5 text-xs focus:border-blue-500">
                      {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label htmlFor="audit-plan-type" className="block text-[11px] font-bold text-gray-500 uppercase">Audit Type</label>
                    <select id="audit-plan-type" value={auditType} onChange={(e) => setAuditType(e.target.value as any)} className="block w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-1.5 text-xs focus:border-blue-500">
                      {(['Financial', 'Inventory', 'Cash', 'Bank', 'Sales', 'Purchasing', 'Warehouse', 'Operations', 'IT', 'Compliance', 'HR'] as AuditType[]).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="audit-plan-risk" className="block text-[11px] font-bold text-gray-500 uppercase">Risk Level</label>
                    <select id="audit-plan-risk" value={riskLevel} onChange={(e) => setRiskLevel(e.target.value as any)} className="block w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-1.5 text-xs focus:border-blue-500">
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="audit-plan-priority" className="block text-[11px] font-bold text-gray-500 uppercase">Priority</label>
                    <select id="audit-plan-priority" value={priority} onChange={(e) => setPriority(e.target.value as any)} className="block w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-1.5 text-xs focus:border-blue-500">
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label htmlFor="audit-plan-lead" className="block text-[11px] font-bold text-gray-500 uppercase">Lead Auditor</label>
                    <select id="audit-plan-lead" value={leadAuditorId} onChange={(e) => setLeadAuditorId(e.target.value)} className="block w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-1.5 text-xs focus:border-blue-500">
                      {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.fullName}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="audit-plan-dates" className="block text-[11px] font-bold text-gray-500 uppercase">Timeline Range *</label>
                    <div id="audit-plan-dates" className="flex items-center space-x-2">
                      <input type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)} className="block w-full rounded-lg border border-gray-200 bg-white dark:bg-gray-900 px-2 py-1.5 text-xs focus:border-blue-500" />
                      <span className="text-[10px] text-gray-400">to</span>
                      <input type="date" required value={endDate} onChange={(e) => setEndDate(e.target.value)} className="block w-full rounded-lg border border-gray-200 bg-white dark:bg-gray-900 px-2 py-1.5 text-xs focus:border-blue-500" />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="audit-plan-objective" className="block text-[11px] font-bold text-gray-500 uppercase">Audit Objective *</label>
                  <textarea id="audit-plan-objective" required rows={2} value={objective} onChange={(e) => setObjective(e.target.value)} placeholder="Identify risk control deficiencies..." className="block w-full rounded-lg border border-gray-200 bg-white dark:bg-gray-900 px-3 py-1.5 text-xs focus:border-blue-500" />
                </div>

                <div className="space-y-1">
                  <label htmlFor="audit-plan-scope" className="block text-[11px] font-bold text-gray-500 uppercase">Audit Scope</label>
                  <textarea id="audit-plan-scope" rows={2} value={scope} onChange={(e) => setScope(e.target.value)} placeholder="Main warehousing, receiving docks, software directories..." className="block w-full rounded-lg border border-gray-200 bg-white dark:bg-gray-900 px-3 py-1.5 text-xs focus:border-blue-500" />
                </div>

                <div className="space-y-1">
                  <span className="block text-[11px] font-bold text-gray-500 uppercase">Audit Team Members</span>
                  <div className="grid grid-cols-2 gap-2 max-h-24 overflow-y-auto border border-gray-200 dark:border-gray-800 p-2.5 rounded-lg bg-gray-50 dark:bg-gray-850">
                    {employees.filter(e => e.id !== leadAuditorId).map(emp => (
                      <label key={emp.id} className="flex items-center space-x-2 text-xs">
                        <input type="checkbox" checked={selectedTeamIds.includes(emp.id)} onChange={() => toggleTeamMember(emp.id)} className="rounded-sm border-gray-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5" />
                        <span className="text-gray-700 dark:text-gray-300 truncate">{emp.fullName}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="audit-plan-remarks" className="block text-[11px] font-bold text-gray-500 uppercase">Remarks / Notes</label>
                  <input id="audit-plan-remarks" type="text" value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Enter details..." className="block w-full rounded-lg border border-gray-200 bg-white dark:bg-gray-900 px-3 py-1.5 text-xs focus:border-blue-500" />
                </div>
              </form>
            </div>

            <div className="border-t border-gray-100 dark:border-gray-800 pt-4 flex items-center justify-end space-x-2 mt-4">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button type="button" onClick={handleSubmit} className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg">Save Audit Plan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
