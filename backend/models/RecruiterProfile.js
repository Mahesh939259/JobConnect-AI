const mongoose = require('mongoose');

const recruiterProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
    },
    companyName: {
      type: String,
      trim: true,
      default: '',
    },
    designation: {
      type: String,
      trim: true,
      default: 'Talent Acquisition Specialist',
    },
    department: {
      type: String,
      trim: true,
      default: 'Human Resources',
    },
    workPhone: {
      type: String,
      trim: true,
      default: '',
    },
    about: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('RecruiterProfile', recruiterProfileSchema);
