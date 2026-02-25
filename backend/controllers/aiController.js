const axios = require('axios');
const Mark = require('../models/Mark');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');

// @desc    Analyze Student Performance
// @route   POST /api/ai/analyze
// @access  Private (Student)
exports.analyzePerformance = async (req, res) => {
    try {
        const student = await Student.findOne({ user: req.user._id });
        if (!student) return res.status(404).json({ message: 'Student profile not found' });

        // 1. Gather Data
        const marks = await Mark.find({ student: student._id }).populate('course', 'name code');
        const attendance = await Attendance.find({ student: student._id }).populate('course', 'name');

        // 2. Construct Prompt
        let prompt = `Analyze the academic performance for student ${req.user.name}. \n\n`;

        prompt += `Marks:\n`;
        if (marks.length === 0) prompt += "No marks recorded yet.\n";
        marks.forEach(m => {
            prompt += `- ${m.course.name} (${m.type}): ${m.marks}/${m.total}\n`;
        });

        prompt += `\nAttendance Summary:\n`;
        if (attendance.length === 0) prompt += "No detailed attendance records.\n";

        prompt += `\nPlease provide a concise analysis:
        1. Strongest Subjects
        2. Areas for Improvement
        3. Specific Study Tips based on these results.
        Keep the tone encouraging and professional. Format the response as a raw JSON object with keys: strengths (array), improvements (array), tips (string). Do not include markdown formatting.`;

        // 3. Call Gemini via REST
        const API_KEY = process.env.GEMINI_API_KEY;
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${API_KEY}`;

        const response = await axios.post(url, {
            contents: [{ parts: [{ text: prompt }] }]
        });

        const text = response.data.candidates[0].content.parts[0].text;

        // 4. Send Response
        // basic cleanup to ensure we get JSON if model wraps it in markdown code blocks
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();

        try {
            const analysis = JSON.parse(jsonStr);
            res.json(analysis);
        } catch (e) {
            // Fallback if not valid JSON
            res.json({ raw: text });
        }

    } catch (error) {
        console.error("AI Analysis Failed:", error.response?.data || error.message);
        res.status(500).json({ message: "Failed to generate AI analysis" });
    }
};

// @desc    Chat with AI Assistant (FAQ)
// @route   POST /api/ai/chat
// @access  Private (All Roles)
exports.chatFAQ = async (req, res) => {
    try {
        const { message, history } = req.body;
        const user = req.user;

        const systemPrompt = `You are "Nexus AI", the official virtual assistant for the Nexus Institute Management System (IMS).
        Goal: Help students, faculty, and admins navigate the portal and answer common academic questions.
        
        About Nexus IMS:
        - Portals: Student, Faculty, Admin.
        - Features: Attendance, Course mgmt, Marks, Fees, Exams, AI Analysis.
        - Tone: Professional, helpful, concise. 
        - Role: Official Institute Assistant.

        Context:
        - Current User: ${user.name}
        - Role: ${user.role}

        Conversation History:
        ${history ? JSON.stringify(history) : 'No history'}

        User Message: ${message}`;

        const API_KEY = process.env.GEMINI_API_KEY;
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${API_KEY}`;

        const response = await axios.post(url, {
            contents: [{ parts: [{ text: systemPrompt }] }]
        });

        const text = response.data.candidates[0].content.parts[0].text;
        res.json({ text });

    } catch (error) {
        console.error("AI Chat Failed:", error.response?.data || error.message);
        res.status(500).json({ message: "Chat assistance unavailable" });
    }
};
