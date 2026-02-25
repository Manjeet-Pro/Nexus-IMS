
const User = require('../models/User');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Course = require('../models/Course');
const Fee = require('../models/Fee');
const Parent = require('../models/Parent');
const { createNotification } = require('../utils/notificationHelper');

// @desc    Get Admin Dashboard Stats
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getAdminStats = async (req, res) => {
    try {
        const today = new Date();
        const startOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);

        const totalStudents = await Student.countDocuments();
        const totalFaculty = await Faculty.countDocuments();
        const totalParents = await Parent.countDocuments();
        const activeCourses = await Course.countDocuments();

        // Trend calculations helper
        const getTrend = (current, last) => {
            if (last === 0) return current > 0 ? 100 : 0;
            return Math.round(((current - last) / last) * 100);
        };

        // Monthly counts for Trends (Counting from profiles for accuracy)
        const currentMonthStudents = await Student.countDocuments({ createdAt: { $gte: startOfCurrentMonth } });
        const lastMonthStudents = await Student.countDocuments({ createdAt: { $gte: startOfLastMonth, $lt: startOfCurrentMonth } });
        const studentTrend = getTrend(currentMonthStudents, lastMonthStudents);

        const currentMonthFaculty = await Faculty.countDocuments({ createdAt: { $gte: startOfCurrentMonth } });
        const lastMonthFaculty = await Faculty.countDocuments({ createdAt: { $gte: startOfLastMonth, $lt: startOfCurrentMonth } });
        const facultyTrend = getTrend(currentMonthFaculty, lastMonthFaculty);

        const currentMonthParents = await Parent.countDocuments({ createdAt: { $gte: startOfCurrentMonth } });
        const lastMonthParents = await Parent.countDocuments({ createdAt: { $gte: startOfLastMonth, $lt: startOfCurrentMonth } });
        const parentTrend = getTrend(currentMonthParents, lastMonthParents);

        const currentMonthCourses = await Course.countDocuments({ createdAt: { $gte: startOfCurrentMonth } });
        const lastMonthCourses = await Course.countDocuments({ createdAt: { $gte: startOfLastMonth, $lt: startOfCurrentMonth } });
        const courseTrend = getTrend(currentMonthCourses, lastMonthCourses);

        // Calculate Fee Collection & Trend
        const fees = await Fee.aggregate([
            { $match: { status: 'Paid' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalFees = fees.length > 0 ? fees[0].total : 0;

        const currentMonthFeesAgg = await Fee.aggregate([
            { $match: { status: 'Paid', date: { $gte: startOfCurrentMonth } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const lastMonthFeesAgg = await Fee.aggregate([
            { $match: { status: 'Paid', date: { $gte: startOfLastMonth, $lt: startOfCurrentMonth } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const currentFees = currentMonthFeesAgg.length > 0 ? currentMonthFeesAgg[0].total : 0;
        const lastFees = lastMonthFeesAgg.length > 0 ? lastMonthFeesAgg[0].total : 0;
        const feeTrend = getTrend(currentFees, lastFees);

        // Format Fees
        const formatCurrency = (val) => {
            if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`;
            if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
            return `₹${val.toLocaleString('en-IN')}`;
        };

        // Calculate last 6 months cumulative graph data
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const graphData = [];

        for (let i = 5; i >= 0; i--) {
            const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const nextMonth = new Date(today.getFullYear(), today.getMonth() - i + 1, 1);
            const monthName = months[date.getMonth()];

            // Cumulative count up to this month (Counting from profiles)
            const studentTotal = await Student.countDocuments({
                createdAt: { $lt: nextMonth }
            });

            const facultyTotal = await Faculty.countDocuments({
                createdAt: { $lt: nextMonth }
            });

            graphData.push({
                name: monthName,
                students: studentTotal,
                faculty: facultyTotal
            });
        }

        // Fetch Recent Activities
        const recentStudents = await Student.find().sort({ createdAt: -1 }).limit(3).populate('user', 'name');
        const recentFaculty = await Faculty.find().sort({ createdAt: -1 }).limit(2).populate('user', 'name');
        const recentFeesPopulated = await Fee.find({ status: 'Paid' })
            .sort({ date: -1 })
            .limit(3)
            .populate({
                path: 'student',
                populate: { path: 'user', select: 'name' }
            });

        const activities = [];
        recentStudents.forEach(student => {
            if (student.user) {
                activities.push({
                    id: `stu_${student._id}`,
                    message: `New Student Joined: ${student.user.name}`,
                    time: student.createdAt,
                    color: 'bg-primary-500'
                });
            }
        });

        recentFaculty.forEach(fac => {
            if (fac.user) {
                activities.push({
                    id: `fac_${fac._id}`,
                    message: `New Faculty Joined: ${fac.user.name}`,
                    time: fac.createdAt,
                    color: 'bg-purple-500'
                });
            }
        });

        recentFeesPopulated.forEach(fee => {
            if (fee.student && fee.student.user) {
                activities.push({
                    id: `fee_${fee._id}`,
                    message: `Fee Received: ₹${fee.amount} from ${fee.student.user.name}`,
                    time: fee.date,
                    color: 'bg-emerald-500'
                });
            }
        });

        activities.sort((a, b) => new Date(b.time) - new Date(a.time));
        const recentActivities = activities.slice(0, 5);

        res.json({
            students: { total: totalStudents, trend: studentTrend >= 0 ? 'up' : 'down', trendValue: `${Math.abs(studentTrend)}%` },
            faculty: { total: totalFaculty, trend: facultyTrend >= 0 ? 'up' : 'down', trendValue: `${Math.abs(facultyTrend)}%` },
            parents: { total: totalParents, trend: parentTrend >= 0 ? 'up' : 'down', trendValue: `${Math.abs(parentTrend)}%` },
            courses: { total: activeCourses, trend: courseTrend >= 0 ? 'up' : 'down', trendValue: `${Math.abs(courseTrend)}%` },
            fees: { total: formatCurrency(totalFees), trend: feeTrend >= 0 ? 'up' : 'down', trendValue: `${Math.abs(feeTrend)}%` },
            graphData,
            recentActivities
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add a new faculty member
// @route   POST /api/admin/faculty
// @access  Private/Admin
exports.createFaculty = async (req, res) => {
    try {
        const { name, email, dept, designation } = req.body;

        // 1. Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // 2. Create User
        // 2. Create User
        // Default password for new faculty (Strong Password)
        const password = 'Nexus@2024!';
        // We need bcrypt here, so let's import it or use the same logic as authController
        // Better to import bcrypt. But wait, I need to require it at the top.
        // Let's add bcrypt import at the top first or inline it if I can't edit top easily.
        // I will add it to the top in a separate edit or assume it relies on User model pre-save? 
        // User model doesn't have pre-save hash? Let's check User model. 
        // User model is plain schema. authController does hashing.
        // So I need bcryptjs here.

        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'faculty',
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
        });

        // 3. Create Faculty Profile
        if (user) {
            const faculty = await Faculty.create({
                user: user._id,
                department: dept,
                designation: designation
            });

            res.status(201).json({
                _id: faculty._id,
                name: user.name,
                email: user.email,
                dept: faculty.department,
                designation: faculty.designation
            });

            // Trigger Onboarding Notification/Email
            createNotification({
                recipientId: user._id,
                message: `Welcome to Nexus! Your faculty account has been created. Department: ${dept}`,
                type: 'success',
                sendEmail: true,
                emailData: {
                    subject: 'Welcome to Nexus Institute',
                    title: 'Account Created',
                    body: `Hi ${name}, your faculty account for the ${dept} department has been successfully created. You can now log in to the portal.`,
                    actionLink: 'http://localhost:5173/'
                }
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add a new student
// @route   POST /api/admin/students
// @access  Private/Admin
exports.createStudent = async (req, res) => {
    try {
        const { name, email, course, year } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // Auto-generate sequential Roll Number
        const lastStudent = await Student.findOne().sort({ rollNo: -1 });
        let nextNumber = 1;
        if (lastStudent && lastStudent.rollNo && lastStudent.rollNo.startsWith('STU')) {
            const lastNumber = parseInt(lastStudent.rollNo.replace('STU', ''));
            if (!isNaN(lastNumber)) {
                nextNumber = lastNumber + 1;
            }
        }
        const rollNo = `STU${nextNumber.toString().padStart(2, '0')}`;

        const password = 'Nexus@2024!';
        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'student',
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
        });

        if (user) {
            try {
                const student = await Student.create({
                    user: user._id,
                    rollNo,
                    course,
                    year
                });

                // Trigger Onboarding Notification/Email
                createNotification({
                    recipientId: user._id,
                    message: `Welcome to Nexus! Your student account for ${course} has been created.`,
                    type: 'success',
                    sendEmail: true,
                    emailData: {
                        subject: 'Welcome to Nexus Institute',
                        title: 'Academic Account Activated',
                        body: `Hi ${name}, your student profile for ${course} has been successfully created. Your Roll No is ${rollNo}.`,
                        actionLink: 'http://localhost:5173/'
                    }
                });

                res.status(201).json({
                    _id: student._id,
                    name: user.name,
                    email: user.email,
                    rollNo: student.rollNo,
                    course: student.course
                });
            } catch (studentError) {
                // Rollback: Delete the user if student creation fails
                await User.findByIdAndDelete(user._id);
                throw studentError; // Re-throw to be caught by outer catch
            }
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        if (error.code === 11000) {
            if (error.keyPattern?.rollNo) {
                return res.status(400).json({ message: 'Roll Number already exists' });
            }
        }
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update student details
// @route   PUT /api/admin/students/:id
// @access  Private/Admin
exports.updateStudent = async (req, res) => {
    try {
        const { name, email, course, year, status, rollNo } = req.body;
        const student = await Student.findById(req.params.id).populate('user');

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Check if rollNo is being updated and if it's unique
        if (rollNo && rollNo !== student.rollNo) {
            // Check change limit (max 2)
            if (student.rollNoChanges >= 2) {
                return res.status(400).json({ message: 'Roll Number change limit reached (Max 2 changes allowed)' });
            }

            const existingStudent = await Student.findOne({ rollNo });
            if (existingStudent) {
                return res.status(400).json({ message: 'Roll Number already exists' });
            }
            student.rollNo = rollNo;
            student.rollNoChanges = (student.rollNoChanges || 0) + 1;
        }

        // Update User info
        if (student.user) {
            const user = await User.findById(student.user._id);
            if (user) {
                user.name = name || user.name;
                user.email = email || user.email;
                await user.save();
            }
        }

        // Update Student info
        student.course = course || student.course;
        student.year = year || student.year;
        student.status = status || student.status;

        const updatedStudent = await student.save();

        res.json({
            _id: updatedStudent._id,
            name: student.user?.name,
            rollNo: updatedStudent.rollNo,
            course: updatedStudent.course,
            year: updatedStudent.year,
            status: updatedStudent.status
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Roll Number already exists' });
        }
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a student
// @route   DELETE /api/admin/students/:id
// @access  Private/Admin
exports.deleteStudent = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Delete associated User
        if (student.user) {
            await User.findByIdAndDelete(student.user);
        }

        // Delete Student profile
        await Student.findByIdAndDelete(req.params.id);

        res.json({ message: 'Student removed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all parents
// @route   GET /api/admin/parents
// @access  Private/Admin
exports.getParents = async (req, res) => {
    try {
        console.log("DEBUG: Fetching parents...");
        const parents = await Parent.find()
            .populate('user', 'name email avatar')
            .populate({
                path: 'children',
                populate: { path: 'user', select: 'name' }
            });

        console.log(`DEBUG: Found ${parents.length} parents.`);

        // Map to a friendlier format
        const formattedParents = parents.map(p => ({
            id: p._id.toString(),
            name: p.user ? p.user.name : 'Unknown',
            email: (p.user && p.user.email && p.user.email !== 'N/A') ? p.user.email : '',
            phone: (p.phone && p.phone !== 'N/A') ? p.phone : '',
            children: p.children.map(c => c.user ? c.user.name : c.rollNo).join(', ') || '',
            childrenData: p.children.map(c => ({
                id: c._id.toString(),
                name: c.user ? c.user.name : 'Unknown',
                rollNo: c.rollNo
            })),
            childrenCount: p.children.length,
            address: p.address || '',
            joinedAt: p.createdAt
        }));

        res.json(formattedParents);
    } catch (error) {
        console.error("DEBUG: Error in getParents:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update Parent Details
// @route   PUT /api/admin/parents/:id
// @access  Private/Admin
exports.updateParent = async (req, res) => {
    try {
        const { name, email, phone, address, children } = req.body;
        // Check if parent exists
        const parent = await Parent.findById(req.params.id);

        if (!parent) {
            return res.status(404).json({ message: 'Parent not found' });
        }

        // Update User fields
        const user = await User.findById(parent.user);
        if (user) {
            user.name = name || user.name;
            user.email = email || user.email;
            await user.save();
        }

        // Update Parent fields
        parent.phone = phone || parent.phone;
        parent.address = address || parent.address;

        // Update Children (Expects array of Student IDs)
        if (children) {
            // Validate children IDs if necessary, or just assign
            // Assuming children is an array of student IDs
            parent.children = children;
        }

        const updatedParent = await parent.save();

        res.json({
            _id: updatedParent._id,
            phone: updatedParent.phone,
            address: updatedParent.address,
            children: updatedParent.children
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new parent
// @route   POST /api/admin/parents
// @access  Private/Admin
exports.createParent = async (req, res) => {
    try {
        const { name, email, phone, address, children } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        const password = 'Nexus@2024!';
        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'parent',
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
        });

        if (user) {
            const parent = await Parent.create({
                user: user._id,
                phone,
                address,
                children: children || [] // Array of Student IDs
            });

            res.status(201).json({
                _id: parent._id,
                name: user.name,
                email: user.email,
                children: parent.children
            });

            // Trigger Onboarding Notification/Email
            createNotification({
                recipientId: user._id,
                message: `Welcome to Nexus! Your parent account has been created to track your children's progress.`,
                type: 'success',
                sendEmail: true,
                emailData: {
                    subject: 'Welcome to Nexus Institute',
                    title: 'Parent Portal Access',
                    body: `Hi ${name}, your parent account has been successfully created. You can now use this portal to track your children's attendance and academic performance.`,
                    actionLink: 'http://localhost:5173/'
                }
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a parent
// @route   DELETE /api/admin/parents/:id
// @access  Private/Admin
exports.deleteParent = async (req, res) => {
    try {
        const parent = await Parent.findById(req.params.id);

        if (parent) {
            // Delete associated User
            await User.findByIdAndDelete(parent.user);
            // Delete Parent Profile
            await Parent.findByIdAndDelete(req.params.id);
            res.json({ message: 'Parent removed' });
        } else {
            res.status(404).json({ message: 'Parent not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
