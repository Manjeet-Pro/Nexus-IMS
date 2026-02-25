const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Faculty = require('./models/Faculty');
const User = require('./models/User');

dotenv.config({ path: './server/.env' });

const debugDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        console.log('\n--- Checking Users ---');
        const users = await User.find({});
        console.log(`Found ${users.length} users.`);
        users.forEach(u => console.log(`- [${u.role}] ${u.name} (${u.email}) ID: ${u._id}`));

        console.log('\n--- Checking Faculty ---');
        const facultyMembers = await Faculty.find({});
        console.log(`Found ${facultyMembers.length} faculty records (raw).`);

        console.log('\n--- Checking Faculty with Populate ---');
        const populatedFaculty = await Faculty.find().populate('user');
        populatedFaculty.forEach(f => {
            console.log(`- Dept: ${f.department}, Designation: ${f.designation}`);
            if (f.user) {
                console.log(`  -> Linked User: ${f.user.name} (${f.user.email})`);
            } else {
                console.log(`  -> LINKED USER IS NULL OR MISSING! (Raw User ID: ${f.user})`);
            }
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected.');
    }
};

debugDB();
