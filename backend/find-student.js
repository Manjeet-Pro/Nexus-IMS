const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const User = require('./models/User');
const Student = require('./models/Student');

const findStudent = async (namePattern) => {
    try {
        const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nexus_db';
        await mongoose.connect(MONGODB_URI);
        const user = await User.findOne({ name: new RegExp(namePattern, 'i') });
        if (!user) {
            console.log('User not found');
            process.exit(0);
        }
        const student = await Student.findOne({ user: user._id });
        if (!student) {
            console.log('Student record not found for user: ' + user.name);
            process.exit(0);
        }
        console.log(JSON.stringify({ user, student }, null, 2));
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

findStudent(process.argv[2] || 'Arsh');
