const express = require('express');
const router = express.Router();
const { getAllStudents, getStudentById, getStudentDashboard, getTimetable, enrollStudent } = require('../controllers/studentController');
const { protect, faculty, admin } = require('../middleware/authMiddleware');

router.get('/', protect, faculty, getAllStudents);
router.get('/dashboard', protect, getStudentDashboard);
router.get('/timetable', protect, getTimetable);
router.get('/:id', protect, faculty, getStudentById);

router.post('/enroll', protect, admin, enrollStudent);
module.exports = router;
