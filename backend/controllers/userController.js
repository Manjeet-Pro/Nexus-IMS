const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        let profileData = { ...user._doc };

        if (user.role === 'student') {
            const studentProfile = await Student.findOne({ user: user._id });
            profileData = { ...profileData, ...studentProfile?._doc };
        } else if (user.role === 'faculty') {
            const facultyProfile = await Faculty.findOne({ user: user._id });
            profileData = { ...profileData, ...facultyProfile?._doc };
        }

        res.json(profileData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
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
                user.password = req.body.password; // Add hashing middleware if needed
            }

            const updatedUser = await user.save();
            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                avatar: updatedUser.avatar,
                publicProfile: updatedUser.publicProfile,
                emailNotifs: updatedUser.emailNotifs,
                token: generateToken(updatedUser._id) // Optional: issue new token
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
