const express = require('express');
const router = express.Router();
const {
  applyJob,
  getMyApplications,
  getApplicationById,
  updateApplicationStatus,
} = require('../controllers/applicationController');
const { authenticateUser, requireRole } = require('../middleware/auth');

router.use(authenticateUser);

router.post('/:jobId', requireRole('student'), applyJob);
router.get('/my', requireRole('student'), getMyApplications);
router.get('/:id', getApplicationById);
router.put('/:id/status', requireRole('recruiter', 'admin'), updateApplicationStatus);

module.exports = router;
