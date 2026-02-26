const mongoose = require('mongoose');

// REPLACE THIS with your actual string from Render Dashboard
const MONGODB_URI = 'mongodb+srv://nexus_ims:rnU5lUChdc1IFQs4@cluster0.e9kx9z8.mongodb.net/?appName=Cluster0';

console.log('--- MongoDB Connection Test ---');
console.log('Testing connection to:', MONGODB_URI.split('@')[1] || 'Invalid URI');

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('✅ SUCCESS: Connected to MongoDB successfully!');
        process.exit(0);
    })
    .catch((err) => {
        console.error('❌ FAILED: Connection error details:');
        console.error(err.message);
        if (err.message.includes('IP address')) {
            console.log('\n💡 TIP: Aapka IP Atlas par whitelist nahi hai. MongoDB Atlas -> Network Access mein ja kar 0.0.0.0/0 add karein.');
        } else if (err.message.includes('authentication failed')) {
            console.log('\n💡 TIP: Username ya password galat hai. Check karein ki special characters (jaise @) URL-encoded hain ya nahi.');
        }
        process.exit(1);
    });
