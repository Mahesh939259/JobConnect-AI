import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Briefcase,
  Sparkles,
  Menu,
  X,
  User,
  LogOut,
  ChevronDown,
  FileText,
  Bookmark,
  PlusCircle,
  ShieldAlert,
  Users,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import NotificationDropdown from '../common/NotificationDropdown';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2.5">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-100">
                <Briefcase className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-700 bg-clip-text text-transparent">
                  JobConnect <span className="text-indigo-600 font-bold">AI</span>
                </span>
                <span className="text-[9px] uppercase tracking-wider font-bold text-indigo-500 -mt-1 flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5" /> Next-Gen Hiring
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:ml-8 md:flex md:space-x-1">
              <Link
                to="/"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/')
                    ? 'text-indigo-600 bg-indigo-50/70'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Home
              </Link>
              <Link
                to="/jobs"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/jobs')
                    ? 'text-indigo-600 bg-indigo-50/70'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Find Jobs
              </Link>
              <Link
                to="/companies"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/companies')
                    ? 'text-indigo-600 bg-indigo-50/70'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Companies
              </Link>
              {user?.role === 'student' && (
                <Link
                  to="/student/recommended-jobs"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                    isActive('/student/recommended-jobs')
                      ? 'text-indigo-600 bg-indigo-50/70 font-semibold'
                      : 'text-indigo-700 hover:bg-indigo-50'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  <span>AI Matches</span>
                </Link>
              )}
            </div>
          </div>

          {/* Right Header Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-3">
            {isAuthenticated && user ? (
              <>
                <NotificationDropdown />

                {user.role === 'recruiter' && (
                  <Link
                    to="/recruiter/jobs/create"
                    className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Post a Job</span>
                  </Link>
                )}

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors focus:outline-none"
                  >
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm ring-1 ring-indigo-200">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-full h-full rounded-lg object-cover"
                        />
                      ) : (
                        user.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="text-left hidden lg:block">
                      <p className="text-xs font-semibold text-slate-800 leading-tight">
                        {user.name}
                      </p>
                      <p className="text-[10px] capitalize text-slate-500 font-medium">
                        {user.role}
                      </p>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-xl ring-1 ring-slate-900/5 py-1.5 z-50 divide-y divide-slate-100">
                      <div className="px-4 py-2.5">
                        <p className="text-xs text-slate-500">Signed in as</p>
                        <p className="text-xs font-semibold text-slate-800 truncate">
                          {user.email}
                        </p>
                      </div>

                      <div className="py-1">
                        {user.role === 'student' && (
                          <>
                            <Link
                              to="/student/dashboard"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                            >
                              <Briefcase className="w-4 h-4 mr-2 text-slate-400" />
                              Student Dashboard
                            </Link>
                            <Link
                              to="/student/profile"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                            >
                              <User className="w-4 h-4 mr-2 text-slate-400" />
                              My Profile
                            </Link>
                            <Link
                              to="/student/applications"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                            >
                              <FileText className="w-4 h-4 mr-2 text-slate-400" />
                              My Applications
                            </Link>
                            <Link
                              to="/student/saved-jobs"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                            >
                              <Bookmark className="w-4 h-4 mr-2 text-slate-400" />
                              Saved Jobs
                            </Link>
                            <Link
                              to="/student/resume-analysis"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center px-4 py-2 text-xs font-medium text-indigo-600 hover:bg-indigo-50"
                            >
                              <Sparkles className="w-4 h-4 mr-2 text-indigo-500" />
                              AI Resume Analyzer
                            </Link>
                          </>
                        )}

                        {user.role === 'recruiter' && (
                          <>
                            <Link
                              to="/recruiter/dashboard"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                            >
                              <Briefcase className="w-4 h-4 mr-2 text-slate-400" />
                              Recruiter Dashboard
                            </Link>
                            <Link
                              to="/recruiter/jobs"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                            >
                              <FileText className="w-4 h-4 mr-2 text-slate-400" />
                              Manage Posted Jobs
                            </Link>
                            <Link
                              to="/recruiter/interviews"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                            >
                              <Users className="w-4 h-4 mr-2 text-slate-400" />
                              Scheduled Interviews
                            </Link>
                            <Link
                              to="/recruiter/company"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                            >
                              <User className="w-4 h-4 mr-2 text-slate-400" />
                              Company Profile
                            </Link>
                          </>
                        )}

                        {user.role === 'admin' && (
                          <>
                            <Link
                              to="/admin/dashboard"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50"
                            >
                              <ShieldAlert className="w-4 h-4 mr-2 text-rose-500" />
                              Admin Console
                            </Link>
                            <Link
                              to="/admin/users"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                            >
                              <Users className="w-4 h-4 mr-2 text-slate-400" />
                              Manage Users
                            </Link>
                          </>
                        )}
                      </div>

                      <div className="py-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors text-left"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-100 transition-all"
                >
                  Register
                </Link>
                <Link
                  to="/register?role=recruiter"
                  className="hidden lg:inline-flex items-center space-x-1 px-3.5 py-2 rounded-xl text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                >
                  <span>Post a Job</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center space-x-2">
            {isAuthenticated && <NotificationDropdown />}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <div className="space-y-1">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
            >
              Home
            </Link>
            <Link
              to="/jobs"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
            >
              Find Jobs
            </Link>
            <Link
              to="/companies"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
            >
              Companies
            </Link>
          </div>

          {isAuthenticated && user ? (
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <div className="px-3 py-1">
                <p className="text-sm font-bold text-slate-900">{user.name}</p>
                <p className="text-xs text-slate-500 capitalize">{user.role} account</p>
              </div>

              {user.role === 'student' && (
                <>
                  <Link
                    to="/student/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/student/recommended-jobs"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-indigo-600 hover:bg-indigo-50"
                  >
                    AI Recommended Jobs
                  </Link>
                  <Link
                    to="/student/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Profile & Resume
                  </Link>
                  <Link
                    to="/student/applications"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Applications
                  </Link>
                  <Link
                    to="/student/resume-analysis"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    AI Resume Analyzer
                  </Link>
                </>
              )}

              {user.role === 'recruiter' && (
                <>
                  <Link
                    to="/recruiter/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Recruiter Dashboard
                  </Link>
                  <Link
                    to="/recruiter/jobs/create"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-indigo-600 hover:bg-indigo-50"
                  >
                    + Post a New Job
                  </Link>
                  <Link
                    to="/recruiter/jobs"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Posted Jobs & Applicants
                  </Link>
                </>
              )}

              {user.role === 'admin' && (
                <Link
                  to="/admin/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50"
                >
                  Admin Console
                </Link>
              )}

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-4 border-t border-slate-100 flex flex-col space-y-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center px-4 py-2.5 rounded-xl bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-700 shadow-sm"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
