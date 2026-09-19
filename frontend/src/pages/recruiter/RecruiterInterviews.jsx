import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, ExternalLink, CheckCircle, XCircle } from 'lucide-react';
import api from '../../services/api';
import { formatDate } from '../../utils/formatters';

const RecruiterInterviews = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const res = await api.get('/interviews/recruiter');
      if (res.data.success) {
        setInterviews(res.data.interviews || []);
      }
    } catch (err) {
      console.error('Error fetching interviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.put(`/interviews/${id}/status`, { status });
      setInterviews((prev) =>
        prev.map((i) => (i._id === id ? { ...i, status } : i))
      );
    } catch (err) {
      alert('Failed to update interview status');
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
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Scheduled Interviews
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Coordinate upcoming candidate interview rounds and update outcomes
        </p>
      </div>

      {interviews.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-3">
          <Calendar className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900">No interviews scheduled yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Review candidate applications and click "Schedule Interview" to set up meetings.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {interviews.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    {item.candidateId?.name || 'Candidate'}
                  </h3>
                  <p className="text-xs text-slate-500">{item.jobId?.title}</p>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    item.status === 'Scheduled'
                      ? 'bg-amber-50 text-amber-800 border border-amber-200'
                      : item.status === 'Completed'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {item.status}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl text-xs space-y-1 text-slate-600">
                <div className="flex items-center gap-2 font-semibold text-slate-800">
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  <span>
                    {formatDate(item.date)} at {item.time} ({item.type})
                  </span>
                </div>
                {item.notes && <p className="text-[11px] text-slate-500 pt-1">{item.notes}</p>}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                {item.meetingLink ? (
                  <a
                    href={item.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-indigo-600 hover:underline inline-flex items-center space-x-1"
                  >
                    <span>Open Meeting Link</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="text-slate-400">No link specified</span>
                )}

                {item.status === 'Scheduled' && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleStatusUpdate(item._id, 'Completed')}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold"
                    >
                      Complete
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(item._id, 'Cancelled')}
                      className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecruiterInterviews;
