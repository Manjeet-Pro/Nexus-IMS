const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Student = require('./models/Student');
const Course = require('./models/Course');
const Mark = require('./models/Mark');
const User = require('./models/User');

dotenv.config();

const seedMarksForStudent = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error("MONGODB_URI is not defined in environment variables.");
        }
        console.log("Connecting to DB...");
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected.");

        // Get all students
        const students = await Student.find().select('_id');

        if (students.length === 0) {
            console.log("❌ No students found.");
            return;
        }

        console.log(`Found ${students.length} students.`);

        // Get all courses
        const courses = await Course.find().select('_id').limit(5);

        if (courses.length === 0) {
            console.log("❌ No courses found. Please run seed-courses.js first.");
            return;
        }

        const examTypes = ['Mid-Term', 'End-Term', 'Assignment', 'Quiz'];
        let totalMarksCreated = 0;

        for (const student of students) {
            // Clear existing marks for this student
            await Mark.deleteMany({ student: student._id });

            const marksData = [];

            // Create marks for each course
            for (const course of courses) {
                const numExams = Math.floor(Math.random() * 2) + 2; // 2 or 3 exams

                // Randomly shuffle exam types to ensure variety (especially 'Quiz')
                const shuffledTypes = [...examTypes].sort(() => 0.5 - Math.random());
                const selectedExams = shuffledTypes.slice(0, numExams);

                for (const examType of selectedExams) {
                    const score = Math.floor(Math.random() * (98 - 65 + 1)) + 65; // Random score between 65 and 98

                    // Random date in last 30 days
                    const date = new Date();
                    date.setDate(date.getDate() - Math.floor(Math.random() * 30));

                    marksData.push({
                        student: student._id,
                        course: course._id,
                        type: examType,
                        marks: score,
                        total: 100,
                        date: date
                    });
                }
            }

            if (marksData.length > 0) {
                await Mark.insertMany(marksData);
                totalMarksCreated += marksData.length;
                console.log(`✅ Created ${marksData.length} marks for student ${student._id}`);
            }
        }

        console.log(`\n✅ Successfully seeded total ${totalMarksCreated} marks for ${students.length} students.`);

    } catch (error) {
        console.error("❌ Seeding Error:", error);
    } finally {
        await mongoose.connection.close();
        console.log("\nDatabase connection closed.");
    }
};

seedMarksForStudent();
