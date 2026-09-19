import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Building2, MapPin, CheckCircle2, ArrowRight } from 'lucide-react';
import api from '../../services/api';

const CompaniesList = () => {
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/companies?search=${encodeURIComponent(search)}`);
      if (res.data.success) {
        setCompanies(res.data.companies || []);
      }
    } catch (err) {
      console.error('Error loading companies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCompanies();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Top Tech Employers in India
        </h1>
        <p className="text-sm text-slate-500">
          Explore leading companies hiring talent across Bangalore, Hyderabad, Pune, and pan-India.
        </p>

        {/* Search input */}
        <form onSubmit={handleSearchSubmit} className="pt-4 flex gap-2 max-w-md mx-auto">
          <div className="flex-1 flex items-center px-3.5 py-2 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <Search className="w-4 h-4 text-slate-400 mr-2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search companies by name or industry..."
              className="w-full text-xs text-slate-800 bg-transparent focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs"
          >
            Search
          </button>
        </form>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((comp) => (
            <Link
              key={comp._id}
              to={`/companies/${comp._id}`}
              className="group bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <img
                    src={
                      comp.logo ||
                      'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100'
                    }
                    alt={comp.name}
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-100 p-0.5"
                  />
                  {comp.isVerified && (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Verified</span>
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-base text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {comp.name}
                  </h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {comp.location} • {comp.industry}
                  </p>
                </div>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {comp.description}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">{comp.companySize}</span>
                <span className="font-bold text-indigo-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                  View Jobs <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default CompaniesList;
