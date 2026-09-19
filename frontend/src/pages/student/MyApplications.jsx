import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Briefcase, Calendar, MapPin, Sparkles, ExternalLink } from 'lucide-react';
import api from '../../services/api';
import { formatDate, getStatusBadgeClass } from '../../utils/formatters';
import MatchScoreBadge from '../../components/jobs/MatchScoreBadge';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const res = await api.get('/applications/my');
        if (res.data.success) {
          setApplications(res.data.applications || []);
        }
      } catch (err) {
        console.error('Error fetching applications:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          My Applications
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review all job applications submitted and their current review stages
        </p>
      </div>

      {applications.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No applications yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Explore verified open tech roles and apply with your AI-matched profile.
          </p>
          <Link
            to="/jobs"
            className="inline-block px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-xs"
          >
            Explore Jobs
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Job & Company</th>
                  <th className="px-6 py-4">Applied Date</th>
                  <th className="px-6 py-4">AI Match</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        <Link
                          to={`/jobs/${app.jobId?._id}`}
                          className="font-bold text-slate-900 hover:text-indigo-600 transition-colors"
                        >
                          {app.jobId?.title || 'Job Posting'}
                        </Link>
                        <p className="text-slate-500 font-medium">
                          {app.jobId?.company} • {app.jobId?.location}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {formatDate(app.appliedAt)}
                    </td>
                    <td className="px-6 py-4">
                      {app.aiMatch?.score ? (
                        <MatchScoreBadge score={app.aiMatch.score} details={app.aiMatch} />
                      ) : (
                        <span className="text-slate-400">N/A</span>
                      )}
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
                        className="font-bold text-indigo-600 hover:underline"
                      >
                        View Job
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyApplications;
