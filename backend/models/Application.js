const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
      index: true,
    },
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
    },
    resumeUrl: {
      type: String,
      default: '',
    },
    coverLetter: {
      type: String,
      trim: true,
      default: '',
    },
    portfolio: {
      type: String,
      trim: true,
      default: '',
    },
    linkedin: {
      type: String,
      trim: true,
      default: '',
    },
    github: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['Applied', 'Under Review', 'Shortlisted', 'Interview', 'Selected', 'Rejected'],
      default: 'Applied',
      index: true,
    },
    aiMatch: {
      score: { type: Number, default: 0 },
      matchedSkills: [{ type: String }],
      missingSkills: [{ type: String }],
      experienceMatch: { type: String, default: '' },
      educationMatch: { type: String, default: '' },
      reason: { type: String, default: '' },
      breakdown: { type: mongoose.Schema.Types.Mixed, default: {} },
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate applications by same student for same job
applicationSchema.index({ studentId: 1, jobId: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
