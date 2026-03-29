const express = require('express');
const router = express.Router();
const { getAllFees, addFeeRecord, getMyFees, payFee } = require('./feeController');
const { protect, admin, student } = require('../../1_Authentication_Core_Security_Module/backend/authMiddleware');

router.get('/', protect, admin, getAllFees);
router.post('/', protect, admin, addFeeRecord);
router.get('/my', protect, student, getMyFees);
router.put('/:id/pay', protect, payFee);

module.exports = router;
