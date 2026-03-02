const axios = require('axios');
const Notice = require('../models/Notice');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Student = require('../models/Student');
const Mark = require('../models/Mark');
const Attendance = require('../models/Attendance');
const { notifyMany } = require('../utils/notificationHelper');
const { emitToAll } = require('../utils/socket');

// ==========================================
// 1. NOTICES (from noticeController.js)
// ==========================================

exports.createNotice = async (req, res) => {
    try {
        const { title, content, audience, type } = req.body;
        const notice = await Notice.create({ title, content, audience, type, postedBy: req.user._id });
        const populated = await Notice.findById(notice._id).populate('postedBy', 'name');
        let targetRoles = audience.toLowerCase() === 'all' ? ['student', 'faculty', 'parent'] : [audience.toLowerCase()];
        const users = await User.find({ role: { $in: targetRoles } }).select('_id');
        notifyMany(users.map(u => u._id), { message: `New Notice: ${title}`, type: 'academic', sendEmail: true, emailData: { subject: 'New Academic Notice', title: 'Announcement', actionLink: 'http://localhost:5173/dashboard' } });
        emitToAll('new-notice', populated);
        res.status(201).json(populated);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.getAllNotices = async (req, res) => {
    try {
        let q = {}; if (req.query.audience) q.audience = { $regex: req.query.audience, $options: 'i' };
        res.json(await Notice.find(q).sort({ date: -1 }).populate('postedBy', 'name'));
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.updateNotice = async (req, res) => {
    try {
        const notice = await Notice.findById(req.params.id);
        if (!notice) return res.status(404).json({ message: 'Not found' });
        notice.title = req.body.title || notice.title; notice.content = req.body.content || notice.content; notice.audience = req.body.audience || notice.audience; notice.type = req.body.type || notice.type;
        res.json(await (await notice.save()).populate('postedBy', 'name'));
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.deleteNotice = async (req, res) => {
    try {
        const notice = await Notice.findById(req.params.id);
        if (notice) { await notice.deleteOne(); res.json({ message: 'Deleted' }); } else res.status(404).json({ message: 'Not found' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// ==========================================
// 2. NOTIFICATIONS (from notificationController.js)
// ==========================================

exports.getNotifications = async (req, res) => {
    try {
        let q = req.user.role === 'admin' ? { $or: [{ recipient: req.user._id }, { recipient: null }] } : { recipient: req.user._id };
        res.json(await Notification.find(q).sort({ createdAt: -1 }).limit(20));
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.markAsRead = async (req, res) => {
    try {
        const n = await Notification.findById(req.params.id);
        if (n) { n.read = true; await n.save(); res.json(n); } else res.status(404).json({ message: 'Not found' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.markAllAsRead = async (req, res) => {
    try {
        let q = req.user.role === 'admin' ? { $or: [{ recipient: req.user._id }, { recipient: null }], read: false } : { recipient: req.user._id, read: false };
        await Notification.updateMany(q, { read: true });
        res.json({ message: 'Marked all read' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// ==========================================
// 3. AI SERVICES (from aiController.js)
// ==========================================

exports.analyzePerformance = async (req, res) => {
    try {
        const student = await Student.findOne({ user: req.user._id });
        if (!student) return res.status(404).json({ message: 'Profile not found' });
        const marks = await Mark.find({ student: student._id }).populate('course', 'name code');
        const attendance = await Attendance.find({ student: student._id }).populate('course', 'name');
        let prompt = `Analyze academic performance for ${req.user.name}:\nMarks:\n${marks.map(m => `- ${m.course.name}: ${m.marks}/${m.total}`).join('\n')}\nAttendance: ${attendance.length} records.\nJSON format: {strengths:[], improvements:[], tips:""}`;
        const resp = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`, { contents: [{ parts: [{ text: prompt }] }] });
        const text = resp.data.candidates[0].content.parts[0].text.replace(/```json/g, '').replace(/```/g, '').trim();
        try { res.json(JSON.parse(text)); } catch (e) { res.json({ raw: text }); }
    } catch (error) { res.status(500).json({ message: "AI Analysis unavailable" }); }
};

exports.chatFAQ = async (req, res) => {
    try {
        const prompt = `You are Nexus AI for ${req.user.name} (${req.user.role}). Message: ${req.body.message}`;
        const resp = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`, { contents: [{ parts: [{ text: prompt }] }] });
        res.json({ text: resp.data.candidates[0].content.parts[0].text });
    } catch (error) { res.status(500).json({ message: "Chat unavailable" }); }
};
