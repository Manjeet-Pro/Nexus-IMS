const Student = require('../models/Student');
const User = require('../models/User');
const Course = require('../models/Course');
const Parent = require('../models/Parent');

// @desc    Get all students
// @route   GET /api/students
// @access  Private (Faculty/Admin)
exports.getAllStudents = async (req, res) => {
    try {
        const students = await Student.find().populate('user', 'name email avatar publicProfile');

        const filteredStudents = students
            .filter(s => s.user) // Filter out orphaned records
            .map(s => {
                const sDoc = s.toObject();
                if (sDoc.user && !sDoc.user.publicProfile) {
                    return {
                        ...sDoc,
                        user: {
                            _id: sDoc.user._id,
                            name: sDoc.user.name,
                            publicProfile: false,
                            isPrivate: true
                        }
                    };
                }
                return sDoc;
            });

        res.json(filteredStudents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get student by ID
// @route   GET /api/students/:id
// @access  Private
exports.getStudentById = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id).populate('user', 'name email avatar');
        if (student) {
            const sDoc = student.toObject();
            // If it's not the user's own profile and it's private, filter it
            if (sDoc.user && !sDoc.user.publicProfile && sDoc.user._id.toString() !== req.user.id) {
                return res.json({
                    _id: sDoc._id,
                    rollNo: sDoc.rollNo,
                    user: {
                        _id: sDoc.user._id,
                        name: sDoc.user.name,
                        publicProfile: false,
                        isPrivate: true
                    },
                    course: sDoc.course,
                    year: sDoc.year
                });
            }
            res.json(student);
        } else {
            res.status(404).json({ message: 'Student not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const Mark = require('../models/Mark');

// @desc    Get current logged in student dashboard data
// @route   GET /api/students/dashboard
// @access  Private (Student)
exports.getStudentDashboard = async (req, res) => {
    try {
        const student = await Student.findOne({ user: req.user._id }).populate('user', 'name email avatar');

        if (student) {
            // 1. Find parent associated with this student
            const parentRecord = await Parent.findOne({ children: student._id }).populate('user', 'name');
            const parentName = parentRecord && parentRecord.user ? parentRecord.user.name : null;

            // 2. Calculate Dynamic CGPA and Backlogs from Marks
            const allMarks = await Mark.find({ student: student._id });
            let cgpa = 0;
            let backlogs = 0;

            if (allMarks.length > 0) {
                const totalObtained = allMarks.reduce((acc, curr) => acc + curr.marks, 0);
                const totalMax = allMarks.reduce((acc, curr) => acc + curr.total, 0);
                const overallPercentage = (totalObtained / totalMax) * 100;
                cgpa = (overallPercentage / 10).toFixed(2);

                // Backlogs: marks < 40% (assuming 40 is pass)
                backlogs = allMarks.filter(m => (m.marks / m.total) * 100 < 40).length;
            }

            // 3. Calculate Attendance Percentage & Eligibility
            const attendanceStats = (student.attendance || []).reduce((acc, curr) => {
                acc.present += curr.present;
                acc.total += curr.total;
                return acc;
            }, { present: 0, total: 0 });

            const attendancePercentage = attendanceStats.total > 0
                ? Math.round((attendanceStats.present / attendanceStats.total) * 100)
                : 0;

            const isEligible = attendancePercentage >= 75;

            // 4. Fetch Courses & Progress
            const courses = await Course.find({ studentsEnrolled: student._id })
                .populate({
                    path: 'instructor',
                    populate: {
                        path: 'user',
                        select: 'name'
                    }
                });

            const formattedCourses = courses.map(course => {
                // Calculate progress based on syllabus completion
                const totalTopics = course.syllabus ? course.syllabus.length : 0;
                const completedTopics = course.syllabus ? course.syllabus.filter(t => t.completed).length : 0;
                const progress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

                return {
                    id: course.code,
                    name: course.name,
                    instructor: course.instructor && course.instructor.user ? course.instructor.user.name : 'TBD',
                    progress
                };
            });

            // 5. Calculate Next Class
            const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const now = new Date();
            const currentDayIndex = now.getDay();
            const currentTime = now.getHours() * 60 + now.getMinutes();

            let nextClass = null;
            let minDiff = Infinity;

            courses.forEach(course => {
                if (course.schedule) {
                    course.schedule.forEach(slot => {
                        const slotDayIndex = daysOfWeek.indexOf(slot.day);
                        const [startHour, startMinute] = slot.startTime.split(':').map(Number);
                        const slotStartTime = startHour * 60 + startMinute;

                        let minutesUntil = 0;
                        if (slotDayIndex > currentDayIndex) {
                            minutesUntil = ((slotDayIndex - currentDayIndex) * 24 * 60) - currentTime + slotStartTime;
                        } else if (slotDayIndex < currentDayIndex) {
                            minutesUntil = ((7 - (currentDayIndex - slotDayIndex)) * 24 * 60) - currentTime + slotStartTime;
                        } else {
                            if (slotStartTime > currentTime) {
                                minutesUntil = slotStartTime - currentTime;
                            } else {
                                minutesUntil = (7 * 24 * 60) - currentTime + slotStartTime;
                            }
                        }

                        if (minutesUntil < minDiff) {
                            minDiff = minutesUntil;
                            nextClass = {
                                name: course.name,
                                code: course.code,
                                room: slot.room,
                                time: `${slot.startTime} ${parseInt(slot.startTime.split(':')[0]) >= 12 ? 'PM' : 'AM'}`,
                                rawTime: slot.startTime,
                                day: slot.day
                            };
                        }
                    });
                }
            });

            if (nextClass) {
                const [h, m] = nextClass.rawTime.split(':');
                const hour = parseInt(h);
                const hour12 = hour % 12 || 12;
                const ampm = hour >= 12 ? 'PM' : 'AM';
                nextClass.time = `${hour12}:${m} ${ampm}`;
            }

            // Calculate Sequential ID (Serial No) - position of student in database by creation date
            const serialNo = await Student.countDocuments({ createdAt: { $lt: student.createdAt } }) + 1;

            // Construct full dashboard profile object with dynamic data
            const profileData = {
                ...student.toObject(),
                cgpa,
                backlogs,
                attendancePercentage,
                isEligible,
                parentName,
                serialNo
            };

            res.json({
                profile: profileData,
                attendance: student.attendance || [],
                courses: formattedCourses,
                nextClass,
                parentName
            });
        } else {
            res.status(404).json({ message: 'Student profile not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get student timetable
// @route   GET /api/students/timetable
// @access  Private (Student)
exports.getTimetable = async (req, res) => {
    try {
        const student = await Student.findOne({ user: req.user._id });

        if (!student) {
            return res.status(404).json({ message: 'Student profile not found' });
        }

        const courses = await Course.find({ studentsEnrolled: student._id })
            .populate('instructor', 'user')
            .populate({
                path: 'instructor',
                populate: {
                    path: 'user',
                    select: 'name'
                }
            });

        let timetable = {
            Monday: [],
            Tuesday: [],
            Wednesday: [],
            Thursday: [],
            Friday: [],
            Saturday: [],
            Sunday: []
        };

        courses.forEach(course => {
            if (course.schedule) {
                course.schedule.forEach(slot => {
                    if (timetable[slot.day]) {
                        timetable[slot.day].push({
                            courseName: course.name,
                            courseCode: course.code,
                            startTime: slot.startTime,
                            endTime: slot.endTime,
                            room: slot.room,
                            instructor: course.instructor && course.instructor.user ? course.instructor.user.name : 'TBD'
                        });
                    }
                });
            }
        });

        // Sort classes by start time
        for (const day in timetable) {
            timetable[day].sort((a, b) => {
                return a.startTime.localeCompare(b.startTime);
            });
        }

        res.json(timetable);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Enroll student in a course
// @route   POST /api/students/enroll
// @access  Private (Admin)
exports.enrollStudent = async (req, res) => {
    try {
        // Placeholder implementation
        res.status(200).json({ message: 'Enrollment successful (Placeholder)' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
