const express = require('express');
const router = express.Router();
const { getAllFees, addFeeRecord, getMyFees, payFee } = require('../controllers/feeController');
const { protect, admin, student } = require('../middleware/authMiddleware');

router.get('/', protect, admin, getAllFees);
router.post('/', protect, admin, addFeeRecord);
router.get('/my', protect, student, getMyFees);
router.put('/:id/pay', protect, payFee);

module.exports = router;
