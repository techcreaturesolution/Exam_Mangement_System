const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  getLevels,
  getLevel,
  createLevel,
  updateLevel,
  deleteLevel,
} = require('../controllers/levelController');

router.get('/', protect, getLevels);
router.get('/:id', protect, getLevel);
router.post('/', protect, adminOnly, createLevel);
router.put('/:id', protect, adminOnly, updateLevel);
router.delete('/:id', protect, adminOnly, deleteLevel);

module.exports = router;
