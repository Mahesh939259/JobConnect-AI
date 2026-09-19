import React, { useState, useEffect } from 'react';
import { Building2, CheckCircle2, XCircle } from 'lucide-react';
import api from '../../services/api';

const AdminCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const res = await api.get('/companies?limit=50');
      if (res.data.success) {
        setCompanies(res.data.companies || []);
      }
    } catch (err) {
      console.error('Error fetching companies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleToggleVerify = async (id) => {
    try {
      const res = await api.put(`/admin/companies/${id}/verify`);
      if (res.data.success) {
        setCompanies((prev) =>
          prev.map((c) => (c._id === id ? { ...c, isVerified: res.data.isVerified } : c))
        );
      }
    } catch (err) {
      alert('Error updating company verification');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Employer Companies & Verification
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Verify verified employer credentials and badges across the platform
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-12 text-center">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Company</th>
                  <th className="px-6 py-4">Industry & Location</th>
                  <th className="px-6 py-4">Size</th>
                  <th className="px-6 py-4">Verification</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {companies.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={
                            c.logo ||
                            'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100'
                          }
                          alt={c.name}
                          className="w-8 h-8 rounded-lg object-cover border border-slate-200"
                        />
                        <span className="font-bold text-slate-900">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {c.industry} • {c.location}
                    </td>
                    <td className="px-6 py-4 text-slate-500">{c.companySize}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          c.isVerified
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {c.isVerified && <CheckCircle2 className="w-3 h-3" />}
                        <span>{c.isVerified ? 'Verified Employer' : 'Unverified'}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleToggleVerify(c._id)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                          c.isVerified
                            ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                        }`}
                      >
                        {c.isVerified ? 'Revoke Badge' : 'Verify'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCompanies;
