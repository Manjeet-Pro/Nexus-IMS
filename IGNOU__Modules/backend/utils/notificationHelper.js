const Notification = require('../models/Notification');
const User = require('../models/User');
const { sendEmailAlert } = require('./emailService');

/**
 * Unified helper to send notifications across multiple channels
 * @param {Object} options
 * @param {string} options.recipientId - User ID of the recipient (null for system-wide admin)
 * @param {string} options.message - Notification message
 * @param {string} options.type - 'info', 'alert', 'success', 'academic'
 * @param {boolean} options.sendEmail - Whether to send an email alert
 * @param {Object} options.emailData - Data for the email (subject, title, actionLink)
 */
const createNotification = async ({
    recipientId,
    message,
    type = 'info',
    sendEmail = false,
    emailData = {}
}) => {
    try {
        // 1. Create Database Notification
        const notification = await Notification.create({
            recipient: recipientId,
            message,
            type
        });

        // 2. Emit Real-time Socket Event
        const { emitToUser, emitToAll } = require('./socket');
        if (recipientId) {
            emitToUser(recipientId.toString(), 'new_notification', notification);
        } else {
            // System-wide notification
            emitToAll('new_notification', notification);
        }

        // 3. Send Email Alert if requested and recipient allows
        if (sendEmail && recipientId) {
            const recipient = await User.findById(recipientId).select('email emailNotifs');

            // Only send email if recipient exists and has not explicitly disabled email notifications
            if (recipient && recipient.email && recipient.emailNotifs !== false) {
                // Background dispatch (don't await)
                sendEmailAlert(
                    recipient.email,
                    emailData.subject || 'New Notification',
                    emailData.title || 'Nexus Alert', // Assuming 'title' is the second argument for sendEmailAlert
                    emailData.body || message,
                    emailData.actionLink,
                    emailData.actionText
                );
            }
        }

        return notification;
    } catch (error) {
        console.error('Error in createNotification helper:', error);
        // We don't throw here to prevent blocking main business logic if notification fails
        return null;
    }
};

/**
 * Send notification to multiple users
 * @param {Array} recipientIds - Array of User IDs
 * @param {Object} options - Same as createNotification
 */
const notifyMany = async (recipientIds, options) => {
    try {
        // Map over IDs and call createNotification
        // Use Promise.all if we want to wait, but for notifications we can do it in background
        const results = await Promise.all(recipientIds.map(id =>
            createNotification({ ...options, recipientId: id })
        ));
        return results;
    } catch (error) {
        console.error('Error in notifyMany helper:', error);
        return [];
    }
};

module.exports = { createNotification, notifyMany };
