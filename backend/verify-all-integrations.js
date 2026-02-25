const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Student = require('./models/Student');
const Faculty = require('./models/Faculty');
const Parent = require('./models/Parent');
const Course = require('./models/Course');
const Attendance = require('./models/Attendance');
const Mark = require('./models/Mark');
const Fee = require('./models/Fee');
const Notice = require('./models/Notice');

const verifyIntegrity = async () => {
    try {
        const fs = require('fs');
        const reportPath = 'integration-report.txt';
        const log = (msg) => {
            console.log(msg);
            fs.appendFileSync(reportPath, msg + '\r\n');
        };

        if (fs.existsSync(reportPath)) fs.unlinkSync(reportPath);

        const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nexus_db';
        await mongoose.connect(MONGODB_URI);
        log('✅ Connected to MongoDB');
        log('---------------------------------------------------');

        // 1. Verify Students & Enrollment
        log('🔍 Checking Student Integration...');
        const students = await Student.find().populate('user');
        log(`   Found ${students.length} students.`);

        for (const s of students) {
            if (!s.user) {
                log(`   ❌ ORPHAN STUDENT: ${s._id} (No User Linked)`);
                continue;
            }
            // Check enrollment
            const enrolledCourses = await Course.find({ studentsEnrolled: s._id });
            if (enrolledCourses.length === 0) {
                log(`   ⚠️ Student ${s.user.name} (${s.rollNo}) is NOT enrolled in any course.`);
            } else {
                log(`   ✅ Student ${s.user.name} is enrolled in ${enrolledCourses.length} courses.`);
            }

            // Check Fees
            const fees = await Fee.find({ student: s._id });
            const pendingFees = fees.filter(f => f.status === 'Pending').length;
            if (fees.length > 0) {
                log(`   ✅ Fees linked: ${fees.length} records (${pendingFees} pending).`);
            } else {
                log(`   ⚠️ No fee records found for ${s.user.name}.`);
            }
        }

        log('\n---------------------------------------------------');

        // 2. Verify Faculty & Courses
        log('🔍 Checking Faculty & Course Integration...');
        const courses = await Course.find().populate('instructor');
        log(`   Found ${courses.length} courses.`);

        for (const c of courses) {
            if (!c.instructor) {
                log(`   ⚠️ Course ${c.name} (${c.code}) has NO Instructor assigned.`);
            } else {
                // Verify instructor is valid Faculty
                const faculty = await Faculty.findById(c.instructor._id).populate('user');
                if (faculty && faculty.user) {
                    log(`   ✅ Course ${c.name} assigned to ${faculty.user.name}.`);
                } else {
                    log(`   ❌ Course ${c.name} has invalid instructor reference.`);
                }
            }
        }

        log('\n---------------------------------------------------');

        // 3. Verify Parents
        log('🔍 Checking Parent-Student Linkage...');
        const parents = await Parent.find().populate('user').populate('children');
        log(`   Found ${parents.length} parents.`);

        for (const p of parents) {
            if (!p.user) {
                log(`   ❌ ORPHAN PARENT: ${p._id}`);
                continue;
            }
            if (p.children.length === 0) {
                log(`   ⚠️ Parent ${p.user.name} has NO children linked.`);
            } else {
                // Manually fetch child details if populate failed or just use rollNo
                // The populate('children') should work if Schema is correct.
                // Parent schema children ref 'Student'.
                const childDetails = [];
                for (const child of p.children) {
                    // if child is populated
                    if (child.rollNo) {
                        childDetails.push(child.rollNo);
                    } else {
                        childDetails.push(`ID: ${child}`);
                    }
                }
                log(`   ✅ Parent ${p.user.name} linked to children: ${childDetails.join(', ')}`);
            }
        }

        log('\n---------------------------------------------------');

        // 4. Verify Notices
        const notices = await Notice.find();
        log(`🔍 Found ${notices.length} Notices.`);
        const parentNotices = notices.filter(n => ['Parent', 'All', 'parent', 'all'].includes(n.audience));
        log(`   ✅ ${parentNotices.length} notices exist for Parents.`);

        log('\n🏁 Integration Verification Complete.');
        process.exit(0);

    } catch (error) {
        console.error('FATAL Error:', error);
        process.exit(1);
    }
};

verifyIntegrity();
