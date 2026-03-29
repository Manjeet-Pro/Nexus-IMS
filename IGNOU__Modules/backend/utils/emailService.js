const nodemailer = require('nodemailer');


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

/**
 * Send a 6-digit OTP for email verification
 * @param {string} email - Recipient email
 * @param {string} otp - 6-digit OTP code
 */
const sendOTPEmail = async (email, otp) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        const mailOptions = {
            from: `"Nexus Institute" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Nexus Account Verification Code',
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
                    <div style="background-color: #4F46E5; padding: 24px; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 24px;">Nexus Institute</h1>
                    </div>
                    <div style="padding: 32px; background-color: white; text-align: center;">
                        <h2 style="color: #111827; margin-top: 0;">Verify Your Email</h2>
                        <p style="color: #4b5563; line-height: 1.6; font-size: 16px;">
                            Thank you for joining Nexus! Please use the following One-Time Password (OTP) to verify your email address.
                        </p>
                        <div style="margin: 32px 0; padding: 20px; background-color: #f3f4f6; border-radius: 12px; letter-spacing: 12px; font-size: 36px; font-weight: bold; color: #4F46E5;">
                            ${otp}
                        </div>
                        <p style="color: #6b7280; font-size: 14px;">
                            This code is valid for 10 minutes. If you did not request this, please ignore this email.
                        </p>
                    </div>
                    <div style="background-color: #f9fafb; padding: 16px; text-align: center; border-top: 1px solid #e5e7eb;">
                        <p style="color: #9ca3af; font-size: 12px; margin: 0;">&copy; 2024 Nexus Institute Management System. All rights reserved.</p>
                    </div>
                </div>
            `
        };

        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            await transporter.sendMail(mailOptions);
            console.log('✅ OTP email sent to:', email);
            return true;
        } else {
            console.log('--- OTP EMAIL SIMULATION ---');
            console.log(`To: ${email}`);
            console.log(`OTP: ${otp}`);
            console.log('----------------------------');
            return true;
        }
    } catch (error) {
        console.error('❌ Error sending OTP email:', error);
        return false;
    }
};

/**
 * Send a 6-digit OTP for password reset
 * @param {string} email - Recipient email
 * @param {string} otp - 6-digit OTP code
 */
const sendPasswordResetOTPEmail = async (email, otp) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        const mailOptions = {
            from: `"Nexus Institute" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Nexus Password Reset Code',
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
                    <div style="background-color: #4F46E5; padding: 24px; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 24px;">Nexus Institute</h1>
                    </div>
                    <div style="padding: 32px; background-color: white; text-align: center;">
                        <h2 style="color: #111827; margin-top: 0;">Password Reset Request</h2>
                        <p style="color: #4b5563; line-height: 1.6; font-size: 16px;">
                            You are receiving this because you have requested to reset your password. Please use the following One-Time Password (OTP) to complete the process.
                        </p>
                        <div style="margin: 32px 0; padding: 20px; background-color: #f3f4f6; border-radius: 12px; letter-spacing: 12px; font-size: 36px; font-weight: bold; color: #4F46E5;">
                            ${otp}
                        </div>
                        <p style="color: #6b7280; font-size: 14px;">
                            This code is valid for 10 minutes. If you did not request this, please ignore this email.
                        </p>
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
            console.log('--- PASSWORD RESET OTP SIMULATION ---');
            console.log(`To: ${email}`);
            console.log(`OTP: ${otp}`);
            console.log('----------------------------');
            return true;
        }
    } catch (error) {
        console.error('Error sending password reset OTP email:', error);
        return false;
    }
};

module.exports = { sendEmailAlert, sendWelcomeEmail, sendOTPEmail, sendPasswordResetOTPEmail };
