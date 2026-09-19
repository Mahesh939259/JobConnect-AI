const express = require('express');
const router = express.Router();
const {
  getPlatformStats,
  getAllUsers,
  toggleUserSuspension,
  toggleCompanyVerification,
  deleteJobAdmin,
} = require('../controllers/adminController');
const { authenticateUser, requireRole } = require('../middleware/auth');

router.use(authenticateUser);
router.use(requireRole('admin'));

router.get('/stats', getPlatformStats);
router.get('/users', getAllUsers);
router.put('/users/:id/suspend', toggleUserSuspension);
router.put('/companies/:id/verify', toggleCompanyVerification);
router.delete('/jobs/:id', deleteJobAdmin);

module.exports = router;
