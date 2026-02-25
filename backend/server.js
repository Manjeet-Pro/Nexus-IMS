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

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const studentRoutes = require('./routes/studentRoutes');
const facultyRoutes = require('./routes/facultyRoutes');
const adminRoutes = require('./routes/adminRoutes');
const noticeRoutes = require('./routes/noticeRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const courseRoutes = require('./routes/courseRoutes');
const feeRoutes = require('./routes/feeRoutes');
const examRoutes = require('./routes/examRoutes');
const markRoutes = require('./routes/markRoutes');
const aiRoutes = require('./routes/aiRoutes');
const configRoutes = require('./routes/configRoutes');
const parentRoutes = require('./routes/parentRoutes');
// const attendanceRoutes = require('./routes/attendanceRoutes'); // Assuming this is a new route

// Routes
// Public routes or routes not affected by maintenance mode
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes); // Admin routes should bypass maintenance check
app.use('/api/ai', aiRoutes); // AI routes might be public or have their own checks
app.use('/api/config', configRoutes); // Config routes might be public or have their own checks

// Apply maintenance check to non-admin modules
app.use('/api/users', protect, checkMaintenance, userRoutes);
app.use('/api/students', protect, checkMaintenance, studentRoutes);
app.use('/api/faculty', protect, checkMaintenance, facultyRoutes);
app.use('/api/parent', protect, checkMaintenance, parentRoutes);
app.use('/api/notices', protect, checkMaintenance, noticeRoutes);
app.use('/api/notifications', protect, checkMaintenance, notificationRoutes);
app.use('/api/exams', protect, checkMaintenance, examRoutes);
app.use('/api/marks', protect, checkMaintenance, markRoutes);
app.use('/api/courses', protect, checkMaintenance, courseRoutes);
app.use('/api/fees', protect, checkMaintenance, feeRoutes);
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
