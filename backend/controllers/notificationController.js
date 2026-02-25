const Notification = require('../models/Notification');

// @desc    Get notifications for current user
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
    try {
        // Fetch notifications specific to user OR system-wide for admins
        let query = { recipient: req.user._id };

        if (req.user.role === 'admin') {
            // Admins see their own + system-wide (recipient: null)
            query = {
                $or: [
                    { recipient: req.user._id },
                    { recipient: null }
                ]
            };
        }

        const notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(20);
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (notification) {
            notification.read = true;
            await notification.save();
            res.json(notification);
        } else {
            res.status(404).json({ message: 'Notification not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark all as read
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res) => {
    try {
        let query = { recipient: req.user._id, read: false };
        if (req.user.role === 'admin') {
            query = {
                $or: [
                    { recipient: req.user._id },
                    { recipient: null }
                ],
                read: false
            };
        }

        await Notification.updateMany(query, { read: true });
        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
