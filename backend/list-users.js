
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: './server/.env' });

// Define minimal Schema to avoid importing the whole model if it has other dependencies
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    role: String
}, { collection: 'users' }); // Force collection name to 'users'

const User = mongoose.model('User', userSchema);

const listUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to database.");

        const users = await User.find({}, 'name email role _id');
        console.log("\n--- Current Users in Database ---");
        users.forEach(u => {
            console.log(`[${u.role}] ${u.name} (${u.email})`);
        });
        console.log("---------------------------------\n");

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
    }
};

listUsers();
