import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin,
  Globe,
  Users,
  Calendar,
  Building2,
  CheckCircle2,
  Briefcase,
  ArrowLeft,
} from 'lucide-react';
import api from '../../services/api';
import JobCard from '../../components/jobs/JobCard';

const CompanyDetails = () => {
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [openJobs, setOpenJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/companies/${id}`);
        if (res.data.success) {
          setCompany(res.data.company);
          setOpenJobs(res.data.openJobs || []);
        }
      } catch (err) {
        console.error('Error fetching company details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Company Not Found</h2>
        <Link to="/companies" className="text-xs font-bold text-indigo-600 hover:underline">
          Return to Companies Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Link
        to="/companies"
        className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Companies</span>
      </Link>

      {/* Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
          <div className="flex items-start space-x-4">
            <img
              src={
                company.logo ||
                'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100'
              }
              alt={company.name}
              className="w-16 h-16 rounded-2xl object-cover border border-slate-100 p-0.5 shadow-xs flex-shrink-0"
            />
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-extrabold text-slate-900">{company.name}</h1>
                {company.isVerified && (
                  <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {company.industry} • Founded {company.foundedYear || 2015}
              </p>
            </div>
          </div>

          {company.website && (
            <a
              href={company.website}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
            >
              <Globe className="w-4 h-4" />
              <span>Visit Website</span>
            </a>
          )}
        </div>

        {/* Highlight details */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100 text-xs">
          <div className="p-3 bg-slate-50 rounded-2xl">
            <span className="text-slate-400 block text-[10px] font-bold uppercase">Location</span>
            <span className="font-bold text-slate-800 text-sm flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {company.location}
            </span>
          </div>
          <div className="p-3 bg-slate-50 rounded-2xl">
            <span className="text-slate-400 block text-[10px] font-bold uppercase">Company Size</span>
            <span className="font-bold text-slate-800 text-sm flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              {company.companySize}
            </span>
          </div>
          <div className="p-3 bg-slate-50 rounded-2xl">
            <span className="text-slate-400 block text-[10px] font-bold uppercase">Open Positions</span>
            <span className="font-bold text-indigo-600 text-sm flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
              {openJobs.length} Jobs
            </span>
          </div>
        </div>

        {/* About */}
        <div className="pt-2">
          <h3 className="text-sm font-bold text-slate-900 mb-2">About {company.name}</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
            {company.description}
          </p>
        </div>
      </div>

      {/* Open Positions List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">
          Open Positions at {company.name} ({openJobs.length})
        </h2>
        {openJobs.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center text-xs text-slate-500">
            No active openings currently listed for this company.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {openJobs.map((job) => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyDetails;
