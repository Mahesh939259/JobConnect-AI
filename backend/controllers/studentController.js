const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Interview = require('../models/Interview');
const { computeJobMatch, analyzeResumeQuality } = require('../services/matchingService');

// @desc    Get student profile
// @route   GET /api/student/profile
// @access  Private (student)
const getProfile = async (req, res, next) => {
  try {
    let profile = await StudentProfile.findOne({ userId: req.user._id });
    if (!profile) {
      profile = await StudentProfile.create({ userId: req.user._id });
    }

    const completion = profile.calculateCompletion();
    await profile.save();

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
      completion,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update student profile
// @route   PUT /api/student/profile
// @access  Private (student)
const updateProfile = async (req, res, next) => {
  try {
    const {
      name,
      phone,
      location,
      headline,
      bio,
      education,
      skills,
      experience,
      projects,
      certifications,
      links,
    } = req.body;

    // Update base User model fields
    if (name || phone || location) {
      await User.findByIdAndUpdate(req.user._id, {
        ...(name && { name }),
        ...(phone && { phone }),
        ...(location && { location }),
      });
    }

    let profile = await StudentProfile.findOne({ userId: req.user._id });
    if (!profile) {
      profile = new StudentProfile({ userId: req.user._id });
    }

    if (headline !== undefined) profile.headline = headline;
    if (bio !== undefined) profile.bio = bio;
    if (education !== undefined) profile.education = education;
    if (skills !== undefined) profile.skills = skills;
    if (experience !== undefined) profile.experience = experience;
    if (projects !== undefined) profile.projects = projects;
    if (certifications !== undefined) profile.certifications = certifications;
    if (links !== undefined) profile.links = links;

    profile.calculateCompletion();
    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      profile,
      completion: profile.profileCompletion,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get student dashboard metrics & recent applications
// @route   GET /api/student/dashboard
// @access  Private (student)
const getDashboard = async (req, res, next) => {
  try {
    const studentId = req.user._id;

    const [
      totalApplications,
      underReview,
      shortlisted,
      interviewsCount,
      recentApplications,
      upcomingInterviews,
      profile,
    ] = await Promise.all([
      Application.countDocuments({ studentId }),
      Application.countDocuments({ studentId, status: 'Under Review' }),
      Application.countDocuments({ studentId, status: 'Shortlisted' }),
      Application.countDocuments({ studentId, status: 'Interview' }),
      Application.find({ studentId })
        .populate({
          path: 'jobId',
          select: 'title company location salaryMin salaryMax jobType workMode',
          populate: { path: 'companyId', select: 'logo' },
        })
        .sort({ appliedAt: -1 })
        .limit(5),
      Interview.find({ candidateId: studentId, status: 'Scheduled' })
        .populate('jobId', 'title company')
        .populate('recruiterId', 'name email')
        .sort({ date: 1 })
        .limit(3),
      StudentProfile.findOne({ userId: studentId }),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalApplications,
        underReview,
        shortlisted,
        interviews: interviewsCount,
        profileCompletion: profile ? profile.profileCompletion : 20,
        resumeScore: profile ? profile.resumeScore : 0,
      },
      recentApplications,
      upcomingInterviews,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get AI recommended jobs for student
// @route   GET /api/student/recommended-jobs
// @access  Private (student)
const getRecommendedJobs = async (req, res, next) => {
  try {
    const profile = await StudentProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(200).json({ success: true, count: 0, jobs: [] });
    }

    // Fetch active jobs
    const activeJobs = await Job.find({ status: 'Active' })
      .populate('companyId', 'logo name industry location')
      .limit(30);

    // Compute match score for each active job
    const rankedJobs = [];
    for (const job of activeJobs) {
      const matchResult = await computeJobMatch(profile, job);
      rankedJobs.push({
        job,
        matchScore: matchResult.score,
        matchedSkills: matchResult.matchedSkills,
        missingSkills: matchResult.missingSkills,
        reason: matchResult.reason,
        breakdown: matchResult.breakdown,
      });
    }

    // Sort descending by match score
    rankedJobs.sort((a, b) => b.matchScore - a.matchScore);

    res.status(200).json({
      success: true,
      count: rankedJobs.length,
      jobs: rankedJobs,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get AI resume analysis
// @route   GET /api/student/resume-analysis
// @access  Private (student)
const getResumeAnalysis = async (req, res, next) => {
  try {
    let profile = await StudentProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    const analysis = analyzeResumeQuality(profile);
    profile.resumeScore = analysis.score;
    profile.resumeAnalysis = analysis;
    await profile.save();

    res.status(200).json({
      success: true,
      analysis,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getDashboard,
  getRecommendedJobs,
  getResumeAnalysis,
};
