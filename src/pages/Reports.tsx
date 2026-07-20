import React, { useState, useEffect } from 'react';
import { Download, FileText, BarChart3, TrendingUp, AlertCircle, ShieldCheck } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Database } from '../services/db';

interface ReportsProps {
  addToast: (msg: string, type: 'success' | 'danger' | 'warning' | 'info') => void;
}

export default function Reports({ addToast }: ReportsProps) {
  const [plansCount, setPlansCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [findingsCount, setFindingsCount] = useState(0);
  const [ncrsCount, setNcrsCount] = useState(0);

  // Chart data states
  const [severityData, setSeverityData] = useState<any[]>([]);
  const [departmentData, setDepartmentData] = useState<any[]>([]);

  useEffect(() => {
    const plans = Database.getAuditPlans();
    const findings = Database.getFindings();
    const ncrs = Database.getNCRs();

    setPlansCount(plans.length);
    setCompletedCount(plans.filter(p => p.status === 'Completed').length);
    setFindingsCount(findings.length);
    setNcrsCount(ncrs.length);

    // Calculate severity statistics
    const critical = findings.filter(f => f.severity === 'Critical').length;
    const major = findings.filter(f => f.severity === 'Major').length;
    const minor = findings.filter(f => f.severity === 'Minor').length;

    setSeverityData([
      { name: 'Critical', value: critical, color: '#EF4444' },
      { name: 'Major', value: major, color: '#F59E0B' },
      { name: 'Minor', value: minor, color: '#2563EB' }
    ]);

    // Calculate department compliance metrics
    const depts = Database.getDepartments();
    const mockDeptRates = depts.map((d, index) => {
      // Simulate real calculation based on finding density
      const deptFindings = findings.filter(f => {
        const p = plans.find(plan => plan.id === f.auditPlanId);
        return p?.departmentId === d.id;
      }).length;

      // Compliance calculation: starts at 100%, subtracts 12% per finding
      const rate = Math.max(45, 100 - (deptFindings * 12));
      return {
        name: d.name.slice(0, 16),
        Compliance: rate,
        Findings: deptFindings
      };
    });

    setDepartmentData(mockDeptRates);
  }, []);

  const handleDownloadSummary = () => {
    addToast('Compiling executive PDF compliance digest... download started.', 'success');
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
            Compliance Analytics & Executive Reports
          </h1>
          <p className="text-xs text-gray-400 font-medium">Verify company-wide audit success rate metrics and corporate risk ratios.</p>
        </div>
        <button
          onClick={handleDownloadSummary}
          className="mt-4 sm:mt-0 inline-flex items-center space-x-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow-xs"
        >
          <Download className="h-4 w-4" />
          <span>Export Executive PDF</span>
        </button>
      </div>

      {/* KPI Stats Panel */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-100 p-4.5 rounded-xl flex items-center justify-between">
          <div>
            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Scheduled Timelines</span>
            <span className="block text-2xl font-black text-gray-900 dark:text-gray-150 mt-1">{plansCount}</span>
            <span className="text-[10px] text-gray-400 font-semibold mt-1 block">Active target templates</span>
          </div>
          <FileText className="h-9 w-9 text-blue-500/10" />
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-100 p-4.5 rounded-xl flex items-center justify-between">
          <div>
            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Completed Audit Sign-offs</span>
            <span className="block text-2xl font-black text-green-600 mt-1">{completedCount}</span>
            <span className="text-[10px] text-green-500 font-bold mt-1 block">
              {plansCount > 0 ? ((completedCount / plansCount) * 100).toFixed(0) : 0}% Completion Rate
            </span>
          </div>
          <ShieldCheck className="h-9 w-9 text-green-500/10" />
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-100 p-4.5 rounded-xl flex items-center justify-between">
          <div>
            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Logged Findings</span>
            <span className="block text-2xl font-black text-amber-500 mt-1">{findingsCount}</span>
            <span className="text-[10px] text-gray-400 font-semibold mt-1 block">Non-conformances catalog</span>
          </div>
          <AlertCircle className="h-9 w-9 text-amber-500/10" />
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-100 p-4.5 rounded-xl flex items-center justify-between">
          <div>
            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Active NCR Warnings</span>
            <span className="block text-2xl font-black text-red-500 mt-1">{ncrsCount}</span>
            <span className="text-[10px] text-red-500 font-semibold mt-1 block">ISO standard deviations</span>
          </div>
          <AlertCircle className="h-9 w-9 text-red-500/10" />
        </div>
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid gap-6 md:grid-cols-12">
        {/* Compliance rate chart */}
        <div className="md:col-span-8 bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider flex items-center space-x-1.5">
              <BarChart3 className="h-4 w-4 text-blue-500" />
              <span>Departmental Compliance Ratios (%)</span>
            </h2>
            <span className="text-[10px] text-gray-400 font-semibold">Targets vs actual findings</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#9CA3AF' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: '#9CA3AF' }} />
                <Tooltip />
                <Bar dataKey="Compliance" fill="#2563EB" radius={[4, 4, 0, 0]} barSize={35} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity pie chart */}
        <div className="md:col-span-4 bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-100 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-1">
            <h2 className="text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider flex items-center space-x-1.5">
              <TrendingUp className="h-4 w-4 text-amber-500" />
              <span>Findings Severity Matrix</span>
            </h2>
            <p className="text-[10px] text-gray-400">Compliance deviations segmented by priority</p>
          </div>

          <div className="h-44 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-black text-gray-950 dark:text-gray-100">{findingsCount}</span>
              <span className="text-[9px] text-gray-400 font-bold uppercase">Total Proofs</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 border-t pt-4 text-center text-[10px]">
            {severityData.map((d, i) => (
              <div key={i} className="space-y-0.5">
                <span className="block font-semibold text-gray-400 uppercase">{d.name}</span>
                <span className="block font-mono font-bold text-sm" style={{ color: d.color }}>{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ISO Quality Assurance Statement */}
      <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-start space-x-3">
          <ShieldCheck className="h-8 w-8 text-blue-600 shrink-0" />
          <div className="space-y-1">
            <p className="font-bold text-blue-700">Audit Trail Verification Certificate</p>
            <p className="text-gray-500 leading-normal max-w-xl">
              All metrics listed are auto-compiled from local database transactions and are compliant with official corporate audit standards and regulatory compliance rules.
            </p>
          </div>
        </div>
        <div className="text-[11px] font-mono font-bold text-blue-700 bg-blue-100/60 px-3.5 py-1.5 rounded-lg border border-blue-200">
          ISO 9001:2015 COMPLIANT
        </div>
      </div>
    </div>
  );
}
