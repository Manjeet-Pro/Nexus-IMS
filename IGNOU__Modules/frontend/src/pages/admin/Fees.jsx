import React, { useState, useEffect } from 'react';
import { Search, Download, Plus, IndianRupee, Filter, Trash2 } from 'lucide-react';
import { exportToCSV } from '../../utils/export';
import api from '../../utils/api';

const Fees = () => {
    const [fees, setFees] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newFee, setNewFee] = useState({
        studentId: '',
        amount: '',
        type: 'Tuition',
        semester: '1st',
        status: 'Paid',
        transactionId: ''
    });

    useEffect(() => {
        fetchFees();
        fetchStudents();
    }, []);

    const fetchFees = async () => {
        try {
            const response = await api.get('/fees');
            setFees(response.data);
        } catch (error) {
            console.error("Failed to fetch fees:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStudents = async () => {
        try {
            const response = await api.get('/students');
            setStudents(response.data.map(s => ({
                id: s._id,
                name: s.user?.name || 'Unknown',
                rollNo: s.rollNo,
                course: s.course
            })));
        } catch (error) {
            console.error("Failed to fetch students:", error);
        }
    };

    const handleAddFee = async (e) => {
        e.preventDefault();
        try {
            await api.post('/fees', newFee);
            fetchFees();
            setIsModalOpen(false);
            setNewFee({
                studentId: '',
                amount: '',
                type: 'Tuition',
                semester: '1st',
                status: 'Paid',
                transactionId: ''
            });
            alert('Fee record added successfully!');
        } catch (error) {
            console.error("Failed to add fee:", error);
            alert(error.response?.data?.message || 'Failed to add fee');
        }
    };

    const filteredFees = fees.filter(fee =>
        fee.student?.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fee.transactionId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleExport = () => {
        const dataToExport = filteredFees.map(f => ({
            'Serial No': f.serialNo || 'N/A',
            Student: f.student?.user?.name || 'Unknown',
            Amount: f.amount,
            Type: f.type,
            Semester: f.semester,
            Status: f.status,
            Date: f.date && !isNaN(new Date(f.date).getTime()) ? new Date(f.date).toLocaleDateString() : 'N/A',
            TransactionID: f.transactionId || 'N/A'
        }));
        exportToCSV(dataToExport, 'fee_records');
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Fee Management</h1>
                    <p className="text-gray-500">Track and manage student payments</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleExport}
                        className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        <span>Export</span>
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-4 py-2 bg-success-600 text-white rounded-lg hover:bg-success-700 transition-colors flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add Payment</span>
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-success-50 rounded-lg">
                            <IndianRupee className="w-5 h-5 text-success-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-500">Total Collected</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                        ₹{fees.reduce((sum, f) => f.status === 'Paid' ? sum + f.amount : sum, 0).toLocaleString('en-IN')}
                    </p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-info-50 rounded-lg">
                            <Filter className="w-5 h-5 text-info-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-500">Pending Dues</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                        ₹{fees.reduce((sum, f) => f.status === 'Pending' ? sum + f.amount : sum, 0).toLocaleString('en-IN')}
                    </p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-primary-50 rounded-lg">
                            <Filter className="w-5 h-5 text-primary-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-500">Transactions</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                        {fees.length}
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by student or transaction ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full !pl-12 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-600 font-medium text-sm">
                            <tr>
                                <th className="px-6 py-3">Serial No</th>
                                <th className="px-6 py-3">Student</th>
                                <th className="px-6 py-3">Amount</th>
                                <th className="px-6 py-3">Type</th>
                                <th className="px-6 py-3">Semester</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3">Transaction ID</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredFees.map((fee) => (
                                <tr key={fee._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-mono text-xs text-gray-600 font-bold">{fee.serialNo || '-'}</td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">
                                            {fee.student?.user?.name || 'Unknown'}
                                        </div>
                                        <div className="text-xs text-gray-500">{fee.student?.rollNo}</div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900">₹{fee.amount.toLocaleString('en-IN')}</td>
                                    <td className="px-6 py-4 text-gray-600">{fee.type}</td>
                                    <td className="px-6 py-4 text-gray-600">{fee.semester}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${fee.status === 'Paid' ? 'bg-success-100 text-success-700' :
                                            fee.status === 'Pending' ? 'bg-warning-100 text-warning-700' :
                                                'bg-danger-100 text-danger-700'
                                            }`}>
                                            {fee.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 text-sm">
                                        {fee.date && !isNaN(new Date(fee.date).getTime()) ? new Date(fee.date).toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 text-xs font-mono">
                                        {fee.transactionId || '-'}
                                    </td>
                                </tr>
                            ))}
                            {filteredFees.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                                        No fee records found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Fee Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Record Fee Payment</h2>
                        <form onSubmit={handleAddFee} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
                                <select
                                    required
                                    value={newFee.studentId}
                                    onChange={(e) => setNewFee({ ...newFee, studentId: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                >
                                    <option value="">-- Select Student --</option>
                                    {students.sort((a, b) => a.name.localeCompare(b.name)).map(s => (
                                        <option key={s.id} value={s.id}>
                                            {s.name} ({s.rollNo})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                                    <input
                                        type="number"
                                        required
                                        value={newFee.amount}
                                        onChange={(e) => setNewFee({ ...newFee, amount: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                    <select
                                        value={newFee.type}
                                        onChange={(e) => setNewFee({ ...newFee, type: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    >
                                        <option value="Tuition">Tuition Fee</option>
                                        <option value="Exam">Exam Fee</option>
                                        <option value="Hostel">Hostel Fee</option>
                                        <option value="Library">Library Fee</option>
                                        <option value="transportation">Transport</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                                    <select
                                        value={newFee.semester}
                                        onChange={(e) => setNewFee({ ...newFee, semester: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    >
                                        <option value="1st">1st Semester</option>
                                        <option value="2nd">2nd Semester</option>
                                        <option value="3rd">3rd Semester</option>
                                        <option value="4th">4th Semester</option>
                                        <option value="5th">5th Semester</option>
                                        <option value="6th">6th Semester</option>
                                        <option value="7th">7th Semester</option>
                                        <option value="8th">8th Semester</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select
                                        value={newFee.status}
                                        onChange={(e) => setNewFee({ ...newFee, status: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    >
                                        <option value="Paid">Paid</option>
                                        <option value="Pending">Pending</option>
                                    </select>
                                </div>
                            </div>
                            {newFee.status === 'Paid' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Transaction ID (Optional)</label>
                                    <input
                                        type="text"
                                        value={newFee.transactionId}
                                        onChange={(e) => setNewFee({ ...newFee, transactionId: e.target.value })}
                                        placeholder="e.g. UPI1234567890"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                            )}

                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-success-600 text-white rounded-lg hover:bg-success-700"
                                >
                                    Save Record
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Fees;
