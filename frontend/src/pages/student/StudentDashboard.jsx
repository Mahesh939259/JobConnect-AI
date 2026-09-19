import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Clock,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  TrendingUp,
  FileText,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import api from '../../services/api';
import { formatDate, getStatusBadgeClass } from '../../utils/formatters';

const StudentDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentApplications, setRecentApplications] = useState([]);
  const [upcomingInterviews, setUpcomingInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await api.get('/student/dashboard');
        if (res.data.success) {
          setStats(res.data.stats);
          setRecentApplications(res.data.recentApplications || []);
          setUpcomingInterviews(res.data.upcomingInterviews || []);
        }
      } catch (err) {
        console.error('Error fetching student dashboard:', err);
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-white rounded-2xl border border-slate-200 p-4"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Student Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track your job applications, interviews, and resume intelligence
          </p>
        </div>
        <Link
          to="/student/recommended-jobs"
          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-100 transition-all self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          <span>View AI Job Matches</span>
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">Total Applied</p>
            <p className="text-2xl font-extrabold text-slate-900">{stats?.totalApplications || 0}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">Under Review</p>
            <p className="text-2xl font-extrabold text-slate-900">{stats?.underReview || 0}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">Shortlisted</p>
            <p className="text-2xl font-extrabold text-emerald-600">{stats?.shortlisted || 0}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">Interviews</p>
            <p className="text-2xl font-extrabold text-amber-600">{stats?.interviews || 0}</p>
          </div>
        </div>
      </div>

      {/* Two Widgets: Profile Completion & Resume Score */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Completion */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Profile Completion</h3>
            <span className="text-xs font-extrabold text-indigo-600">
              {stats?.profileCompletion || 20}%
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-500"
              style={{ width: `${stats?.profileCompletion || 20}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-slate-500">
              {stats?.profileCompletion >= 85
                ? 'Great! Your profile is ready for recruiter discovery.'
                : 'Add education, skills & projects to increase visibility.'}
            </span>
            <Link
              to="/student/profile"
              className="font-bold text-indigo-600 hover:underline flex items-center gap-0.5 flex-shrink-0"
            >
              <span>Edit</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Resume Score */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Resume Quality Score</span>
            </h3>
            <span className="text-xs font-extrabold text-emerald-600">
              {stats?.resumeScore || 0} / 100
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${stats?.resumeScore || 0}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-slate-500">
              AI analysis of keywords, projects, and formatting.
            </span>
            <Link
              to="/student/resume-analysis"
              className="font-bold text-indigo-600 hover:underline flex items-center gap-0.5 flex-shrink-0"
            >
              <span>View Report</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Upcoming Interviews */}
      {upcomingInterviews.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-500" />
              <span>Upcoming Scheduled Interviews</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingInterviews.map((item) => (
              <div
                key={item._id}
                className="p-4 bg-amber-50/40 rounded-2xl border border-amber-200/60 space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-900">{item.jobId?.title}</p>
                    <p className="text-[11px] text-slate-500">{item.jobId?.company}</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    {item.type}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 text-xs">
                  <span className="text-slate-600 font-medium">
                    {formatDate(item.date)} at {item.time}
                  </span>
                  {item.meetingLink && (
                    <a
                      href={item.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold text-indigo-600 hover:underline inline-flex items-center gap-0.5"
                    >
                      <span>Join Meeting</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Applications Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Recent Applications</h3>
          <Link
            to="/student/applications"
            className="text-xs font-bold text-indigo-600 hover:underline"
          >
            View All ({stats?.totalApplications || 0})
          </Link>
        </div>

        {recentApplications.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No applications submitted yet.{' '}
            <Link to="/jobs" className="text-indigo-600 font-bold hover:underline">
              Explore open positions
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Job Title</th>
                  <th className="px-6 py-3.5">Company</th>
                  <th className="px-6 py-3.5">Applied Date</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentApplications.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {app.jobId?.title || 'Position'}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {app.jobId?.company || 'Company'}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {formatDate(app.appliedAt)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold border ${getStatusBadgeClass(
                          app.status
                        )}`}
                      >
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/jobs/${app.jobId?._id}`}
                        className="text-indigo-600 hover:underline font-bold text-xs"
                      >
                        View Job
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
