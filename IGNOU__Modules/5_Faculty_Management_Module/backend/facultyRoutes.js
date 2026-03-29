const express = require('express');
const router = express.Router();
const { getAllFaculty, getFacultyDashboard, getEnrolledStudents, updateStudentMarks, getFacultyCourses, getFacultyTimetable, markAttendance } = require('./facultyController');
const { protect } = require('../../1_Authentication_Core_Security_Module/backend/authMiddleware');

router.get('/', protect, getAllFaculty);
router.get('/dashboard', protect, getFacultyDashboard);
router.get('/students', protect, getEnrolledStudents);
router.post('/marks', protect, updateStudentMarks);
router.get('/courses', protect, getFacultyCourses);
router.get('/timetable', protect, getFacultyTimetable);
router.post('/attendance', protect, markAttendance);

module.exports = router;
