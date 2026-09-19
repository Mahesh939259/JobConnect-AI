const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    rawText: {
      type: String,
      default: '',
    },
    parsedData: {
      name: { type: String, default: '' },
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
      skills: [{ type: String }],
      education: [{ type: mongoose.Schema.Types.Mixed }],
      experience: [{ type: mongoose.Schema.Types.Mixed }],
      projects: [{ type: mongoose.Schema.Types.Mixed }],
      certifications: [{ type: mongoose.Schema.Types.Mixed }],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Resume', resumeSchema);
