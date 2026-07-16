import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Upload,
  FileText,
  CalendarClock,
  Bot,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  Plus,
  Activity,
  BookOpen,
  PhoneCall,
  Languages,
  Settings as SettingsIcon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, labelKey: 'nav.dashboard' },
  { to: '/prescriptions/upload', icon: Upload, labelKey: 'nav.upload_prescription' },
  { to: '/prescriptions', icon: FileText, labelKey: 'nav.my_prescriptions' },
  { to: '/schedule', icon: CalendarClock, labelKey: 'nav.medication_schedule' },
  { to: '/history', icon: Activity, labelKey: 'nav.medical_history' },
  { to: '/medicines', icon: BookOpen, labelKey: 'nav.medicine_library' },
  { to: '/assistant', icon: Bot, labelKey: 'nav.ai_assistant' },
  { to: '/meditriage', icon: Activity, labelKey: 'nav.meditriage' },
  { to: '/emergency', icon: PhoneCall, labelKey: 'nav.emergency' },
  { to: '/settings', icon: SettingsIcon, labelKey: 'Settings' },
];

function NavItem({ to, icon: Icon, label, comingSoon, collapsed, onClick }) {
  if (comingSoon) {
    return (
      <div
        className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-dark-500 cursor-not-allowed
                     ${collapsed ? 'justify-center' : ''}`}
        title={collapsed ? label : undefined}
      >
        <Icon className="w-5 h-5 flex-shrink-0" />
        {!collapsed && (
          <span className="text-sm font-medium truncate flex-1">{label}</span>
        )}
        {!collapsed && (
          <span className="text-[10px] bg-dark-700/50 text-dark-500 px-1.5 py-0.5 rounded-md font-medium">
            Soon
          </span>
        )}
      </div>
    );
  }

  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
         ${collapsed ? 'justify-center' : ''}
         ${isActive
           ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20'
           : 'text-dark-400 hover:text-dark-200 hover:bg-dark-700/50 border border-transparent'
         }`
      }
      title={collapsed ? label : undefined}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      {!collapsed && <span className="text-sm font-medium truncate">{label}</span>}
    </NavLink>
  );
}

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'hi' : 'en';
    i18n.changeLanguage(newLang);
  };

  const closeMobileSidebar = () => setSidebarOpen(false);

  const userInitials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <div className="flex h-screen overflow-hidden bg-dark-950">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={closeMobileSidebar}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          flex flex-col
          bg-dark-900/80 backdrop-blur-2xl border-r border-dark-700/50
          transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${collapsed ? 'w-[72px]' : 'w-72'}
        `}
      >
        {/* Logo */}
        <div className={`flex items-center gap-3 p-4 border-b border-dark-700/50 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-teal-500 flex items-center justify-center flex-shrink-0">
            <Plus className="w-5 h-5 text-white" strokeWidth={3} />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold gradient-text">MediGuide</h1>
              <p className="text-[10px] text-dark-500 font-medium tracking-wider uppercase">AI Platform</p>
            </div>
          )}
          {/* Close button - mobile only */}
          <button
            onClick={closeMobileSidebar}
            className="lg:hidden p-1.5 rounded-lg text-dark-400 hover:text-dark-200 hover:bg-dark-700/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavItem key={item.to} to={item.to} icon={item.icon} label={t(item.labelKey)} collapsed={collapsed} onClick={closeMobileSidebar} />
          ))}
        </nav>

        {/* Collapse toggle - desktop only */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex items-center justify-center p-2 mx-3 mb-2 rounded-lg text-dark-500 hover:text-dark-300 hover:bg-dark-700/50 transition-colors"
        >
          <ChevronLeft className={`w-4 h-4 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
        </button>

        {/* User section */}
        <div className={`p-3 border-t border-dark-700/50 ${collapsed ? 'flex flex-col items-center gap-2' : ''}`}>
          <div className={`flex items-center gap-3 ${collapsed ? 'flex-col' : ''}`}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 to-teal-600 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-white">{userInitials}</span>
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-dark-200 truncate">{user?.full_name || 'User'}</p>
                <p className="text-xs text-dark-500 truncate">{user?.email || ''}</p>
              </div>
            )}
            
            <button
              onClick={toggleLanguage}
              className="p-2 rounded-lg text-dark-500 hover:text-primary-400 hover:bg-primary-500/10 transition-all"
              title={t('common.language')}
            >
              <Languages className="w-4 h-4" />
            </button>

            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-dark-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
              title={t('nav.sign_out')}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-dark-900/50 backdrop-blur-xl border-b border-dark-700/50">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl text-dark-400 hover:text-dark-200 hover:bg-dark-700/50 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-teal-500 flex items-center justify-center">
              <Plus className="w-4 h-4 text-white" strokeWidth={3} />
            </div>
            <span className="text-sm font-bold gradient-text">MediGuide</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 to-teal-600 flex items-center justify-center">
            <span className="text-xs font-bold text-white">{userInitials}</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
