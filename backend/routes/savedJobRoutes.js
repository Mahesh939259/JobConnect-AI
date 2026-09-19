const express = require('express');
const router = express.Router();
const { saveJob, unsaveJob, getSavedJobs } = require('../controllers/applicationController');
const { authenticateUser, requireRole } = require('../middleware/auth');

router.use(authenticateUser);
router.use(requireRole('student'));

router.get('/', getSavedJobs);
router.post('/:jobId', saveJob);
router.delete('/:jobId', unsaveJob);

module.exports = router;
