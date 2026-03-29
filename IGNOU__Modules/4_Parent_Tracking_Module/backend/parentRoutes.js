const express = require('express');
const router = express.Router();
const { protect, parent } = require('../../1_Authentication_Core_Security_Module/backend/authMiddleware');
const { getParentDashboard, getChildDetails, getChildFees, getParentNotices, updateChildAvatar } = require('./parentController');

router.get('/dashboard', protect, parent, getParentDashboard);
router.get('/child/:id', protect, parent, getChildDetails);
router.put('/child/:id/avatar', protect, parent, updateChildAvatar); // New Route
router.get('/fees/:childId', protect, parent, getChildFees);
router.get('/notices', protect, parent, getParentNotices);

module.exports = router;
