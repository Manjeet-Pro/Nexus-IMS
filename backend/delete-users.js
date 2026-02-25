
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
// Also delete associated Faculty/Student profiles if they exist
const Faculty = require('./models/Faculty');
const Student = require('./models/Student');

const deleteSpecificUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to database.");

        const emailsToDelete = [
            'admin@nexus.com',
            'faculty@nexus.com',
            'student@nexus.com'
        ];

        console.log(`Deleting users with emails: ${emailsToDelete.join(', ')}...`);

        // Find users first to get their IDs
        const users = await User.find({ email: { $in: emailsToDelete } });

        if (users.length === 0) {
            console.log("No matching users found to delete.");
            return;
        }

        const userIds = users.map(u => u._id);

        // Delete associated profiles
        const facultyResult = await Faculty.deleteMany({ user: { $in: userIds } });
        console.log(`Deleted ${facultyResult.deletedCount} linked Faculty profiles.`);

        const studentResult = await Student.deleteMany({ user: { $in: userIds } });
        console.log(`Deleted ${studentResult.deletedCount} linked Student profiles.`);

        // Delete Users
        const userResult = await User.deleteMany({ _id: { $in: userIds } });
        console.log(`Successfully deleted ${userResult.deletedCount} Users.`);

    } catch (error) {
        console.error("Error deleting users:", error);
    } finally {
        await mongoose.disconnect();
    }
};

deleteSpecificUsers();
