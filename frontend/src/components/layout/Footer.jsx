import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Sparkles, Heart, Github, Linkedin, Twitter, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center space-x-2.5">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-lg">
                <Briefcase className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-white">
                JobConnect <span className="text-indigo-400">AI</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              India’s next-generation AI-powered career platform connecting ambitious students and professionals with high-growth tech companies.
            </p>
            <div className="flex items-center space-x-3 pt-2">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-indigo-600 transition-colors"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-indigo-600 transition-colors"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-indigo-600 transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 1: For Job Seekers */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase">Job Seekers</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/jobs" className="hover:text-indigo-400 transition-colors">
                  Browse All Jobs
                </Link>
              </li>
              <li>
                <Link to="/student/recommended-jobs" className="hover:text-indigo-400 transition-colors flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  <span>AI Recommended</span>
                </Link>
              </li>
              <li>
                <Link to="/student/resume-analysis" className="hover:text-indigo-400 transition-colors">
                  Resume Quality Score
                </Link>
              </li>
              <li>
                <Link to="/companies" className="hover:text-indigo-400 transition-colors">
                  Explore Companies
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2: For Employers */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase">Recruiters</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/recruiter/jobs/create" className="hover:text-indigo-400 transition-colors">
                  Post a Job Opening
                </Link>
              </li>
              <li>
                <Link to="/recruiter/dashboard" className="hover:text-indigo-400 transition-colors">
                  Recruiter Dashboard
                </Link>
              </li>
              <li>
                <Link to="/recruiter/jobs" className="hover:text-indigo-400 transition-colors">
                  AI Applicant Ranking
                </Link>
              </li>
              <li>
                <Link to="/register?role=recruiter" className="hover:text-indigo-400 transition-colors">
                  Employer Signup
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Tech Hubs */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase">Top Cities</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/jobs?location=Bangalore" className="hover:text-indigo-400 transition-colors">
                  Jobs in Bangalore
                </Link>
              </li>
              <li>
                <Link to="/jobs?location=Hyderabad" className="hover:text-indigo-400 transition-colors">
                  Jobs in Hyderabad
                </Link>
              </li>
              <li>
                <Link to="/jobs?location=Pune" className="hover:text-indigo-400 transition-colors">
                  Jobs in Pune
                </Link>
              </li>
              <li>
                <Link to="/jobs?location=Noida" className="hover:text-indigo-400 transition-colors">
                  Jobs in Delhi NCR
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} JobConnect AI. Built for real production-grade hiring.</p>
          <div className="flex items-center space-x-6">
            <span>React + Node.js + Express + MongoDB</span>
            <span>AI Resume Match Engine</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
