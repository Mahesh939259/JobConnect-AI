import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Briefcase,
  IndianRupee,
  Clock,
  Bookmark,
  Building2,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { formatSalary, formatRelativeTime } from '../../utils/formatters';
import MatchScoreBadge from './MatchScoreBadge';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import ApplyModal from './ApplyModal';

const JobCard = ({
  job,
  matchScore = null,
  matchDetails = null,
  initialSaved = false,
  onApplySuccess,
}) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [saving, setSaving] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  const handleSaveToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user?.role !== 'student') return;

    try {
      setSaving(true);
      if (isSaved) {
        await api.delete(`/saved-jobs/${job._id}`);
        setIsSaved(false);
      } else {
        await api.post(`/saved-jobs/${job._id}`);
        setIsSaved(true);
      }
    } catch (err) {
      console.error('Error toggling save job:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleApplyClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user?.role !== 'student') {
      alert('Only student accounts can apply for jobs.');
      return;
    }

    setIsApplyModalOpen(true);
  };

  const companyLogo =
    job.companyId?.logo ||
    'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100&auto=format&fit=crop&q=60';

  return (
    <>
      <div className="group relative bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all duration-200 flex flex-col justify-between">
        <div>
          {/* Top Row: Logo, Title, Bookmark */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start space-x-3.5">
              <img
                src={companyLogo}
                alt={job.company}
                className="w-12 h-12 rounded-xl object-cover border border-slate-100 p-0.5 shadow-xs flex-shrink-0"
                onError={(e) => {
                  e.target.src =
                    'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100&auto=format&fit=crop&q=60';
                }}
              />
              <div>
                <Link
                  to={`/jobs/${job._id}`}
                  className="font-bold text-slate-900 text-base group-hover:text-indigo-600 transition-colors line-clamp-1"
                >
                  {job.title}
                </Link>
                <div className="flex items-center space-x-2 mt-0.5 text-xs text-slate-500 font-medium">
                  <span className="text-slate-700 font-semibold hover:underline">
                    {job.company}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-0.5">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {job.location}
                  </span>
                </div>
              </div>
            </div>

            {/* Bookmark button */}
            <button
              onClick={handleSaveToggle}
              disabled={saving}
              className={`p-2 rounded-xl border transition-colors ${
                isSaved
                  ? 'bg-amber-50 border-amber-200 text-amber-600'
                  : 'border-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-50'
              }`}
              title={isSaved ? 'Remove from saved' : 'Save job'}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-500' : ''}`} />
            </button>
          </div>

          {/* AI Match Badge (if available or passed) */}
          {matchScore !== null && (
            <div className="mt-3">
              <MatchScoreBadge score={matchScore} details={matchDetails} />
            </div>
          )}

          {/* Badges: Salary, Exp, Type, Mode */}
          <div className="flex flex-wrap gap-2 mt-3.5 text-xs">
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-semibold border border-emerald-100">
              <IndianRupee className="w-3 h-3 mr-0.5 text-emerald-600" />
              {formatSalary(job.salaryMin, job.salaryMax)}
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium">
              <Briefcase className="w-3 h-3 mr-1 text-slate-400" />
              {job.experienceMin}-{job.experienceMax} Yrs Exp
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium">
              {job.jobType}
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-medium">
              {job.workMode}
            </span>
          </div>

          {/* Skills Tags */}
          <div className="flex flex-wrap gap-1.5 mt-3.5">
            {(job.skills || []).slice(0, 4).map((skill, idx) => (
              <span
                key={idx}
                className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-50 text-slate-600 border border-slate-200/70"
              >
                {skill}
              </span>
            ))}
            {(job.skills || []).length > 4 && (
              <span className="text-[10px] text-slate-400 font-medium self-center">
                +{job.skills.length - 4} more
              </span>
            )}
          </div>
        </div>

        {/* Footer: Posted time + Actions */}
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100">
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatRelativeTime(job.createdAt)}
          </span>

          <div className="flex items-center space-x-2">
            <Link
              to={`/jobs/${job._id}`}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Details
            </Link>
            <button
              onClick={handleApplyClick}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-all flex items-center space-x-1"
            >
              <span>Apply</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <ApplyModal
        job={job}
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        onSuccess={onApplySuccess}
      />
    </>
  );
};

export default JobCard;
