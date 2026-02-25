const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Student = require('./models/Student');
const Faculty = require('./models/Faculty');
const Parent = require('./models/Parent');

const verifyIntegrity = async () => {
    try {
        const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nexus_db';
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const users = await User.find({});
        console.log(`Checking ${users.length} users for role integrity...`);
        console.log('---------------------------------------------------');

        let issuesFound = 0;

        for (const user of users) {
            console.log(`Processing user: ${user.name} (${user.role})`);
            let studentProfile = null;
            let facultyProfile = null;
            let parentProfile = null;

            try {
                studentProfile = await Student.findOne({ user: user._id });
            } catch (e) { console.error(`Error finding Student for ${user._id}:`, e); }

            try {
                facultyProfile = await Faculty.findOne({ user: user._id });
            } catch (e) { console.error(`Error finding Faculty for ${user._id}:`, e); }

            try {
                parentProfile = await Parent.findOne({ user: user._id });
            } catch (e) { console.error(`Error finding Parent for ${user._id}:`, e); }

            let profilesFound = [];
            if (studentProfile) profilesFound.push('Student');
            if (facultyProfile) profilesFound.push('Faculty');
            if (parentProfile) profilesFound.push('Parent');

            console.log(`  Profiles found: ${profilesFound.join(', ') || 'None'}`);

            // Check for multiple profiles
            if (profilesFound.length > 1) {
                console.error(`[CRITICAL] User ${user.name} (${user.email}) has MULTIPLE profiles: ${profilesFound.join(', ')}`);
                issuesFound++;
            }

            // Check for role mismatch
            if (user.role === 'student' && !studentProfile) {
                console.warn(`[WARNING] User ${user.name} is role 'student' but has NO Student profile.`);
            }
            if (user.role === 'faculty' && !facultyProfile) {
                console.warn(`[WARNING] User ${user.name} is role 'faculty' but has NO Faculty profile.`);
            }
            if (user.role === 'parent' && !parentProfile) {
                console.warn(`[WARNING] User ${user.name} is role 'parent' but has NO Parent profile.`);
            }

            // Check for profile mismatch
            if (user.role === 'student' && facultyProfile) {
                console.error(`[ERROR] User ${user.name} is role 'student' but has a FACULTY profile.`);
                issuesFound++;
            }
            if (user.role === 'faculty' && studentProfile) {
                console.error(`[ERROR] User ${user.name} is role 'faculty' but has a STUDENT profile.`);
                issuesFound++;
            }
        }

        if (issuesFound === 0) {
            console.log('✅ Integrity Check Passed: No cross-role contamination found.');
        } else {
            console.log(`❌ Integrity Check Failed: ${issuesFound} issues found.`);
        }

        process.exit();
    } catch (error) {
        console.error('FATAL Error:', error);
        process.exit(1);
    }
};

verifyIntegrity();
