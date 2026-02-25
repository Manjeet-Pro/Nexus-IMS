const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Faculty = require('./models/Faculty');

dotenv.config();

const generateFacultyIds = async () => {
    try {
        console.log("Connecting to DB...");
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected.");

        // Get all faculty members
        const faculties = await Faculty.find().sort({ createdAt: 1 });
        console.log(`Found ${faculties.length} faculty members.`);

        if (faculties.length === 0) {
            console.log("❌ No faculty members found in database.");
            return;
        }

        let updateCount = 0;

        // Assign employee IDs
        for (let i = 0; i < faculties.length; i++) {
            const faculty = faculties[i];

            // Only update if employeeId doesn't exist
            if (!faculty.employeeId) {
                faculty.employeeId = `FAC${String(i + 1).padStart(2, '0')}`;
                await faculty.save();
                updateCount++;
                console.log(`✅ Assigned ${faculty.employeeId} to faculty member`);
            } else {
                console.log(`⏭️  Faculty already has ID: ${faculty.employeeId}`);
            }
        }

        console.log(`\n🎉 Success! Updated ${updateCount} faculty members with employee IDs.`);

    } catch (error) {
        console.error("❌ Error:", error);
    } finally {
        await mongoose.connection.close();
        console.log("\nDatabase connection closed.");
    }
};

generateFacultyIds();
