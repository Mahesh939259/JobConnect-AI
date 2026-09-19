const express = require('express');
const router = express.Router();
const {
  scheduleInterview,
  getRecruiterInterviews,
  getCandidateInterviews,
  updateInterviewStatus,
} = require('../controllers/interviewController');
const { authenticateUser, requireRole } = require('../middleware/auth');

router.use(authenticateUser);

router.post('/', requireRole('recruiter', 'admin'), scheduleInterview);
router.get('/recruiter', requireRole('recruiter', 'admin'), getRecruiterInterviews);
router.get('/my', requireRole('student'), getCandidateInterviews);
router.put('/:id/status', requireRole('recruiter', 'admin'), updateInterviewStatus);

module.exports = router;
