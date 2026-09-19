import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';

const FilterSidebar = ({ filters, onFilterChange, onReset }) => {
  const jobTypes = ['All', 'Full Time', 'Part Time', 'Internship', 'Contract'];
  const workModes = ['All', 'Remote', 'Hybrid', 'On-site'];
  const locations = [
    'All',
    'Bangalore',
    'Hyderabad',
    'Pune',
    'Chennai',
    'Mumbai',
    'Delhi',
    'Noida',
    'Gurgaon',
  ];

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2 text-slate-800 font-bold text-sm">
          <Filter className="w-4 h-4 text-indigo-600" />
          <span>Filters</span>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center space-x-1"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Work Mode */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Work Mode
        </h4>
        <div className="space-y-1.5">
          {workModes.map((mode) => (
            <label
              key={mode}
              className="flex items-center space-x-2.5 text-xs text-slate-700 cursor-pointer hover:text-indigo-600"
            >
              <input
                type="radio"
                name="workMode"
                value={mode}
                checked={filters.workMode === mode}
                onChange={(e) => onFilterChange('workMode', e.target.value)}
                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
              />
              <span>{mode}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Job Type */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Job Type
        </h4>
        <div className="space-y-1.5">
          {jobTypes.map((type) => (
            <label
              key={type}
              className="flex items-center space-x-2.5 text-xs text-slate-700 cursor-pointer hover:text-indigo-600"
            >
              <input
                type="radio"
                name="jobType"
                value={type}
                checked={filters.jobType === type}
                onChange={(e) => onFilterChange('jobType', e.target.value)}
                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
              />
              <span>{type}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Location */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Location
        </h4>
        <select
          value={filters.location}
          onChange={(e) => onFilterChange('location', e.target.value)}
          className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
        >
          {locations.map((loc) => (
            <option key={loc} value={loc === 'All' ? '' : loc}>
              {loc === 'All' ? 'All Locations' : loc}
            </option>
          ))}
        </select>
      </div>

      {/* Minimum Experience */}
      <div className="space-y-2.5">
        <div className="flex justify-between items-center">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Experience Level
          </h4>
          <span className="text-xs font-semibold text-indigo-600">
            {filters.experienceMax ? `Up to ${filters.experienceMax} yrs` : 'Any'}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="8"
          step="1"
          value={filters.experienceMax || 8}
          onChange={(e) =>
            onFilterChange('experienceMax', e.target.value === '8' ? '' : e.target.value)
          }
          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
        />
        <div className="flex justify-between text-[10px] text-slate-400">
          <span>Entry (0y)</span>
          <span>Mid (3y)</span>
          <span>Lead (5y+)</span>
        </div>
      </div>

      {/* Minimum Salary LPA */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Min Salary
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'All', val: '' },
            { label: '₹6+ LPA', val: '600000' },
            { label: '₹10+ LPA', val: '1000000' },
            { label: '₹15+ LPA', val: '1500000' },
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => onFilterChange('salaryMin', item.val)}
              className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
                filters.salaryMin === item.val
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;
