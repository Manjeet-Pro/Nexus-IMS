const Course = require('../models/Course');
const Faculty = require('../models/Faculty');

// @desc    Get all courses
// @route   GET /api/courses
// @access  Private
exports.getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find()
            .populate({
                path: 'instructor',
                populate: { path: 'user', select: 'name email' }
            });
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new course
// @route   POST /api/courses
// @access  Private/Admin
exports.createCourse = async (req, res) => {
    try {
        const { name, code, credits, department, semester } = req.body;

        const courseExists = await Course.findOne({ code });
        if (courseExists) {
            return res.status(400).json({ message: 'Course already exists' });
        }

        const course = await Course.create({
            name,
            code,
            credits,
            department,
            semester
        });

        res.status(201).json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a course
// @route   PUT /api/courses/:id
// @access  Private/Admin
exports.updateCourse = async (req, res) => {
    try {
        const { name, code, credits, department, semester, schedule } = req.body;
        const course = await Course.findById(req.params.id);

        if (course) {
            course.name = name || course.name;
            course.code = code || course.code;
            course.credits = credits || course.credits;
            course.department = department || course.department;
            course.semester = semester || course.semester;
            course.schedule = schedule || course.schedule;

            const updatedCourse = await course.save();
            res.json(updatedCourse);
        } else {
            res.status(404).json({ message: 'Course not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get my courses (Student)
// @route   GET /api/courses/my
// @access  Private/Student
exports.getMyCourses = async (req, res) => {
    try {
        const Student = require('../models/Student');

        // 1. Find the student profile
        const student = await Student.findOne({ user: req.user._id });
        if (!student) {
            return res.status(404).json({ message: 'Student profile not found' });
        }

        // 2. Find courses where student is enrolled
        const courses = await Course.find({ studentsEnrolled: student._id })
            .populate({
                path: 'instructor',
                populate: { path: 'user', select: 'name email' }
            });

        // 3. Attach attendance data if available
        const coursesWithattendance = courses.map(course => {
            const courseObj = course.toObject();

            // Find attendance record for this course (matching by code or name)
            const attendanceRecord = student.attendance.find(a =>
                a.subject === course.code || a.subject === course.name
            );

            return {
                ...courseObj,
                attendance: attendanceRecord ? {
                    present: attendanceRecord.present,
                    total: attendanceRecord.total,
                    percentage: Math.round((attendanceRecord.present / attendanceRecord.total) * 100)
                } : null,
                progress: course.syllabus && course.syllabus.length > 0
                    ? Math.round((course.syllabus.filter(t => t.completed).length / course.syllabus.length) * 100)
                    : 0
            };
        });

        res.json(coursesWithattendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.assignCourse = async (req, res) => {
    try {
        const { courseId, facultyId } = req.body;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const faculty = await Faculty.findById(facultyId);
        if (!faculty) {
            return res.status(404).json({ message: 'Faculty not found' });
        }

        // 1. Remove course from previous instructor if exists
        if (course.instructor) {
            const prevFaculty = await Faculty.findById(course.instructor);
            if (prevFaculty) {
                prevFaculty.courses = prevFaculty.courses.filter(c => c !== course.code && c !== course.name);
                await prevFaculty.save();
            }
        }

        // 2. Assign new instructor to course
        course.instructor = facultyId;
        await course.save();

        // 3. Add course to faculty's list
        // Check if course code/name is already in list (using code for uniqueness if possible, or name)
        // Schema says courses: [String]. Let's store "Name (Code)" or just Code.
        // Let's store "Code - Name" for readability or just "Name".
        // The DFD implies "Assignment Data".
        const courseString = `${course.name} (${course.code})`;

        if (!faculty.courses.includes(courseString)) {
            faculty.courses.push(courseString);
            await faculty.save();
        }

        res.json({ message: 'Course assigned successfully', course, faculty });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update course syllabus status
// @route   PUT /api/courses/:id/syllabus
// @access  Private (Faculty)
exports.updateSyllabusStatus = async (req, res) => {
    try {
        const { syllabus } = req.body;
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Verify if the faculty is the instructor
        // Assuming req.user is the faculty user
        // We need to find the Faculty profile for this user
        const Faculty = require('../models/Faculty');
        const facultyProfile = await Faculty.findOne({ user: req.user._id });

        if (!facultyProfile) {
            return res.status(403).json({ message: 'Not authorized as faculty' });
        }

        // Check if instructor matches
        if (course.instructor && course.instructor.toString() !== facultyProfile._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this course' });
        }

        course.syllabus = syllabus;
        await course.save();

        res.json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
