
const express = require('express');
const router = express.Router();
const { getAdminStats, createFaculty, createStudent, updateStudent, deleteStudent, getParents } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/stats', protect, admin, getAdminStats);
router.get('/parents', protect, admin, getParents);
router.put('/parents/:id', protect, admin, require('../controllers/adminController').updateParent);
router.delete('/parents/:id', protect, admin, require('../controllers/adminController').deleteParent);
router.post('/parents', protect, admin, require('../controllers/adminController').createParent);
router.post('/faculty', protect, admin, createFaculty);
router.post('/students', protect, admin, createStudent);
router.put('/students/:id', protect, admin, updateStudent);
router.delete('/students/:id', protect, admin, deleteStudent);

module.exports = router;
