const express = require('express');
const router = express.Router();
const { uploadResume, confirmParsedData } = require('../controllers/resumeController');
const { authenticateUser, requireRole } = require('../middleware/auth');
const { uploadResume: multerUpload } = require('../middleware/upload');

router.use(authenticateUser);
router.use(requireRole('student'));

router.post('/upload', multerUpload.single('resume'), uploadResume);
router.post('/confirm', confirmParsedData);

module.exports = router;
