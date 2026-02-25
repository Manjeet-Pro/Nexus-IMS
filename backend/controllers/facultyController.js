const Faculty = require('../models/Faculty');
const User = require('../models/User');
const Student = require('../models/Student');
const Parent = require('../models/Parent');
const { createNotification } = require('../utils/notificationHelper');

// @desc    Get all faculty members
// @route   GET /api/faculty
// @access  Private
exports.getAllFaculty = async (req, res) => {
    try {
        const faculty = await Faculty.find().populate('user', 'name email avatar publicProfile');

        // Filter sensitive data based on publicProfile
        const filteredFaculty = faculty.map(fac => {
            const facDoc = fac.toObject();
            if (facDoc.user && !facDoc.user.publicProfile) {
                return {
                    ...facDoc,
                    user: {
                        _id: facDoc.user._id,
                        name: facDoc.user.name,
                        avatar: facDoc.user.avatar, // Keeping avatar is usually okay for "basic info" or can be hidden
                        publicProfile: false,
                        isPrivate: true
                    },
                    email: 'Private Profile'
                };
            }
            return facDoc;
        });

        res.json(filteredFaculty);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get current logged in faculty dashboard data
// @route   GET /api/faculty/dashboard
// @access  Private (Faculty)
exports.getFacultyDashboard = async (req, res) => {
    try {
        const faculty = await Faculty.findOne({ user: req.user._id }).populate('user', 'name email avatar department');
        const Course = require('../models/Course'); // Import dynamically to avoid circular dependency issues if any
        const Mark = require('../models/Mark');

        if (faculty) {
            // 1. Get Today's Schedule
            const courses = await Course.find({ instructor: faculty._id });
            const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

            let todaysSchedule = [];
            courses.forEach(course => {
                const todaySlot = course.schedule.find(s => s.day === today);
                if (todaySlot) {
                    todaysSchedule.push({
                        id: course.code,
                        name: course.name,
                        time: todaySlot.startTime, // e.g. "14:00"
                        room: todaySlot.room || 'Online',
                        rawTime: todaySlot.startTime // for sorting
                    });
                }
            });

            // Sort by time
            todaysSchedule.sort((a, b) => a.rawTime.localeCompare(b.rawTime));

            // 2. Calculate Class Performance (Avg Marks per Course)
            let performanceData = [];
            for (const course of courses) {
                const marks = await Mark.find({ course: course._id, type: 'Mid-Term' });
                if (marks.length > 0) {
                    const totalMarks = marks.reduce((sum, m) => sum + m.marks, 0);
                    const avg = Math.round(totalMarks / marks.length);
                    performanceData.push({
                        subject: course.code,
                        avg: avg
                    });
                } else {
                    performanceData.push({
                        subject: course.code,
                        avg: 0
                    });
                }
            }

            // 3. Get All Courses (for dropdowns)
            const allCourses = courses.map(c => ({
                _id: c._id,
                name: c.name,
                code: c.code
            }));

            res.json({
                profile: faculty,
                schedule: todaysSchedule,
                performance: performanceData,
                courses: allCourses
            });
        } else {
            res.status(404).json({ message: 'Faculty profile not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get students enrolled in faculty's courses
// @route   GET /api/faculty/students
// @access  Private (Faculty)
exports.getEnrolledStudents = async (req, res) => {
    try {
        const faculty = await Faculty.findOne({ user: req.user._id });
        const Course = require('../models/Course');
        const Student = require('../models/Student');

        if (!faculty) {
            return res.status(404).json({ message: 'Faculty profile not found' });
        }

        const courses = await Course.find({ instructor: faculty._id });
        let allStudentIds = [];
        courses.forEach(c => {
            allStudentIds = [...allStudentIds, ...c.studentsEnrolled];
        });

        const uniqueStudentIds = [...new Set(allStudentIds.map(id => id.toString()))];

        const students = await Student.find({ _id: { $in: uniqueStudentIds } })
            .populate('user', 'name email avatar publicProfile');

        const studentList = students.map(s => {
            const sDoc = s.toObject();
            if (sDoc.user && !sDoc.user.publicProfile) {
                return {
                    _id: sDoc._id,
                    rollNo: sDoc.rollNo,
                    user: {
                        _id: sDoc.user._id,
                        name: sDoc.user.name,
                        publicProfile: false,
                        isPrivate: true
                    },
                    course: sDoc.course,
                    year: sDoc.year,
                    email: 'Private Profile'
                };
            }
            return {
                _id: sDoc._id,
                rollNo: sDoc.rollNo,
                user: sDoc.user,
                course: sDoc.course,
                year: sDoc.year,
                email: sDoc.user?.email || 'N/A'
            };
        });

        res.json(studentList);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update student marks
// @route   POST /api/faculty/marks
// @access  Private (Faculty)
exports.updateStudentMarks = async (req, res) => {
    try {
        const { studentId, courseId, type, marks } = req.body;
        const Mark = require('../models/Mark');

        let markDoc = await Mark.findOne({ student: studentId, course: courseId, type });

        if (markDoc) {
            markDoc.marks = marks;
            await markDoc.save();
        } else {
            markDoc = await Mark.create({
                student: studentId,
                course: courseId,
                type,
                marks,
                total: 100
            });
        }

        // Trigger Result Notification to Student
        const student = await Student.findById(studentId).populate('user', 'name');
        if (student && student.user) {
            createNotification({
                recipientId: student.user._id,
                message: `Your marks for ${type} in course code ${courseId} have been updated to ${marks}.`,
                type: 'academic',
                sendEmail: true,
                emailData: {
                    subject: 'New Academic Result Published',
                    title: 'Marks Updated',
                    body: `Hi ${student.user.name}, your marks for ${type} have been uploaded/updated. Your score: ${marks}.`,
                    actionLink: 'http://localhost:5173/student/results'
                }
            });

            // Notify Parent if linked
            const parent = await Parent.findOne({ children: studentId }).populate('user', 'email name');
            if (parent && parent.user) {
                createNotification({
                    recipientId: parent.user._id,
                    message: `Academic Update: ${student.user.name}'s marks for ${type} have been updated.`,
                    type: 'info',
                    sendEmail: true,
                    emailData: {
                        subject: `Academic Performance Update - ${student.user.name}`,
                        title: 'New Result Published',
                        body: `Dear Parent, ${student.user.name}'s marks for ${type} have been updated. Score: ${marks}.`,
                        actionLink: 'http://localhost:5173/parent/dashboard'
                    }
                });
            }
        }

        res.json(markDoc);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get courses taught by faculty
// @route   GET /api/faculty/courses
// @access  Private (Faculty)
exports.getFacultyCourses = async (req, res) => {
    try {
        const faculty = await Faculty.findOne({ user: req.user._id });
        const Course = require('../models/Course');

        if (!faculty) {
            return res.status(404).json({ message: 'Faculty profile not found' });
        }

        const courses = await Course.find({ instructor: faculty._id });

        const courseList = courses.map(course => {
            // Calculate next class
            const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
            let nextClass = 'TBA';
            if (course.schedule && course.schedule.length > 0) {
                const nextSlot = course.schedule.find(s => s.day === today) || course.schedule[0];
                nextClass = `${nextSlot.day}, ${nextSlot.startTime}`;
            }

            return {
                id: course._id,
                code: course.code,
                name: course.name,
                batch: `B.Tech ${course.department || 'CSE'}`,
                semester: course.semester || 'N/A',
                students: course.studentsEnrolled.length,
                room: course.schedule[0]?.room || 'Online',
                progress: course.syllabus && course.syllabus.length > 0
                    ? Math.round((course.syllabus.filter(t => t.completed).length / course.syllabus.length) * 100)
                    : 0,
                syllabus: course.syllabus || [],
                nextClass: nextClass
            };
        });

        res.json(courseList);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get faculty aggregated timetable
// @route   GET /api/faculty/timetable
// @access  Private (Faculty)
exports.getFacultyTimetable = async (req, res) => {
    try {
        const faculty = await Faculty.findOne({ user: req.user._id });
        const Course = require('../models/Course');

        if (!faculty) {
            return res.status(404).json({ message: 'Faculty profile not found' });
        }

        const courses = await Course.find({ instructor: faculty._id });

        // Aggregate schedule
        let weeklySchedule = {
            Monday: [],
            Tuesday: [],
            Wednesday: [],
            Thursday: [],
            Friday: [],
            Saturday: [],
            Sunday: []
        };

        courses.forEach(course => {
            if (course.schedule && course.schedule.length > 0) {
                course.schedule.forEach(slot => {
                    if (weeklySchedule[slot.day]) {
                        weeklySchedule[slot.day].push({
                            id: course.code,
                            name: course.name,
                            time: slot.startTime,
                            room: slot.room || 'Online',
                            type: 'Lecture' // Default type
                        });
                    }
                });
            }
        });

        // Sort each day by time
        Object.keys(weeklySchedule).forEach(day => {
            weeklySchedule[day].sort((a, b) => a.time.localeCompare(b.time));
        });

        res.json(weeklySchedule);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};
// @desc    Mark attendance for a class
// @route   POST /api/faculty/attendance
// @access  Private (Faculty)
exports.markAttendance = async (req, res) => {
    try {
        const { courseId, date, attendanceData } = req.body; // attendanceData: [{ studentId, status }]
        const Attendance = require('../models/Attendance');
        const Student = require('../models/Student');

        // Validate date
        const attendanceDate = new Date(date);
        attendanceDate.setHours(0, 0, 0, 0);

        const operations = attendanceData.map(record => ({
            updateOne: {
                filter: {
                    course: courseId,
                    student: record.studentId,
                    date: attendanceDate
                },
                update: {
                    $set: {
                        status: record.status,
                        recordedBy: req.user._id
                    }
                },
                upsert: true
            }
        }));

        if (operations.length > 0) {
            await Attendance.bulkWrite(operations);
        }

        // Update Student Summary (Simplified: Increment if Present)
        // Note: For a real system, you'd recalculate total/present from Attendance collection.
        // Here we'll do a quick recalc for the affected students to keep it accurate.

        for (const record of attendanceData) {
            const studentId = record.studentId;

            // Count total classes and present classes for this student in this course
            const totalClasses = await Attendance.countDocuments({
                course: courseId,
                student: studentId
            });
            const presentClasses = await Attendance.countDocuments({
                course: courseId,
                student: studentId,
                status: 'Present'
            });

            // Update Student model's attendance array
            const student = await Student.findById(studentId);
            if (student) {
                const subjectIndex = student.attendance.findIndex(a => a.subject === courseId.toString()); // Assuming subject stores ID or Name? Model says String.
                // If model stores subject name, we need to fetch course name.
                // For now, let's assume we might need to adjust based on Student model structure.
                // Student model: attendance: [{ subject: String, present: Number, total: Number }]

                // Let's look up course name
                const Course = require('../models/Course');
                const course = await Course.findById(courseId);

                if (course) {
                    const existingSubject = student.attendance.find(a => a.subject === course.code || a.subject === course.name);

                    if (existingSubject) {
                        existingSubject.present = presentClasses;
                        existingSubject.total = totalClasses;
                    } else {
                        student.attendance.push({
                            subject: course.code,
                            present: presentClasses,
                            total: totalClasses
                        });
                    }
                    await student.save();
                }
            }
        }

        // Trigger Absence Alerts to Parents
        const absentRecords = attendanceData.filter(r => r.status === 'Absent');
        if (absentRecords.length > 0) {
            const Course = require('../models/Course');
            const courseData = await Course.findById(courseId);

            for (const record of absentRecords) {
                const student = await Student.findById(record.studentId).populate('user', 'name');
                if (student) {
                    const parent = await Parent.findOne({ children: student._id }).populate('user', 'email name');
                    if (parent && parent.user) {
                        createNotification({
                            recipientId: parent.user._id,
                            message: `Attendance Alert: ${student.user.name} was marked ABSENT for ${courseData?.name || 'class'} today.`,
                            type: 'alert',
                            sendEmail: true,
                            emailData: {
                                subject: 'Attendance Alert - Absence Noted',
                                title: 'Absence Notification',
                                body: `Dear Parent, your ward ${student.user.name} was marked ABSENT for the class: ${courseData?.name || 'Academic Session'} on ${new Date(date).toLocaleDateString()}.`,
                                actionLink: 'http://localhost:5173/parent/dashboard'
                            }
                        });
                    }
                }
            }
        }

        res.json({ message: 'Attendance marked successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};
