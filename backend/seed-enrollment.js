const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Student = require('./models/Student');
const Course = require('./models/Course');
const Faculty = require('./models/Faculty');

dotenv.config();

const seedEnrollment = async () => {
    try {
        console.log("Connecting to DB...");
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected.");

        // 1. Get Student (student@nexus.com)
        const studentUser = await User.findOne({ email: 'student@nexus.com' });
        if (!studentUser) {
            console.log("❌ Student user not found. Please run reset-and-test.js first.");
            return;
        }
        const student = await Student.findOne({ user: studentUser._id });
        if (!student) {
            console.log("❌ Student profile not found.");
            return;
        }

        // update student stats and profile
        student.cgpa = 8.5;
        student.backlogs = 0;
        student.course = 'B.Tech Computer Science';
        student.year = '2nd Year';
        student.semester = '3rd';
        student.rollNo = 'CS2401';
        await student.save();

        // 2. Get Faculty (faculty@nexus.com)
        const facultyUser = await User.findOne({ email: 'faculty@nexus.com' });
        const faculty = await Faculty.findOne({ user: facultyUser._id });

        // 3. Create Courses
        console.log("Creating Courses...");

        // Clear existing courses to avoid duplicates for this test
        await Course.deleteMany({});

        const coursesData = [
            {
                name: 'Data Structures & Algorithms',
                code: 'CS301',
                credits: 4,
                department: 'CSE',
                semester: '3rd',
                semester: '3rd',
                instructor: faculty._id,
                schedule: [
                    { day: 'Monday', startTime: '14:00', endTime: '16:00', room: '302' },
                    { day: 'Wednesday', startTime: '14:00', endTime: '16:00', room: '302' }
                ]
            },
            {
                name: 'Database Management Systems',
                code: 'CS304',
                credits: 3,
                department: 'CSE',
                semester: '3rd',
                instructor: faculty._id,
                schedule: [
                    { day: 'Tuesday', startTime: '10:00', endTime: '11:30', room: '105' },
                    { day: 'Thursday', startTime: '10:00', endTime: '11:30', room: '105' }
                ]
            },
            {
                name: 'Computer Networks',
                code: 'CS305',
                credits: 4,
                department: 'CSE',
                semester: '3rd',
                instructor: faculty._id,
                schedule: [
                    { day: 'Friday', startTime: '09:00', endTime: '11:00', room: '201' }
                ]
            }
        ];

        const createdCourses = await Course.insertMany(coursesData);
        console.log(`✅ Created ${createdCourses.length} courses.`);

        // 4. Enroll Student in Courses
        console.log("Enrolling Student...");

        for (const course of createdCourses) {
            course.studentsEnrolled.push(student._id);
            await course.save();
        }

        // 5. Update Student Attendance mock data
        student.attendance = [
            { subject: 'CS301', present: 24, total: 30 }, // 80%
            { subject: 'CS304', present: 18, total: 25 }, // 72%
            { subject: 'CS305', present: 28, total: 30 }  // 93%
        ];
        await student.save();

        console.log("✅ Student enrolled and attendance updated.");

    } catch (error) {
        console.error("❌ Seeding Error:", error);
    } finally {
        await mongoose.connection.close();
    }
};

seedEnrollment();
