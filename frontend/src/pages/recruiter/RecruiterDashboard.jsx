import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Users,
  CheckCircle2,
  Calendar,
  TrendingUp,
  Award,
  PlusCircle,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import api from '../../services/api';

const RecruiterDashboard = () => {
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await api.get('/recruiter/dashboard');
        if (res.data.success) {
          setStats(res.data.stats);
          setCharts(res.data.charts);
        }
      } catch (err) {
        console.error('Error fetching recruiter dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-48"></div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-28 bg-white rounded-2xl border border-slate-200 p-4"></div>
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Active Jobs', val: stats?.activeJobs || 0, icon: Briefcase, color: 'text-indigo-600 bg-indigo-50' },
    { label: 'Total Jobs Posted', val: stats?.totalJobs || 0, icon: TrendingUp, color: 'text-blue-600 bg-blue-50' },
    { label: 'Total Applicants', val: stats?.totalApplications || 0, icon: Users, color: 'text-purple-600 bg-purple-50' },
    { label: 'Shortlisted', val: stats?.shortlisted || 0, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Interviews Scheduled', val: stats?.interviews || 0, icon: Calendar, color: 'text-amber-600 bg-amber-50' },
    { label: 'Hired Candidates', val: stats?.hired || 0, icon: Award, color: 'text-teal-600 bg-teal-50' },
  ];

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Recruitment Command Center
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time candidate metrics, AI match rankings, and hiring pipelines
          </p>
        </div>
        <Link
          to="/recruiter/jobs/create"
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-100 transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post New Job</span>
        </Link>
      </div>

      {/* Metric Cards Grid */}
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

      {/* Analytics Breakdown: Status Distribution & Applications by Job */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Candidate Status Distribution */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">
            Candidate Pipeline Distribution
          </h3>
          <div className="space-y-3 pt-2">
            {Object.entries(charts?.statusDistribution || {}).map(([st, count]) => {
              const total = stats?.totalApplications || 1;
              const percent = Math.round((count / total) * 100);
              return (
                <div key={st} className="space-y-1 text-xs">
                  <div className="flex justify-between font-semibold text-slate-700">
                    <span>{st}</span>
                    <span>
                      {count} ({percent}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Applications by Job Posting */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Top Postings by Applicants</h3>
            <Link
              to="/recruiter/jobs"
              className="text-xs font-bold text-indigo-600 hover:underline"
            >
              All Jobs
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {(charts?.applicationsByJob || []).length === 0 ? (
              <div className="text-xs text-slate-400 py-6 text-center">
                No job applications recorded yet.
              </div>
            ) : (
              (charts?.applicationsByJob || []).map((item) => (
                <div
                  key={item.jobId}
                  className="py-3 flex items-center justify-between hover:bg-slate-50 rounded-xl px-2 transition-colors"
                >
                  <div className="min-w-0 flex-1 pr-4">
                    <p className="text-xs font-bold text-slate-800 truncate">{item.title}</p>
                    <span className="text-[11px] text-slate-400">
                      {item.count} total candidate{item.count !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <Link
                    to={`/recruiter/jobs/${item.jobId}/applicants`}
                    className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-xs flex items-center space-x-1 flex-shrink-0"
                  >
                    <span>Applicants</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruiterDashboard;
