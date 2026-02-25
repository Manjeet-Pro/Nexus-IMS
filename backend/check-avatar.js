const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Student = require('./models/Student');
const User = require('./models/User');

dotenv.config();

const checkAvatar = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const studentId = '698e00368832e208fde29037';

        // Find student first to get user ID
        const student = await Student.findById(studentId).populate('user');

        if (!student) {
            console.log('Student not found with ID:', studentId);
            const user = await User.findById(studentId);
            if (user) {
                console.log('Found User with this ID instead:', user);
            } else {
                console.log('No User found either.');
            }
            return;
        }

        console.log('Student Found:', student.user.name);
        console.log('Avatar Field:', student.user.avatar);
        console.log('Avatar Type:', typeof student.user.avatar);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

checkAvatar();
