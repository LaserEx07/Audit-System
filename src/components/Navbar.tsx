import { useState, useEffect } from 'react';
import { Bell, Sun, Moon, Search, ChevronDown, Shield, CheckCircle2, AlertTriangle, Info, User, HelpCircle } from 'lucide-react';
import { getActiveUser, setActiveUser, Database } from '../services/db';
import { UserRole, Notification } from '../types';

interface NavbarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  globalSearch: string;
  onGlobalSearchChange: (val: string) => void;
  onNavigate: (page: string) => void;
}

export default function Navbar({
  currentRole,
  onRoleChange,
  darkMode,
  onToggleDarkMode,
  globalSearch,
  onGlobalSearchChange,
  onNavigate
}: NavbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    setNotifications(Database.getNotifications());
    // Polling simulation or direct fetch
    const interval = setInterval(() => {
      setNotifications(Database.getNotifications());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAsRead = (id: string) => {
    Database.markNotificationAsRead(id);
    setNotifications(Database.getNotifications());
  };

  const handleClearAll = () => {
    Database.clearAllNotifications();
    setNotifications([]);
  };

  const handleRoleSelect = (role: UserRole) => {
    const roleToUserMap: Record<UserRole, { name: string; email: string }> = {
      Administrator: { name: 'Alice Smith', email: 'alice.smith@auditcorp.com' },
      'Internal Auditor': { name: 'Sophia Martinez', email: 'sophia.m@auditcorp.com' },
      Accounting: { name: 'Emily Davis', email: 'emily.davis@auditcorp.com' },
      Warehouse: { name: 'Robert Johnson', email: 'robert.j@auditcorp.com' },
      Purchasing: { name: 'Michael Brown', email: 'michael.b@auditcorp.com' },
      Manager: { name: 'John Doe', email: 'john.doe@auditcorp.com' },
      Viewer: { name: 'David Chen', email: 'david.chen@apexlogistics.com' }
    };

    const userDetails = roleToUserMap[role];
    setActiveUser({
      id: `emp-${role.toLowerCase()}`,
      fullName: userDetails.name,
      email: userDetails.email,
      role: role
    });
    onRoleChange(role);
    setShowRoleMenu(false);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'audit':
        return <Info className="h-4 w-4 text-blue-500" />;
      case 'finding':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'action':
        return <ChevronDown className="h-4 w-4 text-amber-500" />;
      case 'approval':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      default:
        return <HelpCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 px-6 shadow-xs backdrop-blur-md">
      {/* Search Bar */}
      <div className="flex flex-1 max-w-md items-center">
        <div className="relative w-full">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            id="navbar-global-search"
            type="search"
            value={globalSearch}
            onChange={(e) => onGlobalSearchChange(e.target.value)}
            placeholder="Search audits, findings, employees, companies..."
            className="block w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 py-2 pl-10 pr-4 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:border-blue-500 focus:bg-white dark:focus:bg-gray-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>
      </div>

      {/* Right Navigation Actions */}
      <div className="flex items-center space-x-4">
        {/* Dynamic Role Switcher Badge */}
        <div className="relative">
          <button
            id="role-switcher-btn"
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center space-x-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 shadow-xs hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <Shield className="h-3.5 w-3.5 text-blue-500" />
            <span>Role: {currentRole}</span>
            <ChevronDown className="h-3 w-3 text-gray-400" />
          </button>

          {showRoleMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowRoleMenu(false)} />
              <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-1 shadow-lg ring-1 ring-black/5 focus:outline-hidden z-20">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800 mb-1">
                  Simulate Workspace Role
                </div>
                {(
                  [
                    'Administrator',
                    'Internal Auditor',
                    'Accounting',
                    'Warehouse',
                    'Purchasing',
                    'Manager',
                    'Viewer'
                  ] as UserRole[]
                ).map((role) => (
                  <button
                    key={role}
                    onClick={() => handleRoleSelect(role)}
                    className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-xs transition-colors ${
                      currentRole === role
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <span>{role}</span>
                    {currentRole === role && <CheckCircle2 className="h-3.5 w-3.5" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          id="theme-toggle-btn"
          onClick={onToggleDarkMode}
          title="Toggle Theme"
          className="rounded-lg p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        >
          {darkMode ? <Sun className="h-5 w-5 text-amber-500" /> : <Moon className="h-5 w-5" />}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            id="notification-bell-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-lg p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-gray-900 animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)} />
              <div className="absolute right-0 mt-2 w-80 origin-top-right rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl ring-1 ring-black/5 z-20">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 px-4 py-2.5">
                  <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                    System Notifications ({unreadCount} unread)
                  </span>
                  {notifications.length > 0 && (
                    <button
                      onClick={handleClearAll}
                      className="text-[10px] font-semibold text-red-500 hover:underline"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                <div className="max-h-64 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-xs text-gray-400 dark:text-gray-500">
                      No active alerts
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-3 transition-colors ${
                          notif.isRead ? 'opacity-70' : 'bg-blue-50/50 dark:bg-blue-950/10'
                        }`}
                      >
                        <div className="flex items-start space-x-2.5">
                          <div className="mt-0.5 shrink-0">{getNotificationIcon(notif.type)}</div>
                          <div className="flex-1 space-y-0.5">
                            <p className="text-xs font-medium text-gray-900 dark:text-gray-100 leading-tight">
                              {notif.title}
                            </p>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-snug">
                              {notif.message}
                            </p>
                            <div className="flex items-center justify-between pt-1">
                              <span className="text-[9px] text-gray-400">{notif.date}</span>
                              {!notif.isRead && (
                                <button
                                  onClick={() => handleMarkAsRead(notif.id)}
                                  className="text-[9px] text-blue-500 font-semibold hover:underline"
                                >
                                  Mark Read
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Profile Info */}
        <div className="flex items-center space-x-2.5 border-l border-gray-200 dark:border-gray-800 pl-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 font-bold text-white text-xs select-none">
            {getActiveUser().fullName.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 leading-tight">
              {getActiveUser().fullName}
            </p>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-none">
              {getActiveUser().role}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
