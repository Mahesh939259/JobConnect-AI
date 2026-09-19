const Application = require('../models/Application');
const Job = require('../models/Job');
const SavedJob = require('../models/SavedJob');
const StudentProfile = require('../models/StudentProfile');
const Notification = require('../models/Notification');
const { computeJobMatch } = require('../services/matchingService');

// @desc    Apply for a job
// @route   POST /api/applications/:jobId
// @access  Private (student only)
const applyJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const { coverLetter, portfolio, linkedin, github, resumeUrl } = req.body;
    const studentId = req.user._id;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (job.status !== 'Active') {
      return res.status(400).json({
        success: false,
        message: 'This job posting is closed and no longer accepting applications.',
      });
    }

    // Check duplicate application
    const existing = await Application.findOne({ studentId, jobId });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'You have already applied for this position.',
      });
    }

    // Fetch student profile for AI matching
    let profile = await StudentProfile.findOne({ userId: studentId });
    if (!profile) {
      profile = await StudentProfile.create({ userId: studentId });
    }

    // Compute real AI match for this application
    const matchResult = await computeJobMatch(profile, job);

    const application = await Application.create({
      studentId,
      jobId,
      recruiterId: job.createdBy,
      resumeUrl: resumeUrl || profile.resumeUrl,
      resumeId: profile.resumeId,
      coverLetter: coverLetter || '',
      portfolio: portfolio || profile.links?.portfolio || '',
      linkedin: linkedin || profile.links?.linkedin || '',
      github: github || profile.links?.github || '',
      status: 'Applied',
      aiMatch: {
        score: matchResult.score,
        matchedSkills: matchResult.matchedSkills,
        missingSkills: matchResult.missingSkills,
        experienceMatch: matchResult.experienceMatch,
        educationMatch: matchResult.educationMatch,
        reason: matchResult.reason,
        breakdown: matchResult.breakdown,
      },
    });

    // Increment applicants counter on job
    await Job.findByIdAndUpdate(jobId, { $inc: { applicantsCount: 1 } });

    // Send notifications
    await Promise.all([
      Notification.create({
        userId: studentId,
        type: 'application_submitted',
        title: 'Application Submitted',
        message: `You successfully applied for ${job.title} at ${job.company}.`,
        link: `/student/applications`,
      }),
      Notification.create({
        userId: job.createdBy,
        type: 'new_applicant',
        title: 'New Applicant',
        message: `${req.user.name} applied for your posting: ${job.title} (AI Match: ${matchResult.score}%).`,
        link: `/recruiter/jobs/${job._id}/applicants`,
      }),
    ]);

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully!',
      application,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get student's own applications
// @route   GET /api/applications/my
// @access  Private (student)
const getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ studentId: req.user._id })
      .populate({
        path: 'jobId',
        select: 'title company location salaryMin salaryMax jobType workMode status',
        populate: { path: 'companyId', select: 'logo name industry' },
      })
      .sort({ appliedAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get application details by ID
// @route   GET /api/applications/:id
// @access  Private (Applicant or Job Recruiter or Admin)
const getApplicationById = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('jobId')
      .populate('studentId', 'name email phone location avatar');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const isStudent = application.studentId._id.toString() === req.user._id.toString();
    const isRecruiter = application.recruiterId?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isStudent && !isRecruiter && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to view this application',
      });
    }

    // Attach student profile
    const studentProfile = await StudentProfile.findOne({
      userId: application.studentId._id,
    });

    res.status(200).json({
      success: true,
      application,
      studentProfile,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update application status (Recruiter only)
// @route   PUT /api/applications/:id/status
// @access  Private (recruiter, admin)
const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ['Applied', 'Under Review', 'Shortlisted', 'Interview', 'Selected', 'Rejected'];

    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed statuses: ${allowed.join(', ')}`,
      });
    }

    const application = await Application.findById(req.params.id).populate('jobId', 'title company');
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // Authorization check
    if (
      application.recruiterId.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only update applications for your own jobs',
      });
    }

    application.status = status;
    await application.save();

    // Notify the student
    await Notification.create({
      userId: application.studentId,
      type: 'status_changed',
      title: 'Application Status Updated',
      message: `Your application for ${application.jobId?.title || 'position'} has been updated to "${status}".`,
      link: `/student/applications`,
    });

    res.status(200).json({
      success: true,
      message: `Candidate status updated to "${status}" successfully.`,
      application,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Save / Bookmark a job
// @route   POST /api/saved-jobs/:jobId
// @access  Private (student)
const saveJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const studentId = req.user._id;

    const existing = await SavedJob.findOne({ studentId, jobId });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Job is already saved' });
    }

    await SavedJob.create({ studentId, jobId });

    res.status(201).json({
      success: true,
      message: 'Job saved to your bookmarks!',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Unsave / Remove bookmark
// @route   DELETE /api/saved-jobs/:jobId
// @access  Private (student)
const unsaveJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const studentId = req.user._id;

    await SavedJob.findOneAndDelete({ studentId, jobId });

    res.status(200).json({
      success: true,
      message: 'Job removed from saved bookmarks',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all saved jobs for student
// @route   GET /api/saved-jobs
// @access  Private (student)
const getSavedJobs = async (req, res, next) => {
  try {
    const saved = await SavedJob.find({ studentId: req.user._id })
      .populate({
        path: 'jobId',
        populate: { path: 'companyId', select: 'logo name location industry' },
      })
      .sort({ createdAt: -1 });

    const jobs = saved.filter((s) => s.jobId).map((s) => s.jobId);

    res.status(200).json({
      success: true,
      count: jobs.length,
      jobs,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  applyJob,
  getMyApplications,
  getApplicationById,
  updateApplicationStatus,
  saveJob,
  unsaveJob,
  getSavedJobs,
};
