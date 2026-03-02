const express = require('express');
const router = express.Router();
const {
    createNotice, getAllNotices, updateNotice, deleteNotice,
    getNotifications, markAsRead, markAllAsRead,
    analyzePerformance, chatFAQ
} = require('../controllers/serviceController');
const { protect, admin } = require('../middleware/authMiddleware');
const checkMaintenance = require('../middleware/maintenanceMiddleware');

// Notices
router.post('/notices', protect, createNotice);
router.get('/notices', protect, getAllNotices);
router.put('/notices/:id', protect, updateNotice);
router.delete('/notices/:id', protect, deleteNotice);

// Notifications
router.get('/notifications', protect, getNotifications);
router.put('/notifications/:id/read', protect, markAsRead);
router.put('/notifications/read-all', protect, markAllAsRead);

// AI
router.post('/ai/analyze', protect, analyzePerformance);
router.post('/ai/chat', protect, chatFAQ);

module.exports = router;
