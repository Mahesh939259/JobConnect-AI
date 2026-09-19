import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, MapPin, SlidersHorizontal, Sparkles, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import JobCard from '../../components/jobs/JobCard';
import FilterSidebar from '../../components/jobs/FilterSidebar';
import { JobCardSkeleton } from '../../components/common/Skeleton';

const JobsList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filter state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [jobType, setJobType] = useState(searchParams.get('jobType') || 'All');
  const [workMode, setWorkMode] = useState(searchParams.get('workMode') || 'All');
  const [experienceMax, setExperienceMax] = useState(searchParams.get('experienceMax') || '');
  const [salaryMin, setSalaryMin] = useState(searchParams.get('salaryMin') || '');
  const [sort, setSort] = useState('newest');

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (location.trim() && location !== 'All') params.append('location', location.trim());
      if (jobType && jobType !== 'All') params.append('jobType', jobType);
      if (workMode && workMode !== 'All') params.append('workMode', workMode);
      if (experienceMax) params.append('experienceMax', experienceMax);
      if (salaryMin) params.append('salaryMin', salaryMin);
      if (sort) params.append('sort', sort);
      params.append('page', currentPage);
      params.append('limit', 10);

      const res = await api.get(`/jobs?${params.toString()}`);
      if (res.data.success) {
        setJobs(res.data.jobs || []);
        setTotalJobs(res.data.totalJobs || 0);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [currentPage, sort, jobType, workMode, location, experienceMax, salaryMin]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchJobs();
  };

  const handleFilterChange = (key, value) => {
    setCurrentPage(1);
    if (key === 'jobType') setJobType(value);
    if (key === 'workMode') setWorkMode(value);
    if (key === 'location') setLocation(value);
    if (key === 'experienceMax') setExperienceMax(value);
    if (key === 'salaryMin') setSalaryMin(value);
  };

  const handleResetFilters = () => {
    setSearch('');
    setLocation('');
    setJobType('All');
    setWorkMode('All');
    setExperienceMax('');
    setSalaryMin('');
    setSort('newest');
    setCurrentPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Search Header Banner */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 flex items-center px-4 py-2.5 bg-slate-50 rounded-2xl border border-slate-200/80">
            <Search className="w-5 h-5 text-slate-400 mr-3 flex-shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by job title, skill (e.g. React, Node, Python, AWS)..."
              className="w-full text-xs sm:text-sm bg-transparent focus:outline-none text-slate-800 placeholder-slate-400"
            />
          </div>

          <div className="w-full md:w-64 flex items-center px-4 py-2.5 bg-slate-50 rounded-2xl border border-slate-200/80">
            <MapPin className="w-5 h-5 text-slate-400 mr-2 flex-shrink-0" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location..."
              className="w-full text-xs sm:text-sm bg-transparent focus:outline-none text-slate-800 placeholder-slate-400"
            />
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center space-x-2"
          >
            <span>Search</span>
          </button>
        </form>

        {/* Sorting + Mobile Filter Trigger */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
          <div className="text-slate-500 font-medium">
            Showing <span className="font-bold text-slate-800">{totalJobs}</span> verified tech jobs
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="md:hidden flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 font-semibold"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
            </button>

            <div className="flex items-center space-x-1.5">
              <span className="text-slate-400 hidden sm:inline">Sort:</span>
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="newest">Most Recent</option>
                <option value="salary_high">Salary: High to Low</option>
                <option value="salary_low">Salary: Low to High</option>
                <option value="experience_low">Experience: Entry Level</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Sidebar + Jobs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        {/* Desktop Sidebar */}
        <div className="hidden md:block md:col-span-1">
          <FilterSidebar
            filters={{ jobType, workMode, location, experienceMax, salaryMin }}
            onFilterChange={handleFilterChange}
            onReset={handleResetFilters}
          />
        </div>

        {/* Mobile Filter Drawer */}
        {mobileFilterOpen && (
          <div className="md:hidden col-span-1 mb-4">
            <FilterSidebar
              filters={{ jobType, workMode, location, experienceMax, salaryMin }}
              onFilterChange={handleFilterChange}
              onReset={handleResetFilters}
            />
          </div>
        )}

        {/* Jobs List */}
        <div className="md:col-span-3 space-y-4">
          {loading ? (
            <div className="space-y-4">
              <JobCardSkeleton />
              <JobCardSkeleton />
              <JobCardSkeleton />
            </div>
          ) : jobs.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No jobs match your criteria</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try loosening your search filters or resetting keywords to explore all open opportunities.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 rounded-xl bg-indigo-50 text-indigo-600 text-xs font-bold hover:bg-indigo-100 transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <JobCard key={job._id} job={job} onApplySuccess={fetchJobs} />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 pt-6">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-xs text-slate-500 font-medium px-2">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobsList;
