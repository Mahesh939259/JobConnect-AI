const express = require('express');
const router = express.Router();
const {
  getDashboard,
  getRecruiterJobs,
  getJobApplicants,
  getProfile,
  updateProfile,
} = require('../controllers/recruiterController');
const { authenticateUser, requireRole } = require('../middleware/auth');

router.use(authenticateUser);
router.use(requireRole('recruiter', 'admin'));

router.get('/dashboard', getDashboard);
router.get('/jobs', getRecruiterJobs);
router.get('/jobs/:jobId/applicants', getJobApplicants);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

module.exports = router;
