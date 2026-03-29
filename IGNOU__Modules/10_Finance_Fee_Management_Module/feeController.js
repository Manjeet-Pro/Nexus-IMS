const Fee = require('../models/Fee');
const Student = require('../models/Student');
const Parent = require('../models/Parent');
const { createNotification } = require('../utils/notificationHelper');

// @desc    Get all fees (Admin)
// @route   GET /api/fees
// @access  Private/Admin
exports.getAllFees = async (req, res) => {
    try {
        const fees = await Fee.find()
            .populate({
                path: 'student',
                populate: { path: 'user', select: 'name email' }
            })
            .sort({ date: -1 });
        res.json(fees);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add a fee record (Admin)
// @route   POST /api/fees
// @access  Private/Admin
exports.addFeeRecord = async (req, res) => {
    try {
        const { studentId, amount, type, status, semester, transactionId } = req.body;

        // Verify student exists
        const student = await Student.findById(studentId).populate('user', 'name');
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Generate sequential Serial Number (e.g., RCPT-001)
        const lastFee = await Fee.findOne().sort({ createdAt: -1 });
        let nextSerialNum = 1;
        if (lastFee && lastFee.serialNo) {
            const lastSerial = lastFee.serialNo;
            const match = lastSerial.match(/RCPT-(\d+)/);
            if (match) {
                nextSerialNum = parseInt(match[1]) + 1;
            }
        }
        const serialNo = `RCPT-${nextSerialNum.toString().padStart(3, '0')}`;

        const fee = await Fee.create({
            student: studentId,
            amount,
            type,
            status, // 'Paid', 'Pending', 'Overdue'
            semester,
            serialNo,
            date: new Date(),
            transactionId: status === 'Paid' ? (transactionId || `TXN${Date.now()}`) : undefined
        });

        const populatedFee = await Fee.findById(fee._id).populate({
            path: 'student',
            populate: { path: 'user', select: 'name email' }
        });

        // Trigger Notifications
        if (student.user) {
            const receiptHtml = status === 'Paid' ? `
                <p>Hi ${student.user.name}, a payment of <b>₹${amount}</b> has been recorded for your account.</p>
                <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #111827; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px;">Payment Receipt</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 8px 0; color: #6b7280;">Transaction ID:</td>
                            <td style="padding: 8px 0; font-weight: bold; text-align: right; color: #111827;">${fee.transactionId || 'OFFLINE'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #6b7280;">Description:</td>
                            <td style="padding: 8px 0; text-align: right; color: #111827;">${type} (${semester})</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #6b7280;">Date:</td>
                            <td style="padding: 8px 0; text-align: right; color: #111827;">${new Date(fee.date).toLocaleDateString()}</td>
                        </tr>
                        <tr style="border-top: 1px solid #e5e7eb;">
                            <td style="padding: 12px 0; font-weight: bold; color: #111827;">Total Paid:</td>
                            <td style="padding: 12px 0; font-weight: bold; text-align: right; color: #4F46E5; font-size: 18px;">₹${amount.toLocaleString('en-IN')}</td>
                        </tr>
                    </table>
                </div>
            ` : null;

            // Notify Student
            createNotification({
                recipientId: student.user._id,
                message: `New Fee Record: ${type} - ₹${amount} (${status}).`,
                type: status === 'Paid' ? 'success' : 'alert',
                sendEmail: true,
                emailData: {
                    subject: status === 'Paid' ? 'Payment Receipt - Nexus' : 'New Fee Invoice',
                    title: status === 'Paid' ? 'Fee Payment Confirmed' : 'Fee Action Required',
                    body: status === 'Paid' ? receiptHtml : `Hi ${student.user.name}, a new fee for "${type}" has been generated. Amount: ₹${amount}. Current Status: ${status}.`,
                    actionLink: 'http://localhost:5173/student/fees'
                }
            });

            // Notify Parent
            const parent = await Parent.findOne({ children: studentId }).populate('user', 'name');
            if (parent && parent.user) {
                createNotification({
                    recipientId: parent.user._id,
                    message: `Fee Update for ${student.user.name}: ${type} - ₹${amount} (${status}).`,
                    type: status === 'Paid' ? 'success' : 'alert',
                    sendEmail: true,
                    emailData: {
                        subject: `Fee Update - ${student.user.name}`,
                        title: status === 'Paid' ? 'Fee Payment Successful' : 'New Fee Issued',
                        body: status === 'Paid'
                            ? `<p>Dear Parent, a payment of <b>₹${amount}</b> has been recorded for ${student.user.name}.</p>${receiptHtml}`
                            : `Dear Parent, a new fee of ₹${amount} has been issued for ${student.user.name} (${type}). Status: ${status}.`,
                        actionLink: 'http://localhost:5173/parent/fees'
                    }
                });
            }
        }

        res.status(201).json(populatedFee);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get my fees (Student)
// @route   GET /api/fees/my
// @access  Private/Student
exports.getMyFees = async (req, res) => {
    try {
        // Find student record for logged in user
        const student = await Student.findOne({ user: req.user._id });
        if (!student) {
            return res.status(404).json({ message: 'Student record not found' });
        }

        const fees = await Fee.find({ student: student._id }).sort({ date: -1 });
        res.json(fees);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Pay a fee (Student/Parent simulation)
// @route   PUT /api/fees/:id/pay
// @access  Private
exports.payFee = async (req, res) => {
    try {
        const fee = await Fee.findById(req.params.id).populate({
            path: 'student',
            populate: { path: 'user', select: 'name email' }
        });

        if (!fee) {
            return res.status(404).json({ message: 'Fee record not found' });
        }

        if (fee.status === 'Paid') {
            return res.status(400).json({ message: 'Fee already paid' });
        }

        fee.status = 'Paid';
        fee.date = new Date();
        fee.transactionId = `SIM${Date.now()}`;
        await fee.save();

        // Trigger Notification
        if (fee.student && fee.student.user) {
            const receiptHtml = `
                <p>Hi ${fee.student.user.name}, your payment has been successfully processed. Here is your transaction receipt:</p>
                <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #111827; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px;">Payment Receipt</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 8px 0; color: #6b7280;">Transaction ID:</td>
                            <td style="padding: 8px 0; font-weight: bold; text-align: right; color: #111827;">${fee.transactionId}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #6b7280;">Description:</td>
                            <td style="padding: 8px 0; text-align: right; color: #111827;">${fee.type} (${fee.semester})</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #6b7280;">Date:</td>
                            <td style="padding: 8px 0; text-align: right; color: #111827;">${new Date(fee.date).toLocaleDateString()}</td>
                        </tr>
                        <tr style="border-top: 1px solid #e5e7eb;">
                            <td style="padding: 12px 0; font-weight: bold; color: #111827;">Total Paid:</td>
                            <td style="padding: 12px 0; font-weight: bold; text-align: right; color: #4F46E5; font-size: 18px;">₹${fee.amount.toLocaleString('en-IN')}</td>
                        </tr>
                    </table>
                </div>
            `;

            createNotification({
                recipientId: fee.student.user._id,
                message: `Payment Successful: ₹${fee.amount} received for ${fee.type}.`,
                type: 'success',
                sendEmail: true,
                emailData: {
                    subject: 'Payment Receipt - Nexus',
                    title: 'Fee Payment Confirmed',
                    body: receiptHtml,
                    actionLink: 'http://localhost:5173/student/fees'
                }
            });

            // Notify Parent
            const parent = await Parent.findOne({ children: fee.student._id }).populate('user', 'email name');
            if (parent && parent.user) {
                createNotification({
                    recipientId: parent.user._id,
                    message: `Payment Confirmation: ₹${fee.amount} paid for ${fee.student.user.name}'s ${fee.type}.`,
                    type: 'success',
                    sendEmail: true,
                    emailData: {
                        subject: `Fee Payment Successful - ${fee.student.user.name}`,
                        title: 'Payment Received',
                        body: `<p>Dear Parent, we have received a payment of <b>₹${fee.amount}</b> for ${fee.student.user.name}'s ${fee.type}.</p>${receiptHtml}`,
                        actionLink: 'http://localhost:5173/parent/dashboard'
                    }
                });
            }
        }

        res.json(fee);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
