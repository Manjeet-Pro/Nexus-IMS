const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Student = require('./models/Student');

dotenv.config();

const checkStudent = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const users = await User.find({ role: 'student' });
        console.log(`Found ${users.length} users with role 'student'.`);

        for (const user of users) {
            const student = await Student.findOne({ user: user._id });
            if (!student) {
                console.log(`❌ User ${user.email} (${user._id}) has NO Linked Student Profile. Creating one...`);
                await Student.create({
                    user: user._id,
                    enrollmentNo: `ENR${Math.floor(Math.random() * 100000)}`,
                    rollNo: `R${Math.floor(Math.random() * 1000)}`,
                    course: 'B.Tech',
                    year: '3rd Year',
                    department: 'Computer Science'
                });
                console.log(`✅ Created Student profile for ${user.email}`);
            } else {
                console.log(`✅ User ${user.email} is linked to Student ${student._id}.`);
            }
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

checkStudent();
