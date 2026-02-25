const Parent = require('../models/Parent');
const Student = require('../models/Student');

// @desc    Get Parent Dashboard Data (Children)
// @route   GET /api/parent/dashboard
// @access  Private (Parent)
exports.getParentDashboard = async (req, res) => {
    try {
        const parent = await Parent.findOne({ user: req.user._id })
            .populate({
                path: 'children',
                populate: { path: 'user', select: 'name email avatar' }
            });

        if (!parent) {
            return res.status(404).json({ message: 'Parent profile not found' });
        }

        // Enhance children data with Attendance and Marks overview
        const enhancedChildren = await Promise.all(parent.children.map(async (child) => {
            // 1. Calculate Attendance Percentage
            const totalClasses = await require('../models/Attendance').countDocuments({ student: child._id });
            const attendedClasses = await require('../models/Attendance').countDocuments({ student: child._id, status: 'Present' });
            const attendancePercentage = totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 100) : 0;

            // 2. Get Recent Performance (Average of last 5 marks)
            const recentMarks = await require('../models/Mark').find({ student: child._id })
                .sort({ date: -1 })
                .limit(5);

            let performance = 'N/A';
            if (recentMarks.length > 0) {
                const totalObtained = recentMarks.reduce((acc, curr) => acc + curr.marks, 0);
                const totalMax = recentMarks.reduce((acc, curr) => acc + curr.total, 0);
                const avgPercentage = (totalObtained / totalMax) * 100;

                if (avgPercentage >= 90) performance = 'Excellent';
                else if (avgPercentage >= 75) performance = 'Good';
                else if (avgPercentage >= 50) performance = 'Average';
                else performance = 'Needs Improvement';
            }

            return {
                ...child.toObject(),
                attendancePercentage,
                performance
            };
        }));

        res.json({ ...parent.toObject(), children: enhancedChildren });
    } catch (error) {
        console.error("Get Parent Dashboard Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get Specific Child Details (Attendance & Marks)
// @route   GET /api/parent/child/:id
// @access  Private (Parent)
exports.getChildDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const parent = await Parent.findOne({ user: req.user._id });

        // Ensure this child belongs to the logged-in parent
        if (!parent.children.includes(id)) {
            return res.status(403).json({ message: 'Not authorized to view this student' });
        }

        const student = await Student.findById(id).populate('user', 'name email avatar');
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // 1. Fetch Attendance History (Grouped by Month for Chart)
        let attendanceGraph = [];
        try {
            const Attendance = require('../models/Attendance');
            const attendanceRecords = await Attendance.find({ student: id }).sort({ date: 1 });

            // Aggregate attendance by month
            const attendanceMap = new Map(); // "Jan 2024" -> { total: 0, present: 0 }

            attendanceRecords.forEach(record => {
                const date = new Date(record.date);
                const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });

                if (!attendanceMap.has(monthYear)) {
                    attendanceMap.set(monthYear, { total: 0, present: 0 });
                }

                const stats = attendanceMap.get(monthYear);
                stats.total++;
                if (record.status === 'Present') stats.present++;
            });

            attendanceGraph = Array.from(attendanceMap.entries()).map(([month, stats]) => ({
                month,
                percentage: Math.round((stats.present / stats.total) * 100)
            }));
        } catch (err) {
            console.warn("Attendance module missing or error", err);
            // Return empty array if attendance fails, allowing page to load
        }

        // 2. Fetch Exam Results
        const results = await require('../models/Mark').find({ student: id })
            .populate('course', 'name code')
            .sort({ date: -1 });

        const formattedResults = results.map(r => ({
            id: r._id,
            subject: r.course.name,
            code: r.course.code,
            type: r.type,
            marks: r.marks,
            total: r.total,
            date: new Date(r.date).toLocaleDateString()
        }));

        // 3. Fetch Enrolled Courses with Progress
        const courses = await require('../models/Course').find({ studentsEnrolled: id })
            .populate('instructor', 'user')
            .populate({ path: 'instructor', populate: { path: 'user', select: 'name' } });

        const coursesWithProgress = courses.map(course => {
            const totalTopics = course.syllabus ? course.syllabus.length : 0;
            const completedTopics = course.syllabus ? course.syllabus.filter(t => t.completed).length : 0;
            const progress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

            return {
                id: course._id,
                name: course.name,
                code: course.code,
                instructor: course.instructor?.user?.name || 'Faculty',
                progress
            };
        });

        res.json({
            child: student,
            attendance: attendanceGraph,
            results: formattedResults,
            courses: coursesWithProgress
        });

    } catch (error) {
        console.error("Get Child Details Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get Fees for a specific child
// @route   GET /api/parent/fees/:childId
// @access  Private (Parent)
exports.getChildFees = async (req, res) => {
    try {
        const { childId } = req.params;
        const parent = await Parent.findOne({ user: req.user._id });

        // Ensure this child belongs to the logged-in parent
        if (!parent.children.includes(childId)) {
            return res.status(403).json({ message: 'Not authorized to view fees for this student' });
        }

        const fees = await require('../models/Fee').find({ student: childId }).sort({ dueDate: 1 });
        res.json(fees);
    } catch (error) {
        console.error("Get Child Fees Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get Notices relevant to Parents
// @route   GET /api/parent/notices
// @access  Private (Parent)
exports.getParentNotices = async (req, res) => {
    try {
        // Fetch notices targeted at 'Parent' or 'All'
        const notices = await require('../models/Notice').find({
            audience: { $in: ['Parent', 'All', 'parent', 'all'] } // Case insensitive check handled by $in with both cases ideally, or ensure consistent casing in DB
        }).sort({ date: -1 }).populate('postedBy', 'name');

        res.json(notices);
    } catch (error) {
        console.error("Get Parent Notices Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};
// @desc    Update Child Avatar
// @route   PUT /api/parent/child/:id/avatar
// @access  Private (Parent)
exports.updateChildAvatar = async (req, res) => {
    try {
        const { id } = req.params;
        const { avatar } = req.body;

        const parent = await Parent.findOne({ user: req.user._id });

        // Ensure this child belongs to the logged-in parent
        if (!parent.children.includes(id)) {
            return res.status(403).json({ message: 'Not authorized to update this student' });
        }

        const student = await Student.findById(id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const user = await require('../models/User').findById(student.user);
        if (user) {
            user.avatar = avatar;
            await user.save();
            res.json({ message: 'Profile picture updated successfully', avatar: user.avatar });
        } else {
            res.status(404).json({ message: 'User account not found for this student' });
        }

    } catch (error) {
        console.error("Update Child Avatar Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};
