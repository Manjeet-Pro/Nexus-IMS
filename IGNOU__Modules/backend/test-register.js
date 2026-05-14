const axios = require('axios');

const testRegister = async () => {
    try {
        const response = await axios.post('http://localhost:5000/api/auth/register', {
            name: 'Test User',
            email: `test${Date.now()}@example.com`,
            password: 'Password@123',
            role: 'student',
            extraData: {
                rollNo: `TEST${Math.floor(Math.random() * 1000)}`,
                course: 'Computer Science',
                year: '2024'
            }
        });
        console.log('Registration Response:', response.data);
    } catch (error) {
        console.error('Registration Error:', error.response ? error.response.data : error.message);
    }
};

testRegister();
