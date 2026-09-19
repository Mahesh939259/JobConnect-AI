import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircle,
  Briefcase,
  Users,
  Edit,
  Trash2,
  ExternalLink,
  MapPin,
  Calendar,
} from 'lucide-react';
import api from '../../services/api';
import { formatDate, formatSalary } from '../../utils/formatters';

const RecruiterJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/recruiter/jobs');
      if (res.data.success) {
        setJobs(res.data.jobs || []);
      }
    } catch (err) {
      console.error('Error fetching recruiter jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this job posting?')) return;
    try {
      await api.delete(`/jobs/${id}`);
      setJobs(jobs.filter((j) => j._id !== id));
    } catch (err) {
      alert('Failed to delete job posting');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Manage Posted Jobs
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review active listings, track candidate flow, and edit job specifications
          </p>
        </div>
        <Link
          to="/recruiter/jobs/create"
          className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-100 transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post New Job</span>
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <Briefcase className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No jobs posted yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Create your first job listing to start receiving AI-matched applications.
          </p>
          <Link
            to="/recruiter/jobs/create"
            className="inline-block px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-xs"
          >
            Create Job Posting
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Job Title & Location</th>
                  <th className="px-6 py-4">Type & Work Mode</th>
                  <th className="px-6 py-4">Applicants</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Posted Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {jobs.map((job) => (
                  <tr key={job._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        <Link
                          to={`/recruiter/jobs/${job._id}/applicants`}
                          className="font-bold text-slate-900 hover:text-indigo-600 transition-colors block"
                        >
                          {job.title}
                        </Link>
                        <p className="text-slate-400 flex items-center gap-1 text-[11px]">
                          <MapPin className="w-3 h-3" />
                          {job.location} • {formatSalary(job.salaryMin, job.salaryMax)}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <span className="font-semibold">{job.jobType}</span> ({job.workMode})
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        to={`/recruiter/jobs/${job._id}/applicants`}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 font-bold hover:bg-indigo-100 transition-colors"
                      >
                        <Users className="w-3 h-3" />
                        <span>{job.applicantsCount || 0} Candidates</span>
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          job.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {job.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {formatDate(job.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          to={`/recruiter/jobs/${job._id}/applicants`}
                          className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50"
                          title="View Candidates"
                        >
                          <Users className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/jobs/${job._id}`}
                          target="_blank"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                          title="Public Preview"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(job._id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          title="Delete Job"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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

export default RecruiterJobs;
