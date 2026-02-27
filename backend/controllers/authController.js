const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Parent = require('../models/Parent');

const generateToken = require('../utils/generateToken');

const { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail } = require('../utils/emailService');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res) => {
    try {
        const { name, email, password, role, extraData } = req.body;

        console.log("Register Request:", { name, email, role });

        // 1. Strong Password Validation
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                message: 'Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.'
            });
        }

        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is not defined in environment variables");
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 2. Generate Verification Token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationTokenExpire = Date.now() + 3600000; // 1 hour

        const isEmailConfigured = !!(process.env.EMAIL_USER && process.env.EMAIL_PASS);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
            verificationToken,
            verificationTokenExpire,
            isVerified: false // Proper flow: verify via email first
        });

        console.log("DEBUG: User created successfully:", user._id);

        if (user) {
            // Create specific profile based on role
            console.log("DEBUG: Creating profile for role:", role);
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
                // If children roll numbers are provided, find them
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

            console.log("DEBUG: Profile created. Sending email in background...");

            // 3. Send Verification Email (NON-BLOCKING - to avoid Render timeouts)
            sendVerificationEmail(user.email, verificationToken)
                .then(sent => {
                    if (sent.success) console.log("✅ DEBUG: Verification email delivered to:", user.email);
                    else console.log("⚠️ DEBUG: Email failed:", sent.error);
                })
                .catch(e => console.error("❌ DEBUG: Background Email Error:", e.message));

            // Respond immediately so the user isn't stuck waiting
            return res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: false,
                message: 'Registration successful! Please check your email inbox (and Spam folder) in a few minutes.'
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error("Registration Error Details:", error);
        // Improved error message for debugging
        res.status(500).json({
            message: `Registration failed: ${error.message}`,
            stack: process.env.NODE_ENV === 'development' ? error.stack : null
        });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {

            // Check if verified
            if (!user.isVerified) {
                return res.status(401).json({ message: 'Please verify your email address before logging in.' });
            }

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                publicProfile: user.publicProfile,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error("Login Error Details:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate token
        const resetToken = crypto.randomBytes(20).toString('hex');

        // Hash token and set to resetPasswordToken field
        user.resetPasswordToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        // Set expire (10 minutes)
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

        await user.save();

        // Create reset url
        const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

        try {
            await sendPasswordResetEmail(user.email, resetToken);
            res.status(200).json({ success: true, data: 'Email sent' });
        } catch (err) {
            console.error(err);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;

            await user.save();

            return res.status(500).json({ message: 'Email could not be sent' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Validate Reset Token
// @route   GET /api/auth/validate-reset-token/:resetToken
// @access  Public
exports.validateResetToken = async (req, res) => {
    try {
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.params.resetToken)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken: resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                valid: false,
                message: 'This password reset link has expired or has already been used.'
            });
        }

        res.status(200).json({
            valid: true,
            message: 'Token is valid'
        });
    } catch (error) {
        res.status(500).json({
            valid: false,
            message: error.message
        });
    }
};

// @desc    Reset Password
// @route   PUT /api/auth/resetpassword/:resetToken
// @access  Public
exports.resetPassword = async (req, res) => {
    try {
        // Get hashed token
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.params.resetToken)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken: resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        // Set new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);

        // Immediately clear and expire the reset token
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = Date.now() - 1000; // Set to past time to ensure expiration

        await user.save();

        res.status(200).json({
            success: true,
            data: 'Password updated successfully',
            token: generateToken(user._id)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Search students for parent linking
// @route   GET /api/auth/search-students
// @access  Public
exports.searchStudents = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query || query.length < 3) {
            return res.json([]);
        }

        // Search by Roll No (exact or partial)
        // OR Search by Name (via populated User)
        // Since Name is in User model, we need to aggregate or find users first

        // Approach 1: Find Students with regex RollNo
        const studentsByRoll = await Student.find({
            rollNo: { $regex: query, $options: 'i' }
        }).populate('user', 'name publicProfile').limit(5);

        // Approach 2: Find Users with regex Name, then find their Student profiles
        const usersByName = await User.find({
            name: { $regex: query, $options: 'i' },
            role: 'student'
        }).select('_id name').limit(5);

        const userIds = usersByName.map(u => u._id);
        const studentsByName = await Student.find({
            user: { $in: userIds }
        }).populate('user', 'name publicProfile').limit(5);

        // Combine and Deduplicate
        const allStudents = [...studentsByRoll, ...studentsByName];
        const uniqueStudents = Array.from(new Set(allStudents.map(a => a._id.toString())))
            .map(id => {
                return allStudents.find(a => a._id.toString() === id);
            });

        const results = uniqueStudents.slice(0, 5).map(s => {
            const isPrivate = s.user && !s.user.publicProfile;
            return {
                _id: s._id,
                rollNo: s.rollNo,
                name: s.user.name,
                course: s.course,
                year: s.year,
                isPrivate: isPrivate
            };
        });

        res.json(results);

    } catch (error) {
        console.error("Search Student Error:", error);
        res.status(500).json({ message: "Failed to search students" });
    }
};

// @desc    Verify Email
// @route   GET /api/auth/verifyemail/:token
// @access  Public
exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;

        // Find user with token and check expiry
        const user = await User.findOne({
            verificationToken: token,
            verificationTokenExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired verification token' });
        }

        // Verify user
        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpire = undefined;
        await user.save();

        // Send Welcome Email upon successful verification
        await sendWelcomeEmail(user.email, user.name);

        res.status(200).json({
            message: 'Email verified successfully. You can now login.',
            success: true
        });

    } catch (error) {
        console.error("Verification Error:", error);
        res.status(500).json({ message: error.message });
    }
};
