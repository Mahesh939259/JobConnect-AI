const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: [120, 'Job title cannot exceed 120 characters'],
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
    },
    responsibilities: [
      {
        type: String,
        trim: true,
      },
    ],
    requirements: [
      {
        type: String,
        trim: true,
      },
    ],
    preferredSkills: [
      {
        type: String,
        trim: true,
      },
    ],
    qualifications: [
      {
        type: String,
        trim: true,
      },
    ],
    skills: [
      {
        type: String,
        required: true,
        trim: true,
      },
    ],
    location: {
      type: String,
      required: [true, 'Job location is required'],
      trim: true,
    },
    salaryMin: {
      type: Number,
      required: [true, 'Minimum salary is required'],
      min: [0, 'Salary cannot be negative'],
    },
    salaryMax: {
      type: Number,
      required: [true, 'Maximum salary is required'],
      min: [0, 'Salary cannot be negative'],
    },
    experienceMin: {
      type: Number,
      default: 0,
      min: 0,
    },
    experienceMax: {
      type: Number,
      default: 2,
      min: 0,
    },
    jobType: {
      type: String,
      enum: ['Full Time', 'Part Time', 'Internship', 'Contract'],
      default: 'Full Time',
      required: true,
    },
    workMode: {
      type: String,
      enum: ['Remote', 'Hybrid', 'On-site'],
      default: 'Remote',
      required: true,
    },
    industry: {
      type: String,
      default: 'Information Technology',
      trim: true,
    },
    benefits: [
      {
        type: String,
        trim: true,
      },
    ],
    applicationDeadline: {
      type: Date,
      default: () => new Date(+new Date() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
    status: {
      type: String,
      enum: ['Draft', 'Active', 'Closed'],
      default: 'Active',
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    applicantsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast querying, text search, and filtering
jobSchema.index({
  title: 'text',
  description: 'text',
  skills: 'text',
  company: 'text',
  location: 'text',
});

jobSchema.index({ status: 1, createdAt: -1 });
jobSchema.index({ location: 1, status: 1 });
jobSchema.index({ jobType: 1, workMode: 1 });
jobSchema.index({ salaryMin: 1, salaryMax: 1 });

module.exports = mongoose.model('Job', jobSchema);
