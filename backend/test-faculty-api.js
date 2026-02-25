const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config({ path: './server/.env' });

const testFacultyAPI = async () => {
    try {
        // 1. Login as Admin
        console.log('Logging in as Admin...');
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'admin@nexus.com',
            password: 'password'
        });

        const token = loginRes.data.token;
        console.log('Login successful. Token obtained.');

        // 2. Fetch Faculty
        console.log('\nFetching Faculty list...');
        const facultyRes = await axios.get('http://localhost:5000/api/faculty', {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log(`Status: ${facultyRes.status}`);
        console.log('Data received:', JSON.stringify(facultyRes.data, null, 2));

        // 3. Verify Structure
        const facultyList = facultyRes.data;
        if (facultyList.length === 0) {
            console.log('WARNING: Faculty list is empty!');
        } else {
            facultyList.forEach((f, i) => {
                console.log(`\n[${i}] ID: ${f._id}`);
                console.log(`    User Object:`, f.user);
                if (!f.user) {
                    console.log('    ERROR: User field is null/undefined!');
                } else {
                    console.log(`    Name: ${f.user.name}`);
                }
            });
        }

    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
};

testFacultyAPI();
