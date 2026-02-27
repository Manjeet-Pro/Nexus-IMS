const mongoose = require('mongoose');

// REPLACE THIS with your connection string if it's not in .env
const MONGODB_URI = 'mongodb+srv://nexus_ims:rnU5lUChdc1IFQs4@cluster0.e9kx9z8.mongodb.net/?appName=Cluster0';

const User = require('./models/User');

async function run() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('--- Database Records Check ---');

        const users = await User.find({}).select('name email role isVerified createdAt');

        if (users.length === 0) {
            console.log('ℹ️ No users found in the database.');
        } else {
            console.log(`✅ Found ${users.length} users:`);
            users.forEach((u, i) => {
                console.log(`${i + 1}. [${u.role}] ${u.name} (${u.email}) - Verified: ${u.isVerified} - Created: ${u.createdAt}`);
            });

            // Auto-fix: Verify all current users just in case
            console.log('\n🔧 Auto-fixing: Verifying all existing users...');
            await User.updateMany({ isVerified: false }, { isVerified: true });
            console.log('✅ All users are now verified.');
        }

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

run();
