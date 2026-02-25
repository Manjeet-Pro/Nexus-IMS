const Notice = require('../models/Notice');
const { notifyMany } = require('../utils/notificationHelper');
const User = require('../models/User');

// @desc    Create a new notice
// @route   POST /api/notices
// @access  Private (Faculty/Admin)
exports.createNotice = async (req, res) => {
    try {
        const { title, content, audience, type } = req.body;

        const notice = await Notice.create({
            title,
            content,
            audience,
            type,
            postedBy: req.user._id
        });

        const populatedNotice = await Notice.findById(notice._id).populate('postedBy', 'name');

        // Trigger Notifications
        // 1. Determine target audience roles
        let targetRoles = [];
        if (audience.toLowerCase() === 'all') targetRoles = ['student', 'faculty', 'parent'];
        else if (audience.toLowerCase() === 'student') targetRoles = ['student'];
        else if (audience.toLowerCase() === 'faculty') targetRoles = ['faculty'];
        else if (audience.toLowerCase() === 'parent') targetRoles = ['parent'];

        // 2. Fetch all users in those roles
        if (targetRoles.length > 0) {
            const users = await User.find({ role: { $in: targetRoles } }).select('_id email');
            const userIds = users.map(u => u._id);

            // 3. Dispatch notifications in background
            notifyMany(userIds, {
                message: `New Notice: ${title}`,
                type: 'academic',
                sendEmail: true,
                emailData: {
                    subject: 'New Academic Notice',
                    title: 'Important Announcement',
                    actionLink: 'http://localhost:5173/dashboard' // Update to appropriate frontend link
                }
            });
        }

        // 4. Emit real-time socket event for new notice
        const { emitToAll } = require('../utils/socket');
        emitToAll('new-notice', populatedNotice);

        res.status(201).json(populatedNotice);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all notices
// @route   GET /api/notices
// @access  Private
exports.getAllNotices = async (req, res) => {
    try {
        const { audience } = req.query;
        let query = {};

        if (audience) {
            query.audience = { $regex: audience, $options: 'i' };
        }

        const notices = await Notice.find(query).sort({ date: -1 }).populate('postedBy', 'name');
        res.json(notices);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a notice
// @route   PUT /api/notices/:id
// @access  Private (Admin/Faculty who created it)
exports.updateNotice = async (req, res) => {
    try {
        const { title, content, audience, type } = req.body;

        const notice = await Notice.findById(req.params.id);

        if (!notice) {
            return res.status(404).json({ message: 'Notice not found' });
        }

        // Update fields
        notice.title = title || notice.title;
        notice.content = content || notice.content;
        notice.audience = audience || notice.audience;
        notice.type = type || notice.type;

        const updatedNotice = await notice.save();
        const populatedNotice = await Notice.findById(updatedNotice._id).populate('postedBy', 'name');

        res.json(populatedNotice);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a notice
// @route   DELETE /api/notices/:id
// @access  Private (Admin/Faculty who created it)
exports.deleteNotice = async (req, res) => {
    try {
        const notice = await Notice.findById(req.params.id);

        if (!notice) {
            return res.status(404).json({ message: 'Notice not found' });
        }

        await notice.deleteOne();
        res.json({ message: 'Notice deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
