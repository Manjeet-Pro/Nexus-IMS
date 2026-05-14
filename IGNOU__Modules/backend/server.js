const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const logger = require('./utils/logger');
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

// Simple Request Logger
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`);
    next();
});

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

app.get('/', (req, res) => {
    res.send('Nexus API is running...');
});

// Global Error Handler
app.use((err, req, res, next) => {
    logger.error('Unhandled Error:', err.message);
    res.status(500).json({
        success: false,
        message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message
    });
});

const http = require('http');
const socketUtils = require('./utils/socket');

// Database Connection
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nexus_db';

const server = http.createServer(app);
const io = socketUtils.init(server);

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log("⚠️ WARNING: Email service link is pending. Check .env file.");
}

mongoose.connect(MONGODB_URI)
    .then(async () => {
        logger.info('Connected to MongoDB');
        
        // Verify Email Service on startup
        const { verifyTransporter } = require('./utils/emailService');
        await verifyTransporter();

        server.listen(PORT, () => {
            logger.info(`Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        logger.error('MongoDB connection error:', err.message);
        // Don't exit immediately if in dev, nodemon will handle it
        if (process.env.NODE_ENV === 'production') {
            process.exit(1);
        }
    });

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise);
    logger.error('Reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception:', err);
    // Give time for logs to write
    setTimeout(() => {
        process.exit(1);
    }, 1000);
});
