const Interview = require('../models/Interview');
const Application = require('../models/Application');
const Job = require('../models/Job');
const Notification = require('../models/Notification');

// @desc    Schedule an interview
// @route   POST /api/interviews
// @access  Private (recruiter)
const scheduleInterview = async (req, res, next) => {
  try {
    const { applicationId, date, time, type, meetingLink, location, notes } = req.body;

    if (!applicationId || !date || !time) {
      return res.status(400).json({
        success: false,
        message: 'Application ID, date, and time are required to schedule an interview',
      });
    }

    const application = await Application.findById(applicationId).populate('jobId');
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // Verify recruiter owns the job
    if (
      application.recruiterId.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only schedule interviews for your own job postings',
      });
    }

    const interview = await Interview.create({
      applicationId,
      candidateId: application.studentId,
      recruiterId: req.user._id,
      jobId: application.jobId._id,
      date: new Date(date),
      time,
      type: type || 'Online',
      meetingLink: meetingLink || '',
      location: location || '',
      notes: notes || '',
      status: 'Scheduled',
    });

    // Update application status to Interview
    application.status = 'Interview';
    await application.save();

    // Send notifications to candidate
    const formattedDate = new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    await Promise.all([
      Notification.create({
        userId: application.studentId,
        type: 'interview_scheduled',
        title: 'Interview Scheduled!',
        message: `An interview has been scheduled for ${application.jobId.title} on ${formattedDate} at ${time}.`,
        link: '/student/dashboard',
      }),
      Notification.create({
        userId: req.user._id,
        type: 'interview_scheduled',
        title: 'Interview Confirmed',
        message: `Interview scheduled on ${formattedDate} at ${time}.`,
        link: '/recruiter/interviews',
      }),
    ]);

    res.status(201).json({
      success: true,
      message: 'Interview scheduled successfully!',
      interview,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get recruiter's scheduled interviews
// @route   GET /api/interviews/recruiter
// @access  Private (recruiter)
const getRecruiterInterviews = async (req, res, next) => {
  try {
    const interviews = await Interview.find({ recruiterId: req.user._id })
      .populate('candidateId', 'name email phone avatar')
      .populate('jobId', 'title company')
      .sort({ date: 1 });

    res.status(200).json({
      success: true,
      count: interviews.length,
      interviews,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get candidate's interviews
// @route   GET /api/interviews/my
// @access  Private (student)
const getCandidateInterviews = async (req, res, next) => {
  try {
    const interviews = await Interview.find({ candidateId: req.user._id })
      .populate('jobId', 'title company location')
      .populate('recruiterId', 'name email phone')
      .sort({ date: 1 });

    res.status(200).json({
      success: true,
      count: interviews.length,
      interviews,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update interview status (Complete/Cancel)
// @route   PUT /api/interviews/:id/status
// @access  Private (recruiter)
const updateInterviewStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['Scheduled', 'Completed', 'Cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid interview status' });
    }

    const interview = await Interview.findById(req.params.id);
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }

    if (
      interview.recruiterId.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    interview.status = status;
    await interview.save();

    res.status(200).json({
      success: true,
      message: `Interview status marked as ${status}`,
      interview,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  scheduleInterview,
  getRecruiterInterviews,
  getCandidateInterviews,
  updateInterviewStatus,
};
