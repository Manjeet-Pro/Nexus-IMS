const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Student = require('./models/Student');
const User = require('./models/User');

const listStudents = async () => {
    try {
        const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nexus_db';
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const students = await Student.find().populate('user', 'name email role');
        console.log(`Found ${students.length} students in 'students' collection:`);

        students.forEach((s, i) => {
            if (!s.user) {
                console.log(`${i + 1}. [ORPHAN STUDENT] ID: ${s._id} - User field is null/missing`);
            } else {
                console.log(`${i + 1}. Name: ${s.user.name}, Email: ${s.user.email}, RollNo: ${s.rollNo}`);
            }
        });

        const users = await User.find({ role: 'student' });
        console.log(`\nFound ${users.length} users with role 'student' in 'users' collection:`);
        users.forEach((u, i) => {
            console.log(`${i + 1}. Name: ${u.name}, Email: ${u.email}, ID: ${u._id}`);
        });

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

listStudents();
