import React, { useState, useEffect } from 'react';
import { Bell, Check, Clock, Filter, Trash2 } from 'lucide-react';
import api from '../../utils/api';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // 'all', 'unread'

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await api.get('/notifications');
            // Format time relative
            const formatted = response.data.map(n => ({
                id: n._id,
                text: n.message,
                time: new Date(n.createdAt).toLocaleString(),
                read: n.read,
                type: n.type,
                originalDate: new Date(n.createdAt)
            }));
            setNotifications(formatted);
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(notifications.map(n =>
                n.id === id ? { ...n, read: true } : n
            ));
        } catch (error) {
            console.error("Failed to mark as read", error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.put('/notifications/read-all');
            setNotifications(notifications.map(n => ({ ...n, read: true })));
        } catch (error) {
            console.error("Failed to mark all as read", error);
        }
    };

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'unread') return !n.read;
        return true;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                    <p className="text-gray-500">View and manage your alerts</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={markAllAsRead}
                        className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                        <Check className="w-4 h-4" />
                        <span>Mark all as read</span>
                    </button>
                    {/* Future: Clear All button */}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex gap-4">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'all' ? 'bg-primary-50 text-primary-700' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilter('unread')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'unread' ? 'bg-primary-50 text-primary-700' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            Unread
                        </button>
                    </div>
                </div>

                <div className="divide-y divide-gray-100">
                    {loading ? (
                        <div className="p-8 text-center text-gray-500">Loading notifications...</div>
                    ) : filteredNotifications.length > 0 ? (
                        filteredNotifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`p-6 hover:bg-gray-50 transition-colors cursor-pointer group ${notification.read ? 'opacity-70' : 'bg-blue-50/10'}`}
                                onClick={() => markAsRead(notification.id)}
                            >
                                <div className="flex gap-4">
                                    <div className={`mt-1 w-3 h-3 rounded-full flex-shrink-0 ${notification.read ? 'bg-gray-300' : 'bg-primary-500'}`}></div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <p className={`text-base ${notification.read ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                                                {notification.text}
                                            </p>
                                            <span className={`px-2 py-1 rounded text-xs font-medium uppercase tracking-wider ${notification.type === 'alert' ? 'bg-red-50 text-red-700' :
                                                    notification.type === 'success' ? 'bg-green-50 text-green-700' :
                                                        notification.type === 'academic' ? 'bg-purple-50 text-purple-700' :
                                                            'bg-gray-100 text-gray-600'
                                                }`}>
                                                {notification.type}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-2">
                                            <Clock className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm text-gray-500">{notification.time}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-12 text-center text-gray-500">
                            <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <h3 className="text-lg font-medium text-gray-900">No notifications</h3>
                            <p className="mt-1">You're all caught up!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Notifications;
