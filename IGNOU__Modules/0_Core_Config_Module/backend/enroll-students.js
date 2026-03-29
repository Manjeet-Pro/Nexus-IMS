const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Student = require('../../3_Student_Management_Module/backend/Student');
const Course = require('../../6_Academic_Course_Management_Module/backend/Course');

dotenv.config();

const enrollStudentsInCourses = async () => {
    try {
        console.log("Connecting to DB...");
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected.");

        // Get all students
        const students = await Student.find();
        console.log(`Found ${students.length} students.`);

        if (students.length === 0) {
            console.log("❌ No students found in database.");
            return;
        }

        // Get all courses
        const courses = await Course.find();
        console.log(`Found ${courses.length} courses.`);

        if (courses.length === 0) {
            console.log("❌ No courses found. Please run seed-courses.js first.");
            return;
        }

        let enrollmentCount = 0;

        // Enroll each student in all available courses
        for (const course of courses) {
            // Clear existing enrollments first
            course.studentsEnrolled = [];

            // Add all students to this course
            for (const student of students) {
                if (!course.studentsEnrolled.includes(student._id)) {
                    course.studentsEnrolled.push(student._id);
                    enrollmentCount++;
                }
            }

            await course.save();
            console.log(`✅ Enrolled ${students.length} students in ${course.name} (${course.code})`);
        }

        console.log(`\n🎉 Success! Total enrollments: ${enrollmentCount}`);
        console.log(`📊 Summary:`);
        console.log(`   - Students: ${students.length}`);
        console.log(`   - Courses: ${courses.length}`);
        console.log(`   - Total Enrollments: ${enrollmentCount}`);

    } catch (error) {
        console.error("❌ Enrollment Error:", error);
    } finally {
        await mongoose.connection.close();
        console.log("\nDatabase connection closed.");
    }
};

enrollStudentsInCourses();
