import React, { useState, useEffect } from 'react';
import { Calendar, AlertTriangle, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import api from '../../utils/api';

const Attendance = () => {
    const [attendanceData, setAttendanceData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                const { data } = await api.get('/courses/my');

                // Transform data for the table
                const transformedData = data.map(course => ({
                    subject: course.name,
                    code: course.code,
                    total: course.attendance?.total || 0,
                    attended: course.attendance?.present || 0,
                    percentage: course.attendance?.percentage || 0
                }));

                setAttendanceData(transformedData);
            } catch (err) {
                console.error("Failed to fetch attendance:", err);
                setError('Failed to load attendance records.');
            } finally {
                setLoading(false);
            }
        };

        fetchAttendance();
    }, []);

    // Calculate Overall Percentage
    const totalClasses = attendanceData.reduce((acc, curr) => acc + curr.total, 0);
    const totalAttended = attendanceData.reduce((acc, curr) => acc + curr.attended, 0);
    const overallPercentage = totalClasses > 0
        ? ((totalAttended / totalClasses) * 100).toFixed(1)
        : 0;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                {error}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Attendance Record</h1>
                    <p className="text-gray-500 dark:text-gray-400">Track your class participation</p>
                </div>
                <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-3 transition-colors">
                    <div className="text-right">
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider">Overall</p>
                        <p className={`text-xl font-bold ${overallPercentage >= 75 ? 'text-success-600 dark:text-success-400' : 'text-warning-600 dark:text-warning-400'}`}>
                            {overallPercentage}%
                        </p>
                    </div>
                    <div className={`p-2 rounded-full ${overallPercentage >= 75 ? 'bg-success-100 dark:bg-success-900/30 text-success-600 dark:text-success-400' : 'bg-warning-100 dark:bg-warning-900/30 text-warning-600 dark:text-warning-400'}`}>
                        <Calendar className="w-5 h-5" />
                    </div>
                </div>
            </div>

            {/* Attendance Alerts */}
            {attendanceData.some(s => s.percentage < 75) && (
                <div className="bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800/50 rounded-xl p-4 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-warning-600 dark:text-warning-500 mt-0.5" />
                    <div>
                        <h3 className="text-warning-800 dark:text-warning-300 font-semibold text-sm">Low Attendance Alert</h3>
                        <p className="text-warning-700 dark:text-warning-400 text-sm mt-1">
                            You are falling below 75% attendance in the following subjects:
                            <br />
                            <span className="font-medium">
                                {attendanceData.filter(s => s.percentage < 75).map(s => s.subject).join(', ')}
                            </span>
                        </p>
                    </div>
                </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 font-medium text-sm">
                        <tr>
                            <th className="px-6 py-4">Subject</th>
                            <th className="px-6 py-4 text-center">Total Classes</th>
                            <th className="px-6 py-4 text-center">Attended</th>
                            <th className="px-6 py-4 text-center">Skipped</th>
                            <th className="px-6 py-4 text-right">Percentage</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {attendanceData.length > 0 ? (
                            attendanceData.map((item, index) => (
                                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900 dark:text-white">{item.subject}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">{item.code}</div>
                                    </td>
                                    <td className="px-6 py-4 text-center text-gray-600 dark:text-gray-300">{item.total}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 dark:bg-success-900/30 text-success-800 dark:text-success-300">
                                            {item.attended}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-danger-100 dark:bg-danger-900/30 text-danger-800 dark:text-danger-300">
                                            {item.total - item.attended}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <div className="w-24 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${item.percentage >= 75 ? 'bg-success-500' :
                                                        item.percentage >= 60 ? 'bg-warning-500' : 'bg-danger-500'
                                                        }`}
                                                    style={{ width: `${item.percentage}%` }}
                                                ></div>
                                            </div>
                                            <span className={`font-bold w-12 text-sm ${item.percentage >= 75 ? 'text-success-600 dark:text-success-400' :
                                                item.percentage >= 60 ? 'text-warning-600 dark:text-warning-400' : 'text-danger-600 dark:text-danger-400'
                                                }`}>
                                                {item.percentage}%
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                    No attendance records found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Attendance;
