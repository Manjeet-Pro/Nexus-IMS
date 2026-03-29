const mongoose = require('mongoose');
const Student = require('../../3_Student_Management_Module/backend/Student');
const Faculty = require('../../5_Faculty_Management_Module/backend/Faculty');
require('dotenv').config({ path: './.env' });

const verify = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nexus');
        console.log('Connected to MongoDB');

        const student = await Student.findOne();
        console.log('Sample Student createdAt:', student ? student.createdAt : 'No student found');

        const countWithDate = await Student.countDocuments({ createdAt: { $exists: true } });
        console.log('Students with createdAt:', countWithDate);

        const faculty = await Faculty.findOne();
        console.log('Sample Faculty createdAt:', faculty ? faculty.createdAt : 'No faculty found');

        const facWithDate = await Faculty.countDocuments({ createdAt: { $exists: true } });
        console.log('Faculty with createdAt:', facWithDate);

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

verify();
