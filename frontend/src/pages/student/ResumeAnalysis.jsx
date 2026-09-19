import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  TrendingUp,
  Award,
  BookOpen,
  FolderGit2,
  Code2,
  AlignLeft,
} from 'lucide-react';
import api from '../../services/api';

const ResumeAnalysis = () => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        setLoading(true);
        const res = await api.get('/student/resume-analysis');
        if (res.data.success) {
          setAnalysis(res.data.analysis);
        }
      } catch (err) {
        console.error('Error fetching resume analysis:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-slate-400 mt-2">Evaluating resume criteria...</p>
      </div>
    );
  }

  const categoryIcons = {
    skills: Code2,
    experience: Award,
    projects: FolderGit2,
    education: BookOpen,
    formatting: AlignLeft,
    keywords: Sparkles,
    achievements: TrendingUp,
  };

  const getScoreColor = (val) => {
    if (val >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (val >= 60) return 'text-indigo-600 bg-indigo-50 border-indigo-200';
    return 'text-amber-600 bg-amber-50 border-amber-200';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Diagnostic Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Resume Quality Analysis
          </h1>
          <p className="text-xs text-slate-500 max-w-md">
            Holistic diagnostic score benchmarking your resume against technical ATS filters and recruiter benchmarks.
          </p>
        </div>

        {/* Circular Score Gauge */}
        <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-tr from-indigo-50 to-slate-50 rounded-3xl border border-indigo-100/80 shadow-xs flex-shrink-0">
          <span className="text-4xl sm:text-5xl font-extrabold text-indigo-600 tracking-tight">
            {analysis?.score || 0}
          </span>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">
            Overall Score / 100
          </span>
        </div>
      </div>

      {/* Category Scores Grid */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900">Category Breakdown</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {Object.entries(analysis?.categoryScores || {}).map(([key, val]) => {
            const Icon = categoryIcons[key] || Sparkles;
            return (
              <div
                key={key}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${getScoreColor(
                      val
                    )}`}
                  >
                    {val}%
                  </span>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 capitalize">{key}</p>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full"
                      style={{ width: `${val}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actionable Suggestions */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900">Actionable Suggestions</h2>
        <div className="space-y-3">
          {(analysis?.suggestions || []).map((sug, idx) => (
            <div
              key={idx}
              className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-start space-x-3.5"
            >
              <div
                className={`p-2 rounded-xl mt-0.5 flex-shrink-0 ${
                  sug.type === 'high_impact'
                    ? 'bg-rose-50 text-rose-600'
                    : 'bg-amber-50 text-amber-600'
                }`}
              >
                {sug.type === 'high_impact' ? (
                  <AlertTriangle className="w-4 h-4" />
                ) : (
                  <Lightbulb className="w-4 h-4" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                    {sug.category}
                  </span>
                  {sug.type === 'high_impact' && (
                    <span className="text-[10px] font-bold text-rose-600">
                      High Impact
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-700 mt-1 leading-relaxed">{sug.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer link to Profile to implement suggestions */}
      <div className="bg-indigo-50/70 rounded-3xl p-6 border border-indigo-100 flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-indigo-900">
            Ready to upgrade your profile?
          </h4>
          <p className="text-xs text-indigo-700/80 mt-0.5">
            Add recommended skills and projects to boost your score in real-time.
          </p>
        </div>
        <Link
          to="/student/profile"
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs inline-flex items-center space-x-1.5 flex-shrink-0"
        >
          <span>Edit Profile</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

export default ResumeAnalysis;
