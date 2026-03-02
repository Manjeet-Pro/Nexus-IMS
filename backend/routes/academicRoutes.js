const express = require('express');
const router = express.Router();
const {
    getAllCourses, createCourse, updateCourse, getMyCourses, assignCourse, updateSyllabusStatus,
    createExam, getExams, deleteExam,
    addMark, getCourseMarks, getMyMarks, getStudentMarks
} = require('../controllers/academicController');
const { protect, admin } = require('../middleware/authMiddleware');
const checkMaintenance = require('../middleware/maintenanceMiddleware');

// Courses
router.get('/courses', protect, checkMaintenance, getAllCourses);
router.post('/courses', protect, admin, createCourse);
router.put('/courses/:id', protect, admin, updateCourse);
router.get('/courses/my', protect, checkMaintenance, getMyCourses);
router.post('/courses/assign', protect, admin, assignCourse);
router.put('/courses/:id/syllabus', protect, updateSyllabusStatus);

// Exams
router.post('/exams', protect, admin, createExam);
router.get('/exams', protect, checkMaintenance, getExams);
router.delete('/exams/:id', protect, admin, deleteExam);

// Marks
router.post('/marks', protect, addMark);
router.get('/marks/course/:courseId', protect, getCourseMarks);
router.get('/marks/my', protect, checkMaintenance, getMyMarks);
router.get('/marks/student/:studentId', protect, getStudentMarks);

module.exports = router;
