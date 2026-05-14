const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

const testEmail = async () => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: 'Test Email',
            text: 'This is a test email from Nexus.'
        });

        console.log('Message sent: %s', info.messageId);
    } catch (error) {
        console.error('Error occurred:', error.message);
    }
};

testEmail();
