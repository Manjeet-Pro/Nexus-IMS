import React, { useState, useEffect } from 'react';
import { CreditCard, Download, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../../utils/api';

const ParentFees = () => {
    const [children, setChildren] = useState([]);
    const [selectedChild, setSelectedChild] = useState(null);
    const [feeRecords, setFeeRecords] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch Parent's Children
                const { data: dashboardData } = await api.get('/parent/dashboard');
                const kids = dashboardData.children || [];
                setChildren(kids);

                if (kids.length > 0) {
                    setSelectedChild(kids[0]);
                    fetchFees(kids[0]._id);
                } else {
                    setLoading(false);
                }
            } catch (error) {
                console.error("Failed to fetch data", error);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const fetchFees = async (childId) => {
        setLoading(true);
        try {
            const { data } = await api.get(`/parent/fees/${childId}`);
            setFeeRecords(data);
        } catch (error) {
            console.error("Failed to fetch fees", error);
        } finally {
            setLoading(false);
        }
    };

    const handleChildChange = (childId) => {
        const child = children.find(c => c._id === childId);
        setSelectedChild(child);
        fetchFees(childId);
    };

    if (loading && children.length === 0) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fee Payment</h1>

                {children.length > 1 && (
                    <select
                        className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                        onChange={(e) => handleChildChange(e.target.value)}
                        value={selectedChild?._id}
                    >
                        {children.map(child => (
                            <option key={child._id} value={child._id}>{child.user?.name}</option>
                        ))}
                    </select>
                )}
            </div>

            <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-primary-600 mt-0.5" />
                <div>
                    <h3 className="font-semibold text-primary-800">Payment Information</h3>
                    <p className="text-sm text-primary-700">Online fee payment gateway coming soon. Please pay at the administrative office.</p>
                </div>
            </div>

            {feeRecords.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 text-center text-gray-500 dark:text-gray-400">
                    <CreditCard className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                    <p>No fee records found for {selectedChild?.user?.name}.</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                            <thead className="bg-gray-50 dark:bg-gray-700 text-xs uppercase text-gray-700 dark:text-gray-300">
                                <tr>
                                    <th className="px-6 py-3">Fee Type</th>
                                    <th className="px-6 py-3">Due Date</th>
                                    <th className="px-6 py-3">Amount</th>
                                    <th className="px-6 py-3">Status</th>
                                    {/* <th className="px-6 py-3">Action</th> */}
                                </tr>
                            </thead>
                            <tbody>
                                {feeRecords.map((record) => (
                                    <tr key={record._id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{record.type}</td>
                                        <td className="px-6 py-4">{record.date ? new Date(record.date).toLocaleDateString() : 'N/A'}</td>
                                        <td className="px-6 py-4 font-semibold">₹{record.amount}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium
                                                    ${record.status === 'Paid' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                                                        record.status === 'Late' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                                                            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'}`}>
                                                    {record.status === 'Paid' && <CheckCircle className="w-3 h-3" />}
                                                    {record.status}
                                                </span>
                                                {(record.status === 'Pending' || record.status === 'Late') && (
                                                    <button
                                                        onClick={async () => {
                                                            if (window.confirm(`Proceed with payment of ₹${record.amount} for ${selectedChild?.user?.name}?`)) {
                                                                try {
                                                                    await api.put(`/fees/${record._id}/pay`);
                                                                    alert('Payment successful! Confirmation mail triggered.');
                                                                    fetchFees(selectedChild?._id);
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
                                        {/* <td className="px-6 py-4">
                                            {record.status === 'Paid' && (
                                                <button className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
                                                    <Download className="w-4 h-4" />
                                                    Receipt
                                                </button>
                                            )}
                                        </td> */}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ParentFees;
