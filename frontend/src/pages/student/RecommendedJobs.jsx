import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import api from '../../services/api';
import JobCard from '../../components/jobs/JobCard';

const RecommendedJobs = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/student/recommended-jobs');
      if (res.data.success) {
        setRecommendations(res.data.jobs || []);
      }
    } catch (err) {
      console.error('Error loading recommended jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-900 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white space-y-2 shadow-lg">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-200 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Personalized AI Matching</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Recommended Jobs for You
        </h1>
        <p className="text-xs sm:text-sm text-indigo-100/80 max-w-2xl leading-relaxed">
          These opportunities are automatically ranked based on your skill overlap, projects, education credentials, and career trajectory.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-400 mt-2">Running AI matching algorithms...</p>
        </div>
      ) : recommendations.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-3">
          <h3 className="text-base font-bold text-slate-900">No recommendations available</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Make sure to add skills to your profile or upload a resume to unlock AI matching.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((item) => (
            <JobCard
              key={item.job._id}
              job={item.job}
              matchScore={item.matchScore}
              matchDetails={{
                reason: item.reason,
                matchedSkills: item.matchedSkills,
                missingSkills: item.missingSkills,
              }}
              onApplySuccess={fetchRecommendations}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default RecommendedJobs;
