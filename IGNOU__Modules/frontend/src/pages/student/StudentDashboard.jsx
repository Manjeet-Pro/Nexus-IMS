
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { BookOpen, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getCurrentUser } from '../../utils/auth';
import api from '../../utils/api';

const StudentDashboard = () => {
    const user = getCurrentUser();
    const [dashboardData, setDashboardData] = useState(null);
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [dashboardRes, noticesRes] = await Promise.all([
                    api.get('/students/dashboard'),
                    api.get('/notices')
                ]);
                setDashboardData(dashboardRes.data);
                setNotices(noticesRes.data);
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const courses = dashboardData?.courses || [];

    // Calculate attendance stats if available, otherwise use defaults
    const attendanceStats = dashboardData?.attendance?.reduce((acc, curr) => {
        acc.present += curr.present;
        acc.total += curr.total;
        return acc;
    }, { present: 0, total: 0 }) || { present: 0, total: 0 };

    const attendancePercentage = attendanceStats.total > 0
        ? Math.round((attendanceStats.present / attendanceStats.total) * 100)
        : 0;

    const ATTENDANCE_DATA = [
        { name: 'Present', value: attendancePercentage, color: '#10b981' },
        { name: 'Absent', value: 100 - attendancePercentage, color: '#ef4444' },
    ];

    if (loading) {
        return <div className="p-6 text-center">Loading dashboard...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Welcome & Profile Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row items-center gap-6 transition-colors">
                <div className="relative">
                    <img
                        src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}`}
                        alt="Profile"
                        className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-700 shadow-md"
                    />
                    <div className="absolute bottom-0 right-0 w-6 h-6 bg-success-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                </div>
                <div className="text-center md:text-left flex-1">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{user?.name}</h1>
                    <p className="text-gray-500 dark:text-gray-400 mb-2">
                        {dashboardData?.profile?.course} • Roll No: {dashboardData?.profile?.rollNo}
                    </p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-2">
                        {dashboardData?.profile?.isEligible ? (
                            <span className="px-3 py-1 bg-success-50 dark:bg-success-900/30 text-success-700 dark:text-success-400 text-xs font-medium rounded-full flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" /> Eligible for Exams
                            </span>
                        ) : (
                            <span className="px-3 py-1 bg-error-50 dark:bg-error-900/30 text-error-700 dark:text-error-400 text-xs font-medium rounded-full flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> Ineligible for Exams
                            </span>
                        )}
                        <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium rounded-full">
                            Semester {dashboardData?.profile?.semester}
                        </span>
                    </div>
                </div>
                <div className="flex gap-4 border-t md:border-t-0 md:border-l border-gray-100 dark:border-gray-700 pt-4 md:pt-0 md:pl-6 w-full md:w-auto justify-around md:justify-start">
                    <div className="text-center">
                        <div className="text-xl font-bold text-gray-900 dark:text-white">{dashboardData?.profile?.cgpa || '0.00'}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">CGPA</div>
                    </div>
                    <div className="text-center">
                        <div className="text-xl font-bold text-gray-900 dark:text-white">{dashboardData?.profile?.backlogs || '0'}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Backlogs</div>
                    </div>
                    <div className="text-center">
                        <div className="text-xl font-bold text-gray-900 dark:text-white">
                            {dashboardData?.profile?.attendancePercentage ?? attendancePercentage}%
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Attendance</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column - Courses & Notices */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Active Courses */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Enrolled Courses</h2>
                            <Link to="/student/courses" className="text-primary-600 dark:text-primary-400 text-sm font-medium hover:underline">View All</Link>
                        </div>
                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                            {courses.map((course) => (
                                <div key={course.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <div className="flex justify-between mb-2">
                                        <h3 className="font-medium text-gray-900 dark:text-white">{course.name}</h3>
                                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{course.id}</span>
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{course.instructor}</p>
                                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                                        <div
                                            className="bg-primary-500 h-2 rounded-full transition-all duration-1000"
                                            style={{ width: `${course.progress}%` }}
                                        ></div>
                                    </div>
                                    <div className="mt-1 text-right text-xs text-gray-400"> {course.progress}% Complete</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Notices */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-primary-500" />
                            Recent Notices
                        </h2>
                        <div className="space-y-4">
                            {notices.length > 0 ? (
                                notices.slice(0, 3).map((notice) => (
                                    <div key={notice._id} className="bg-primary-50/50 dark:bg-primary-900/20 p-4 rounded-lg border border-primary-100 dark:border-primary-800/30">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="font-medium text-primary-900 dark:text-primary-300">{notice.title}</h3>
                                            <span className="text-xs text-primary-600 dark:text-primary-400">
                                                {(() => {
                                                    const d = new Date(notice.createdAt || notice.date);
                                                    return !isNaN(d.getTime()) ? d.toLocaleDateString() : 'Recently';
                                                })()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-primary-800 dark:text-primary-200 opacity-90">{notice.content.substring(0, 100)}...</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400 text-sm">No recent notices.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column - Attendance & Schedule */}
                <div className="space-y-6">

                    {/* Attendance Chart */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Attendance</h2>
                        {attendanceStats.total > 0 ? (
                            <>
                                <div className="h-64 relative">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={ATTENDANCE_DATA}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                                stroke="none"
                                            >
                                                {ATTENDANCE_DATA.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    {/* Center Text */}
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                        <span className="text-3xl font-bold text-gray-900 dark:text-white">{attendancePercentage}%</span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">Present</span>
                                    </div>
                                </div>
                                <div className="flex justify-center gap-4 mt-4 text-sm">
                                    {ATTENDANCE_DATA.map((entry) => (
                                        <div key={entry.name} className="flex items-center gap-1.5">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
                                            <span className="text-gray-600 dark:text-gray-300">{entry.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="h-64 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                                <p>No attendance records yet</p>
                            </div>
                        )}
                    </div>

                    {/* Next Class */}
                    <div className="bg-primary-600 dark:bg-primary-700 rounded-xl shadow-sm p-6 text-white text-center transition-colors">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                            <Clock className="w-6 h-6 text-white" />
                        </div>
                        <p className="text-primary-100 text-sm font-medium uppercase tracking-wider mb-1">Next Class</p>

                        {dashboardData?.nextClass ? (
                            <>
                                <h3 className="text-xl font-bold mb-2">{dashboardData.nextClass.name}</h3>
                                <p className="text-primary-50 opacity-90 mb-4">
                                    {dashboardData.nextClass.day === new Date().toLocaleDateString('en-US', { weekday: 'long' }) ? 'Today' : dashboardData.nextClass.day} • {dashboardData.nextClass.room ? `Room ${dashboardData.nextClass.room}` : 'Online'} • {dashboardData.nextClass.time}
                                </p>
                            </>
                        ) : (
                            <>
                                <h3 className="text-xl font-bold mb-2">No Upcoming Classes</h3>
                                <p className="text-primary-50 opacity-90 mb-4">Enjoy your free time!</p>
                            </>
                        )}

                        <Link to="/student/timetable" className="w-full py-2 bg-white text-primary-600 dark:text-primary-700 rounded-lg hover:bg-primary-50 transition-colors font-medium text-sm inline-block">
                            View Timetable
                        </Link>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
