const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Notice = require('./models/Notice');
const User = require('./models/User');

dotenv.config();

const seedNotices = async () => {
    try {
        console.log("Connecting to DB...");
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected.");

        // Get an admin user to be the 'postedBy'
        const adminUser = await User.findOne({ role: 'admin' });
        const posterId = adminUser ? adminUser._id : null;

        if (!posterId) {
            console.log("⚠️ No admin user found. Notices will be posted without an author.");
        }

        console.log("Clearing existing notices...");
        await Notice.deleteMany({});

        const notices = [
            {
                title: 'End Semester Examination Schedule - Spring 2026',
                content: 'The tentative schedule for End Semester Examinations has been released. Please download the PDF for detailed datesheet.',
                date: '06 Feb 2026',
                type: 'academic',
                audience: 'All Students',
                attachmentUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                postedBy: posterId
            },
            {
                title: 'Holiday Declaration - Mahashivratri',
                content: 'The institute will remain closed on 14th Feb 2026 on account of Mahashivratri. All scheduled classes stand cancelled.',
                date: '05 Feb 2026',
                type: 'holiday',
                audience: 'All',
                postedBy: posterId
            },
            {
                title: 'Project Submission Guidelines for Final Year',
                content: 'All final year students must adhere to the attached guidelines for project report submission. Deadline: 20th March.',
                date: '02 Feb 2026',
                type: 'academic',
                audience: 'Final Year',
                attachmentUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                postedBy: posterId
            },
            {
                title: 'Inter-College Hackathon Registration',
                content: 'Registrations are open for the annual hackathon. Teams of 3-4 members can register via the student portal before 15th Feb.',
                date: '30 Jan 2026',
                type: 'event',
                audience: 'All Students',
                attachmentUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                postedBy: posterId
            }
        ];

        console.log("Creating new notices...");
        await Notice.insertMany(notices);
        console.log("✅ Notices seeded successfully.");

    } catch (error) {
        console.error("❌ Seeding Error:", error);
    } finally {
        await mongoose.connection.close();
    }
};

seedNotices();
