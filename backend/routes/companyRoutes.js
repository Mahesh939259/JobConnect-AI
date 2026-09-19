const express = require('express');
const router = express.Router();
const {
  getCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  uploadCompanyLogo,
} = require('../controllers/companyController');
const { authenticateUser, requireRole } = require('../middleware/auth');
const { uploadLogo } = require('../middleware/upload');

// Public routes
router.get('/', getCompanies);
router.get('/:id', getCompanyById);

// Protected routes
router.post('/', authenticateUser, requireRole('recruiter', 'admin'), createCompany);
router.put('/:id', authenticateUser, requireRole('recruiter', 'admin'), updateCompany);
router.post(
  '/:id/logo',
  authenticateUser,
  requireRole('recruiter', 'admin'),
  uploadLogo.single('logo'),
  uploadCompanyLogo
);

module.exports = router;
