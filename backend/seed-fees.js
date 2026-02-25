const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Fee = require('./models/Fee');
const Student = require('./models/Student');
const User = require('./models/User');

dotenv.config();

const seedFees = async () => {
    try {
        console.log("Connecting to DB...");
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected.");

        // 1. Find all students
        const students = await Student.find();

        if (students.length === 0) {
            console.log("❌ No students found.");
            return;
        }

        console.log(`Found ${students.length} students.`);

        // 2. Clear existing fees
        console.log("Clearing existing fees...");
        await Fee.deleteMany({});

        let totalFees = 0;
        const feeTypes = ['Tuition', 'Exam', 'Library', 'transportation']; // Corrected 'Transport' to 'transportation'
        const statuses = ['Paid', 'Pending']; // Removed 'Late'

        // 3. Create Sample Fees for each student
        for (const student of students) {
            const feesData = [];
            const numFees = Math.floor(Math.random() * 4) + 2; // 2 to 5 records per student

            for (let i = 0; i < numFees; i++) {
                const type = feeTypes[i % feeTypes.length];
                const status = statuses[Math.floor(Math.random() * statuses.length)];
                const amount = type === 'Tuition' ? 45000 : type === 'transportation' ? 12000 : type === 'Exam' ? 2500 : 500;

                // Date logic: specific dates relative to now
                const date = new Date();
                date.setDate(date.getDate() + (Math.floor(Math.random() * 60) - 30)); // +/- 30 days

                feesData.push({
                    student: student._id,
                    type: type,
                    amount: amount,
                    status: status, // status matches schema
                    date: date, // Explicit date
                    semester: '1st', // Defaulting for simplicity
                    transactionId: status === 'Paid' ? `TXN${Math.floor(Math.random() * 1000000000)}` : undefined,
                    serialNo: `FEE-${Date.now()}-${Math.floor(Math.random() * 100000)}` // Unique serial number
                });
            }

            await Fee.insertMany(feesData);
            totalFees += feesData.length;
        }

        console.log(`✅ Created ${totalFees} fee records for ${students.length} students.`);

    } catch (error) {
        console.error("❌ Seeding Error:", error);
    } finally {
        await mongoose.connection.close();
        console.log("Database connection closed.");
    }
};

seedFees();
