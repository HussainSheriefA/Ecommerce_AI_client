const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authValidators } = require('../middleware/validator');

router.post('/register', authValidators.register, register);
router.post('/login', authValidators.login, login);
router.get('/me', protect, getMe);

module.exports = router;
