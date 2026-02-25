const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Student = require('./models/Student');
const Faculty = require('./models/Faculty');
const bcrypt = require('bcryptjs');

dotenv.config();

const resetAndTest = async () => {
    try {
        console.log("1. Connecting to DB...");
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("   Connected.");

        // --- RESET ---
        console.log("2. Clearing Database...");
        await User.deleteMany({});
        await Student.deleteMany({});
        await Faculty.deleteMany({});
        console.log("   Database Cleared.");

        // --- ADMIN SETUP ---
        console.log("3. Creating Admin User...");
        const salt = await bcrypt.genSalt(10);
        const hashedPwd = await bcrypt.hash("password", salt);
        const admin = await User.create({
            name: "Admin User",
            email: "admin@nexus.com",
            password: hashedPwd,
            role: "admin"
        });
        console.log("   Admin Created:", admin.email);

        // --- REGISTRATION TEST (Simulation) ---
        console.log("4. Simulating Faculty Registration...");
        const facPwd = await bcrypt.hash("password123", salt);
        const facultyUser = await User.create({
            name: "Dr. Amit Sharma",
            email: "faculty@nexus.com",
            password: facPwd,
            role: "faculty"
        });
        const facultyProfile = await Faculty.create({
            user: facultyUser._id,
            department: "Computer Science",
            designation: "Professor"
        });
        console.log("   Faculty Registered & Profiled:", facultyProfile.department);

        console.log("5. Simulating Student Registration (via Admin API logic)...");
        const stuPwd = await bcrypt.hash("password123", salt);
        const studentUser = await User.create({
            name: "Priya Patel",
            email: "student@nexus.com",
            password: stuPwd,
            role: "student"
        });
        const studentProfile = await Student.create({
            user: studentUser._id,
            rollNo: "STU2024001",
            course: "B.Tech CSE",
            year: "1st Year"
        });
        console.log("   Student Registered & Profiled:", studentProfile.rollNo);

        // --- COURSE & ENROLLMENT ---
        console.log("6. Creating Course & Enrollment...");
        const Course = require('./models/Course');
        const course = await Course.create({
            name: "Data Structures",
            code: "CS101",
            credits: 4,
            department: "Computer Science",
            semester: "1st",
            instructor: facultyProfile._id,
            schedule: [
                { day: "Monday", startTime: "10:00", endTime: "11:00", room: "LT-1" },
                { day: "Wednesday", startTime: "10:00", endTime: "11:00", room: "LT-1" }
            ],
            studentsEnrolled: [studentProfile._id]
        });
        console.log("   Course Created & Student Enrolled:", course.name);

        console.log("\n✅ ALL CHECKS PASSED. Database is reset and ready.");
        console.log("   - Admin Login: admin@nexus.com / password");
        console.log("   - Faculty Login: faculty@nexus.com / password123");
        console.log("   - Student Login: student@nexus.com / password123");

    } catch (error) {
        console.error("❌ TEST FAILED:", error);
    } finally {
        await mongoose.connection.close();
    }
};

resetAndTest();
