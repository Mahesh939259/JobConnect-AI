import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Briefcase, Lock, Mail, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const from = location.state?.from?.pathname || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        if (from) {
          navigate(from, { replace: true });
        } else if (res.user.role === 'student') {
          navigate('/student/dashboard');
        } else if (res.user.role === 'recruiter') {
          navigate('/recruiter/dashboard');
        } else if (res.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
      } else {
        setError(res.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Cannot connect to backend server. Make sure the backend is running on http://127.0.0.1:5000.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemo = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <Link to="/" className="inline-flex items-center space-x-2">
          <div className="h-10 w-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-100">
            <Briefcase className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-slate-900">
            JobConnect <span className="text-indigo-600">AI</span>
          </span>
        </Link>
        <h2 className="text-xl font-bold text-slate-900">Sign in to your account</h2>
        <p className="text-xs text-slate-500">
          Enter your credentials to access your dashboard
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-8 rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/40 space-y-5">
          {/* Quick Demo Credentials Toolbar */}
          <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-indigo-900">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> 1-Click Demo Logins
              </span>
              <span className="text-[10px] text-indigo-500 font-normal">Auto-fills</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-[10px]">
              <button
                type="button"
                onClick={() => fillDemo('rahul.sharma@gmail.com', 'Password@123')}
                className="py-1.5 px-2 bg-white hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg border border-indigo-200 transition-all text-center"
              >
                Student
              </button>
              <button
                type="button"
                onClick={() =>
                  fillDemo('recruiter.razorpay@jobconnect.ai', 'Password@123')
                }
                className="py-1.5 px-2 bg-white hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg border border-indigo-200 transition-all text-center"
              >
                Recruiter
              </button>
              <button
                type="button"
                onClick={() => fillDemo('admin@jobconnect.ai', 'Password@123')}
                className="py-1.5 px-2 bg-white hover:bg-indigo-100 text-rose-700 font-bold rounded-lg border border-rose-200 transition-all text-center"
              >
                Admin
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full text-xs pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[11px] font-semibold text-indigo-600 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-100 flex items-center justify-center space-x-1.5 transition-all disabled:opacity-50"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 pt-2">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-indigo-600 hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
