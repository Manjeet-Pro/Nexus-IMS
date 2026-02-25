const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });

const backfill = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nexus');
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;

        // Processing Students
        const students = await db.collection('students').find({}).toArray();
        console.log(`Processing ${students.length} students...`);

        for (const student of students) {
            const user = await db.collection('users').findOne({ _id: student.user });
            if (user && user.createdAt) {
                console.log(`Setting date for User ${user.name}: ${user.createdAt}`);
                await db.collection('students').updateOne(
                    { _id: student._id },
                    { $set: { createdAt: user.createdAt, updatedAt: user.createdAt } }
                );
            } else {
                console.log(`Setting current date for User ${student.user || 'Unknown'}`);
                await db.collection('students').updateOne(
                    { _id: student._id },
                    { $set: { createdAt: new Date(), updatedAt: new Date() } }
                );
            }
        }

        // Processing Faculty
        const faculty = await db.collection('faculties').find({}).toArray();
        console.log(`Processing ${faculty.length} faculty members...`);

        for (const fac of faculty) {
            const user = await db.collection('users').findOne({ _id: fac.user });
            if (user && user.createdAt) {
                console.log(`Setting date for User ${user.name}: ${user.createdAt}`);
                await db.collection('faculties').updateOne(
                    { _id: fac._id },
                    { $set: { createdAt: user.createdAt, updatedAt: user.createdAt } }
                );
            } else {
                console.log(`Setting current date for User ${fac.user || 'Unknown'}`);
                await db.collection('faculties').updateOne(
                    { _id: fac._id },
                    { $set: { createdAt: new Date(), updatedAt: new Date() } }
                );
            }
        }

        console.log('Raw backfill complete!');
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

backfill();
