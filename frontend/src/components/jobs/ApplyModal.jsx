import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Upload, AlertCircle, Sparkles } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { formatSalary } from '../../utils/formatters';

const ApplyModal = ({ job, isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [coverLetter, setCoverLetter] = useState('');
  const [portfolio, setPortfolio] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [github, setGithub] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (user?.profile) {
      setPortfolio(user.profile.links?.portfolio || '');
      setLinkedin(user.profile.links?.linkedin || '');
      setGithub(user.profile.links?.github || '');
    }
    setError('');
    setIsSuccess(false);
  }, [user, isOpen]);

  if (!isOpen || !job) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await api.post(`/applications/${job._id}`, {
        coverLetter,
        portfolio,
        linkedin,
        github,
        resumeUrl: user?.profile?.resumeUrl || '',
      });

      if (res.data.success) {
        setIsSuccess(true);
        if (onSuccess) onSuccess();
        setTimeout(() => {
          onClose();
        }, 1800);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to submit application. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Apply for Position</h3>
            <p className="text-xs text-slate-500">
              {job.title} • {job.company}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h4 className="text-xl font-bold text-slate-900">Application Submitted!</h4>
            <p className="text-sm text-slate-600 max-w-sm mx-auto">
              Your profile and AI match details have been securely sent to the hiring team at {job.company}.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Applicant Summary */}
            <div className="bg-indigo-50/60 p-3.5 rounded-2xl border border-indigo-100/80 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-800">{user?.name}</p>
                <p className="text-[11px] text-slate-500">{user?.email}</p>
                <p className="text-[11px] text-slate-500">{user?.phone || 'No phone added'}</p>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-semibold text-indigo-700 block">
                  {formatSalary(job.salaryMin, job.salaryMax)}
                </span>
                <span className="text-[10px] text-slate-500">{job.location}</span>
              </div>
            </div>

            {/* Resume indicator */}
            <div className="border border-slate-200 rounded-2xl p-3 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800">
                    {user?.profile?.resumeOriginalName || 'Standard Profile Resume'}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Will be reviewed with AI matching algorithm
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                Attached
              </span>
            </div>

            {/* Cover Letter */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Note / Cover Letter to Recruiter (Optional)
              </label>
              <textarea
                rows={3}
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Share why your background makes you a strong fit for this role..."
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
              />
            </div>

            {/* Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  GitHub Profile
                </label>
                <input
                  type="url"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  placeholder="https://github.com/..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Portfolio / Live URL
                </label>
                <input
                  type="url"
                  value={portfolio}
                  onChange={(e) => setPortfolio(e.target.value)}
                  placeholder="https://..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="pt-2 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm shadow-indigo-100 flex items-center space-x-1.5 disabled:opacity-50 transition-all"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Confirm & Apply</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ApplyModal;
