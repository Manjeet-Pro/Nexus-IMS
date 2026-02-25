const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Course = require('./models/Course');

dotenv.config();

const courses = [
    { name: 'Data Structures', code: 'CSE101', credits: 4, department: 'CSE', semester: '3rd' },
    { name: 'Algorithms', code: 'CSE102', credits: 4, department: 'CSE', semester: '4th' },
    { name: 'Database Management', code: 'CSE103', credits: 3, department: 'CSE', semester: '5th' },
    { name: 'Operating Systems', code: 'CSE104', credits: 4, department: 'CSE', semester: '4th' },
    { name: 'Computer Networks', code: 'CSE105', credits: 3, department: 'CSE', semester: '5th' },
    { name: 'Digital Electronics', code: 'ECE101', credits: 4, department: 'ECE', semester: '3rd' },
    { name: 'Signals and Systems', code: 'ECE102', credits: 4, department: 'ECE', semester: '4th' }
];

const seedCourses = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        await Course.deleteMany({});
        console.log('Cleared existing courses');

        await Course.insertMany(courses);
        console.log('Courses seeded successfully');

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedCourses();
