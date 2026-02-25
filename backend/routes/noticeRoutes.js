const express = require('express');
const router = express.Router();
const { createNotice, getAllNotices, updateNotice, deleteNotice } = require('../controllers/noticeController');
const { protect, faculty, admin } = require('../middleware/authMiddleware');

router.post('/', protect, faculty, createNotice);
router.get('/', protect, getAllNotices);
router.put('/:id', protect, updateNotice);
router.delete('/:id', protect, deleteNotice);

module.exports = router;
