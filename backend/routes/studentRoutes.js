const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  getDashboard,
  getRecommendedJobs,
  getResumeAnalysis,
} = require('../controllers/studentController');
const { authenticateUser, requireRole } = require('../middleware/auth');

// All student routes require authentication and student role
router.use(authenticateUser);
router.use(requireRole('student'));

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/dashboard', getDashboard);
router.get('/recommended-jobs', getRecommendedJobs);
router.get('/resume-analysis', getResumeAnalysis);

module.exports = router;
