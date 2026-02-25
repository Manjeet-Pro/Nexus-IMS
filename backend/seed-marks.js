const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Student = require('./models/Student');
const Course = require('./models/Course');
const Mark = require('./models/Mark');
const Faculty = require('./models/Faculty');
const User = require('./models/User');

dotenv.config();

const seedMarks = async () => {
    try {
        console.log("Connecting to DB...");
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected.");

        // 1. Get Faculty
        const facultyUser = await User.findOne({ email: 'faculty@nexus.com' });
        const faculty = await Faculty.findOne({ user: facultyUser._id });

        if (!faculty) {
            console.log("❌ Faculty not found.");
            return;
        }

        // 2. Get Courses taught by Faculty
        const courses = await Course.find({ instructor: faculty._id });
        console.log(`Found ${courses.length} courses taught by faculty.`);

        // 3. Clear existing marks
        await Mark.deleteMany({});
        console.log("Cleared existing marks.");

        const marksData = [];

        for (const course of courses) {
            // Get students enrolled in this course
            const students = await Student.find({ _id: { $in: course.studentsEnrolled } });

            for (const student of students) {
                // Generate random marks for Mid-Term
                const score = Math.floor(Math.random() * (95 - 60 + 1)) + 60; // Random score between 60 and 95

                marksData.push({
                    student: student._id,
                    course: course._id,
                    type: 'Mid-Term',
                    marks: score,
                    total: 100
                });
            }
        }

        await Mark.insertMany(marksData);
        console.log(`✅ Created ${marksData.length} mark records.`);

    } catch (error) {
        console.error("❌ Seeding Error:", error);
    } finally {
        await mongoose.connection.close();
    }
};

seedMarks();
