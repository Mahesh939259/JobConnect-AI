const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema(
  {
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
      index: true,
    },
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    recruiterId: {
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
    date: {
      type: Date,
      required: [true, 'Interview date is required'],
    },
    time: {
      type: String,
      required: [true, 'Interview time is required'],
    },
    type: {
      type: String,
      enum: ['Online', 'Phone', 'In-person'],
      default: 'Online',
    },
    meetingLink: {
      type: String,
      trim: true,
      default: '',
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Completed', 'Cancelled'],
      default: 'Scheduled',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Interview', interviewSchema);
