const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [100, 'Company name cannot exceed 100 characters'],
    },
    logo: {
      type: String,
      default: '',
    },
    website: {
      type: String,
      trim: true,
      default: '',
    },
    industry: {
      type: String,
      required: [true, 'Industry is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Company description is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    companySize: {
      type: String,
      default: '50-200 employees',
      trim: true,
    },
    foundedYear: {
      type: Number,
      default: 2015,
    },
    socialLinks: {
      linkedin: { type: String, trim: true, default: '' },
      twitter: { type: String, trim: true, default: '' },
      github: { type: String, trim: true, default: '' },
      facebook: { type: String, trim: true, default: '' },
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

companySchema.index({ name: 'text', industry: 'text', location: 'text' });

module.exports = mongoose.model('Company', companySchema);
