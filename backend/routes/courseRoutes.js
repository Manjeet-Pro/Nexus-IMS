const express = require('express');
const router = express.Router();
const { getAllCourses, createCourse, updateCourse, assignCourse, getMyCourses, updateSyllabusStatus } = require('../controllers/courseController');
const { protect, admin, student, faculty } = require('../middleware/authMiddleware');

router.get('/', protect, getAllCourses);
router.get('/my', protect, student, getMyCourses);
router.post('/', protect, admin, createCourse);
router.post('/assign', protect, admin, assignCourse);
router.put('/:id', protect, admin, updateCourse);
router.put('/:id/syllabus', protect, faculty, updateSyllabusStatus);

module.exports = router;
