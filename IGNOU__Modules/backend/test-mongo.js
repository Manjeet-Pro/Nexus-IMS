const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const testMongo = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB connection successful');
        await mongoose.disconnect();
    } catch (error) {
        console.error('MongoDB connection failed:', error.message);
    }
};

testMongo();
