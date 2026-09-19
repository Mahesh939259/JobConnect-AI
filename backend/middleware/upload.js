const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload folders exist
const ensureDirExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const storage = (subFolder) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(__dirname, '../uploads', subFolder);
      ensureDirExists(uploadPath);
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const cleanName = path
        .basename(file.originalname, ext)
        .replace(/[^a-zA-Z0-9]/g, '_')
        .substring(0, 40);
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `${cleanName}-${uniqueSuffix}${ext}`);
    },
  });

// Resume filter (PDF, DOC, DOCX)
const resumeFilter = (req, file, cb) => {
  const allowedExtensions = ['.pdf', '.doc', '.docx'];
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/octet-stream', // sometimes sent for docx on Windows
  ];

  if (allowedExtensions.includes(ext) || allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, DOC, and DOCX files are allowed for resumes'), false);
  }
};

// Image filter (JPG, PNG, WEBP)
const imageFilter = (req, file, cb) => {
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedExtensions.includes(ext) && file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, PNG, and WEBP images are allowed'), false);
  }
};

const uploadResume = multer({
  storage: storage('resumes'),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: resumeFilter,
});

const uploadLogo = multer({
  storage: storage('logos'),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
  fileFilter: imageFilter,
});

const uploadAvatar = multer({
  storage: storage('avatars'),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
  fileFilter: imageFilter,
});

module.exports = { uploadResume, uploadLogo, uploadAvatar };
