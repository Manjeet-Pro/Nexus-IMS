const nodemailer = require('nodemailer');

const sendVerificationEmail = async (email, token) => {
    try {
        // Create transporter
        // If credentials are missing, this will fail or we can use Ethereal for dev
        const transporter = nodemailer.createTransport({
            service: 'gmail', // or your preferred service
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // Verification Link (Use FRONTEND_URL from env or fallback)
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const verificationUrl = `${frontendUrl}/verify-email/${token}`;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Nexus Account Verification',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #4F46E5;">Verify Your Nexus Account</h2>
                    <p>Thank you for registering with Nexus Institute Management System.</p>
                    <p>Please click the button below to verify your email address and activate your account:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${verificationUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email</a>
                    </div>
                    <p>Or copy and paste this link in your browser:</p>
                    <p><a href="${verificationUrl}">${verificationUrl}</a></p>
                    <p>This link will expire in 1 hour.</p>
                </div>
            `
        };

        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            const info = await transporter.sendMail(mailOptions);
            console.log('Verification email sent:', info.messageId);
            return true;
        } else {
            console.log('---------------------------------------------------');
            console.log('⚠️ EMAIL SERVICE NOT CONFIGURED');
            console.log(`To: ${email}`);
            console.log(`Token: ${token}`);
            console.log(`Link: ${verificationUrl}`);
            console.log('Add EMAIL_USER and EMAIL_PASS to .env to send real emails.');
            console.log('---------------------------------------------------');
            return false; // Return false but don't throw, allowing registration to proceed in dev
        }

    } catch (error) {
        console.error('Error sending verification email:', error);
        return false;
    }
};

/**
 * Send a generic email alert
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} title - Heading in the email body
 * @param {string} body - Main text content
 * @param {string} actionLink - Optional URL for a CTA button
 */
const sendEmailAlert = async (to, subject, title, body, actionLink = null) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: `Nexus Support <${process.env.EMAIL_USER}>`,
            to,
            subject: `Nexus: ${subject}`,
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
                    <div style="background-color: #4F46E5; padding: 24px; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 24px;">Nexus Institute</h1>
                    </div>
                    <div style="padding: 32px; background-color: white;">
                        <h2 style="color: #111827; margin-top: 0;">${title}</h2>
                        <div style="color: #4b5563; line-height: 1.6; font-size: 16px;">${body}</div>
                        ${actionLink ? `
                        <div style="text-align: center; margin-top: 32px;">
                            <a href="${actionLink}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">View Details</a>
                        </div>` : ''}
                    </div>
                    <div style="background-color: #f9fafb; padding: 16px; text-align: center; border-top: 1px solid #e5e7eb;">
                        <p style="color: #9ca3af; font-size: 12px; margin: 0;">&copy; 2024 Nexus Institute Management System. All rights reserved.</p>
                    </div>
                </div>
            `
        };

        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            await transporter.sendMail(mailOptions);
            return true;
        } else {
            console.log('--- EMAIL SIMULATION ---');
            console.log(`To: ${to}`);
            console.log(`Subject: ${subject}`);
            console.log(`Body: ${body}`);
            console.log('------------------------');
            return true;
        }
    } catch (error) {
        console.error('Error sending email alert:', error);
        return false;
    }
};

/**
 * Send a welcome email after successful registration
 * @param {string} email - Recipient email
 * @param {string} name - Recipient name
 */
const sendWelcomeEmail = async (email, name) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: `"Nexus Institute" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Account Created Successfully',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
                    <div style="background-color: #4F46E5; padding: 24px; text-align: center;">
                        <h1 style="color: white; margin: 0;">Welcome to Nexus!</h1>
                    </div>
                    <div style="padding: 32px; background-color: white;">
                        <h2 style="color: #111827;">Hello ${name},</h2>
                        <p style="color: #4b5563; line-height: 1.6; font-size: 16px;">
                            Your account has been successfully created at Nexus Institute Management System. We are excited to have you on board!
                        </p>
                        <p style="color: #4b5563; line-height: 1.6; font-size: 16px;">
                            You can now use your credentials to log in once your email has been verified.
                        </p>
                    </div>
                    <div style="background-color: #f9fafb; padding: 16px; text-align: center; border-top: 1px solid #e5e7eb;">
                        <p style="color: #9ca3af; font-size: 12px; margin: 0;">&copy; 2024 Nexus Institute. All rights reserved.</p>
                    </div>
                </div>
            `
        };

        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            await transporter.sendMail(mailOptions);
            console.log('Welcome email sent to:', email);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error sending welcome email:', error);
        return false;
    }
};

/**
 * Send a password reset email
 * @param {string} email - Recipient email
 * @param {string} token - Reset token
 */
const sendPasswordResetEmail = async (email, token) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const resetUrl = `${frontendUrl}/reset-password/${token}`;

        const mailOptions = {
            from: `"Nexus Institute" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Password Reset Request',
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
                    <div style="background-color: #4F46E5; padding: 24px; text-align: center;">
                        <h1 style="color: white; margin: 0;">Nexus Password Reset</h1>
                    </div>
                    <div style="padding: 32px; background-color: white;">
                        <h2 style="color: #111827;">Reset Your Password</h2>
                        <p style="color: #4b5563; line-height: 1.6; font-size: 16px;">
                            You are receiving this email because you (or someone else) have requested the reset of the password for your account.
                        </p>
                        <p style="color: #4b5563; line-height: 1.6; font-size: 16px;">
                            Please click on the button below to complete the process. This link will expire in 10 minutes.
                        </p>
                        <div style="text-align: center; margin: 32px 0;">
                            <a href="${resetUrl}" style="background-color: #4F46E5; color: white; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Password</a>
                        </div>
                        <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
                            If you did not request this, please ignore this email and your password will remain unchanged.
                        </p>
                    </div>
                    <div style="background-color: #f9fafb; padding: 16px; text-align: center; border-top: 1px solid #e5e7eb;">
                        <p style="color: #9ca3af; font-size: 12px; margin: 0;">&copy; 2024 Nexus Institute. All rights reserved.</p>
                    </div>
                </div>
            `
        };

        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            await transporter.sendMail(mailOptions);
            return true;
        } else {
            console.log('--- PASSWORD RESET SIMULATION ---');
            console.log(`To: ${email}`);
            console.log(`Link: ${resetUrl}`);
            console.log('---------------------------------');
            return true;
        }
    } catch (error) {
        console.error('Error sending reset email:', error);
        return false;
    }
};

module.exports = { sendVerificationEmail, sendEmailAlert, sendWelcomeEmail, sendPasswordResetEmail };
