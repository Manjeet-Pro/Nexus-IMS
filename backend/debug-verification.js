const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');

async function debugUserVerification() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        const user = await User.findOne().sort({ createdAt: -1 });

        if (!user) {
            console.log("No users found.");
            return;
        }

        console.log("\n--- Most Recent User Debug ---");
        console.log(`Name: ${user.name}`);
        console.log(`Email: ${user.email}`);
        console.log(`isVerified: ${user.isVerified}`);
        console.log(`verificationToken: ${user.verificationToken}`);
        console.log(`verificationTokenExpire: ${user.verificationTokenExpire}`);
        console.log(`Current Time: ${new Date()}`);

        if (user.verificationTokenExpire) {
            const isExpired = user.verificationTokenExpire < Date.now();
            console.log(`Is Expired: ${isExpired}`);
        }
        console.log("-------------------------------\n");

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
    }
}

debugUserVerification();
