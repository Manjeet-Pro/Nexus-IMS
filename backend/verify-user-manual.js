const mongoose = require('mongoose');
const User = require('./models/User');

// UPDATE THIS with your MongoDB URI
const MONGODB_URI = 'mongodb+srv://nexus_ims:rnU5lUChdc1IFQs4@cluster0.e9kx9z8.mongodb.net/?appName=Cluster0';

// UPDATE THIS with the email you want to verify
const EMAIL_TO_VERIFY = 'iitzmanjeet07@gmail.com';

async function run() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('--- Manual User Verification ---');

        const user = await User.findOne({ email: EMAIL_TO_VERIFY });

        if (!user) {
            console.log(`❌ Error: User with email ${EMAIL_TO_VERIFY} not found.`);
            process.exit(1);
        }

        if (user.isVerified) {
            console.log(`ℹ️ User ${EMAIL_TO_VERIFY} is already verified.`);
        } else {
            user.isVerified = true;
            await user.save();
            console.log(`✅ SUCCESS: User ${EMAIL_TO_VERIFY} has been manually verified!`);
            console.log('You can now log in with this account on the website.');
        }

    } catch (err) {
        console.error('❌ Database Error:', err.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

run();
