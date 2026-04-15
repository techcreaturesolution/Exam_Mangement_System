const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
  getQuestions,
  getQuestion,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  bulkUploadQuestions,
  getQuestionCount,
} = require('../controllers/questionController');
const { protect, adminOnly, companyScope } = require('../middleware/auth');

// Multer config for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, `questions_${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel and CSV files are allowed'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

router.get('/count', protect, companyScope, getQuestionCount);
router.get('/', protect, adminOnly, companyScope, getQuestions);
router.get('/:id', protect, adminOnly, getQuestion);
router.post('/', protect, adminOnly, companyScope, createQuestion);
router.put('/:id', protect, adminOnly, updateQuestion);
router.delete('/:id', protect, adminOnly, deleteQuestion);
router.post('/bulk-upload', protect, adminOnly, companyScope, upload.single('file'), bulkUploadQuestions);

module.exports = router;
