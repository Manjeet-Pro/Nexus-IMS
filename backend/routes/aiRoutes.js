const express = require('express');
const router = express.Router();
const { analyzePerformance, chatFAQ } = require('../controllers/aiController');
const { protect, student } = require('../middleware/authMiddleware');

router.post('/analyze', protect, student, analyzePerformance);
router.post('/chat', protect, chatFAQ);

module.exports = router;
