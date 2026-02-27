const nodemailer = require('nodemailer');

// 1. UPDATE THESE with your real Gmail details
const EMAIL_USER = 'ms1813403@gmail.com';
const EMAIL_PASS = 'wgbaorggakynhmbm'; // YOUR 16-DIGIT APP PASSWORD

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
    }
});

console.log('--- Email Connection Test ---');
console.log('Testing email for:', EMAIL_USER);

const mailOptions = {
    from: EMAIL_USER,
    to: EMAIL_USER, // Sending to yourself for testing
    subject: 'Nexus Email Test',
    text: 'If you see this, your Gmail App Password is working!'
};

transporter.sendMail(mailOptions)
    .then(info => {
        console.log('✅ SUCCESS: Email sent successfully!');
        console.log('Message ID:', info.messageId);
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ FAILED: Email error:');
        console.error(err.message);

        if (err.message.includes('Invalid login')) {
            console.log('\n💡 TIP: Aapka App Password galat hai. Google Security -> App Passwords mein ja kar naya code generate karein.');
        } else if (err.message.includes('Username and Password not accepted')) {
            console.log('\n💡 TIP: Kya aapne naya 16-digit App Password use kiya hai? Normal password yahan nahi chalega.');
        }
        process.exit(1);
    });
