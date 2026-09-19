const User = require('../models/User');
const Company = require('../models/Company');
const Job = require('../models/Job');
const Application = require('../models/Application');

// @desc    Get admin platform analytics & stats
// @route   GET /api/admin/stats
// @access  Private (admin only)
const getPlatformStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalStudents,
      totalRecruiters,
      totalCompanies,
      totalJobs,
      activeJobs,
      totalApplications,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'recruiter' }),
      Company.countDocuments(),
      Job.countDocuments(),
      Job.countDocuments({ status: 'Active' }),
      Application.countDocuments(),
    ]);

    // Recent activity
    const [recentUsers, recentJobs, recentApplications] = await Promise.all([
      User.find().select('-password').sort({ createdAt: -1 }).limit(5),
      Job.find().sort({ createdAt: -1 }).limit(5),
      Application.find()
        .populate('studentId', 'name email')
        .populate('jobId', 'title company')
        .sort({ appliedAt: -1 })
        .limit(5),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalStudents,
        totalRecruiters,
        totalCompanies,
        totalJobs,
        activeJobs,
        totalApplications,
      },
      recentActivity: {
        recentUsers,
        recentJobs,
        recentApplications,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all users with search and pagination
// @route   GET /api/admin/users
// @access  Private (admin only)
const getAllUsers = async (req, res, next) => {
  try {
    const { search, role, page = 1, limit = 15 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (role && role !== 'All') {
      query.role = role;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const totalUsers = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: users.length,
      totalUsers,
      totalPages: Math.ceil(totalUsers / Number(limit)),
      currentPage: Number(page),
      users,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Suspend or activate user
// @route   PUT /api/admin/users/:id/suspend
// @access  Private (admin only)
const toggleUserSuspension = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot suspend an administrative account',
      });
    }

    user.isSuspended = !user.isSuspended;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User account has been ${user.isSuspended ? 'suspended' : 'activated'}.`,
      isSuspended: user.isSuspended,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Verify or unverify company
// @route   PUT /api/admin/companies/:id/verify
// @access  Private (admin only)
const toggleCompanyVerification = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    company.isVerified = !company.isVerified;
    await company.save();

    res.status(200).json({
      success: true,
      message: `Company ${company.name} verification status: ${company.isVerified}`,
      isVerified: company.isVerified,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Admin delete job
// @route   DELETE /api/admin/jobs/:id
// @access  Private (admin only)
const deleteJobAdmin = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    await Job.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Job posting deleted by administrator',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getPlatformStats,
  getAllUsers,
  toggleUserSuspension,
  toggleCompanyVerification,
  deleteJobAdmin,
};
