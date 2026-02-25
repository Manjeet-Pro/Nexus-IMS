const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Models
const Student = require('./models/Student');
const Mark = require('./models/Mark');
const User = require('./models/User');
const Course = require('./models/Course');

const checkData = async () => {
    try {
        const MONGODB_URI = process.env.MONGODB_URI;
        if (!MONGODB_URI) {
            console.error("MONGODB_URI is undefined!");
            return;
        }

        await mongoose.connect(MONGODB_URI);

        console.log("--- DATA VERIFICATION START ---");

        // Check Users
        const userCount = await User.countDocuments();
        const studentUsers = await User.countDocuments({ role: 'student' });
        const facultyUsers = await User.countDocuments({ role: 'faculty' });
        console.log(`Users: Total=${userCount}, Student=${studentUsers}, Faculty=${facultyUsers}`);

        // Check Students
        const studentCount = await Student.countDocuments();
        console.log(`Student Profiles: ${studentCount}`);

        if (studentCount > 0) {
            const sampleStudent = await Student.findOne().populate('user', 'name');
            console.log(`Sample: ${sampleStudent.user?.name} (${sampleStudent.rollNo})`);
        }

        // Check Courses
        const courseCount = await Course.countDocuments();
        console.log(`Courses: ${courseCount}`);

        // Check Marks
        const markCount = await Mark.countDocuments();
        console.log(`Marks: ${markCount}`);

        if (markCount > 0) {
            const sampleMark = await Mark.findOne().populate('course');
            console.log(`Sample Mark: ${sampleMark.marks}/${sampleMark.total} in ${sampleMark.course?.name}`);
        } else {
            console.log("WARNING: Zero marks found!");
        }

        // Real Names Check
        console.log("--- Users Sample ---");
        const users = await User.find({ role: 'student' }).limit(5).select('name email');
        users.forEach(u => console.log(`- ${u.name} (${u.email})`));

        console.log("--- DATA VERIFICATION END ---");

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
};

checkData();
