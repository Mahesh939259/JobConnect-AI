import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Users,
  ArrowLeft,
  Sparkles,
  Download,
  Calendar,
  CheckCircle,
  XCircle,
  FileText,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Filter,
  X,
} from 'lucide-react';
import api from '../../services/api';
import { formatDate, getStatusBadgeClass } from '../../utils/formatters';
import MatchScoreBadge from '../../components/jobs/MatchScoreBadge';

const ApplicantsList = () => {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('score'); // 'score', 'date'

  // Selected candidate profile modal
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // Schedule Interview modal state
  const [interviewModalData, setInterviewModalData] = useState(null);
  const [interviewForm, setInterviewForm] = useState({
    date: '',
    time: '11:00 AM IST',
    type: 'Online',
    meetingLink: 'https://meet.google.com/',
    notes: '',
  });
  const [scheduling, setScheduling] = useState(false);

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/recruiter/jobs/${jobId}/applicants?sortBy=${sortBy}`);
      if (res.data.success) {
        setJob(res.data.job);
        setApplicants(res.data.applicants || []);
      }
    } catch (err) {
      console.error('Error fetching applicants:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, [jobId, sortBy]);

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await api.put(`/applications/${appId}/status`, { status: newStatus });
      setApplicants((prev) =>
        prev.map((a) => (a._id === appId ? { ...a, status: newStatus } : a))
      );
    } catch (err) {
      alert('Failed to update candidate status');
    }
  };

  const handleScheduleInterviewSubmit = async (e) => {
    e.preventDefault();
    if (!interviewModalData) return;

    setScheduling(true);
    try {
      const res = await api.post('/interviews', {
        applicationId: interviewModalData._id,
        ...interviewForm,
      });
      if (res.data.success) {
        alert('Interview scheduled and candidate notified!');
        handleStatusChange(interviewModalData._id, 'Interview');
        setInterviewModalData(null);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to schedule interview');
    } finally {
      setScheduling(false);
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
      <Link
        to="/recruiter/jobs"
        className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Posted Jobs</span>
      </Link>

      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-3 h-3" /> AI Ranked Pipeline
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">{job?.title}</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {applicants.length} Total Candidate{applicants.length !== 1 ? 's' : ''} • Sorted by AI Match Quality
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-400 font-medium">Rank by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-semibold text-slate-700 focus:outline-none"
          >
            <option value="score">AI Match Score (High to Low)</option>
            <option value="date">Application Date (Recent)</option>
          </select>
        </div>
      </div>

      {/* Applicants List */}
      {applicants.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-3">
          <Users className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900">No applicants yet for this posting</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Candidates who match your job's skills and requirements will appear here ranked by fit.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {applicants.map((app, idx) => (
            <div
              key={app._id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:border-indigo-200 transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 font-bold text-lg flex items-center justify-center flex-shrink-0">
                    {app.candidate?.name?.charAt(0) || 'C'}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-bold text-base text-slate-900">
                        {idx + 1}. {app.candidate?.name}
                      </h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadgeClass(
                          app.status
                        )}`}
                      >
                        {app.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 flex flex-wrap gap-2 mt-0.5">
                      <span>{app.candidate?.email}</span>
                      {app.candidate?.phone && <span>• {app.candidate?.phone}</span>}
                      {app.candidate?.location && <span>• {app.candidate?.location}</span>}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 flex-shrink-0">
                  <MatchScoreBadge score={app.aiMatch?.score || 0} details={app.aiMatch} />
                </div>
              </div>

              {/* Skills and Education Chips */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100">
                <div>
                  <span className="font-bold text-slate-700 block mb-1">Skills:</span>
                  <div className="flex flex-wrap gap-1">
                    {(app.skills || []).slice(0, 6).map((sk, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-white text-slate-600 rounded-md border border-slate-200 text-[11px]"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="font-bold text-slate-700 block mb-1">Education:</span>
                  <p className="text-slate-600 text-[11px]">
                    {app.education?.[0]
                      ? `${app.education[0].degree} - ${app.education[0].college}`
                      : 'Graduate Profile'}
                  </p>
                </div>
              </div>

              {/* AI Match Explanation */}
              {app.aiMatch?.reason && (
                <p className="text-xs text-indigo-900 bg-indigo-50/60 p-3 rounded-xl border border-indigo-100 italic">
                  💡 <strong>AI Fit Assessment:</strong> {app.aiMatch.reason}
                </p>
              )}

              {/* Action Buttons Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedCandidate(app)}
                    className="px-3 py-1.5 font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
                  >
                    View Full Profile
                  </button>
                  {app.resumeUrl && (
                    <a
                      href={app.resumeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl flex items-center space-x-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Resume</span>
                    </a>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <select
                    value={app.status}
                    onChange={(e) => handleStatusChange(app._id, e.target.value)}
                    className="p-1.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 text-xs focus:outline-none"
                  >
                    <option value="Applied">Applied</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Shortlisted">Shortlisted</option>
                    <option value="Interview">Interview</option>
                    <option value="Selected">Selected</option>
                    <option value="Rejected">Rejected</option>
                  </select>

                  <button
                    onClick={() => setInterviewModalData(app)}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl flex items-center space-x-1 shadow-xs"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Interview</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SCHEDULE INTERVIEW MODAL */}
      {interviewModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                <Calendar className="w-5 h-5 text-amber-500" />
                <span>Schedule Interview</span>
              </h3>
              <button
                onClick={() => setInterviewModalData(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Candidate: <strong>{interviewModalData.candidate?.name}</strong>
            </p>

            <form onSubmit={handleScheduleInterviewSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Interview Date *</label>
                <input
                  type="date"
                  required
                  value={interviewForm.date}
                  onChange={(e) => setInterviewForm({ ...interviewForm, date: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Time *</label>
                <input
                  type="text"
                  required
                  value={interviewForm.time}
                  onChange={(e) => setInterviewForm({ ...interviewForm, time: e.target.value })}
                  placeholder="e.g. 02:30 PM IST"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Interview Format</label>
                <select
                  value={interviewForm.type}
                  onChange={(e) => setInterviewForm({ ...interviewForm, type: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="Online">Online (Google Meet / Zoom)</option>
                  <option value="Phone">Phone</option>
                  <option value="In-person">In-person</option>
                </select>
              </div>

              {interviewForm.type === 'Online' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Meeting Link</label>
                  <input
                    type="url"
                    value={interviewForm.meetingLink}
                    onChange={(e) => setInterviewForm({ ...interviewForm, meetingLink: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes / Instructions</label>
                <textarea
                  rows={2}
                  value={interviewForm.notes}
                  onChange={(e) => setInterviewForm({ ...interviewForm, notes: e.target.value })}
                  placeholder="Technical discussion on algorithms, systems, and resume..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 resize-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setInterviewModalData(null)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={scheduling}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-xs"
                >
                  {scheduling ? 'Scheduling...' : 'Confirm & Notify'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CANDIDATE FULL PROFILE MODAL */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-2xl shadow-2xl space-y-6 my-8 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Candidate Profile: {selectedCandidate.candidate?.name}
              </h3>
              <button
                onClick={() => setSelectedCandidate(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contact details */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-2xl">
              <div>
                <span className="text-slate-400 block font-semibold">Email</span>
                <span className="text-slate-800 font-bold">{selectedCandidate.candidate?.email}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Phone</span>
                <span className="text-slate-800 font-bold">
                  {selectedCandidate.candidate?.phone || 'Not provided'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Location</span>
                <span className="text-slate-800 font-bold">
                  {selectedCandidate.candidate?.location || 'Not provided'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">AI Match Score</span>
                <span className="text-emerald-600 font-bold">
                  {selectedCandidate.aiMatch?.score}%
                </span>
              </div>
            </div>

            {/* Note / Cover Letter */}
            {selectedCandidate.coverLetter && (
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase mb-1">Cover Note</h4>
                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl leading-relaxed whitespace-pre-line">
                  {selectedCandidate.coverLetter}
                </p>
              </div>
            )}

            {/* Skills */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase mb-2">Technical Skills</h4>
              <div className="flex flex-wrap gap-1.5">
                {(selectedCandidate.skills || []).map((sk, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-semibold"
                  >
                    {sk}
                  </span>
                ))}
              </div>
            </div>

            {/* Close */}
            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedCandidate(null)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicantsList;
