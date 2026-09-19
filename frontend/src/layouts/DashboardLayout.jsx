import React from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  FileText,
  Bookmark,
  Sparkles,
  PlusCircle,
  Users,
  Briefcase,
  Building2,
  LogOut,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from '../components/common/NotificationDropdown';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const studentLinks = [
    { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { name: 'AI Recommended', path: '/student/recommended-jobs', icon: Sparkles, highlight: true },
    { name: 'My Profile & Skills', path: '/student/profile', icon: User },
    { name: 'Applications', path: '/student/applications', icon: FileText },
    { name: 'Saved Bookmarks', path: '/student/saved-jobs', icon: Bookmark },
    { name: 'Resume Analyzer', path: '/student/resume-analysis', icon: Sparkles },
  ];

  const recruiterLinks = [
    { name: 'Dashboard', path: '/recruiter/dashboard', icon: LayoutDashboard },
    { name: 'Post New Job', path: '/recruiter/jobs/create', icon: PlusCircle, highlight: true },
    { name: 'Manage Jobs', path: '/recruiter/jobs', icon: Briefcase },
    { name: 'Scheduled Interviews', path: '/recruiter/interviews', icon: Users },
    { name: 'Company Profile', path: '/recruiter/company', icon: Building2 },
  ];

  const adminLinks = [
    { name: 'Overview Stats', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Manage Users', path: '/admin/users', icon: Users },
    { name: 'Platform Jobs', path: '/admin/jobs', icon: Briefcase },
    { name: 'Verified Companies', path: '/admin/companies', icon: Building2 },
  ];

  let links = studentLinks;
  if (user?.role === 'recruiter') links = recruiterLinks;
  if (user?.role === 'admin') links = adminLinks;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar for desktop */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 flex-shrink-0 flex flex-col justify-between">
        <div>
          {/* Brand header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
                <Briefcase className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-lg tracking-tight text-slate-900">
                JobConnect <span className="text-indigo-600">AI</span>
              </span>
            </Link>
          </div>

          {/* User mini badge */}
          <div className="p-4 mx-3 my-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center ring-1 ring-indigo-200 flex-shrink-0">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full rounded-xl object-cover"
                />
              ) : (
                user?.name?.charAt(0).toUpperCase() || 'U'
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-800 truncate">{user?.name}</p>
              <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize bg-indigo-100 text-indigo-700">
                {user?.role}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  end={link.path === '/student/dashboard' || link.path === '/recruiter/dashboard' || link.path === '/admin/dashboard'}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-100'
                        : link.highlight
                        ? 'text-indigo-600 hover:bg-indigo-50 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{link.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom controls */}
        <div className="p-4 border-t border-slate-100 space-y-2">
          <Link
            to="/jobs"
            className="flex items-center space-x-3 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl"
          >
            <Briefcase className="w-4 h-4 text-slate-400" />
            <span>Public Job Board</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar for dashboard */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium text-slate-500">Welcome back,</span>
            <span className="text-xs font-bold text-slate-900">{user?.name}</span>
          </div>

          <div className="flex items-center space-x-4">
            <NotificationDropdown />
            <Link
              to="/"
              className="text-xs font-medium text-slate-500 hover:text-indigo-600 transition-colors"
            >
              Exit to Main Site →
            </Link>
          </div>
        </header>

        {/* Dashboard Page Content */}
        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
