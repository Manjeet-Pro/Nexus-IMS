const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Parent = require('../models/Parent');
const Course = require('../models/Course');
const Fee = require('../models/Fee');
const generateToken = require('../utils/generateToken');
const { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail } = require('../utils/emailService');
const { createNotification } = require('../utils/notificationHelper');

// ==========================================
// 1. AUTHENTICATION (from authController.js)
// ==========================================

exports.registerUser = async (req, res) => {
    try {
        const { name, email, password, role, extraData } = req.body;
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                message: 'Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.'
            });
        }
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationTokenExpire = Date.now() + 3600000;

        const user = await User.create({
            name, email, password: hashedPassword, role,
            verificationToken, verificationTokenExpire, isVerified: false
        });

        if (user) {
            if (role === 'student') {
                await Student.create({
                    user: user._id,
                    rollNo: extraData?.rollNo || `STU${Math.floor(1000 + Math.random() * 9000)}`,
                    course: extraData?.course || 'General',
                    year: extraData?.year || new Date().getFullYear().toString(),
                    ...extraData
                });
            } else if (role === 'faculty') {
                await Faculty.create({
                    user: user._id,
                    department: extraData?.department || 'General',
                    designation: extraData?.designation || 'Lecturer',
                    ...extraData
                });
            } else if (role === 'parent') {
                let childrenIds = [];
                if (extraData?.childrenRollNos && Array.isArray(extraData.childrenRollNos)) {
                    const students = await Student.find({ rollNo: { $in: extraData.childrenRollNos } });
                    childrenIds = students.map(s => s._id);
                }
                await Parent.create({
                    user: user._id,
                    children: childrenIds,
                    phone: extraData?.phone || '',
                    address: extraData?.address || ''
                });
            }
            sendVerificationEmail(user.email, verificationToken).catch(e => console.error("Email Error:", e.message));
            return res.status(201).json({
                _id: user._id, name: user.name, email: user.email, role: user.role, isVerified: false,
                message: 'Registration successful! Please check your email inbox.'
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: `Registration failed: ${error.message}` });
    }
};

exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (user && (await bcrypt.compare(password, user.password))) {
            if (!user.isVerified) return res.status(401).json({ message: 'Please verify your email address before logging in.' });
            res.json({
                _id: user._id, name: user.name, email: user.email, role: user.role,
                avatar: user.avatar, publicProfile: user.publicProfile, token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(404).json({ message: 'User not found' });
        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
        await user.save();
        try {
            await sendPasswordResetEmail(user.email, resetToken);
            res.status(200).json({ success: true, data: 'Email sent' });
        } catch (err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();
            return res.status(500).json({ message: 'Email could not be sent' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.validateResetToken = async (req, res) => {
    try {
        const resetPasswordToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex');
        const user = await User.findOne({ resetPasswordToken, resetPasswordExpire: { $gt: Date.now() } });
        if (!user) return res.status(400).json({ valid: false, message: 'Expired or used token' });
        res.status(200).json({ valid: true, message: 'Token is valid' });
    } catch (error) {
        res.status(500).json({ valid: false, message: error.message });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const resetPasswordToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex');
        const user = await User.findOne({ resetPasswordToken, resetPasswordExpire: { $gt: Date.now() } });
        if (!user) return res.status(400).json({ message: 'Invalid or expired token' });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = Date.now() - 1000;
        await user.save();
        res.status(200).json({ success: true, data: 'Password updated', token: generateToken(user._id) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.verifyEmail = async (req, res) => {
    try {
        const user = await User.findOne({ verificationToken: req.params.token, verificationTokenExpire: { $gt: Date.now() } });
        if (!user) return res.status(400).json({ message: 'Invalid or expired token' });
        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpire = undefined;
        await user.save();
        await sendWelcomeEmail(user.email, user.name);
        res.status(200).json({ message: 'Email verified', success: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.searchStudents = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query || query.length < 3) return res.json([]);
        const studentsByRoll = await Student.find({ rollNo: { $regex: query, $options: 'i' } }).populate('user', 'name publicProfile').limit(5);
        const usersByName = await User.find({ name: { $regex: query, $options: 'i' }, role: 'student' }).select('_id name').limit(5);
        const studentsByName = await Student.find({ user: { $in: usersByName.map(u => u._id) } }).populate('user', 'name publicProfile').limit(5);
        const all = [...studentsByRoll, ...studentsByName];
        const unique = Array.from(new Set(all.map(a => a._id.toString()))).map(id => all.find(a => a._id.toString() === id));
        res.json(unique.slice(0, 5).map(s => ({ _id: s._id, rollNo: s.rollNo, name: s.user.name, course: s.course, year: s.year, isPrivate: !s.user.publicProfile })));
    } catch (error) {
        res.status(500).json({ message: "Search failed" });
    }
};

// ==========================================
// 2. USER PROFILE (from userController.js)
// ==========================================

exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        let profileData = { ...user._doc };
        if (user.role === 'student') profileData = { ...profileData, ...(await Student.findOne({ user: user._id }))?._doc };
        else if (user.role === 'faculty') profileData = { ...profileData, ...(await Faculty.findOne({ user: user._id }))?._doc };
        res.json(profileData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.avatar = req.body.avatar || user.avatar;
            user.publicProfile = req.body.publicProfile !== undefined ? req.body.publicProfile : user.publicProfile;
            user.emailNotifs = req.body.emailNotifs !== undefined ? req.body.emailNotifs : user.emailNotifs;
            if (req.body.password) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(req.body.password, salt);
            }
            const updated = await user.save();
            res.json({ _id: updated._id, name: updated.name, email: updated.email, role: updated.role, avatar: updated.avatar, publicProfile: updated.publicProfile, emailNotifs: updated.emailNotifs, token: generateToken(updated._id) });
        } else res.status(404).json({ message: 'User not found' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ==========================================
// 3. ADMIN (from adminController.js)
// ==========================================

exports.getAdminStats = async (req, res) => {
    try {
        const today = new Date();
        const startOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const totalStudents = await Student.countDocuments();
        const totalFaculty = await Faculty.countDocuments();
        const totalParents = await Parent.countDocuments();
        const activeCourses = await Course.countDocuments();
        const getTrend = (current, last) => (last === 0) ? (current > 0 ? 100 : 0) : Math.round(((current - last) / last) * 100);

        const fees = await Fee.aggregate([{ $match: { status: 'Paid' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]);
        const totalFees = fees.length > 0 ? fees[0].total : 0;

        const formatCurrency = (val) => val >= 10000000 ? `₹${(val / 10000000).toFixed(1)}Cr` : (val >= 100000 ? `₹${(val / 100000).toFixed(1)}L` : `₹${val.toLocaleString('en-IN')}`);

        const graphData = [];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        for (let i = 5; i >= 0; i--) {
            const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const nextMonth = new Date(today.getFullYear(), today.getMonth() - i + 1, 1);
            graphData.push({ name: months[date.getMonth()], students: await Student.countDocuments({ createdAt: { $lt: nextMonth } }), faculty: await Faculty.countDocuments({ createdAt: { $lt: nextMonth } }) });
        }

        const recentStudents = await Student.find().sort({ createdAt: -1 }).limit(3).populate('user', 'name');
        const recentFaculty = await Faculty.find().sort({ createdAt: -1 }).limit(2).populate('user', 'name');
        const recentFees = await Fee.find({ status: 'Paid' }).sort({ date: -1 }).limit(3).populate({ path: 'student', populate: { path: 'user', select: 'name' } });

        const activities = [];
        recentStudents.forEach(s => s.user && activities.push({ id: `stu_${s._id}`, message: `New Student: ${s.user.name}`, time: s.createdAt, color: 'bg-primary-500' }));
        recentFaculty.forEach(f => f.user && activities.push({ id: `fac_${f._id}`, message: `New Faculty: ${f.user.name}`, time: f.createdAt, color: 'bg-purple-500' }));
        recentFees.forEach(f => f.student?.user && activities.push({ id: `fee_${f._id}`, message: `Fee: ₹${f.amount} from ${f.student.user.name}`, time: f.date, color: 'bg-emerald-500' }));

        res.json({
            students: { total: totalStudents, trend: 'up', trendValue: '10%' },
            faculty: { total: totalFaculty, trend: 'up', trendValue: '5%' },
            parents: { total: totalParents, trend: 'up', trendValue: '2%' },
            courses: { total: activeCourses, trend: 'up', trendValue: '0%' },
            fees: { total: formatCurrency(totalFees), trend: 'up', trendValue: '12%' },
            graphData, recentActivities: activities.sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5)
        });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.createFaculty = async (req, res) => {
    try {
        const { name, email, dept, designation } = req.body;
        if (await User.findOne({ email })) return res.status(400).json({ message: 'Email already exists' });
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('Nexus@2024!', salt);
        const user = await User.create({ name, email, password: hashedPassword, role: 'faculty', avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random` });
        const faculty = await Faculty.create({ user: user._id, department: dept, designation: designation });
        createNotification({ recipientId: user._id, message: `Welcome! Faculty account created for ${dept}.`, type: 'success', sendEmail: true, emailData: { subject: 'Welcome to Nexus', title: 'Account Created', body: `Hi ${name}, your faculty account is ready.`, actionLink: 'http://localhost:5173/' } });
        res.status(201).json({ _id: faculty._id, name: user.name, email: user.email, dept: faculty.department, designation: faculty.designation });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.createStudent = async (req, res) => {
    try {
        const { name, email, course, year } = req.body;
        if (await User.findOne({ email })) return res.status(400).json({ message: 'Email already exists' });
        const last = await Student.findOne().sort({ rollNo: -1 });
        const rollNo = `STU${((last && last.rollNo?.startsWith('STU') ? parseInt(last.rollNo.replace('STU', '')) : 0) + 1).toString().padStart(2, '0')}`;
        const salt = await bcrypt.genSalt(10);
        const user = await User.create({ name, email, password: await bcrypt.hash('Nexus@2024!', salt), role: 'student', avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random` });
        const student = await Student.create({ user: user._id, rollNo, course, year });
        createNotification({ recipientId: user._id, message: `Welcome! Roll No: ${rollNo}`, type: 'success', sendEmail: true, emailData: { subject: 'Welcome to Nexus', title: 'Account Activated', body: `Hi ${name}, your Roll No is ${rollNo}.`, actionLink: 'http://localhost:5173/' } });
        res.status(201).json({ _id: student._id, name: user.name, email: user.email, rollNo: student.rollNo, course: student.course });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.updateStudent = async (req, res) => {
    try {
        const { name, email, course, year, status, rollNo } = req.body;
        const student = await Student.findById(req.params.id).populate('user');
        if (!student) return res.status(404).json({ message: 'Student not found' });
        if (rollNo && rollNo !== student.rollNo) {
            if (student.rollNoChanges >= 2) return res.status(400).json({ message: 'Change limit reached' });
            if (await Student.findOne({ rollNo })) return res.status(400).json({ message: 'Roll No exists' });
            student.rollNo = rollNo;
            student.rollNoChanges = (student.rollNoChanges || 0) + 1;
        }
        if (student.user) {
            const user = await User.findById(student.user._id);
            if (user) { user.name = name || user.name; user.email = email || user.email; await user.save(); }
        }
        student.course = course || student.course; student.year = year || student.year; student.status = status || student.status;
        const updated = await student.save();
        res.json({ _id: updated._id, name: student.user?.name, rollNo: updated.rollNo, course: updated.course, year: updated.year, status: updated.status });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.deleteStudent = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (student) {
            if (student.user) await User.findByIdAndDelete(student.user);
            await Student.findByIdAndDelete(req.params.id);
            res.json({ message: 'Student removed' });
        } else res.status(404).json({ message: 'Not found' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.getParents = async (req, res) => {
    try {
        const parents = await Parent.find().populate('user', 'name email avatar').populate({ path: 'children', populate: { path: 'user', select: 'name' } });
        res.json(parents.map(p => ({ id: p._id.toString(), name: p.user?.name || 'Unknown', email: p.user?.email || '', phone: p.phone || '', children: p.children.map(c => c.user?.name || c.rollNo).join(', '), childrenData: p.children.map(c => ({ id: c._id.toString(), name: c.user?.name || 'Unknown', rollNo: c.rollNo })), address: p.address || '' })));
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.createParent = async (req, res) => {
    try {
        const { name, email, phone, address, children } = req.body;
        if (await User.findOne({ email })) return res.status(400).json({ message: 'Email exists' });
        const salt = await bcrypt.genSalt(10);
        const user = await User.create({ name, email, password: await bcrypt.hash('Nexus@2024!', salt), role: 'parent', avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random` });
        const parent = await Parent.create({ user: user._id, phone, address, children: children || [] });
        res.status(201).json({ _id: parent._id, name: user.name, email: user.email, children: parent.children });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.updateParent = async (req, res) => {
    try {
        const { name, email, phone, address, children } = req.body;
        const parent = await Parent.findById(req.params.id);
        if (!parent) return res.status(404).json({ message: 'Not found' });
        const user = await User.findById(parent.user);
        if (user) { user.name = name || user.name; user.email = email || user.email; await user.save(); }
        parent.phone = phone || parent.phone; parent.address = address || parent.address; if (children) parent.children = children;
        const updated = await parent.save();
        res.json({ _id: updated._id, phone: updated.phone, address: updated.address, children: updated.children });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.deleteParent = async (req, res) => {
    try {
        const parent = await Parent.findById(req.params.id);
        if (parent) {
            await User.findByIdAndDelete(parent.user);
            await Parent.findByIdAndDelete(req.params.id);
            res.json({ message: 'Parent removed' });
        } else res.status(404).json({ message: 'Not found' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};
