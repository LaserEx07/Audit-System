import React, { useState, useEffect } from 'react';
import { Database, Shield, Download, Upload, RefreshCw, Trash2, CheckCircle2 } from 'lucide-react';
import { UserRole } from '../types';

interface SettingsProps {
  currentRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  addToast: (msg: string, type: 'success' | 'danger' | 'warning' | 'info') => void;
}

export default function Settings({ currentRole, onChangeRole, addToast }: SettingsProps) {
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  useEffect(() => {
    setAuditLogs(Database.getAuditLogs().slice(0, 30)); // Display last 30 logs
  }, []);

  const handleDownloadBackup = () => {
    try {
      const dataStr = Database.backupDatabase();
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Internal_Audit_Database_Backup_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      window.URL.revokeObjectURL(url);
      addToast('Local compliance database backup downloaded successfully.', 'success');
    } catch (e) {
      addToast('Backup export failed.', 'danger');
    }
  };

  const handleRestoreBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonStr = event.target?.result as string;
        const success = Database.restoreDatabase(jsonStr);
        if (success) {
          addToast('Database successfully restored! Reloading registry...', 'success');
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } else {
          addToast('Failed to verify backup schema.', 'danger');
        }
      } catch (err) {
        addToast('Invalid backup JSON file.', 'danger');
      }
    };
    reader.readAsText(file);
  };

  const handleResetDemoData = () => {
    if (confirm('Are you sure you want to clear current modifications and reset demo data?')) {
      Database.clearAll();
      addToast('Resetting database standard templates...', 'success');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
          System Administration & Backups
        </h1>
        <p className="text-xs text-gray-400">Configure corporate permission roles, download JSON backups, and view security logs.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        {/* Administrator Actions */}
        <div className="md:col-span-4 space-y-6">
          <div className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-100 space-y-4">
            <h2 className="text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider flex items-center space-x-1.5 text-blue-600">
              <Shield className="h-4 w-4" />
              <span>Identity Profile</span>
            </h2>
            <div className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label htmlFor="settings-current-role" className="block text-[10px] font-bold text-gray-400 uppercase">Active Role Switcher</label>
                <select
                  id="settings-current-role"
                  value={currentRole}
                  onChange={(e) => {
                    onChangeRole(e.target.value as UserRole);
                    addToast(`Identity changed to ${e.target.value}`, 'info');
                  }}
                  className="block w-full border rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 bg-white"
                >
                  <option value="Administrator">Administrator (All Permissions)</option>
                  <option value="Internal Auditor">Internal Auditor (Audit, Findings, CAPs)</option>
                  <option value="Manager">Manager (Review, Departments, Logs)</option>
                  <option value="Warehouse">Warehouse Specialist (Stock Audits)</option>
                  <option value="Accounting">Accounting (Cash & Reconciliation)</option>
                  <option value="Viewer">Viewer (Read-only)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-100 space-y-4">
            <h2 className="text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider text-blue-600">Database Tools</h2>
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleDownloadBackup}
                className="w-full inline-flex items-center justify-center space-x-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-2xs"
              >
                <Download className="h-4 w-4 text-blue-500" />
                <span>Download Database JSON Backup</span>
              </button>

              <div className="relative">
                <button
                  type="button"
                  className="w-full inline-flex items-center justify-center space-x-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-2xs"
                >
                  <Upload className="h-4 w-4 text-green-500" />
                  <span>Restore Database JSON Backup</span>
                </button>
                <input
                  id="restore-database-file"
                  type="file"
                  accept=".json"
                  onChange={handleRestoreBackup}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>

              <div className="border-t pt-3">
                <button
                  type="button"
                  onClick={handleResetDemoData}
                  className="w-full inline-flex items-center justify-center space-x-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-transparent font-bold py-2 text-xs"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Reset to Original Seed Data</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Audit Trails log section */}
        <div className="md:col-span-8 bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-100 space-y-4">
          <h2 className="text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider flex items-center space-x-2">
            <span>Corporate Transaction Logs (Audit Trail)</span>
            <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-sm font-bold font-mono">
              SECURE LOGS
            </span>
          </h2>
          <p className="text-[10px] text-gray-400">Cryptographically isolated sequential change logs for ISO audit readiness.</p>

          <div className="max-h-96 overflow-y-auto border border-gray-50 rounded-lg divide-y bg-white text-xs">
            {auditLogs.length === 0 ? (
              <p className="py-12 text-center text-gray-400">No security logs recorded yet.</p>
            ) : (
              auditLogs.map((log) => (
                <div key={log.id} className="p-3 hover:bg-gray-50/50 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="font-semibold text-gray-800">
                      {log.action}
                    </p>
                    <p className="text-[10px] text-gray-400 font-mono">ID: {log.id} • Target: {log.details}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono text-[9px] font-bold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-sm uppercase">
                      {log.user}
                    </span>
                    <p className="text-[9px] text-gray-400 mt-1 font-mono">{log.timestamp.slice(11, 19)} {log.timestamp.slice(0, 10)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
