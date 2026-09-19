import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Briefcase,
  Building2,
  FileText,
  ShieldAlert,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import api from '../../services/api';
import { formatDate } from '../../utils/formatters';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/stats');
        if (res.data.success) {
          setStats(res.data.stats);
          setRecentActivity(res.data.recentActivity);
        }
      } catch (err) {
        console.error('Error fetching admin statistics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Users', val: stats?.totalUsers || 0, icon: Users, color: 'text-indigo-600 bg-indigo-50' },
    { label: 'Students', val: stats?.totalStudents || 0, icon: Users, color: 'text-blue-600 bg-blue-50' },
    { label: 'Recruiters', val: stats?.totalRecruiters || 0, icon: Users, color: 'text-purple-600 bg-purple-50' },
    { label: 'Companies', val: stats?.totalCompanies || 0, icon: Building2, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Total Jobs', val: stats?.totalJobs || 0, icon: Briefcase, color: 'text-amber-600 bg-amber-50' },
    { label: 'Applications', val: stats?.totalApplications || 0, icon: FileText, color: 'text-rose-600 bg-rose-50' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200 mb-2">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Platform Administrator Console</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          System Overview & Metrics
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Real-time database statistics from MongoDB and user moderation
        </p>
      </div>

      {/* Grid of stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-2"
            >
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${card.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-400">{card.label}</p>
                <p className="text-xl font-extrabold text-slate-900 mt-0.5">{card.val}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Platform Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Recent Registrations</h3>
            <Link to="/admin/users" className="text-xs font-bold text-indigo-600 hover:underline">
              Manage Users
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {(recentActivity?.recentUsers || []).map((u) => (
              <div key={u._id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-800">{u.name}</p>
                  <p className="text-slate-400">{u.email}</p>
                </div>
                <span className="capitalize px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Applications */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Recent Applications</h3>
          </div>

          <div className="divide-y divide-slate-100">
            {(recentActivity?.recentApplications || []).map((app) => (
              <div key={app._id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-800">{app.jobId?.title || 'Job'}</p>
                  <p className="text-slate-400">
                    Applicant: {app.studentId?.name || 'Student'} • {app.jobId?.company}
                  </p>
                </div>
                <span className="text-[10px] font-bold text-slate-500">
                  {formatDate(app.appliedAt)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
