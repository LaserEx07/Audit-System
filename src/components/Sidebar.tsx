import { useState } from 'react';
import {
  LayoutDashboard,
  Building2,
  Briefcase,
  Users,
  Calendar,
  ClipboardCheck,
  Play,
  AlertOctagon,
  CheckSquare,
  FileText,
  Archive,
  DollarSign,
  ArrowLeftRight,
  ShoppingCart,
  FolderOpen,
  BarChart2,
  History,
  Settings2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { UserRole } from '../types';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  currentRole: UserRole;
}

export default function Sidebar({ currentPage, onNavigate, currentRole }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Grouped Navigation configuration for high readability
  const menuGroups = [
    {
      title: 'Core',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: [] }
      ]
    },
    {
      title: 'Enterprise Registry',
      items: [
        { id: 'companies', label: 'Companies', icon: Building2, roles: ['Administrator', 'Internal Auditor'] },
        { id: 'departments', label: 'Departments', icon: Briefcase, roles: ['Administrator', 'Internal Auditor'] },
        { id: 'employees', label: 'Employees', icon: Users, roles: ['Administrator', 'Internal Auditor'] }
      ]
    },
    {
      title: 'Audit Operations',
      items: [
        { id: 'planning', label: 'Audit Planning', icon: Calendar, roles: ['Administrator', 'Internal Auditor', 'Manager', 'Viewer'] },
        { id: 'checklists', label: 'Checklist Templates', icon: ClipboardCheck, roles: ['Administrator', 'Internal Auditor'] },
        { id: 'execution', label: 'Audit Execution', icon: Play, roles: ['Administrator', 'Internal Auditor'] },
        { id: 'findings', label: 'Audit Findings', icon: AlertOctagon, roles: ['Administrator', 'Internal Auditor', 'Manager'] },
        { id: 'corrective-actions', label: 'Corrective Actions', icon: CheckSquare, roles: [] },
        { id: 'ncrs', label: 'Non-Conformance Reports', icon: FileText, roles: [] }
      ]
    },
    {
      title: 'Specialist Audits',
      items: [
        { id: 'inventory-audit', label: 'Inventory Audit', icon: Archive, roles: ['Administrator', 'Internal Auditor', 'Warehouse', 'Manager'] },
        { id: 'cash-audit', label: 'Cash Audit', icon: DollarSign, roles: ['Administrator', 'Internal Auditor', 'Accounting', 'Manager'] },
        { id: 'bank-recon', label: 'Bank Reconciliation', icon: ArrowLeftRight, roles: ['Administrator', 'Internal Auditor', 'Accounting', 'Manager'] },
        { id: 'purchasing-audit', label: 'Purchasing Audit', icon: ShoppingCart, roles: ['Administrator', 'Internal Auditor', 'Purchasing', 'Manager'] }
      ]
    },
    {
      title: 'Support & Security',
      items: [
        { id: 'documents', label: 'Document Library', icon: FolderOpen, roles: [] },
        { id: 'reports', label: 'Executive Reports', icon: BarChart2, roles: [] },
        { id: 'audit-trail', label: 'System Audit Trail', icon: History, roles: ['Administrator'] },
        { id: 'settings', label: 'System Settings', icon: Settings2, roles: ['Administrator'] }
      ]
    }
  ];

  // Helper to filter items based on active workspace permissions
  const canAccess = (itemRoles: string[]) => {
    if (itemRoles.length === 0) return true; // Accessible by all
    if (currentRole === 'Administrator') return true; // Admin bypassed
    return itemRoles.includes(currentRole);
  };

  return (
    <aside
      className={`relative flex flex-col border-r border-gray-200 dark:border-gray-800 bg-gray-900 text-gray-300 transition-all duration-300 select-none shrink-0 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Header Branding */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-gray-800 bg-gray-950">
        <div className="flex items-center space-x-2.5 overflow-hidden">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white shadow-md">
            <ShieldCheck className="h-5 w-5" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-wide text-white leading-tight uppercase">
                AuditorSuite
              </span>
              <span className="text-[10px] text-gray-500 font-semibold leading-none uppercase">
                Enterprise Offline
              </span>
            </div>
          )}
        </div>
        
        {/* Toggle Collapse Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex h-6 w-6 items-center justify-center rounded-full bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-all border border-gray-700 shadow-xs"
        >
          {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Navigation Links List */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-4 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
        {menuGroups.map((group, gIdx) => {
          // Filter visible items
          const visibleItems = group.items.filter(item => canAccess(item.roles));
          if (visibleItems.length === 0) return null;

          return (
            <div key={gIdx} className="space-y-1">
              {!isCollapsed && (
                <h3 className="px-3 text-[10px] font-bold tracking-wider text-gray-500 uppercase">
                  {group.title}
                </h3>
              )}
              <ul className="space-y-0.5">
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;

                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => onNavigate(item.id)}
                        className={`flex w-full items-center rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-gray-400 hover:bg-gray-800/60 hover:text-gray-200'
                        } ${isCollapsed ? 'justify-center' : 'space-x-3'}`}
                        title={isCollapsed ? item.label : undefined}
                      >
                        <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`} />
                        {!isCollapsed && (
                          <span className="truncate leading-none">{item.label}</span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Footer System Status */}
      <div className="p-4 border-t border-gray-800 bg-gray-950/40 text-center">
        {!isCollapsed ? (
          <div className="space-y-1">
            <div className="flex items-center justify-center space-x-1.5 text-[10px] text-green-500 font-semibold uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              <span>Offline Database Connected</span>
            </div>
            <p className="text-[9px] text-gray-600">v1.1.0 • SQLite/Local Client</p>
          </div>
        ) : (
          <div className="flex justify-center">
            <span className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" title="Database Connected" />
          </div>
        )}
      </div>
    </aside>
  );
}
