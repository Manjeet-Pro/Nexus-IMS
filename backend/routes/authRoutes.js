const express = require('express');
const router = express.Router();
const { registerUser, loginUser, verifyEmail } = require('../controllers/authController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/verifyemail/:token', verifyEmail);
router.post('/forgotpassword', require('../controllers/authController').forgotPassword);
router.get('/validate-reset-token/:resetToken', require('../controllers/authController').validateResetToken);
router.put('/resetpassword/:resetToken', require('../controllers/authController').resetPassword);
router.get('/search-students', require('../controllers/authController').searchStudents);

module.exports = router;
