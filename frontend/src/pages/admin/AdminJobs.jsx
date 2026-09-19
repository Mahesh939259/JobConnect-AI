import React, { useState, useEffect } from 'react';
import { Briefcase, Trash2, ExternalLink, MapPin } from 'lucide-react';
import api from '../../services/api';
import { formatDate, formatSalary } from '../../utils/formatters';

const AdminJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/jobs?limit=50');
      if (res.data.success) {
        setJobs(res.data.jobs || []);
      }
    } catch (err) {
      console.error('Error fetching platform jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this job posting from the entire platform?')) return;
    try {
      await api.delete(`/admin/jobs/${id}`);
      setJobs(jobs.filter((j) => j._id !== id));
    } catch (err) {
      alert('Failed to delete job posting');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Platform Job Listings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review, moderate, and remove inappropriate job postings
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-12 text-center">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Title & Company</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Salary Range</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {jobs.map((job) => (
                  <tr key={job._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-slate-900">{job.title}</p>
                        <p className="text-slate-500">{job.company}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{job.location}</td>
                    <td className="px-6 py-4 font-semibold text-emerald-700">
                      {formatSalary(job.salaryMin, job.salaryMax)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {job.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(job._id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Job"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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

export default AdminJobs;
