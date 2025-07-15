const express = require('express');
const router = express.Router();
const { signup, login, getUser, forgotPassword } = require('../controllers/authController');
const { resetPassword } = require('../controllers/authController');

const protect = require('../middleware/auth');


router.post('/signup', signup);
router.post('/login', login);
router.get('/me', protect, getUser);
router.post('/forgot', forgotPassword);
router.post('/reset/:token', resetPassword);

module.exports = router;
