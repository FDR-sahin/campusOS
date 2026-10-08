import React from 'react';
import { Sparkles, Calendar, BookOpen, Clock, ShieldAlert, Bus, HelpCircle, User as UserIcon, LogOut, Compass, LayoutDashboard, Search, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAdminView: boolean;
  setIsAdminView: (val: boolean) => void;
  onOpenSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isAdminView,
  setIsAdminView,
  onOpenSearch,
}) => {
  const { user, logout, openAuthModal, isAdmin } = useAuth();

  const navItems = [
    { id: 'today', label: 'Today', icon: Compass },
    { id: 'notices', label: 'Notices', icon: Sparkles },
    { id: 'exams', label: 'Exams', icon: Clock },
    { id: 'events', label: 'Events & Clubs', icon: Calendar },
    { id: 'resources', label: 'Resources', icon: BookOpen },
    { id: 'transport', label: 'Transport', icon: Bus },
    { id: 'helpdesk', label: 'Helpdesk', icon: HelpCircle },
    { id: 'lostfound', label: 'Lost & Found', icon: ShieldAlert },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-900/95 backdrop-blur-md">
      {/* Top University Announcement Bar */}
      <div className="hidden sm:flex items-center justify-between px-4 sm:px-8 py-1.5 bg-slate-950 border-b border-slate-800/80 text-[11px] text-slate-300">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-white">City University:</span>
          <span>Permanent Campus, Khagan, Birulia, Savar, Dhaka-1216</span>
          <span className="text-slate-600">·</span>
          <span className="text-sky-300 font-medium">Fall 2026 Academic Trimester</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-slate-300">Proctor Office: +880 1711-234567</span>
          <span className="text-slate-600">·</span>
          <a
            href="https://cityuniversity.ac.bd"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-300 hover:text-white transition-colors"
          >
            cityuniversity.ac.bd
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setIsAdminView(false);
                setActiveTab('today');
              }}
              className="flex items-center gap-2.5 text-left focus:outline-none group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20 group-hover:scale-105 transition-transform">
                <span className="font-mono font-bold text-white text-base">CU</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base tracking-tight text-white group-hover:text-sky-400 transition-colors">CampusOS</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-950 border border-sky-800 text-sky-400">v2.6</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-none">City University Digital Hub</p>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          {!isAdminView && (
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                      isActive
                        ? 'text-sky-300 bg-sky-950/70 border border-sky-800 shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          )}

          {/* Right Area: Search, Admin Toggle (Only if Admin), and User Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Global Search Button */}
            <button
              onClick={onOpenSearch}
              aria-label="Search Campus"
              className="flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Search Campus</span>
              <kbd className="hidden sm:inline text-[10px] font-mono bg-slate-900 px-1.5 py-0.5 rounded text-slate-400 border border-slate-700">⌘K</kbd>
            </button>

            {/* ONLY DISPLAYED WHEN AN ADMIN IS LOGGED IN */}
            {isAdmin && (
              <button
                onClick={() => setIsAdminView(!isAdminView)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all border ${
                  isAdminView
                    ? 'bg-amber-600 text-white border-amber-500 shadow-sm'
                    : 'bg-amber-950/60 text-amber-300 border-amber-800/80 hover:bg-amber-900/60'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>{isAdminView ? '← Back to Student View' : 'Admin Panel'}</span>
              </button>
            )}

            {/* User Profile or Single Sign In */}
            {user ? (
              <div className="flex items-center gap-2 pl-1">
                <button
                  onClick={() => {
                    setIsAdminView(false);
                    setActiveTab('profile');
                  }}
                  className="flex items-center gap-2 text-left p-1 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white uppercase shadow-sm">
                    {user.name.slice(0, 2)}
                  </div>
                  <div className="hidden lg:block">
                    <div className="text-xs font-medium text-white leading-tight">{user.name.split(' ')[0]}</div>
                    <div className="text-[10px] text-slate-400 leading-none">
                      {user.role === 'ADMIN' ? 'Registrar Staff' : user.department.split(' ')[0]}
                    </div>
                  </div>
                </button>
                <button
                  onClick={logout}
                  title="Sign Out"
                  aria-label="Sign Out"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={openAuthModal}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-sky-600 hover:bg-sky-500 text-white transition-all shadow-md shadow-sky-600/20"
              >
                Sign In
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Row */}
        {!isAdminView && (
          <div className="md:hidden flex items-center gap-1 overflow-x-auto py-2 border-t border-slate-800 scrollbar-none">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs whitespace-nowrap font-medium rounded-lg transition-all ${
                    isActive
                      ? 'text-sky-300 bg-sky-950 border border-sky-800'
                      : 'text-slate-300 hover:text-white bg-slate-800/80'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
};
