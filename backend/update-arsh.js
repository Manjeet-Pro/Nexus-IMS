const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const User = require('./models/User');
const Student = require('./models/Student');

const updateArsh = async () => {
    try {
        const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nexus_db';
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const users = await User.find({ name: /Arsh/i });
        console.log(`Found ${users.length} users matching 'Arsh'`);

        for (const user of users) {
            console.log(`Checking user: ${user.name} (${user.role})`);
            if (user.role === 'student' || user.name.toLowerCase().includes('arsh halwe')) {
                const student = await Student.findOne({ user: user._id });
                if (student) {
                    const oldRoll = student.rollNo;
                    student.rollNo = 'R01';
                    await student.save();
                    console.log(`Successfully updated ${user.name}: ${oldRoll} -> R01`);
                } else {
                    console.log(`No student record found for ${user.name}`);
                }
            }
        }

        console.log('Update complete.');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

updateArsh();
