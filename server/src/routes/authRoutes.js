const express = require('express');
const router = express.Router();
const { register, login, getMe, adminLogin, getUsers } = require('../controllers/authController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/admin/login', adminLogin);
router.get('/me', protect, getMe);
router.get('/users', protect, adminOnly, getUsers);

module.exports = router;
