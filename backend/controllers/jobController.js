const Job = require('../models/Job');
const Application = require('../models/Application');
const SavedJob = require('../models/SavedJob');
const Company = require('../models/Company');

// Search synonyms dictionary for intelligent matching
const TITLE_SYNONYMS = {
  frontend: ['react', 'ui', 'javascript', 'vue', 'angular', 'web', 'front-end'],
  backend: ['node', 'java', 'python', 'api', 'go', 'spring', 'back-end', 'microservices'],
  fullstack: ['mern', 'full-stack', 'full stack', 'software engineer'],
  data: ['analytics', 'bi', 'machine learning', 'data scientist', 'data analyst'],
  cloud: ['devops', 'aws', 'azure', 'gcp', 'infrastructure', 'sre'],
};

// @desc    Get all jobs with intelligent search, multi-filter, sorting and pagination
// @route   GET /api/jobs
// @access  Public
const getJobs = async (req, res, next) => {
  try {
    const {
      search,
      location,
      jobType,
      workMode,
      industry,
      experienceMin,
      experienceMax,
      salaryMin,
      salaryMax,
      sort = 'newest',
      page = 1,
      limit = 10,
    } = req.query;

    const query = { status: 'Active' };

    // Intelligent text and skill search
    if (search && search.trim()) {
      const term = search.trim();
      const lower = term.toLowerCase();

      // Collect synonym keywords
      const searchTerms = [term];
      Object.entries(TITLE_SYNONYMS).forEach(([key, synonyms]) => {
        if (lower.includes(key) || synonyms.some((s) => lower.includes(s))) {
          searchTerms.push(...synonyms);
        }
      });

      const orConditions = searchTerms.map((t) => ({
        $or: [
          { title: { $regex: t, $options: 'i' } },
          { skills: { $regex: t, $options: 'i' } },
          { company: { $regex: t, $options: 'i' } },
          { description: { $regex: t, $options: 'i' } },
        ],
      }));

      query.$and = query.$and || [];
      query.$and.push({ $or: orConditions.flatMap((c) => c.$or) });
    }

    // Location filter
    if (location && location.trim()) {
      query.location = { $regex: location.trim(), $options: 'i' };
    }

    // Job Type filter
    if (jobType && jobType !== 'All') {
      query.jobType = jobType;
    }

    // Work Mode filter
    if (workMode && workMode !== 'All') {
      query.workMode = workMode;
    }

    // Industry filter
    if (industry && industry !== 'All') {
      query.industry = { $regex: industry, $options: 'i' };
    }

    // Experience filters
    if (experienceMin !== undefined && experienceMin !== '') {
      query.experienceMin = { $gte: Number(experienceMin) };
    }
    if (experienceMax !== undefined && experienceMax !== '') {
      query.experienceMax = { $lte: Number(experienceMax) };
    }

    // Salary filters (LPA or absolute values)
    if (salaryMin !== undefined && salaryMin !== '') {
      query.salaryMax = { $gte: Number(salaryMin) };
    }
    if (salaryMax !== undefined && salaryMax !== '') {
      query.salaryMin = { $lte: Number(salaryMax) };
    }

    // Sorting
    let sortOptions = { createdAt: -1 }; // default newest
    if (sort === 'salary_high') {
      sortOptions = { salaryMax: -1 };
    } else if (sort === 'salary_low') {
      sortOptions = { salaryMin: 1 };
    } else if (sort === 'experience_low') {
      sortOptions = { experienceMin: 1 };
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(50, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [totalJobs, jobs] = await Promise.all([
      Job.countDocuments(query),
      Job.find(query)
        .populate('companyId', 'logo name industry location website')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum),
    ]);

    res.status(200).json({
      success: true,
      count: jobs.length,
      totalJobs,
      totalPages: Math.ceil(totalJobs / limitNum),
      currentPage: pageNum,
      jobs,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single job by ID with similar jobs and applicant status check
// @route   GET /api/jobs/:id
// @access  Public
const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).populate(
      'companyId',
      'logo name industry location website description companySize foundedYear socialLinks'
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job posting not found',
      });
    }

    // Fetch similar jobs matching any skill or same industry
    const similarJobs = await Job.find({
      _id: { $ne: job._id },
      status: 'Active',
      $or: [
        { skills: { $in: job.skills || [] } },
        { industry: job.industry },
        { location: job.location },
      ],
    })
      .populate('companyId', 'logo name')
      .limit(4);

    let hasApplied = false;
    let isSaved = false;

    if (req.user && req.user.role === 'student') {
      const [app, saved] = await Promise.all([
        Application.findOne({ studentId: req.user._id, jobId: job._id }),
        SavedJob.findOne({ studentId: req.user._id, jobId: job._id }),
      ]);
      hasApplied = Boolean(app);
      isSaved = Boolean(saved);
    }

    res.status(200).json({
      success: true,
      job,
      similarJobs,
      hasApplied,
      isSaved,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new job (Recruiters only)
// @route   POST /api/jobs
// @access  Private (recruiter, admin)
const createJob = async (req, res, next) => {
  try {
    const {
      title,
      company,
      companyId,
      description,
      responsibilities,
      requirements,
      preferredSkills,
      qualifications,
      skills,
      location,
      salaryMin,
      salaryMax,
      experienceMin,
      experienceMax,
      jobType,
      workMode,
      industry,
      benefits,
      applicationDeadline,
    } = req.body;

    if (!title || !description || !skills || !location || !salaryMin || !salaryMax) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all mandatory fields: title, description, skills, location, salaryMin, salaryMax.',
      });
    }

    // Format skills array if sent as comma-separated string
    const formatArray = (val) => {
      if (Array.isArray(val)) return val.map((s) => s.trim()).filter(Boolean);
      if (typeof val === 'string') {
        return val
          .split(/[\n,]/)
          .map((s) => s.trim())
          .filter(Boolean);
      }
      return [];
    };

    let effectiveCompanyId = companyId;
    let companyName = company;

    if (!effectiveCompanyId) {
      // Find recruiter's company
      const companyDoc = await Company.findOne({ createdBy: req.user._id });
      if (companyDoc) {
        effectiveCompanyId = companyDoc._id;
        companyName = companyDoc.name;
      }
    }

    const job = await Job.create({
      title,
      company: companyName || req.user.name + ' Enterprise',
      companyId: effectiveCompanyId,
      description,
      responsibilities: formatArray(responsibilities),
      requirements: formatArray(requirements),
      preferredSkills: formatArray(preferredSkills),
      qualifications: formatArray(qualifications),
      skills: formatArray(skills),
      location,
      salaryMin: Number(salaryMin),
      salaryMax: Number(salaryMax),
      experienceMin: Number(experienceMin) || 0,
      experienceMax: Number(experienceMax) || 2,
      jobType: jobType || 'Full Time',
      workMode: workMode || 'Remote',
      industry: industry || 'Information Technology',
      benefits: formatArray(benefits),
      applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : undefined,
      createdBy: req.user._id,
      status: 'Active',
    });

    res.status(201).json({
      success: true,
      message: 'Job posted successfully!',
      job,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update a job (Recruiter can only edit their own, Admin can edit all)
// @route   PUT /api/jobs/:id
// @access  Private (recruiter, admin)
const updateJob = async (req, res, next) => {
  try {
    let job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (
      job.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to edit this job posting',
      });
    }

    const formatArray = (val) => {
      if (Array.isArray(val)) return val.map((s) => s.trim()).filter(Boolean);
      if (typeof val === 'string') {
        return val
          .split(/[\n,]/)
          .map((s) => s.trim())
          .filter(Boolean);
      }
      return val;
    };

    const updateData = { ...req.body };
    if (updateData.skills) updateData.skills = formatArray(updateData.skills);
    if (updateData.responsibilities) updateData.responsibilities = formatArray(updateData.responsibilities);
    if (updateData.requirements) updateData.requirements = formatArray(updateData.requirements);
    if (updateData.preferredSkills) updateData.preferredSkills = formatArray(updateData.preferredSkills);
    if (updateData.qualifications) updateData.qualifications = formatArray(updateData.qualifications);
    if (updateData.benefits) updateData.benefits = formatArray(updateData.benefits);

    job = await Job.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Job posting updated successfully',
      job,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a job
// @route   DELETE /api/jobs/:id
// @access  Private (recruiter, admin)
const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (
      job.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this job posting',
      });
    }

    await Job.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Job posting deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get featured jobs for homepage
// @route   GET /api/jobs/featured
// @access  Public
const getFeaturedJobs = async (req, res, next) => {
  try {
    const featuredJobs = await Job.find({ status: 'Active' })
      .populate('companyId', 'logo name industry location')
      .sort({ createdAt: -1 })
      .limit(6);

    res.status(200).json({
      success: true,
      count: featuredJobs.length,
      jobs: featuredJobs,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getFeaturedJobs,
};
