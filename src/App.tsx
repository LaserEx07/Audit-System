import { useState, useEffect } from 'react';
import {
  LayoutDashboard, Building2, FolderKanban, Users, CalendarDays,
  ClipboardList, CheckSquare, AlertOctagon, ShieldCheck, FileSpreadsheet,
  Package, FileText, BarChart3, Settings as SettingsIcon, Menu, Bell,
  User, Check, AlertCircle, RefreshCw, X, ChevronRight, Moon, Sun, Search
} from 'lucide-react';
import { Database } from './services/db';
import { UserRole } from './types';

// Page Imports
import Dashboard from './pages/Dashboard';
import Companies from './pages/Companies';
import Departments from './pages/Departments';
import Employees from './pages/Employees';
import AuditPlanning from './pages/AuditPlanning';
import AuditChecklists from './pages/AuditChecklists';
import AuditExecutionScreen from './pages/AuditExecution';
import AuditFindings from './pages/AuditFindings';
import CorrectiveActions from './pages/CorrectiveActions';
import NcrReports from './pages/NcrReports';
import SpecialistAudits from './pages/SpecialistAudits';
import Documents from './pages/Documents';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'danger' | 'warning' | 'info';
}

interface SystemNotification {
  id: string;
  title: string;
  detail: string;
  time: string;
  read: boolean;
  type: 'info' | 'warning' | 'alert' | 'success';
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [currentRole, setCurrentRole] = useState<UserRole>('Administrator');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [globalSearch, setGlobalSearch] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Initialize and load default system seed notification alerts
  useEffect(() => {
    setNotifications([
      { id: '1', title: 'Critical Finding Logged', detail: 'Finding #FND-2026-104 Server Access Deviation drafted.', time: '10m ago', read: false, type: 'alert' },
      { id: '2', title: 'Audit Timelines Scheduled', detail: 'Audit AUD-2026-905 scheduled for next Tuesday.', time: '1h ago', read: false, type: 'info' },
      { id: '3', title: 'NCR Issued', detail: 'NCR-2026-440 Non-Conformance Report signed by Lead Auditor.', time: '4h ago', read: true, type: 'warning' },
    ]);
  }, []);

  // Sync Dark mode styles to container root HTML document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const addToast = (message: string, type: 'success' | 'danger' | 'warning' | 'info' = 'info') => {
    const id = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const markAllNotificationsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    addToast('All system compliance notifications marked as read.', 'success');
  };

  const getUnreadNotificationCount = () => {
    return notifications.filter(n => !n.read).length;
  };

  const canAccess = (page: string, role: UserRole): boolean => {
    if (role === 'Administrator') return true;
    if (role === 'Viewer') {
      return ['dashboard', 'companies', 'departments', 'employees', 'planning', 'checklists', 'findings', 'corrective', 'ncr', 'documents', 'reports'].includes(page);
    }
    if (role === 'Warehouse') {
      return ['dashboard', 'specialist', 'documents', 'planning'].includes(page);
    }
    if (role === 'Accounting') {
      return ['dashboard', 'specialist', 'documents', 'reports'].includes(page);
    }
    // Auditor / Manager can access all operational dashboards
    return true;
  };

  const handleNavigation = (page: string) => {
    if (canAccess(page, currentRole)) {
      setCurrentPage(page);
    } else {
      addToast('Your current active role profile does not have access permissions for this module.', 'danger');
    }
  };

  // Nav items configuration with corresponding user access rules
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'companies', label: 'Companies Registry', icon: Building2 },
    { id: 'departments', label: 'Departments', icon: FolderKanban },
    { id: 'employees', label: 'Staff Registry', icon: Users },
    { id: 'planning', label: 'Audit Timeline Plans', icon: CalendarDays },
    { id: 'checklists', label: 'Checklist Templates', icon: ClipboardList },
    { id: 'execution', label: 'Execute Checklist', icon: CheckSquare },
    { id: 'findings', label: 'Audit Findings', icon: AlertOctagon },
    { id: 'corrective', label: 'Corrective Actions (CAP)', icon: ShieldCheck },
    { id: 'ncr', label: 'NCR Reports', icon: FileSpreadsheet },
    { id: 'specialist', label: 'Specialist Audits', icon: Package },
    { id: 'documents', label: 'Documents Vault', icon: FileText },
    { id: 'reports', label: 'Analytics Reports', icon: BarChart3 },
    { id: 'settings', label: 'System Settings', icon: SettingsIcon },
  ];

  const renderActivePage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigation} />;
      case 'companies':
        return <Companies currentRole={currentRole} addToast={addToast} />;
      case 'departments':
        return <Departments currentRole={currentRole} addToast={addToast} />;
      case 'employees':
        return <Employees currentRole={currentRole} addToast={addToast} />;
      case 'planning':
        return <AuditPlanning currentRole={currentRole} addToast={addToast} onNavigate={handleNavigation} />;
      case 'checklists':
        return <AuditChecklists currentRole={currentRole} addToast={addToast} />;
      case 'execution':
        return <AuditExecutionScreen currentRole={currentRole} addToast={addToast} onNavigate={handleNavigation} />;
      case 'findings':
        return <AuditFindings currentRole={currentRole} addToast={addToast} />;
      case 'corrective':
        return <CorrectiveActions currentRole={currentRole} addToast={addToast} />;
      case 'ncr':
        return <NcrReports currentRole={currentRole} addToast={addToast} />;
      case 'specialist':
        return <SpecialistAudits addToast={addToast} />;
      case 'documents':
        return <Documents currentRole={currentRole} addToast={addToast} />;
      case 'reports':
        return <Reports addToast={addToast} />;
      case 'settings':
        return <Settings currentRole={currentRole} onChangeRole={setCurrentRole} addToast={addToast} />;
      default:
        return <Dashboard onNavigate={handleNavigation} />;
    }
  };

  const getToastStyle = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-green-200 bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-400';
      case 'danger':
        return 'border-red-200 bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-400';
      case 'warning':
        return 'border-amber-200 bg-amber-50 text-amber-850 dark:bg-amber-950 dark:text-amber-400';
      default:
        return 'border-blue-200 bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-400';
    }
  };

  return (
    <div className={`min-h-screen font-sans ${isDarkMode ? 'dark bg-gray-950 text-gray-100' : 'bg-gray-55 text-gray-900'}`}>
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 border-b border-gray-100 dark:border-gray-800/80 backdrop-blur-sm shadow-2xs">
        <div className="flex h-14 items-center justify-between px-5">
          {/* Logo Brand area */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-hidden"
              aria-label="Toggle Sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center space-x-2">
              <span className="h-7 w-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-extrabold text-sm shadow-xs select-none">
                A
              </span>
              <span className="hidden sm:inline-block font-extrabold text-sm tracking-tight text-gray-900 dark:text-gray-100">
                AUDIT COMPLIANCE
              </span>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center space-x-4">
            {/* Global Search Bar */}
            <div className="relative hidden md:block w-64">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <Search className="h-4 w-4" />
              </div>
              <input
                id="global-search-query"
                type="text"
                placeholder="Global quick search..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="w-full rounded-lg border border-gray-200/70 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-850 py-1.5 pl-9 pr-3 text-xs placeholder-gray-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Dark Mode Switcher */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-950 dark:hover:text-gray-50"
              aria-label="Toggle Theme"
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-950"
                aria-label="Notification center"
              >
                <Bell className="h-4.5 w-4.5" />
                {getUnreadNotificationCount() > 0 && (
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-600 animate-ping" />
                )}
              </button>

              {/* Notification Box Dropdown */}
              {isNotificationOpen && (
                <div className="absolute right-0 mt-2.5 z-50 w-80 rounded-xl border border-gray-100 bg-white dark:bg-gray-900 shadow-2xl p-4 space-y-3.5">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h3 className="text-xs font-bold text-gray-900 dark:text-gray-50 uppercase tracking-wider">Compliance Alerts</h3>
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-[10px] text-blue-600 hover:underline font-semibold"
                    >
                      Read All
                    </button>
                  </div>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {notifications.map((n) => (
                      <div key={n.id} className={`p-2 rounded-lg text-xs space-y-0.5 border ${n.read ? 'bg-gray-50/50' : 'bg-blue-50/20 border-blue-100'}`}>
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-gray-850">{n.title}</span>
                          <span className="text-[9px] text-gray-400">{n.time}</span>
                        </div>
                        <p className="text-gray-500 leading-normal">{n.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Identity Profile Badge */}
            <div className="flex items-center space-x-2 border-l pl-4 border-gray-200">
              <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 border font-bold text-xs select-none">
                U
              </div>
              <div className="hidden lg:block text-xs text-left">
                <p className="font-bold text-gray-950 dark:text-gray-50">Active Auditor</p>
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">{currentRole}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout Stage */}
      <div className="flex">
        {/* Collapsible Sidebar Navigation */}
        <aside
          className={`shrink-0 transition-all duration-300 border-r border-gray-100 dark:border-gray-800/80 bg-white dark:bg-gray-900 ${
            isSidebarOpen ? 'w-64' : 'w-0 overflow-hidden'
          }`}
          style={{ height: 'calc(100vh - 3.5rem)' }}
        >
          <div className="flex flex-col h-full justify-between p-3.5">
            <nav className="space-y-1 overflow-y-auto">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isSelected = currentPage === item.id;
                const hasPerms = canAccess(item.id, currentRole);
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs'
                        : hasPerms
                        ? 'text-gray-650 hover:bg-gray-50 hover:text-gray-950'
                        : 'text-gray-300 dark:text-gray-650 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={`h-4.5 w-4.5 ${isSelected ? 'text-white' : hasPerms ? 'text-gray-400' : 'text-gray-300'}`} />
                      <span>{item.label}</span>
                    </div>
                    {isSelected && <ChevronRight className="h-3.5 w-3.5 text-white" />}
                  </button>
                );
              })}
            </nav>

            {/* Footer Workspace Info */}
            <div className="border-t pt-3 border-gray-100 dark:border-gray-800 text-[10px] text-gray-450 space-y-1 font-mono">
              <p>WORKSPACE: OFFLINE SECURE</p>
              <p>VER: 1.0.4 • compliant</p>
            </div>
          </div>
        </aside>

        {/* Content Viewer Stage */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto" style={{ height: 'calc(100vh - 3.5rem)' }}>
          <div className="max-w-7xl mx-auto space-y-6">
            {renderActivePage()}
          </div>
        </main>
      </div>

      {/* Floating System Toast Alert System */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2 max-w-sm w-full">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`p-3.5 rounded-xl border shadow-xl flex items-start space-x-3 text-xs justify-between animate-fade-in ${getToastStyle(
              toast.type
            )}`}
          >
            <p className="leading-relaxed font-semibold">{toast.message}</p>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="text-gray-400 hover:text-gray-600 shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
