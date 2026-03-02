const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const helmet = require('helmet');
const { protect } = require('./middleware/authMiddleware');
const checkMaintenance = require('./middleware/maintenanceMiddleware');

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

const userManagementRoutes = require('./routes/userManagementRoutes');
const academicRoutes = require('./routes/academicRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const studentRoutes = require('./routes/studentRoutes');
const facultyRoutes = require('./routes/facultyRoutes');
const configRoutes = require('./routes/configRoutes');
const parentRoutes = require('./routes/parentRoutes');

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
// app.use('/api/attendance', protect, checkMaintenance, attendanceRoutes); // New attendance route

app.get('/', (req, res) => {
    res.send('Nexus API is running...');
});

const http = require('http');
const socketUtils = require('./utils/socket');

// Database Connection
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nexus_db';

const server = http.createServer(app);
const io = socketUtils.init(server);

console.log("DEBUG: Loading Environment Variables...");
console.log("DEBUG: MONGODB_URI starts with:", MONGODB_URI ? MONGODB_URI.substring(0, 15) + "..." : "UNDEFINED");
console.log("DEBUG: JWT_SECRET exists:", !!process.env.JWT_SECRET);
console.log("DEBUG: EMAIL_USER set:", !!process.env.EMAIL_USER);
console.log("DEBUG: EMAIL_PASS set:", !!process.env.EMAIL_PASS);
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log("⚠️ WARNING: Email service will run in SIMULATION mode because credentials are missing.");
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
