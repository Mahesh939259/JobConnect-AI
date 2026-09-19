import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Briefcase, ArrowLeft, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import api from '../../services/api';

const JobCreateEdit = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    jobType: 'Full Time',
    workMode: 'Remote',
    industry: 'Information Technology',
    salaryMin: '',
    salaryMax: '',
    experienceMin: '0',
    experienceMax: '2',
    description: '',
    skills: '',
    preferredSkills: '',
    responsibilities: '',
    requirements: '',
    qualifications: '',
    benefits: '',
    applicationDeadline: '',
  });

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      const fetchJob = async () => {
        try {
          setLoading(true);
          const res = await api.get(`/jobs/${id}`);
          if (res.data.success) {
            const j = res.data.job;
            setFormData({
              title: j.title || '',
              company: j.company || '',
              location: j.location || '',
              jobType: j.jobType || 'Full Time',
              workMode: j.workMode || 'Remote',
              industry: j.industry || 'Information Technology',
              salaryMin: j.salaryMin || '',
              salaryMax: j.salaryMax || '',
              experienceMin: j.experienceMin ?? '0',
              experienceMax: j.experienceMax ?? '2',
              description: j.description || '',
              skills: (j.skills || []).join(', '),
              preferredSkills: (j.preferredSkills || []).join(', '),
              responsibilities: (j.responsibilities || []).join('\n'),
              requirements: (j.requirements || []).join('\n'),
              qualifications: (j.qualifications || []).join('\n'),
              benefits: (j.benefits || []).join('\n'),
              applicationDeadline: j.applicationDeadline ? j.applicationDeadline.split('T')[0] : '',
            });
          }
        } catch (err) {
          setError('Failed to load job details');
        } finally {
          setLoading(false);
        }
      };
      fetchJob();
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (
      !formData.title.trim() ||
      !formData.description.trim() ||
      !formData.skills.trim() ||
      !formData.location.trim() ||
      !formData.salaryMin ||
      !formData.salaryMax
    ) {
      setError('Please provide all required fields (title, skills, location, salary range, description).');
      return;
    }

    setSubmitting(true);

    try {
      if (isEdit) {
        await api.put(`/jobs/${id}`, formData);
      } else {
        await api.post('/jobs', formData);
      }
      navigate('/recruiter/jobs');
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving job posting.');
    } finally {
      setSubmitting(false);
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
      <Link
        to="/recruiter/jobs"
        className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Posted Jobs</span>
      </Link>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">
            {isEdit ? 'Edit Job Posting' : 'Post a New Job Opportunity'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Specify technical skills and requirements for intelligent candidate matching
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          {/* Basic info */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2">
              1. Position Overview
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Job Title *
                </label>
                <input
                  type="text"
                  required
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Senior Frontend Engineer (React & TypeScript)"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Location *
                </label>
                <input
                  type="text"
                  required
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Bangalore or Remote"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Industry / Department
                </label>
                <input
                  type="text"
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  placeholder="e.g. FinTech / Engineering"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Job Type
                </label>
                <select
                  name="jobType"
                  value={formData.jobType}
                  onChange={handleChange}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="Full Time">Full Time</option>
                  <option value="Part Time">Part Time</option>
                  <option value="Internship">Internship</option>
                  <option value="Contract">Contract</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Work Mode
                </label>
                <select
                  name="workMode"
                  value={formData.workMode}
                  onChange={handleChange}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="On-site">On-site</option>
                </select>
              </div>
            </div>
          </div>

          {/* Compensation & Experience */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2">
              2. Compensation & Experience
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Min Salary (INR / yr) *
                </label>
                <input
                  type="number"
                  required
                  name="salaryMin"
                  value={formData.salaryMin}
                  onChange={handleChange}
                  placeholder="e.g. 800000"
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Max Salary (INR / yr) *
                </label>
                <input
                  type="number"
                  required
                  name="salaryMax"
                  value={formData.salaryMax}
                  onChange={handleChange}
                  placeholder="e.g. 1400000"
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Min Experience (Years)
                </label>
                <input
                  type="number"
                  name="experienceMin"
                  value={formData.experienceMin}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Max Experience (Years)
                </label>
                <input
                  type="number"
                  name="experienceMax"
                  value={formData.experienceMax}
                  onChange={handleChange}
                  placeholder="3"
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>
            </div>
          </div>

          {/* Technical Skills */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2">
              3. Skills & Matching Criteria
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Required Skills (Comma separated) *
                </label>
                <input
                  type="text"
                  required
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  placeholder="React, TypeScript, Redux, HTML5, REST API"
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Preferred / Nice-to-have Skills
                </label>
                <input
                  type="text"
                  name="preferredSkills"
                  value={formData.preferredSkills}
                  onChange={handleChange}
                  placeholder="Docker, AWS, Next.js, Jest"
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>
            </div>
          </div>

          {/* Description & Requirements */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2">
              4. Job Details & Responsibilities
            </h3>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Full Job Description *
              </label>
              <textarea
                rows={4}
                required
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe team mission, day-to-day impact, and product overview..."
                className="w-full p-2.5 rounded-xl border border-slate-200 resize-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Key Responsibilities (One per line)
              </label>
              <textarea
                rows={3}
                name="responsibilities"
                value={formData.responsibilities}
                onChange={handleChange}
                placeholder="Architect and build scalable web applications&#10;Collaborate with product designers and backend engineers"
                className="w-full p-2.5 rounded-xl border border-slate-200 resize-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Requirements (One per line)
              </label>
              <textarea
                rows={3}
                name="requirements"
                value={formData.requirements}
                onChange={handleChange}
                placeholder="3+ years building responsive SPAs in React&#10;Strong understanding of JavaScript event loop and async patterns"
                className="w-full p-2.5 rounded-xl border border-slate-200 resize-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Perks & Benefits (One per line)
              </label>
              <textarea
                rows={2}
                name="benefits"
                value={formData.benefits}
                onChange={handleChange}
                placeholder="Comprehensive Health Insurance&#10;Flexible Remote Policy&#10;Annual Tech Allowance"
                className="w-full p-2.5 rounded-xl border border-slate-200 resize-none"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <Link
              to="/recruiter/jobs"
              className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs transition-all disabled:opacity-50 flex items-center space-x-1.5"
            >
              {submitting ? (
                <span>Publishing...</span>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isEdit ? 'Save Changes' : 'Publish Job'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobCreateEdit;
