const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    headline: {
      type: String,
      trim: true,
      default: '',
    },
    bio: {
      type: String,
      trim: true,
      default: '',
    },
    education: [
      {
        degree: { type: String, trim: true },
        college: { type: String, trim: true },
        fieldOfStudy: { type: String, trim: true },
        graduationYear: { type: String, trim: true },
        cgpa: { type: String, trim: true },
        description: { type: String, trim: true },
      },
    ],
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    experience: [
      {
        company: { type: String, trim: true },
        position: { type: String, trim: true },
        startDate: { type: String, trim: true },
        endDate: { type: String, trim: true },
        current: { type: Boolean, default: false },
        description: { type: String, trim: true },
      },
    ],
    projects: [
      {
        title: { type: String, trim: true },
        description: { type: String, trim: true },
        technologies: [{ type: String, trim: true }],
        githubUrl: { type: String, trim: true },
        liveUrl: { type: String, trim: true },
      },
    ],
    certifications: [
      {
        name: { type: String, trim: true },
        organization: { type: String, trim: true },
        issueDate: { type: String, trim: true },
        credentialUrl: { type: String, trim: true },
      },
    ],
    links: {
      linkedin: { type: String, trim: true, default: '' },
      github: { type: String, trim: true, default: '' },
      portfolio: { type: String, trim: true, default: '' },
      twitter: { type: String, trim: true, default: '' },
    },
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
    },
    resumeUrl: {
      type: String,
      default: '',
    },
    resumeOriginalName: {
      type: String,
      default: '',
    },
    resumeScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    resumeAnalysis: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    profileCompletion: {
      type: Number,
      default: 20,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

// Helper method to compute profile completion
studentProfileSchema.methods.calculateCompletion = function () {
  let score = 20; // base signup
  if (this.headline) score += 10;
  if (this.bio) score += 10;
  if (this.education && this.education.length > 0) score += 15;
  if (this.skills && this.skills.length >= 3) score += 15;
  if (this.experience && this.experience.length > 0) score += 10;
  if (this.projects && this.projects.length > 0) score += 10;
  if (this.resumeUrl) score += 10;
  if (this.links && (this.links.linkedin || this.links.github)) score += 10;

  this.profileCompletion = Math.min(100, score);
  return this.profileCompletion;
};

module.exports = mongoose.model('StudentProfile', studentProfileSchema);
