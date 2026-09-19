import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, ArrowRight } from 'lucide-react';
import api from '../../services/api';
import JobCard from '../../components/jobs/JobCard';

const SavedJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSavedJobs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/saved-jobs');
      if (res.data.success) {
        setJobs(res.data.jobs || []);
      }
    } catch (err) {
      console.error('Error fetching saved jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Saved Job Bookmarks
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Positions you've saved to apply for later
        </p>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <Bookmark className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No saved jobs</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click the bookmark icon on any job card to save it here for quick access.
          </p>
          <Link
            to="/jobs"
            className="inline-block px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-xs"
          >
            Browse Jobs
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.map((job) => (
            <JobCard key={job._id} job={job} initialSaved={true} onApplySuccess={fetchSavedJobs} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedJobs;
