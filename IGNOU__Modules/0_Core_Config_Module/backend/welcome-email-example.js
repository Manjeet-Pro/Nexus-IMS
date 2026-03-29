/**
 * Account Created Success Email Example
 * 
 * This script demonstrates how to send a welcome email using Nodemailer.
 * 
 * 1. Installation:
 *    npm install nodemailer dotenv
 * 
 * 2. Setup:
 *    Make sure EMAIL_USER and EMAIL_PASS are set in your .env file.
 */

const nodemailer = require('nodemailer');
require('dotenv').config();

// 1. Initialize the transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // Your Gmail
        pass: process.env.EMAIL_PASS  // Your App Password
    }
});

/**
 * Function to send the Welcome Email
 * @param {string} userEmail - Recipient's email
 * @param {string} userName - Recipient's name
 */
async function sendWelcomeEmail(userEmail, userName) {
    try {
        // 2. Set up email options
        const mailOptions = {
            from: `"Nexus Institute" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: 'Account Created Successfully',
            text: `Hello ${userName},\n\nWelcome to Nexus Institute! Your account has been successfully created.\n\nWe are glad to have you with us.\n\nRegards,\nNexus Team`,
            // html: `<h1>Welcome, ${userName}!</h1><p>Your account is ready.</p>`
        };

        // 3. Send email using async/await
        const info = await transporter.sendMail(mailOptions);

        console.log('✅ Welcome email sent!');
        console.log('Message ID:', info.messageId);
        return true;
    } catch (error) {
        // 4. Handle error
        console.error('❌ Failed to send welcome email:', error.message);
        return false;
    }
}

// --- Integration Guide ---
/*
Where to call this in registration controller (authController.js):

exports.registerUser = async (req, res) => {
    try {
        // ... (existing code to create user)
        const user = await User.create({ ... });

        if (user) {
            // CALL IT HERE:
            await sendWelcomeEmail(user.email, user.name);

            res.status(201).json({ message: 'User registered successfully' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
*/

// --- Run Example (Uncomment to test) ---
// const testEmail = process.env.EMAIL_USER;
// sendWelcomeEmail(testEmail, 'Test User');
