const mongoose = require('mongoose');
const User = require('./backend/models/User');
const Student = require('./backend/models/Student');
const Faculty = require('./backend/models/Faculty');
require('dotenv').config({ path: './backend/.env' });

const backfill = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nexus');
        console.log('Connected to MongoDB');

        // Backfill Students
        const students = await Student.find({ createdAt: { $exists: false } }).populate('user');
        console.log(`Found ${students.length} students to backfill`);

        for (const student of students) {
            if (student.user && student.user.createdAt) {
                await Student.updateOne(
                    { _id: student._id },
                    { $set: { createdAt: student.user.createdAt, updatedAt: student.user.updatedAt || student.user.createdAt } }
                );
            } else {
                // Fallback to now if user doesn't have it (unlikely)
                await Student.updateOne(
                    { _id: student._id },
                    { $set: { createdAt: new Date(), updatedAt: new Date() } }
                );
            }
        }

        // Backfill Faculty
        const faculty = await Faculty.find({ createdAt: { $exists: false } }).populate('user');
        console.log(`Found ${faculty.length} faculty members to backfill`);

        for (const fac of faculty) {
            if (fac.user && fac.user.createdAt) {
                await Faculty.updateOne(
                    { _id: fac._id },
                    { $set: { createdAt: fac.user.createdAt, updatedAt: fac.user.updatedAt || fac.user.createdAt } }
                );
            } else {
                await Faculty.updateOne(
                    { _id: fac._id },
                    { $set: { createdAt: new Date(), updatedAt: new Date() } }
                );
            }
        }

        console.log('Backfill complete!');
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

backfill();
