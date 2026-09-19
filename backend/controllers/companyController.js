const Company = require('../models/Company');
const Job = require('../models/Job');
const RecruiterProfile = require('../models/RecruiterProfile');

// @desc    Get all companies with search and filters
// @route   GET /api/companies
// @access  Public
const getCompanies = async (req, res, next) => {
  try {
    const { search, industry, location, page = 1, limit = 12 } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { industry: { $regex: search, $options: 'i' } },
      ];
    }

    if (industry) {
      query.industry = { $regex: industry, $options: 'i' };
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const totalCompanies = await Company.countDocuments(query);
    const companies = await Company.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: companies.length,
      totalCompanies,
      totalPages: Math.ceil(totalCompanies / Number(limit)),
      currentPage: Number(page),
      companies,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get company by ID with its open jobs
// @route   GET /api/companies/:id
// @access  Public
const getCompanyById = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found',
      });
    }

    // Fetch active open jobs for this company
    const openJobs = await Job.find({
      $or: [{ companyId: company._id }, { company: company.name }],
      status: 'Active',
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      company,
      openJobs,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create company (Recruiter / Admin)
// @route   POST /api/companies
// @access  Private (recruiter, admin)
const createCompany = async (req, res, next) => {
  try {
    const {
      name,
      website,
      industry,
      description,
      location,
      companySize,
      foundedYear,
      socialLinks,
    } = req.body;

    if (!name || !industry || !description || !location) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, industry, description, and location',
      });
    }

    const company = await Company.create({
      name,
      website,
      industry,
      description,
      location,
      companySize,
      foundedYear,
      socialLinks,
      createdBy: req.user._id,
    });

    // Link company to recruiter profile if recruiter
    if (req.user.role === 'recruiter') {
      await RecruiterProfile.findOneAndUpdate(
        { userId: req.user._id },
        { companyId: company._id, companyName: company.name }
      );
    }

    res.status(201).json({
      success: true,
      message: 'Company profile created successfully!',
      company,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update company
// @route   PUT /api/companies/:id
// @access  Private (recruiter, admin)
const updateCompany = async (req, res, next) => {
  try {
    let company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found',
      });
    }

    // Verify ownership or admin
    if (
      company.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this company profile',
      });
    }

    company = await Company.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Company profile updated successfully',
      company,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Upload company logo
// @route   POST /api/companies/:id/logo
// @access  Private (recruiter, admin)
const uploadCompanyLogo = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file (JPG, PNG, WEBP)',
      });
    }

    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    if (
      company.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    company.logo = `/uploads/logos/${req.file.filename}`;
    await company.save();

    res.status(200).json({
      success: true,
      message: 'Company logo uploaded successfully',
      logo: company.logo,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  uploadCompanyLogo,
};
