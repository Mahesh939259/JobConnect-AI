import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Building2,
  FileCheck,
  Award,
  Users,
  CheckCircle2,
  Briefcase,
  Star,
  ChevronRight,
  ArrowUpRight,
} from 'lucide-react';
import api from '../services/api';
import JobCard from '../components/jobs/JobCard';
import { JobCardSkeleton } from '../components/common/Skeleton';

const POPULAR_SEARCHES = [
  'React Developer',
  'Java Developer',
  'Python Developer',
  'Data Analyst',
  'AI/ML Engineer',
  'Cloud Engineer',
];

const CATEGORIES = [
  { name: 'Software Development', jobs: '240+ Openings', icon: Briefcase, color: 'bg-blue-50 text-blue-600' },
  { name: 'Frontend Development', jobs: '180+ Openings', icon: Sparkles, color: 'bg-indigo-50 text-indigo-600' },
  { name: 'Backend Development', jobs: '210+ Openings', icon: TrendingUp, color: 'bg-violet-50 text-violet-600' },
  { name: 'Full Stack', jobs: '320+ Openings', icon: Award, color: 'bg-purple-50 text-purple-600' },
  { name: 'Data Science', jobs: '95+ Openings', icon: FileCheck, color: 'bg-amber-50 text-amber-600' },
  { name: 'AI & Machine Learning', jobs: '140+ Openings', icon: Sparkles, color: 'bg-rose-50 text-rose-600' },
  { name: 'Cloud & DevOps', jobs: '125+ Openings', icon: Building2, color: 'bg-teal-50 text-teal-600' },
  { name: 'UI / UX Design', jobs: '70+ Openings', icon: Users, color: 'bg-pink-50 text-pink-600' },
];

const LandingPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [locationTerm, setLocationTerm] = useState('');
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true);
        const [jobsRes, compRes] = await Promise.all([
          api.get('/jobs/featured'),
          api.get('/companies?limit=6'),
        ]);
        if (jobsRes.data.success) setFeaturedJobs(jobsRes.data.jobs || []);
        if (compRes.data.success) setCompanies(compRes.data.companies || []);
      } catch (err) {
        console.error('Error loading landing page data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.append('search', searchTerm.trim());
    if (locationTerm.trim()) params.append('location', locationTerm.trim());
    navigate(`/jobs?${params.toString()}`);
  };

  const handlePopularClick = (term) => {
    navigate(`/jobs?search=${encodeURIComponent(term)}`);
  };

  return (
    <div className="space-y-20 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-indigo-50/70 via-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI-Powered Career Intelligence & Job Matching</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Find the Right Job.{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                Build Your Future.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto font-normal">
              AI-powered job matching that connects your skills with the right opportunities. Upload your resume, uncover real compatibility scores, and get hired faster.
            </p>

            {/* SEARCH BAR SECTION */}
            <form
              onSubmit={handleSearchSubmit}
              className="p-2.5 sm:p-3 bg-white rounded-2xl sm:rounded-3xl shadow-xl shadow-indigo-100/50 border border-slate-200/80 flex flex-col md:flex-row gap-2 max-w-3xl mx-auto mt-8"
            >
              <div className="flex-1 flex items-center px-3 py-2 border-b md:border-b-0 md:border-r border-slate-100">
                <Search className="w-5 h-5 text-indigo-500 mr-3 flex-shrink-0" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Job title, skills (e.g. React, Node, Python)..."
                  className="w-full text-sm text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none font-medium"
                />
              </div>

              <div className="flex-1 flex items-center px-3 py-2">
                <MapPin className="w-5 h-5 text-indigo-500 mr-3 flex-shrink-0" />
                <input
                  type="text"
                  value={locationTerm}
                  onChange={(e) => setLocationTerm(e.target.value)}
                  placeholder="Location (e.g. Bangalore, Hyderabad, Remote)..."
                  className="w-full text-sm text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none font-medium"
                />
              </div>

              <button
                type="submit"
                className="px-7 py-3 rounded-xl sm:rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-200 transition-all flex items-center justify-center space-x-2 flex-shrink-0"
              >
                <span>Search Jobs</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Popular Searches */}
            <div className="pt-3 flex flex-wrap items-center justify-center gap-2 text-xs">
              <span className="text-slate-400 font-medium">Popular:</span>
              {POPULAR_SEARCHES.map((term) => (
                <button
                  key={term}
                  onClick={() => handlePopularClick(term)}
                  className="px-3 py-1 rounded-full bg-white hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 border border-slate-200 font-medium transition-all"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURED JOBS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <div className="flex items-center space-x-2 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Verified Openings</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Featured Opportunities
            </h2>
          </div>
          <Link
            to="/jobs"
            className="mt-3 md:mt-0 text-sm font-bold text-indigo-600 hover:text-indigo-700 inline-flex items-center space-x-1"
          >
            <span>Explore All Jobs</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <JobCardSkeleton />
            <JobCardSkeleton />
            <JobCardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredJobs.map((job) => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
        )}
      </section>

      {/* 3. POPULAR CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Popular Job Categories
          </h2>
          <p className="text-sm text-slate-500">
            Explore high-demand career tracks across top Indian tech ecosystems
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {CATEGORIES.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <div
                key={idx}
                onClick={() => navigate(`/jobs?industry=${encodeURIComponent(cat.name)}`)}
                className="group p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${cat.color} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 font-medium">{cat.jobs}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. AI RESUME ANALYZER PROMO */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-5">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-200 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Free AI Diagnostic Tool</span>
            </div>
            <h3 className="text-2xl sm:text-4xl font-extrabold leading-tight">
              Test Your Resume Quality Before Applying
            </h3>
            <p className="text-sm sm:text-base text-indigo-100/90 leading-relaxed">
              Our intelligent engine analyzes your skills, experiences, and formatting against real job descriptions, providing actionable suggestions to maximize interview callbacks.
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <Link
                to="/student/resume-analysis"
                className="px-6 py-3 rounded-2xl bg-white text-indigo-900 font-bold text-sm shadow-md hover:bg-indigo-50 transition-all flex items-center space-x-2"
              >
                <span>Analyze My Resume</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/student/profile"
                className="px-6 py-3 rounded-2xl bg-indigo-700/50 hover:bg-indigo-700 text-white font-semibold text-sm border border-indigo-500/50 transition-all"
              >
                Upload & Parse PDF
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. TOP COMPANIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Top Hiring Companies
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Directly partner with India’s leading technology employers
            </p>
          </div>
          <Link
            to="/companies"
            className="mt-3 md:mt-0 text-sm font-bold text-indigo-600 hover:text-indigo-700 inline-flex items-center space-x-1"
          >
            <span>View All Companies</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((comp) => (
            <Link
              key={comp._id}
              to={`/companies/${comp._id}`}
              className="group p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all flex items-start space-x-4"
            >
              <img
                src={comp.logo || 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100'}
                alt={comp.name}
                className="w-14 h-14 rounded-xl object-cover border border-slate-100 flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-1.5">
                  <h3 className="font-bold text-slate-900 text-base group-hover:text-indigo-600 transition-colors truncate">
                    {comp.name}
                  </h3>
                  {comp.isVerified && (
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{comp.industry} • {comp.location}</p>
                <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                  {comp.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 6. HOW JOB CONNECT WORKS */}
      <section className="bg-white py-16 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
              Transparent & Intelligent
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              How JobConnect Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-4">
              <div className="w-12 h-12 bg-indigo-600 text-white font-extrabold text-lg rounded-2xl flex items-center justify-center mx-auto shadow-md shadow-indigo-100">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900">Upload & Parse Resume</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Upload your PDF or DOCX resume. Our parser auto-extracts your skills, projects, and educational background for instant profile setup.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-4">
              <div className="w-12 h-12 bg-indigo-600 text-white font-extrabold text-lg rounded-2xl flex items-center justify-center mx-auto shadow-md shadow-indigo-100">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900">AI Compatibility Scoring</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Each job posting automatically runs through our weighted matching engine, detailing matched skills, growth areas, and personalized match scores.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-4">
              <div className="w-12 h-12 bg-indigo-600 text-white font-extrabold text-lg rounded-2xl flex items-center justify-center mx-auto shadow-md shadow-indigo-100">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900">Direct Interview Scheduling</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Recruiters review verified AI-ranked candidate shortlists, coordinate interview times, and extend offers seamlessly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-indigo-600 rounded-3xl p-8 sm:p-14 text-white text-center space-y-6 shadow-xl shadow-indigo-200">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Take the Next Step in Your Career?
          </h2>
          <p className="text-sm sm:text-base text-indigo-100 max-w-xl mx-auto leading-relaxed">
            Join thousands of students, developers, and tech recruiters already using JobConnect AI.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/register"
              className="px-7 py-3 rounded-2xl bg-white text-indigo-700 font-bold text-sm shadow-md hover:bg-indigo-50 transition-all"
            >
              Sign Up as Candidate
            </Link>
            <Link
              to="/register?role=recruiter"
              className="px-7 py-3 rounded-2xl bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-sm border border-indigo-400 transition-all"
            >
              Post Jobs as Recruiter
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
