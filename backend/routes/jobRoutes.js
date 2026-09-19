const express = require('express');
const router = express.Router();
const {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getFeaturedJobs,
} = require('../controllers/jobController');
const { authenticateUser, optionalAuth, requireRole } = require('../middleware/auth');

// Public routes
router.get('/', getJobs);
router.get('/featured', getFeaturedJobs);
router.get('/:id', optionalAuth, getJobById);

// Protected recruiter/admin routes
router.post('/', authenticateUser, requireRole('recruiter', 'admin'), createJob);
router.put('/:id', authenticateUser, requireRole('recruiter', 'admin'), updateJob);
router.delete('/:id', authenticateUser, requireRole('recruiter', 'admin'), deleteJob);

module.exports = router;
