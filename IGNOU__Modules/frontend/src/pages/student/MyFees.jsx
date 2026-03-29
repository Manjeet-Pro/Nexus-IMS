import React, { useState, useEffect, useCallback } from 'react';
import { Download, IndianRupee, Clock, CheckCircle } from 'lucide-react';
import { exportToCSV } from '../../utils/export';
import api from '../../utils/api';

const MyFees = () => {
    const [fees, setFees] = useState([]);

    const fetchMyFees = useCallback(async () => {
        try {
            const response = await api.get('/fees/my');
            setFees(response.data);
        } catch (error) {
            console.error("Failed to fetch fees:", error);
        }
    }, []);

    useEffect(() => {
        fetchMyFees();
    }, [fetchMyFees]);

    const handleExport = () => {
        const dataToExport = fees.map(f => ({
            Amount: f.amount,
            Type: f.type,
            Semester: f.semester,
            Status: f.status,
            Date: f.date ? new Date(f.date).toLocaleDateString() : 'N/A',
            TransactionID: f.transactionId || 'N/A'
        }));
        exportToCSV(dataToExport, 'my_fee_records');
    };

    const totalPaid = fees.reduce((sum, f) => f.status === 'Paid' ? sum + f.amount : sum, 0);
    const totalPending = fees.reduce((sum, f) => f.status === 'Pending' ? sum + f.amount : sum, 0);

    return (
        <div className="space-y-6 animate-in fade-in zoom-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Fees</h1>
                    <p className="text-gray-500 dark:text-gray-400">Track your payment history and dues</p>
                </div>
                <button
                    onClick={handleExport}
                    className="px-5 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm hover:shadow-md flex items-center gap-2 font-medium"
                >
                    <Download className="w-4 h-4" />
                    <span>Download Receipt</span>
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-success-500 to-success-700 p-6 rounded-2xl text-white shadow-lg shadow-success-500/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10 group-hover:scale-110 transition-transform duration-700"></div>
                    <div className="relative z-10 flex justify-between items-start">
                        <div>
                            <span className="text-success-100 font-medium block mb-1">Total Paid</span>
                            <span className="text-3xl font-bold">₹{totalPaid.toLocaleString('en-IN')}</span>
                            <p className="text-xs text-success-100 mt-2 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" /> All cleared dues
                            </p>
                        </div>
                        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                            <CheckCircle className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                    {totalPending > 0 && <div className="absolute top-0 left-0 w-1 h-full bg-warning-500"></div>}
                    <div className="flex justify-between items-start">
                        <div>
                            <span className="text-gray-500 dark:text-gray-400 font-medium block mb-1">Total Pending</span>
                            <span className={`text-3xl font-bold ${totalPending > 0 ? 'text-warning-600 dark:text-warning-400' : 'text-gray-900 dark:text-white'}`}>
                                ₹{totalPending.toLocaleString('en-IN')}
                            </span>
                            {totalPending > 0 ? (
                                <p className="text-xs text-warning-500 dark:text-warning-400 mt-2 flex items-center gap-1 font-medium">
                                    <Clock className="w-3 h-3" /> Due immediately
                                </p>
                            ) : (
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">No pending dues</p>
                            )}
                        </div>
                        <div className={`p-3 rounded-xl ${totalPending > 0 ? 'bg-warning-50 dark:bg-warning-900/20' : 'bg-gray-50 dark:bg-gray-700/50'}`}>
                            <IndianRupee className={`w-6 h-6 ${totalPending > 0 ? 'text-warning-600 dark:text-warning-400' : 'text-gray-400 dark:text-gray-500'}`} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-all">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/30">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Clock className="w-5 h-5 text-gray-400" />
                        Fee History
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 font-semibold text-sm">
                            <tr>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Semester</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Transaction ID</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {fees.length > 0 ? (
                                fees.map((fee, index) => (
                                    <tr
                                        key={fee._id}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{fee.type}</td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                            <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg text-xs font-medium border border-gray-200 dark:border-gray-600">
                                                {fee.semester}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-mono font-medium text-gray-900 dark:text-white">₹{fee.amount.toLocaleString('en-IN')}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${fee.status === 'Paid'
                                                    ? 'bg-success-50 dark:bg-success-900/30 text-success-700 dark:text-success-400 border-success-100 dark:border-success-800'
                                                    : fee.status === 'Pending'
                                                        ? 'bg-warning-50 dark:bg-warning-900/30 text-warning-700 dark:text-warning-400 border-warning-100 dark:border-warning-800'
                                                        : 'bg-danger-50 dark:bg-danger-900/30 text-danger-700 dark:text-danger-400 border-danger-100 dark:border-danger-800'
                                                    }`}>
                                                    {fee.status}
                                                </span>
                                                {fee.status === 'Pending' && (
                                                    <button
                                                        onClick={async () => {
                                                            if (window.confirm(`Proceed with payment of ₹${fee.amount}?`)) {
                                                                try {
                                                                    await api.put(`/fees/${fee._id}/pay`);
                                                                    alert('Payment successful! Confirmation mail triggered.');
                                                                    fetchMyFees();
                                                                } catch (err) {
                                                                    alert(err.response?.data?.message || 'Payment failed');
                                                                }
                                                            }
                                                        }}
                                                        className="text-xs px-2 py-1 bg-primary-600 hover:bg-primary-700 text-white rounded font-medium transition-colors shadow-sm"
                                                    >
                                                        Pay Now
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-sm">
                                            {fee.date ? new Date(fee.date).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-xs font-mono">
                                            {fee.transactionId || '-'}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <IndianRupee className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                                            <p>No fee records found.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default MyFees;
