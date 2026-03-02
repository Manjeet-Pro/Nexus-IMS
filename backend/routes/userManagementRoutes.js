const express = require('express');
const router = express.Router();
const {
    registerUser, loginUser, verifyEmail, forgotPassword, validateResetToken, resetPassword, searchStudents,
    getUserProfile, updateUserProfile,
    getAdminStats, createFaculty, createStudent, updateStudent, deleteStudent, getParents, createParent, updateParent, deleteParent
} = require('../controllers/userManagementController');
const { protect, admin } = require('../middleware/authMiddleware');

// Auth Routes
router.post('/auth/register', registerUser);
router.post('/auth/login', loginUser);
router.get('/auth/verifyemail/:token', verifyEmail);
router.post('/auth/forgotpassword', forgotPassword);
router.get('/auth/validate-reset-token/:resetToken', validateResetToken);
router.put('/auth/resetpassword/:resetToken', resetPassword);
router.get('/auth/search-students', searchStudents);

// User Profile Routes
router.get('/users/profile', protect, getUserProfile);
router.put('/users/profile', protect, updateUserProfile);

// Admin Routes
router.get('/admin/stats', protect, admin, getAdminStats);
router.get('/admin/parents', protect, admin, getParents);
router.put('/admin/parents/:id', protect, admin, updateParent);
router.delete('/admin/parents/:id', protect, admin, deleteParent);
router.post('/admin/parents', protect, admin, createParent);
router.post('/admin/faculty', protect, admin, createFaculty);
router.post('/admin/students', protect, admin, createStudent);
router.put('/admin/students/:id', protect, admin, updateStudent);
router.delete('/admin/students/:id', protect, admin, deleteStudent);

module.exports = router;
