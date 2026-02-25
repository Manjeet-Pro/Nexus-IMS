
import React, { useState, useEffect } from 'react';
import { BookOpen, Clock, Users, Plus, Send, CheckCircle, BarChart, Calendar, Bell } from 'lucide-react';
import { getCurrentUser } from '../../utils/auth';
import api from '../../utils/api';
import ErrorBoundary from '../../components/ErrorBoundary';
import { io } from 'socket.io-client';

const FacultyDashboardContent = () => {
    const user = getCurrentUser();
    const [announcement, setAnnouncement] = useState('');
    const [posts, setPosts] = useState([]);

    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [noticesRes, dashboardRes] = await Promise.all([
                    api.get('/notices'),
                    api.get('/faculty/dashboard')
                ]);
                setPosts(noticesRes.data);
                setDashboardData(dashboardRes.data);
            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        // Setup Socket.io for real-time notices
        const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');

        socket.on('new-notice', (newNotice) => {
            console.log('New notice received:', newNotice);
            setPosts(prevPosts => [newNotice, ...prevPosts]);
        });

        // Cleanup on unmount
        return () => {
            socket.disconnect();
        };
    }, []);

    const handlePost = async () => {
        if (!announcement.trim()) return;

        try {
            await api.post('/notices', {
                title: 'Announcement',
                content: announcement,
                audience: 'All Students',
                type: 'info'
            });

            // Socket will automatically update posts via 'new-notice' event
            setAnnouncement('');
        } catch (error) {
            console.error('Failed to post notice:', error);
            alert('Failed to post announcement');
        }
    };

    const courses = dashboardData?.schedule || [];
    const performanceData = dashboardData?.performance || [];

    if (loading) {
        return <div className="p-10 text-center text-gray-500">Loading Dashboard...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-primary-800 to-primary-600 rounded-2xl p-8 text-white shadow-lg">
                <div className="flex items-center gap-6">
                    <img
                        src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}`}
                        alt="Profile"
                        className="w-20 h-20 rounded-full border-4 border-white/20"
                    />
                    <div>
                        <h1 className="text-3xl font-bold mb-1">Welcome back, {user?.name}</h1>
                        <p className="text-primary-100 opacity-90">
                            {dashboardData?.profile?.department || 'Faculty'} Department • ID: {dashboardData?.profile?.employeeId || 'N/A'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Today's Schedule */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-700/30 rounded-t-2xl">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Clock className="w-5 h-5 text-primary-600" />
                            Today's Schedule
                        </h2>
                        <button
                            onClick={() => window.location.href = '/faculty/timetable'}
                            className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 font-medium"
                        >
                            View Full Timetable
                        </button>
                    </div>
                    <div className="p-6">
                        {courses.length > 0 ? (
                            <div className="space-y-4">
                                {courses.map((slot, index) => (
                                    <div key={index} className="flex items-center p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                                        <div className="w-24 text-center border-r border-gray-100 dark:border-gray-700 pr-4">
                                            <span className="block text-lg font-bold text-gray-900 dark:text-white">{slot.time}</span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{slot.room}</span>
                                        </div>
                                        <div className="pl-4 flex-1">
                                            <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">{slot.name}</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">Batch: {slot.id}</p>
                                        </div>
                                        <div className="hidden sm:block">
                                            <span className="px-3 py-1 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-lg text-xs font-bold">
                                                Lecture
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10">
                                <div className="w-16 h-16 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Calendar className="w-8 h-8 text-gray-300 dark:text-gray-500" />
                                </div>
                                <p className="text-gray-500 dark:text-gray-400 font-medium">No classes scheduled for today.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions & Performance */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-emerald-500" />
                            Quick Actions
                        </h2>
                        <div className="space-y-3">
                            <button
                                onClick={() => window.location.href = '/faculty/attendance'}
                                className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all group bg-white dark:bg-gray-800 shadow-sm hover:shadow-md"
                            >
                                <span className="font-bold text-gray-700 dark:text-gray-300 group-hover:text-primary-700 dark:group-hover:text-primary-400">Mark Attendance</span>
                                <CheckCircle className="w-5 h-5 text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-transform group-hover:scale-110" />
                            </button>
                            <button
                                onClick={() => window.location.href = '/faculty/marks'}
                                className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all group bg-white dark:bg-gray-800 shadow-sm hover:shadow-md"
                            >
                                <span className="font-bold text-gray-700 dark:text-gray-300 group-hover:text-primary-700 dark:group-hover:text-primary-400">Upload Marks</span>
                                <Plus className="w-5 h-5 text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-transform group-hover:scale-110" />
                            </button>
                            <button
                                onClick={() => window.location.href = '/faculty/directory'}
                                className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all group bg-white dark:bg-gray-800 shadow-sm hover:shadow-md"
                            >
                                <span className="font-bold text-gray-700 dark:text-gray-300 group-hover:text-primary-700 dark:group-hover:text-primary-400">Student List</span>
                                <Users className="w-5 h-5 text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-transform group-hover:scale-110" />
                            </button>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <BarChart className="w-5 h-5 text-blue-500" />
                            Class Performance
                        </h2>
                        <div className="space-y-4">
                            {performanceData.map((item, index) => (
                                <div key={index}>
                                    <div className="flex justify-between text-sm mb-1.5 font-medium">
                                        <span className="text-gray-600 dark:text-gray-300">{item.subject}</span>
                                        <span className="text-gray-900 dark:text-white">{item.avg}% Avg</span>
                                    </div>
                                    <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${item.avg >= 75 ? 'bg-emerald-500' : item.avg >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                                            style={{ width: `${item.avg}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                            {performanceData.length === 0 && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">No performance data available.</p>
                            )}
                        </div>
                    </div>

                    {/* Announcements */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Post Announcement</h2>
                        <div className="space-y-4">
                            <textarea
                                value={announcement}
                                onChange={(e) => setAnnouncement(e.target.value)}
                                placeholder="Type your message to students..."
                                className="w-full p-3 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none h-32 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            ></textarea>
                            <button
                                onClick={handlePost}
                                className="w-full py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 font-medium"
                            >
                                <Send className="w-4 h-4" />
                                Post Message
                            </button>
                        </div>


                        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Recent Posts</h3>
                            <div className="space-y-3">
                                {posts.map((post) => (
                                    <div
                                        key={post._id}
                                        className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600 hover:border-primary-200 dark:hover:border-primary-700 transition-all"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="mt-0.5 p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                                                <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white leading-relaxed mb-2">
                                                    {post.content}
                                                </p>
                                                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                                    <span className="font-medium">
                                                        {(() => {
                                                            const date = new Date(post.createdAt || post.date);
                                                            const displayDate = isNaN(date.getTime()) ? new Date() : date;
                                                            return displayDate.toLocaleDateString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric'
                                                            });
                                                        })()}
                                                    </span>
                                                    <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                                                    <span className="px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-md font-medium">
                                                        {post.audience}
                                                    </span>
                                                    {post.postedBy && (
                                                        <>
                                                            <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                                                            <span>{post.postedBy.name}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

const FacultyDashboard = () => (
    <ErrorBoundary>
        <FacultyDashboardContent />
    </ErrorBoundary>
);

export default FacultyDashboard;
