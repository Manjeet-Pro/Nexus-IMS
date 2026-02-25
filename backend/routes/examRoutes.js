const express = require('express');
const router = express.Router();
const { createExam, getExams, deleteExam } = require('../controllers/examController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, admin, createExam)
    .get(protect, getExams);

router.route('/:id')
    .delete(protect, admin, deleteExam);

module.exports = router;
