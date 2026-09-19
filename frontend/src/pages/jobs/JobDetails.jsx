import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Briefcase,
  IndianRupee,
  Clock,
  Bookmark,
  Calendar,
  Building2,
  CheckCircle,
  Share2,
  ArrowLeft,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { formatSalary, formatDate, formatRelativeTime } from '../../utils/formatters';
import ApplyModal from '../../components/jobs/ApplyModal';
import JobCard from '../../components/jobs/JobCard';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [job, setJob] = useState(null);
  const [similarJobs, setSimilarJobs] = useState([]);
  const [hasApplied, setHasApplied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/jobs/${id}`);
        if (res.data.success) {
          setJob(res.data.job);
          setSimilarJobs(res.data.similarJobs || []);
          setHasApplied(res.data.hasApplied || false);
          setIsSaved(res.data.isSaved || false);
        }
      } catch (err) {
        console.error('Error loading job details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  const handleSaveToggle = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (user?.role !== 'student') return;

    try {
      if (isSaved) {
        await api.delete(`/saved-jobs/${job._id}`);
        setIsSaved(false);
      } else {
        await api.post(`/saved-jobs/${job._id}`);
        setIsSaved(true);
      }
    } catch (err) {
      console.error('Error saving job:', err);
    }
  };

  const handleApplyClick = () => {
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

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-slate-500 font-medium">Loading position details...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Job Posting Not Found</h2>
        <Link to="/jobs" className="text-xs font-bold text-indigo-600 hover:underline">
          Return to Job Board
        </Link>
      </div>
    );
  }

  const companyLogo =
    job.companyId?.logo ||
    'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100&auto=format&fit=crop&q=60';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <Link
        to="/jobs"
        className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to All Jobs</span>
      </Link>

      {/* Main Job Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="flex items-start space-x-4">
            <img
              src={companyLogo}
              alt={job.company}
              className="w-16 h-16 rounded-2xl object-cover border border-slate-100 p-0.5 shadow-xs flex-shrink-0"
            />
            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                {job.title}
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 font-medium">
                {job.companyId ? (
                  <Link
                    to={`/companies/${job.companyId._id || job.companyId}`}
                    className="font-bold text-indigo-600 hover:underline"
                  >
                    {job.company}
                  </Link>
                ) : (
                  <span className="font-bold text-slate-700">{job.company}</span>
                )}
                <span>•</span>
                <span className="flex items-center gap-0.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {job.location}
                </span>
                <span>•</span>
                <span>Posted {formatRelativeTime(job.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            <button
              onClick={handleSaveToggle}
              className={`p-3 rounded-2xl border transition-colors ${
                isSaved
                  ? 'bg-amber-50 border-amber-200 text-amber-600'
                  : 'border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
              title="Save Job"
            >
              <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-amber-500' : ''}`} />
            </button>

            {hasApplied ? (
              <div className="px-5 py-3 rounded-2xl bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center space-x-1.5 border border-emerald-200">
                <CheckCircle className="w-4 h-4" />
                <span>Application Submitted</span>
              </div>
            ) : (
              <button
                onClick={handleApplyClick}
                className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-100 transition-all flex items-center space-x-2"
              >
                <span>Apply Now</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Highlight Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100 text-xs">
          <div className="p-3 bg-slate-50 rounded-2xl">
            <span className="text-slate-400 block text-[10px] font-bold uppercase">Salary</span>
            <span className="font-bold text-emerald-700 text-sm">
              {formatSalary(job.salaryMin, job.salaryMax)}
            </span>
          </div>
          <div className="p-3 bg-slate-50 rounded-2xl">
            <span className="text-slate-400 block text-[10px] font-bold uppercase">Experience</span>
            <span className="font-bold text-slate-800 text-sm">
              {job.experienceMin}-{job.experienceMax} Years
            </span>
          </div>
          <div className="p-3 bg-slate-50 rounded-2xl">
            <span className="text-slate-400 block text-[10px] font-bold uppercase">Job Type</span>
            <span className="font-bold text-slate-800 text-sm">{job.jobType}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-2xl">
            <span className="text-slate-400 block text-[10px] font-bold uppercase">Work Mode</span>
            <span className="font-bold text-indigo-600 text-sm">{job.workMode}</span>
          </div>
        </div>
      </div>

      {/* Body: Description, Responsibilities, Requirements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">About the Role</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {job.description}
            </p>

            {/* Responsibilities */}
            {job.responsibilities?.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h4 className="text-sm font-bold text-slate-900">Key Responsibilities</h4>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
                  {job.responsibilities.map((resp, i) => (
                    <li key={i} className="flex items-start space-x-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-2 flex-shrink-0" />
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Requirements */}
            {job.requirements?.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h4 className="text-sm font-bold text-slate-900">Requirements & Qualifications</h4>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
                  {job.requirements.map((req, i) => (
                    <li key={i} className="flex items-start space-x-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 flex-shrink-0" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Skills */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h4 className="text-sm font-bold text-slate-900">Required Skills</h4>
              <div className="flex flex-wrap gap-2">
                {(job.skills || []).map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Benefits */}
            {job.benefits?.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h4 className="text-sm font-bold text-slate-900">Perks & Benefits</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {job.benefits.map((b, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-slate-50 text-xs text-slate-700 flex items-center space-x-2"
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar info */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Company Overview
            </h4>
            <div className="flex items-center space-x-3">
              <img
                src={companyLogo}
                alt={job.company}
                className="w-10 h-10 rounded-xl object-cover border border-slate-100"
              />
              <div>
                <p className="text-xs font-bold text-slate-800">{job.company}</p>
                <p className="text-[11px] text-slate-400">{job.location}</p>
              </div>
            </div>
            {job.companyId?.description && (
              <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                {job.companyId.description}
              </p>
            )}
            {job.companyId && (
              <Link
                to={`/companies/${job.companyId._id || job.companyId}`}
                className="block text-center w-full py-2 rounded-xl text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
              >
                View Full Company Profile
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Similar Jobs Section */}
      {similarJobs.length > 0 && (
        <div className="space-y-4 pt-8 border-t border-slate-200">
          <h3 className="text-lg font-bold text-slate-900">Similar Positions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {similarJobs.map((simJob) => (
              <JobCard key={simJob._id} job={simJob} />
            ))}
          </div>
        </div>
      )}

      <ApplyModal
        job={job}
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        onSuccess={() => setHasApplied(true)}
      />
    </div>
  );
};

export default JobDetails;
