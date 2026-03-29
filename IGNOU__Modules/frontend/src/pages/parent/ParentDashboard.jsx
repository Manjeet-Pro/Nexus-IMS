import React, { useState, useEffect } from 'react';
import { Users, BookOpen, Clock, Activity } from 'lucide-react';
import api from '../../utils/api';
import { getCurrentUser } from '../../utils/auth';

import { useNavigate } from 'react-router-dom';

const ParentDashboard = () => {
    const [children, setChildren] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = getCurrentUser();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const { data } = await api.get('/parent/dashboard');
                // Backend returns parent object with populated children
                setChildren(data.children || []);
            } catch (error) {
                console.error("Failed to fetch parent dashboard", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    // Helper to get initials
    const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome, {user?.name}</h1>
                <p className="text-gray-500 dark:text-gray-400">Here is an overview of your children's performance.</p>
            </div>

            {children.length === 0 ? (
                <div className="bg-primary-50 dark:bg-primary-900/10 border border-primary-200 dark:border-primary-800/30 rounded-xl p-8 text-center">
                    <div className="bg-primary-100 dark:bg-primary-800/40 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Children Linked</h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                        It looks like no student accounts are linked to your profile yet. Please contact the administration to link your children's accounts.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {children.map((child) => (
                        <div key={child._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
                            <div className="bg-gradient-to-r from-primary-600 to-primary-800 p-6 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                                <div className="flex items-center gap-4 relative z-10">
                                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full p-1 shadow-inner">
                                        <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                                            {child.user?.avatar ? (
                                                <img src={child.user.avatar} alt={child.user.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-xl font-bold text-primary-700">{getInitials(child.user?.name)}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">{child.user?.name}</h3>
                                        <p className="text-primary-100 text-sm">{child.rollNo} • {child.course}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 grid grid-cols-2 gap-4">
                                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                                        <Clock className="w-4 h-4" />
                                        <span className="text-xs font-medium">Attendance</span>
                                    </div>
                                    <p className={`text-lg font-bold ${child.attendancePercentage >= 75 ? 'text-green-600' : 'text-red-600'}`}>
                                        {child.attendancePercentage}%
                                    </p>
                                </div>
                                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                                        <Activity className="w-4 h-4" />
                                        <span className="text-xs font-medium">Performance</span>
                                    </div>
                                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                                        {child.performance}
                                    </p>
                                </div>
                            </div>

                            <div className="px-6 pb-6">
                                <button
                                    onClick={() => navigate(`/parent/child/${child._id}`)}
                                    className="w-full py-2.5 bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300 font-medium rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors flex items-center justify-center gap-2"
                                >
                                    <BookOpen className="w-4 h-4" />
                                    View Detailed Report
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ParentDashboard;
