import React, { useState, useEffect } from 'react';
import {
  User,
  GraduationCap,
  Briefcase,
  Code2,
  FolderGit2,
  Award,
  Link as LinkIcon,
  Upload,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2,
  Sparkles,
  FileText,
  Download,
  X,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const StudentProfile = () => {
  const { refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [completion, setCompletion] = useState(20);

  // Form State
  const [personal, setPersonal] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    headline: '',
    bio: '',
  });

  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');

  const [education, setEducation] = useState([]);
  const [experience, setExperience] = useState([]);
  const [projects, setProjects] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [links, setLinks] = useState({ linkedin: '', github: '', portfolio: '', twitter: '' });

  // Resume Upload & Parsed Review State
  const [resumeInfo, setResumeInfo] = useState({
    resumeUrl: '',
    resumeOriginalName: '',
    resumeScore: 0,
  });
  const [uploadingResume, setUploadingResume] = useState(false);
  const [parsedReviewData, setParsedReviewData] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/student/profile');
      if (res.data.success) {
        const { profile, user, completion: comp } = res.data;
        setPersonal({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          location: user.location || '',
          headline: profile.headline || '',
          bio: profile.bio || '',
        });
        setSkills(profile.skills || []);
        setEducation(profile.education || []);
        setExperience(profile.experience || []);
        setProjects(profile.projects || []);
        setCertifications(profile.certifications || []);
        setLinks(profile.links || { linkedin: '', github: '', portfolio: '', twitter: '' });
        setResumeInfo({
          resumeUrl: profile.resumeUrl || '',
          resumeOriginalName: profile.resumeOriginalName || '',
          resumeScore: profile.resumeScore || 0,
        });
        setCompletion(comp || profile.profileCompletion || 20);
      }
    } catch (err) {
      console.error('Error fetching student profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e?.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);

    try {
      const payload = {
        name: personal.name,
        phone: personal.phone,
        location: personal.location,
        headline: personal.headline,
        bio: personal.bio,
        skills,
        education,
        experience,
        projects,
        certifications,
        links,
      };

      const res = await api.put('/student/profile', payload);
      if (res.data.success) {
        setMessage('Profile updated successfully!');
        setCompletion(res.data.completion || completion);
        await refreshUser();
        setTimeout(() => setMessage(''), 4000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  // Skill Handlers
  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  // Education Handlers
  const handleAddEducation = () => {
    setEducation([
      ...education,
      { degree: '', college: '', fieldOfStudy: '', graduationYear: '', cgpa: '', description: '' },
    ]);
  };

  const handleRemoveEducation = (idx) => {
    setEducation(education.filter((_, i) => i !== idx));
  };

  const handleEducationChange = (idx, field, val) => {
    const copy = [...education];
    copy[idx][field] = val;
    setEducation(copy);
  };

  // Experience Handlers
  const handleAddExperience = () => {
    setExperience([
      ...experience,
      { company: '', position: '', startDate: '', endDate: '', current: false, description: '' },
    ]);
  };

  const handleRemoveExperience = (idx) => {
    setExperience(experience.filter((_, i) => i !== idx));
  };

  const handleExperienceChange = (idx, field, val) => {
    const copy = [...experience];
    copy[idx][field] = val;
    setExperience(copy);
  };

  // Project Handlers
  const handleAddProject = () => {
    setProjects([
      ...projects,
      { title: '', description: '', technologies: [], githubUrl: '', liveUrl: '' },
    ]);
  };

  const handleRemoveProject = (idx) => {
    setProjects(projects.filter((_, i) => i !== idx));
  };

  const handleProjectChange = (idx, field, val) => {
    const copy = [...projects];
    copy[idx][field] = val;
    setProjects(copy);
  };

  // Resume Upload Handler
  const handleResumeFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('resume', file);

    setUploadingResume(true);
    setError('');

    try {
      const res = await api.post('/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        setResumeInfo({
          resumeUrl: res.data.fileUrl,
          resumeOriginalName: res.data.fileName,
          resumeScore: 0,
        });

        // Open review modal with parsed data
        setParsedReviewData(res.data.parsedData);
        setShowReviewModal(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload resume file.');
    } finally {
      setUploadingResume(false);
    }
  };

  // Confirm Parsed Data Handler
  const handleConfirmParsedData = async () => {
    if (!parsedReviewData) return;

    try {
      const res = await api.post('/resumes/confirm', parsedReviewData);
      if (res.data.success) {
        setShowReviewModal(false);
        setMessage('Extracted resume data successfully saved to your profile!');
        fetchProfile();
      }
    } catch (err) {
      setError('Error confirming parsed resume data.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Profile Header & Completion Bar */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-700 font-extrabold text-2xl flex items-center justify-center ring-2 ring-indigo-200 shadow-xs">
              {personal.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">{personal.name}</h1>
              <p className="text-xs text-slate-500 font-medium">
                {personal.headline || 'Add a professional headline to stand out'}
              </p>
            </div>
          </div>

          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all disabled:opacity-50 self-start sm:self-auto"
          >
            {saving ? 'Saving...' : 'Save All Changes'}
          </button>
        </div>

        {/* Completion Progress Bar */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-slate-700">Profile Strength</span>
            <span className="font-extrabold text-indigo-600">{completion}%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${completion}%` }}
            />
          </div>
        </div>

        {message && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-1.5 p-1.5 bg-white rounded-2xl border border-slate-200 shadow-xs text-xs font-bold">
        {[
          { id: 'personal', label: 'Personal Details', icon: User },
          { id: 'resume', label: 'Resume & AI Parse', icon: Upload },
          { id: 'skills', label: 'Skills & Tech', icon: Code2 },
          { id: 'education', label: 'Education', icon: GraduationCap },
          { id: 'experience', label: 'Experience', icon: Briefcase },
          { id: 'projects', label: 'Projects', icon: FolderGit2 },
          { id: 'links', label: 'Social Links', icon: LinkIcon },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl transition-all ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Personal Details */}
      {activeTab === 'personal' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            Personal Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={personal.name}
                onChange={(e) => setPersonal({ ...personal, name: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email (Read Only)</label>
              <input
                type="email"
                disabled
                value={personal.email}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={personal.phone}
                onChange={(e) => setPersonal({ ...personal, phone: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Location / City</label>
              <input
                type="text"
                value={personal.location}
                onChange={(e) => setPersonal({ ...personal, location: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Headline (e.g. Full Stack Developer | React & Node.js)
              </label>
              <input
                type="text"
                value={personal.headline}
                onChange={(e) => setPersonal({ ...personal, headline: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Professional Bio / Summary
              </label>
              <textarea
                rows={3}
                value={personal.bio}
                onChange={(e) => setPersonal({ ...personal, bio: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Resume Upload & Parser */}
      {activeTab === 'resume' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Upload & Parse Resume</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Upload your resume in PDF, DOC, or DOCX format. Our parser extracts key details and lets you review before updating.
            </p>
          </div>

          {/* Current resume badge */}
          {resumeInfo.resumeUrl ? (
            <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-2xl flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">
                    {resumeInfo.resumeOriginalName || 'Uploaded Resume'}
                  </p>
                  <p className="text-[11px] text-slate-500">Ready for AI job applications</p>
                </div>
              </div>
              <a
                href={resumeInfo.resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:text-indigo-600 rounded-xl text-xs font-bold flex items-center space-x-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </a>
            </div>
          ) : (
            <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-2xl text-center text-xs text-slate-500">
              No resume uploaded yet. Upload one below.
            </div>
          )}

          {/* File input box */}
          <div className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/20 rounded-3xl p-8 text-center space-y-3 transition-colors">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">
                {uploadingResume ? 'Extracting & Parsing Document...' : 'Select or drop resume document'}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">PDF, DOC, DOCX up to 5MB</p>
            </div>
            <label className="inline-block px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer shadow-xs transition-all">
              <span>{uploadingResume ? 'Processing...' : 'Choose File'}</span>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                disabled={uploadingResume}
                onChange={handleResumeFileChange}
                className="hidden"
              />
            </label>
          </div>
        </div>
      )}

      {/* Tab 3: Skills */}
      {activeTab === 'skills' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            Technical Skills & Proficiencies
          </h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
              placeholder="Add skill (e.g. React, TypeScript, Docker, SQL)..."
              className="flex-1 p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold"
            >
              Add
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-semibold"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="hover:text-rose-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Education */}
      {activeTab === 'education' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Education Details</h3>
            <button
              type="button"
              onClick={handleAddEducation}
              className="text-xs font-bold text-indigo-600 hover:underline flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Education</span>
            </button>
          </div>

          {education.map((edu, idx) => (
            <div key={idx} className="p-4 bg-slate-50 rounded-2xl space-y-3 relative">
              <button
                type="button"
                onClick={() => handleRemoveEducation(idx)}
                className="absolute top-3 right-3 text-slate-400 hover:text-rose-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Degree</label>
                  <input
                    type="text"
                    value={edu.degree || ''}
                    onChange={(e) => handleEducationChange(idx, 'degree', e.target.value)}
                    placeholder="e.g. B.Tech Computer Science"
                    className="w-full p-2 bg-white rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">College / University</label>
                  <input
                    type="text"
                    value={edu.college || ''}
                    onChange={(e) => handleEducationChange(idx, 'college', e.target.value)}
                    placeholder="e.g. IIT Hyderabad"
                    className="w-full p-2 bg-white rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Graduation Year</label>
                  <input
                    type="text"
                    value={edu.graduationYear || ''}
                    onChange={(e) => handleEducationChange(idx, 'graduationYear', e.target.value)}
                    placeholder="e.g. 2025"
                    className="w-full p-2 bg-white rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">CGPA / Percentage</label>
                  <input
                    type="text"
                    value={edu.cgpa || ''}
                    onChange={(e) => handleEducationChange(idx, 'cgpa', e.target.value)}
                    placeholder="e.g. 8.5 CGPA"
                    className="w-full p-2 bg-white rounded-xl border border-slate-200"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 5: Experience */}
      {activeTab === 'experience' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Work Experience & Internships</h3>
            <button
              type="button"
              onClick={handleAddExperience}
              className="text-xs font-bold text-indigo-600 hover:underline flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Experience</span>
            </button>
          </div>

          {experience.map((exp, idx) => (
            <div key={idx} className="p-4 bg-slate-50 rounded-2xl space-y-3 relative">
              <button
                type="button"
                onClick={() => handleRemoveExperience(idx)}
                className="absolute top-3 right-3 text-slate-400 hover:text-rose-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Company</label>
                  <input
                    type="text"
                    value={exp.company || ''}
                    onChange={(e) => handleExperienceChange(idx, 'company', e.target.value)}
                    placeholder="e.g. Tech Innovators"
                    className="w-full p-2 bg-white rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Position / Role</label>
                  <input
                    type="text"
                    value={exp.position || ''}
                    onChange={(e) => handleExperienceChange(idx, 'position', e.target.value)}
                    placeholder="e.g. Frontend Intern"
                    className="w-full p-2 bg-white rounded-xl border border-slate-200"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Description & Impact</label>
                  <textarea
                    rows={2}
                    value={exp.description || ''}
                    onChange={(e) => handleExperienceChange(idx, 'description', e.target.value)}
                    placeholder="Briefly describe key tasks, tech stack, and achievements..."
                    className="w-full p-2 bg-white rounded-xl border border-slate-200 resize-none"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 6: Projects */}
      {activeTab === 'projects' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Projects Portfolio</h3>
            <button
              type="button"
              onClick={handleAddProject}
              className="text-xs font-bold text-indigo-600 hover:underline flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Project</span>
            </button>
          </div>

          {projects.map((proj, idx) => (
            <div key={idx} className="p-4 bg-slate-50 rounded-2xl space-y-3 relative">
              <button
                type="button"
                onClick={() => handleRemoveProject(idx)}
                className="absolute top-3 right-3 text-slate-400 hover:text-rose-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Project Name</label>
                  <input
                    type="text"
                    value={proj.title || ''}
                    onChange={(e) => handleProjectChange(idx, 'title', e.target.value)}
                    placeholder="e.g. JobConnect AI Platform"
                    className="w-full p-2 bg-white rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">GitHub Repo URL</label>
                  <input
                    type="url"
                    value={proj.githubUrl || ''}
                    onChange={(e) => handleProjectChange(idx, 'githubUrl', e.target.value)}
                    placeholder="https://github.com/..."
                    className="w-full p-2 bg-white rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Live Demo URL</label>
                  <input
                    type="url"
                    value={proj.liveUrl || ''}
                    onChange={(e) => handleProjectChange(idx, 'liveUrl', e.target.value)}
                    placeholder="https://..."
                    className="w-full p-2 bg-white rounded-xl border border-slate-200"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={proj.description || ''}
                    onChange={(e) => handleProjectChange(idx, 'description', e.target.value)}
                    placeholder="What did you build and what problem did it solve?"
                    className="w-full p-2 bg-white rounded-xl border border-slate-200 resize-none"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 7: Social Links */}
      {activeTab === 'links' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            Online Profiles & Links
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">LinkedIn Profile</label>
              <input
                type="url"
                value={links.linkedin}
                onChange={(e) => setLinks({ ...links, linkedin: e.target.value })}
                placeholder="https://linkedin.com/in/..."
                className="w-full p-2.5 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">GitHub Profile</label>
              <input
                type="url"
                value={links.github}
                onChange={(e) => setLinks({ ...links, github: e.target.value })}
                placeholder="https://github.com/..."
                className="w-full p-2.5 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Portfolio Website</label>
              <input
                type="url"
                value={links.portfolio}
                onChange={(e) => setLinks({ ...links, portfolio: e.target.value })}
                placeholder="https://..."
                className="w-full p-2.5 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Twitter / X</label>
              <input
                type="url"
                value={links.twitter}
                onChange={(e) => setLinks({ ...links, twitter: e.target.value })}
                placeholder="https://twitter.com/..."
                className="w-full p-2.5 rounded-xl border border-slate-200"
              />
            </div>
          </div>
        </div>
      )}

      {/* REVIEW & CONFIRM EXTRACTED RESUME MODAL */}
      {showReviewModal && parsedReviewData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 my-8 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Review Extracted Resume Data
                </h3>
              </div>
              <button
                onClick={() => setShowReviewModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              We parsed the following information from your uploaded resume. You can review and edit before saving it to your profile.
            </p>

            {/* Extracted Skills */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase">Extracted Skills</h4>
              <div className="flex flex-wrap gap-1.5">
                {(parsedReviewData.skills || []).map((sk, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold"
                  >
                    {sk}
                  </span>
                ))}
              </div>
            </div>

            {/* Extracted Education */}
            {parsedReviewData.education?.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase">Extracted Education</h4>
                {parsedReviewData.education.map((ed, i) => (
                  <div key={i} className="p-3 bg-slate-50 rounded-xl text-xs space-y-0.5">
                    <p className="font-bold text-slate-800">{ed.degree}</p>
                    <p className="text-slate-500">{ed.college} • {ed.graduationYear}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => setShowReviewModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel / Skip
              </button>
              <button
                onClick={handleConfirmParsedData}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center space-x-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Confirm & Apply to Profile</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentProfile;
