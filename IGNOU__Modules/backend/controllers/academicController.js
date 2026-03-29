const Course = require('../models/Course');
const Faculty = require('../models/Faculty');
const Student = require('../models/Student');
const Exam = require('../models/Exam');
const Mark = require('../models/Mark');
const { emitToUser } = require('../utils/socket');

// ==========================================
// 1. COURSES (from courseController.js)
// ==========================================

exports.getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find().populate({ path: 'instructor', populate: { path: 'user', select: 'name email' } });
        res.json(courses);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.createCourse = async (req, res) => {
    try {
        const { name, code, credits, department, semester } = req.body;
        if (await Course.findOne({ code })) return res.status(400).json({ message: 'Course exists' });
        const course = await Course.create({ name, code, credits, department, semester });
        res.status(201).json(course);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.updateCourse = async (req, res) => {
    try {
        const { name, code, credits, department, semester, schedule } = req.body;
        const course = await Course.findById(req.params.id);
        if (course) {
            course.name = name || course.name; course.code = code || course.code; course.credits = credits || course.credits;
            course.department = department || course.department; course.semester = semester || course.semester; course.schedule = schedule || course.schedule;
            res.json(await course.save());
        } else res.status(404).json({ message: 'Not found' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.getMyCourses = async (req, res) => {
    try {
        const student = await Student.findOne({ user: req.user._id });
        if (!student) return res.status(404).json({ message: 'Profile not found' });
        const courses = await Course.find({ studentsEnrolled: student._id }).populate({ path: 'instructor', populate: { path: 'user', select: 'name email' } });
        res.json(courses.map(course => ({
            ...course.toObject(),
            attendance: student.attendance.find(a => a.subject === course.code || a.subject === course.name) ? { present: student.attendance.find(a => a.subject === course.code || a.subject === course.name).present, total: student.attendance.find(a => a.subject === course.code || a.subject === course.name).total, percentage: Math.round((student.attendance.find(a => a.subject === course.code || a.subject === course.name).present / student.attendance.find(a => a.subject === course.code || a.subject === course.name).total) * 100) } : null,
            progress: course.syllabus?.length > 0 ? Math.round((course.syllabus.filter(t => t.completed).length / course.syllabus.length) * 100) : 0
        })));
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.assignCourse = async (req, res) => {
    try {
        const { courseId, facultyId } = req.body;
        const course = await Course.findById(courseId);
        const faculty = await Faculty.findById(facultyId);
        if (!course || !faculty) return res.status(404).json({ message: 'Course or Faculty not found' });
        if (course.instructor) {
            const prev = await Faculty.findById(course.instructor);
            if (prev) { prev.courses = prev.courses.filter(c => !c.includes(course.code)); await prev.save(); }
        }
        course.instructor = facultyId; await course.save();
        const courseStr = `${course.name} (${course.code})`;
        if (!faculty.courses.includes(courseStr)) { faculty.courses.push(courseStr); await faculty.save(); }
        res.json({ message: 'Assigned', course, faculty });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.updateSyllabusStatus = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        const faculty = await Faculty.findOne({ user: req.user._id });
        if (!course) return res.status(404).json({ message: 'Not found' });
        if (!faculty || course.instructor?.toString() !== faculty._id.toString()) return res.status(403).json({ message: 'Not authorized' });
        course.syllabus = req.body.syllabus; await course.save();
        res.json(course);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// ==========================================
// 2. EXAMS (from examController.js)
// ==========================================

exports.createExam = async (req, res) => {
    try {
        if (!(await Course.findById(req.body.courseId))) return res.status(404).json({ message: 'Course not found' });
        res.status(201).json(await Exam.create({ ...req.body, course: req.body.courseId, createdBy: req.user._id }));
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.getExams = async (req, res) => {
    try {
        let q = {}; if (req.query.courseId) q.course = req.query.courseId; if (req.query.type) q.type = req.query.type;
        res.json(await Exam.find(q).populate('course', 'name code').sort({ date: 1 }));
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.deleteExam = async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);
        if (exam) { await exam.deleteOne(); res.json({ message: 'Removed' }); } else res.status(404).json({ message: 'Not found' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// ==========================================
// 3. MARKS (from markController.js)
// ==========================================

exports.addMark = async (req, res) => {
    try {
        const { studentId, courseId, type, marks, total } = req.body;
        if (!studentId || !courseId || !type || marks === undefined || !total) return res.status(400).json({ message: 'Missing fields' });
        let mark = await Mark.findOne({ student: studentId, course: courseId, type });
        if (mark) { mark.marks = marks; mark.total = total; await mark.save(); }
        else mark = await Mark.create({ student: studentId, course: courseId, type, marks, total });
        const student = await Student.findById(studentId);
        if (student?.user) emitToUser(student.user.toString(), 'marks_updated', { message: `Marks for ${type} updated.`, mark });
        res.json(mark);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.getCourseMarks = async (req, res) => {
    try {
        res.json(await Mark.find({ course: req.params.courseId }).populate({ path: 'student', populate: { path: 'user', select: 'name email' } }).populate('course', 'name code'));
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.getMyMarks = async (req, res) => {
    try {
        const student = await Student.findOne({ user: req.user._id });
        if (!student) return res.status(404).json({ message: 'Not found' });
        res.json(await Mark.find({ student: student._id }).populate('course', 'name code credits'));
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.getStudentMarks = async (req, res) => {
    try {
        res.json(await Mark.find({ student: req.params.studentId }).populate('course', 'name code credits'));
    } catch (error) { res.status(500).json({ message: error.message }); }
};
