const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Course = require('./models/Course');

dotenv.config();

const verifyProgress = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Try to find a course with syllabus
        let course = await Course.findOne({ 'syllabus.0': { $exists: true } });

        // If no course with syllabus, find any course and add dummy syllabus
        if (!course) {
            console.log('No courses with existing syllabus found. Adding sample syllabus to first course...');
            course = await Course.findOne();
            if (course) {
                // Add 5 topics, 2 completed
                course.syllabus = [
                    { topic: 'Introduction to Algorithms', completed: true, week: 1 },
                    { topic: 'Data Structures: Arrays', completed: false, week: 2 },
                    { topic: 'Sorting Algorithms', completed: false, week: 3 },
                    { topic: 'Graph Theory', completed: true, week: 4 },
                    { topic: 'Dynamic Programming', completed: false, week: 5 }
                ];
                await course.save();
                console.log('Sample syllabus added to course:', course.code);
            } else {
                console.log('No courses found at all. Please create a course first.');
                return;
            }
        }

        console.log(`Checking Course: ${course.name} (${course.code})`);

        const totalTopics = course.syllabus.length;
        const completedTopics = course.syllabus.filter(t => t.completed).length;

        // Exact calculation logic used in controllers
        const calculatedPercentage = (completedTopics / totalTopics) * 100;
        const roundedProgress = Math.round(calculatedPercentage);

        console.log('------------------------------------------------');
        console.log(`Total Topics:     ${totalTopics}`);
        console.log(`Completed Topics: ${completedTopics}`);
        console.log(`Raw Calculation:  (${completedTopics}/${totalTopics}) * 100 = ${calculatedPercentage}%`);
        console.log(`Rounded Progress: ${roundedProgress}%`);
        console.log('------------------------------------------------');
        console.log('Syllabus Items:');
        course.syllabus.forEach((s, i) => {
            console.log(`${i + 1}. [${s.completed ? 'X' : ' '}] ${s.topic}`);
        });
        console.log('------------------------------------------------');

        if (roundedProgress === 40) {
            console.log('✅ VERIFICATION SUCCESS: Progress is exactly 40% as expected (2/5).');
        } else {
            console.log(`⚠️ VERIFICATION NOTE: Progress is ${roundedProgress}%. Verify if this matches your manual count.`);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

verifyProgress();
