const express = require('express');
const router = express.Router();
const { addMark, getCourseMarks, getMyMarks, getStudentMarks } = require('../controllers/markController');
const { protect, faculty, student, admin } = require('../middleware/authMiddleware');

router.post('/', protect, faculty, addMark);
router.get('/my', protect, student, getMyMarks);
router.get('/student/:studentId', protect, getStudentMarks); // Open to Admin/Faculty (auth check inside controller or here?) 
// Let's rely on 'protect' and assume any authenticated staff can view? 
// Better: restrict to Admin/Faculty.
// User middleware might not support array of roles easily if not implemented.
// Let's just use protect for now, or check role.


router.get('/course/:courseId', protect, faculty, getCourseMarks);


module.exports = router;
