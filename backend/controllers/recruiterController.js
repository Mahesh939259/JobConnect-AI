const mongoose = require('mongoose');
const Job = require('../models/Job');
const Application = require('../models/Application');
const RecruiterProfile = require('../models/RecruiterProfile');
const Company = require('../models/Company');
const StudentProfile = require('../models/StudentProfile');

// @desc    Get recruiter dashboard metrics and real aggregations
// @route   GET /api/recruiter/dashboard
// @access  Private (recruiter)
const getDashboard = async (req, res, next) => {
  try {
    const recruiterId = req.user._id;

    // Get all jobs created by this recruiter
    const recruiterJobs = await Job.find({ createdBy: recruiterId }).select('_id title');
    const jobIds = recruiterJobs.map((j) => j._id);

    const [
      totalJobs,
      activeJobs,
      totalApplications,
      shortlisted,
      interviews,
      hired,
      statusDistribution,
      applicationsByJob,
    ] = await Promise.all([
      Job.countDocuments({ createdBy: recruiterId }),
      Job.countDocuments({ createdBy: recruiterId, status: 'Active' }),
      Application.countDocuments({ jobId: { $in: jobIds } }),
      Application.countDocuments({ jobId: { $in: jobIds }, status: 'Shortlisted' }),
      Application.countDocuments({ jobId: { $in: jobIds }, status: 'Interview' }),
      Application.countDocuments({ jobId: { $in: jobIds }, status: 'Selected' }),
      Application.aggregate([
        { $match: { jobId: { $in: jobIds } } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Application.aggregate([
        { $match: { jobId: { $in: jobIds } } },
        { $group: { _id: '$jobId', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
    ]);

    // Map applications by job title
    const jobTitleMap = {};
    recruiterJobs.forEach((j) => {
      jobTitleMap[j._id.toString()] = j.title;
    });

    const enrichedAppsByJob = applicationsByJob.map((item) => ({
      jobId: item._id,
      title: jobTitleMap[item._id.toString()] || 'Job Posting',
      count: item.count,
    }));

    // Status map
    const statusMap = {
      Applied: 0,
      'Under Review': 0,
      Shortlisted: 0,
      Interview: 0,
      Selected: 0,
      Rejected: 0,
    };
    statusDistribution.forEach((s) => {
      if (statusMap[s._id] !== undefined) {
        statusMap[s._id] = s.count;
      }
    });

    res.status(200).json({
      success: true,
      stats: {
        totalJobs,
        activeJobs,
        totalApplications,
        shortlisted,
        interviews,
        hired,
      },
      charts: {
        statusDistribution: statusMap,
        applicationsByJob: enrichedAppsByJob,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all jobs created by recruiter
// @route   GET /api/recruiter/jobs
// @access  Private (recruiter)
const getRecruiterJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ createdBy: req.user._id })
      .populate('companyId', 'name logo')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: jobs.length,
      jobs,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get applicants for a specific job with AI ranking and sorting
// @route   GET /api/recruiter/jobs/:jobId/applicants
// @access  Private (recruiter)
const getJobApplicants = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const { sortBy = 'score' } = req.query; // 'score', 'date', 'status'

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (
      job.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only view applicants for your own jobs',
      });
    }

    const applications = await Application.find({ jobId })
      .populate('studentId', 'name email phone location avatar')
      .populate('resumeId');

    // Attach student profile details (education, skills, experience)
    const studentUserIds = applications.map((a) => a.studentId?._id).filter(Boolean);
    const profiles = await StudentProfile.find({ userId: { $in: studentUserIds } });
    const profileMap = {};
    profiles.forEach((p) => {
      profileMap[p.userId.toString()] = p;
    });

    const enrichedApplicants = applications.map((app) => {
      const p = profileMap[app.studentId?._id?.toString()] || {};
      return {
        _id: app._id,
        candidate: app.studentId,
        skills: p.skills || [],
        experience: p.experience || [],
        education: p.education || [],
        resumeUrl: app.resumeUrl || p.resumeUrl,
        portfolio: app.portfolio,
        linkedin: app.linkedin,
        github: app.github,
        coverLetter: app.coverLetter,
        aiMatch: app.aiMatch,
        status: app.status,
        appliedAt: app.appliedAt,
      };
    });

    // Sort applicants
    if (sortBy === 'score') {
      enrichedApplicants.sort((a, b) => (b.aiMatch?.score || 0) - (a.aiMatch?.score || 0));
    } else if (sortBy === 'date') {
      enrichedApplicants.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));
    }

    res.status(200).json({
      success: true,
      job: {
        _id: job._id,
        title: job.title,
        company: job.company,
        location: job.location,
        skills: job.skills,
        experienceMin: job.experienceMin,
        experienceMax: job.experienceMax,
      },
      count: enrichedApplicants.length,
      applicants: enrichedApplicants,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get recruiter profile
// @route   GET /api/recruiter/profile
// @access  Private (recruiter)
const getProfile = async (req, res, next) => {
  try {
    let profile = await RecruiterProfile.findOne({ userId: req.user._id }).populate('companyId');
    if (!profile) {
      profile = await RecruiterProfile.create({ userId: req.user._id });
    }

    res.status(200).json({
      success: true,
      profile,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
        location: req.user.location,
        avatar: req.user.avatar,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update recruiter profile
// @route   PUT /api/recruiter/profile
// @access  Private (recruiter)
const updateProfile = async (req, res, next) => {
  try {
    const { designation, department, workPhone, about, companyName } = req.body;

    let profile = await RecruiterProfile.findOne({ userId: req.user._id });
    if (!profile) {
      profile = new RecruiterProfile({ userId: req.user._id });
    }

    if (designation) profile.designation = designation;
    if (department) profile.department = department;
    if (workPhone) profile.workPhone = workPhone;
    if (about) profile.about = about;
    if (companyName) profile.companyName = companyName;

    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Recruiter profile updated successfully',
      profile,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboard,
  getRecruiterJobs,
  getJobApplicants,
  getProfile,
  updateProfile,
};
