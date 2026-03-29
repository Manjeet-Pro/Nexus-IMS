const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const helmet = require('helmet');
const { protect } = require('../../1_Authentication_Core_Security_Module/backend/authMiddleware');
const checkMaintenance = require('../../2_User_Settings_Management_Module/backend/maintenanceMiddleware');

const app = express();

// Middleware
app.use(cors({
    origin: true, // Allow all origins dynamically
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
const path = require('path');
app.use(helmet()); // Add helmet for security

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const userManagementRoutes = require('../../1_Authentication_Core_Security_Module/backend/userManagementRoutes');
const academicRoutes = require('../../6_Academic_Course_Management_Module/backend/academicRoutes');
const serviceRoutes = require('../../11_Communication_Notice_Board_Module/backend/serviceRoutes');
const studentRoutes = require('../../3_Student_Management_Module/backend/studentRoutes');
const facultyRoutes = require('../../5_Faculty_Management_Module/backend/facultyRoutes');
const configRoutes = require('../../2_User_Settings_Management_Module/backend/configRoutes');
const parentRoutes = require('../../4_Parent_Tracking_Module/backend/parentRoutes');

// Routes
// Consolidated Modules
app.use('/api', userManagementRoutes);
app.use('/api', academicRoutes);
app.use('/api', serviceRoutes);

app.use('/api/config', configRoutes);

// Core Role Modules (Staying separate for now as requested or until further consolidation)
app.use('/api/students', protect, checkMaintenance, studentRoutes);
app.use('/api/faculty', protect, checkMaintenance, facultyRoutes);
app.use('/api/parent', protect, checkMaintenance, parentRoutes);

app.get('/', (req, res) => {
    res.send('Nexus API is running...');
});

const http = require('http');
const socketUtils = require('../../11_Communication_Notice_Board_Module/backend/socket');

// Database Connection
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nexus_db';

const server = http.createServer(app);
const io = socketUtils.init(server);

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log("⚠️ WARNING: Email service link is pending. Check .env file.");
}

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
        process.exit(1); // Exit process with failure code
    });
