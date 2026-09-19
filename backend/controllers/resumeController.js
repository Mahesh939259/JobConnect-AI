const path = require('path');
const fs = require('fs');
const Resume = require('../models/Resume');
const StudentProfile = require('../models/StudentProfile');
const { extractRawText, parseResumeText } = require('../services/resumeParserService');
const { analyzeResumeQuality } = require('../services/matchingService');

// @desc    Upload resume, extract raw text and parse structure
// @route   POST /api/resumes/upload
// @access  Private (student)
const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a PDF, DOC, or DOCX resume file',
      });
    }

    const filePath = req.file.path;
    const fileUrl = `/uploads/resumes/${req.file.filename}`;

    // Extract text from uploaded document
    let rawText = '';
    try {
      rawText = await extractRawText(filePath);
    } catch (parseErr) {
      console.warn('Text extraction warning:', parseErr.message);
    }

    // Parse structured entities
    const parsedData = parseResumeText(rawText);

    // Save Resume document to MongoDB
    const resumeDoc = await Resume.create({
      userId: req.user._id,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      fileUrl,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      rawText,
      parsedData,
    });

    // Update StudentProfile resume pointers
    let profile = await StudentProfile.findOne({ userId: req.user._id });
    if (!profile) {
      profile = new StudentProfile({ userId: req.user._id });
    }

    profile.resumeId = resumeDoc._id;
    profile.resumeUrl = fileUrl;
    profile.resumeOriginalName = req.file.originalname;
    profile.calculateCompletion();
    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Resume uploaded and parsed successfully!',
      resumeId: resumeDoc._id,
      fileUrl,
      fileName: req.file.originalname,
      parsedData,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Confirm and save reviewed parsed data into student profile
// @route   POST /api/resumes/confirm
// @access  Private (student)
const confirmParsedData = async (req, res, next) => {
  try {
    const { skills, education, experience, projects, certifications } = req.body;

    let profile = await StudentProfile.findOne({ userId: req.user._id });
    if (!profile) {
      profile = new StudentProfile({ userId: req.user._id });
    }

    // Merge skills (avoiding duplicates)
    if (Array.isArray(skills) && skills.length > 0) {
      const currentSkills = new Set(profile.skills || []);
      skills.forEach((s) => s && currentSkills.add(s.trim()));
      profile.skills = Array.from(currentSkills);
    }

    // Append confirmed education if provided
    if (Array.isArray(education) && education.length > 0) {
      profile.education = education;
    }

    // Append confirmed experience if provided
    if (Array.isArray(experience) && experience.length > 0) {
      profile.experience = experience;
    }

    // Append confirmed projects if provided
    if (Array.isArray(projects) && projects.length > 0) {
      profile.projects = projects;
    }

    // Compute updated resume score & profile completion
    const analysis = analyzeResumeQuality(profile);
    profile.resumeScore = analysis.score;
    profile.resumeAnalysis = analysis;
    profile.calculateCompletion();
    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Parsed resume data confirmed and profile updated!',
      profile,
      analysis,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  uploadResume,
  confirmParsedData,
};
