const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect, adminOnly } = require('../middleware/auth');
const {
  getQuestions,
  getQuestion,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  importQuestions,
  getQuestionCount,
} = require('../controllers/questionController');

// Multer config for file upload
const fs = require('fs');
const uploadsDir = path.join(__dirname, '../../uploads');
// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, `questions_${Date.now()}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage });

router.get('/count', protect, adminOnly, getQuestionCount);
router.get('/', protect, adminOnly, getQuestions);
router.get('/:id', protect, adminOnly, getQuestion);
router.post('/', protect, adminOnly, createQuestion);
router.post('/import', protect, adminOnly, upload.single('file'), importQuestions);
router.put('/:id', protect, adminOnly, updateQuestion);
router.delete('/:id', protect, adminOnly, deleteQuestion);

module.exports = router;
