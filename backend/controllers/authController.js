const crypto = require('crypto');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const RecruiterProfile = require('../models/RecruiterProfile');
const Company = require('../models/Company');
const { generateToken } = require('../utils/jwt');

// @desc    Register a new user (Student or Recruiter)
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, location, companyName } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, password, role.',
      });
    }

    if (!['student', 'recruiter'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be either "student" or "recruiter".',
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists. Please log in.',
      });
    }

    // Create base user record
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role,
      phone: phone || '',
      location: location || '',
    });

    // Create role-specific profile
    if (role === 'student') {
      await StudentProfile.create({
        userId: user._id,
        profileCompletion: 25,
      });
    } else if (role === 'recruiter') {
      let company = null;
      if (companyName) {
        // Find or create company
        company = await Company.findOne({ name: new RegExp(`^${companyName}$`, 'i') });
        if (!company) {
          company = await Company.create({
            name: companyName,
            industry: 'Information Technology',
            description: `${companyName} is hiring top talent on JobConnect AI.`,
            location: location || 'India',
            createdBy: user._id,
          });
        }
      }

      await RecruiterProfile.create({
        userId: user._id,
        companyId: company ? company._id : null,
        companyName: companyName || '',
      });
    }

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        location: user.location,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Log in user & get JWT token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Password incorrect.',
      });
    }

    if (user.isSuspended) {
      return res.status(403).json({
        success: false,
        message: 'Account is suspended. Please contact platform administrator.',
      });
    }

    const token = generateToken(user._id, user.role);

    // Fetch profile snippet for response
    let profileData = null;
    if (user.role === 'student') {
      profileData = await StudentProfile.findOne({ userId: user._id });
    } else if (user.role === 'recruiter') {
      profileData = await RecruiterProfile.findOne({ userId: user._id }).populate('companyId');
    }

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        location: user.location,
        avatar: user.avatar,
        profile: profileData,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current logged in user details
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    let profile = null;

    if (user.role === 'student') {
      profile = await StudentProfile.findOne({ userId: user._id });
    } else if (user.role === 'recruiter') {
      profile = await RecruiterProfile.findOne({ userId: user._id }).populate('companyId');
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        location: user.location,
        avatar: user.avatar,
        profile,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide email' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No user registered with this email' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes

    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: 'Password reset link generated successfully.',
      resetToken, // for testing / development ease
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide token and newPassword',
      });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset token',
      });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully. You can now log in.',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
};
