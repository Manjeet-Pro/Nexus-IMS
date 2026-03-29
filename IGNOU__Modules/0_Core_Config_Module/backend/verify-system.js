const axios = require('axios');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const API_URL = 'http://localhost:5000/api';

const runVerification = async () => {
    console.log('🔍 Starting Comprehensive System Verification...');

    // 1. Verify MongoDB Connection
    try {
        if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI missing in .env');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connection: SUCCESS');
    } catch (err) {
        console.error('❌ MongoDB Connection: FAILED', err.message);
        process.exit(1);
    }

    // 2. Verify API Health
    try {
        const res = await axios.get('http://localhost:5000/');
        if (res.status === 200) console.log('✅ Server Health Check: SUCCESS');
    } catch (err) {
        console.error('❌ Server Health Check: FAILED (Is server running?)');
        process.exit(1);
    }

    // 3. Test Registration Flow
    const testUser = {
        name: 'Verification User',
        email: `verify_${Date.now()}@test.com`,
        password: 'password123',
        role: 'student'
    };

    let token = '';
    let userId = '';

    try {
        console.log('... Testing Registration');
        const regRes = await axios.post(`${API_URL}/auth/register`, testUser);
        if (regRes.status === 201 && regRes.data.token) {
            console.log('✅ User Registration: SUCCESS');
            token = regRes.data.token;
            userId = regRes.data._id;
        }
    } catch (err) {
        console.error('❌ User Registration: FAILED', err.response?.data || err.message);
    }

    // 4. Test Login Flow
    try {
        console.log('... Testing Login');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: testUser.email,
            password: testUser.password
        });
        if (loginRes.status === 200 && loginRes.data.token) {
            console.log('✅ User Login: SUCCESS');
        }
    } catch (err) {
        console.error('❌ User Login: FAILED', err.response?.data || err.message);
    }

    // 5. Test Authenticated Route (Profile)
    if (token) {
        try {
            console.log('... Testing Protected Route (Profile)');
            const profileRes = await axios.get(`${API_URL}/users/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (profileRes.status === 200) {
                console.log('✅ Protected Route Access: SUCCESS');
            }
        } catch (err) {
            console.error('❌ Protected Route Access: FAILED', err.response?.data || err.message);
        }
    }

    // Cleanup
    if (userId) {
        await mongoose.connection.collection('users').deleteOne({ _id: new mongoose.Types.ObjectId(userId) });
        await mongoose.connection.collection('students').deleteOne({ user: new mongoose.Types.ObjectId(userId) });
        console.log('✅ Cleanup: Test user deleted');
    }

    console.log('\n🏁 Verification Complete');
    process.exit(0);
};

runVerification();
