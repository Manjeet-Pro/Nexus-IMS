const nodemailer = require('nodemailer');
const logger = require('./logger');

// Create a single transporter instance
let transporter = null;

const getTransporter = () => {
    if (transporter) return transporter;

    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;
    const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
    const port = parseInt(process.env.EMAIL_PORT) || 465;
    const secure = process.env.EMAIL_SECURE === 'true' || port === 465;

    if (!user || !pass) {
        logger.warn('Email credentials missing. Email service will run in SIMULATION mode.');
        return null;
    }

    try {
        const transportConfig = {
            auth: { user, pass },
            tls: { rejectUnauthorized: false },
            connectionTimeout: 20000,
            greetingTimeout: 20000,
            socketTimeout: 20000
        };

        // If host is Gmail, use the built-in service driver which is often more reliable
        if (host === 'smtp.gmail.com') {
            transportConfig.service = 'gmail';
        } else {
            transportConfig.host = host;
            transportConfig.port = port;
            transportConfig.secure = secure;
        }

        transporter = nodemailer.createTransport(transportConfig);
        logger.info(`Email transporter initialized: ${host === 'smtp.gmail.com' ? 'Gmail Service' : host}`);
        return transporter;
    } catch (error) {
        logger.error('Failed to initialize email transporter:', error.message);
        return null;
    }
};

/**
 * Verify the transporter connection
 */
const verifyTransporter = async () => {
    const mailTransporter = getTransporter();
    if (!mailTransporter) {
        logger.warn('Email Service: Running in SIMULATION mode (Check .env)');
        return false;
    }
    try {
        await mailTransporter.verify();
        logger.info('✅ Email Service: Ready to send emails');
        return true;
    } catch (error) {
        logger.error('❌ Email Service Error:', error.message);
        if (error.message.includes('EAUTH')) {
            logger.error('Suggestion: Check your EMAIL_USER and EMAIL_PASS (App Password / API Key).');
        } else if (error.message.includes('ETIMEDOUT') || error.message.includes('ESOCKET')) {
            logger.error('Suggestion: SMTP Port might be blocked. Try Port 2525 with EMAIL_SECURE=false.');
        } else {
            logger.error('Suggestion: If using Gmail on Render/Cloud, it might be blocked. Switch to Brevo (smtp-relay.brevo.com) for 100% reliability.');
        }
        return false;
    }
};

/**
 * Send a generic email alert
 */
const sendEmailAlert = async (to, subject, title, body, actionLink = null) => {
    try {
        const mailTransporter = getTransporter();

        if (mailTransporter) {
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
            await mailTransporter.sendMail(mailOptions);
            return true;
        } else {
            logger.info('--- EMAIL SIMULATION ---');
            logger.info(`To: ${to} | Subject: ${subject}`);
            return true;
        }
    } catch (error) {
        logger.error('Error sending email alert:', error.message);
        return false;
    }
};

/**
 * Send a welcome email after successful registration
 */
const sendWelcomeEmail = async (email, name) => {
    try {
        const mailTransporter = getTransporter();

        if (mailTransporter) {
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
            await mailTransporter.sendMail(mailOptions);
            logger.info('Welcome email sent to:', email);
            return true;
        }
        return false;
    } catch (error) {
        logger.error('Error sending welcome email:', error.message);
        return false;
    }
};

/**
 * Send a 6-digit OTP for email verification
 */
const sendOTPEmail = async (email, otp) => {
    try {
        const mailTransporter = getTransporter();
        const hostUsed = process.env.EMAIL_HOST || 'smtp.gmail.com';

        if (mailTransporter) {
            logger.info(`Attempting to send OTP to ${email} via ${hostUsed}...`);
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
            await mailTransporter.sendMail(mailOptions);
            logger.info('✅ OTP email sent to:', email);
            return true;
        } else {
            logger.warn('--- OTP EMAIL FALLBACK (CONSOLE) ---');
            logger.warn(`To: ${email} | OTP: ${otp}`);
            return true;
        }
    } catch (error) {
        logger.error('❌ Error sending OTP email:', error.message);
        logger.warn(`FALLBACK OTP FOR ${email}: ${otp}`);
        return false;
    }
};

/**
 * Send a 6-digit OTP for password reset
 */
const sendPasswordResetOTPEmail = async (email, otp) => {
    try {
        const mailTransporter = getTransporter();
        const hostUsed = process.env.EMAIL_HOST || 'smtp.gmail.com';

        if (mailTransporter) {
            logger.info(`Attempting to send Password Reset OTP to ${email} via ${hostUsed}...`);
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
            await mailTransporter.sendMail(mailOptions);
            return true;
        } else {
            logger.warn('--- PASSWORD RESET OTP FALLBACK (CONSOLE) ---');
            logger.warn(`To: ${email} | OTP: ${otp}`);
            return true;
        }
    } catch (error) {
        logger.error('Error sending password reset OTP email:', error.message);
        logger.warn(`FALLBACK RESET OTP FOR ${email}: ${otp}`);
        return false;
    }
};

module.exports = { sendEmailAlert, sendWelcomeEmail, sendOTPEmail, sendPasswordResetOTPEmail, verifyTransporter };
