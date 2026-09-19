import React, { useState, useEffect } from 'react';
import { Building2, Globe, MapPin, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const CompanyProfile = () => {
  const { user } = useAuth();
  const [company, setCompany] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    website: '',
    industry: 'Information Technology',
    description: '',
    location: '',
    companySize: '50-200 employees',
    foundedYear: 2015,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRecruiterCompany();
  }, []);

  const fetchRecruiterCompany = async () => {
    try {
      setLoading(true);
      const res = await api.get('/recruiter/profile');
      if (res.data.success && res.data.profile?.companyId) {
        const comp = res.data.profile.companyId;
        setCompany(comp);
        setFormData({
          name: comp.name || '',
          website: comp.website || '',
          industry: comp.industry || 'Information Technology',
          description: comp.description || '',
          location: comp.location || '',
          companySize: comp.companySize || '50-200 employees',
          foundedYear: comp.foundedYear || 2015,
        });
      }
    } catch (err) {
      console.error('Error fetching recruiter company:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);

    try {
      let res;
      if (company?._id) {
        res = await api.put(`/companies/${company._id}`, formData);
      } else {
        res = await api.post('/companies', formData);
      }
      if (res.data.success) {
        setMessage('Company profile updated successfully!');
        if (res.data.company) setCompany(res.data.company);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update company profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !company?._id) return;

    const data = new FormData();
    data.append('logo', file);

    setUploadingLogo(true);
    try {
      const res = await api.post(`/companies/${company._id}/logo`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        setCompany((prev) => ({ ...prev, logo: res.data.logo }));
        setMessage('Company logo updated!');
      }
    } catch (err) {
      setError('Failed to upload logo.');
    } finally {
      setUploadingLogo(false);
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
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Employer Company Profile
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your brand presence and public job page details
          </p>
        </div>

        {message && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs flex items-center space-x-2">
            <CheckCircle className="w-4 h-4" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {/* Company Logo Section */}
        {company && (
          <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <img
              src={
                company.logo ||
                'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100'
              }
              alt={company.name}
              className="w-16 h-16 rounded-2xl object-cover border border-slate-200"
            />
            <div>
              <p className="text-xs font-bold text-slate-800">Company Logo</p>
              <label className="inline-block mt-1 px-3 py-1 bg-white border border-slate-200 text-slate-700 hover:text-indigo-600 rounded-lg text-xs font-bold cursor-pointer shadow-xs">
                <span>{uploadingLogo ? 'Uploading...' : 'Change Logo'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  disabled={uploadingLogo}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Company Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Website URL</label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://..."
                className="w-full p-2.5 rounded-xl border border-slate-200"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Primary Industry</label>
              <input
                type="text"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Headquarters Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Bangalore, Karnataka"
                className="w-full p-2.5 rounded-xl border border-slate-200"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Company Size</label>
              <select
                value={formData.companySize}
                onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
              >
                <option value="1-10 employees">1-10 employees</option>
                <option value="10-50 employees">10-50 employees</option>
                <option value="50-200 employees">50-200 employees</option>
                <option value="200-1000 employees">200-1000 employees</option>
                <option value="1000-5000 employees">1000-5000 employees</option>
                <option value="5000+ employees">5000+ employees</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Founded Year</label>
              <input
                type="number"
                value={formData.foundedYear}
                onChange={(e) => setFormData({ ...formData, foundedYear: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl border border-slate-200"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Company Description</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your company mission, culture, and team..."
                className="w-full p-2.5 rounded-xl border border-slate-200 resize-none"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs transition-all"
            >
              {saving ? 'Saving...' : 'Save Company Details'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanyProfile;
