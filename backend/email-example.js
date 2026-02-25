/**
 * Fees Submission Confirmation Email Example
 * 
 * This script demonstrates how to send an email using Nodemailer with Gmail SMTP.
 * 
 * Prerequisites:
 * 1. Install Nodemailer: npm install nodemailer (Done)
 * 2. Setup Gmail App Password in your .env file
 */

const nodemailer = require('nodemailer');
require('dotenv').config();

// 1. Initialize the transporter using Gmail SMTP
// Automatically loads from .env
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

/**
 * Function to send the confirmation email
 * @param {string} recipientEmail - The email address of the student/parent
 */
async function sendFeesConfirmation(recipientEmail) {
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            throw new Error('EMAIL_USER or EMAIL_PASS not set in .env');
        }

        // 2. Set up email options
        const mailOptions = {
            from: `"Nexus Institute" <${process.env.EMAIL_USER}>`, // Sender address
            to: recipientEmail,                                  // Receiver address
            subject: 'Fees Submission Confirmation',        // Subject line
            text: 'Dear Student,\n\nYour fees have been successfully submitted to Nexus Institute.\n\nThank you!', // Plain text body
        };

        // 3. Send the email using async/await
        console.log(`Attempting to send email from ${process.env.EMAIL_USER} to ${recipientEmail}...`);
        const info = await transporter.sendMail(mailOptions);

        console.log('✅ Email sent successfully!');
        console.log('Recipient:', recipientEmail);
        console.log('Message ID:', info.messageId);

    } catch (error) {
        // 4. Handle errors
        console.error('❌ Error sending email:', error.message);
    }
}

// --- Run the example ---
// NOTE: This will fail until you provide real credentials in the .env file!
const testRecipient = process.env.EMAIL_USER || 'recipient-email@example.com';
sendFeesConfirmation(testRecipient);

console.log('Nodemailer script executed. Check output for status.');
