const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

const testEmail = async () => {
    try {
        const recipient = process.argv[2] || process.env.EMAIL_USER;
        console.log(`Testing email sending to: ${recipient}...`);

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
            from: `"Nexus Test" <${process.env.EMAIL_USER}>`,
            to: recipient,
            subject: "Test Email from Nexus",
            text: "If you are reading this, your Nexus email service is working correctly!",
            html: "<b>If you are reading this, your Nexus email service is working correctly!</b>"
        });

        console.log("✅ SUCCESS! Message sent: %s", info.messageId);
        console.log("Accepted recipients:", info.accepted);
    } catch (error) {
        console.error("❌ ERROR occurred:", error.message);
    }
}

testEmail();
