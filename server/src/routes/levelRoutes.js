const express = require('express');
const router = express.Router();
const {
  getLevels,
  getLevel,
  createLevel,
  updateLevel,
  deleteLevel,
} = require('../controllers/levelController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', getLevels);
router.get('/:id', getLevel);
router.post('/', protect, adminOnly, createLevel);
router.put('/:id', protect, adminOnly, updateLevel);
router.delete('/:id', protect, adminOnly, deleteLevel);

module.exports = router;
