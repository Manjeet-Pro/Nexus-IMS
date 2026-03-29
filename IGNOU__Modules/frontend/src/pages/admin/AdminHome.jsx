
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, GraduationCap, BookOpen, Banknote } from 'lucide-react';
import StatCard from '../../components/StatCard';

import api from '../../utils/api';

const AdminHome = () => {
    const [stats, setStats] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/admin/stats');
                setStats(response.data);
            } catch (error) {
                console.error("Failed to fetch admin stats:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="p-6">Loading dashboard...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                <div className="text-sm text-gray-500">Academic Year 2025-26</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Students"
                    value={stats?.students?.total || 0}
                    icon={GraduationCap}
                    trend={stats?.students?.trend}
                    trendValue={stats?.students?.trendValue}
                    color="bg-indigo-500"
                />
                <StatCard
                    title="Total Faculty"
                    value={stats?.faculty?.total || 0}
                    icon={Users}
                    trend={stats?.faculty?.trend}
                    trendValue={stats?.faculty?.trendValue}
                    color="bg-purple-500"
                />
                <StatCard
                    title="Total Parents"
                    value={stats?.parents?.total || 0}
                    icon={Users}
                    trend={stats?.parents?.trend}
                    trendValue={stats?.parents?.trendValue}
                    color="bg-pink-500"
                />
                <StatCard
                    title="Active Courses"
                    value={stats?.courses?.total || 0}
                    icon={BookOpen}
                    trend={stats?.courses?.trend}
                    trendValue={stats?.courses?.trendValue}
                    color="bg-emerald-500"
                />
                <StatCard
                    title="Fee Collection"
                    value={stats?.fees?.total || '₹0'}
                    icon={Banknote}
                    trend={stats?.fees?.trend}
                    trendValue={stats?.fees?.trendValue}
                    color="bg-amber-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Institute Overview</h2>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats?.graphData || []}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    cursor={{ fill: '#F3F4F6' }}
                                />
                                <Bar dataKey="students" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={32} />
                                <Bar dataKey="faculty" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={32} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Activities</h2>
                    <div className="space-y-4">
                        {stats?.recentActivities?.length > 0 ? (
                            stats.recentActivities.map((activity) => (
                                <div key={activity.id} className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                                    <div className={`w-2 h-2 mt-2 rounded-full ${activity.color}`}></div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-800">{activity.message}</p>
                                        <p className="text-xs text-gray-500">
                                            {activity.time && !isNaN(new Date(activity.time).getTime())
                                                ? `${new Date(activity.time).toLocaleDateString()} ${new Date(activity.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                                                : 'Recently'}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500">No recent activities found.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminHome;
