import React, { useState, useRef, useEffect } from 'react';
import { LogOut, Bell, Search, Menu, Sun, Moon, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { logout, getCurrentUser } from '../utils/auth';
import { useTheme } from '../context/ThemeContext';
import { io } from 'socket.io-client';

const TopNavbar = ({ toggleSidebar }) => {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const user = getCurrentUser();
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const notificationRef = useRef(null);

    // Socket.io Real-time Notifications
    useEffect(() => {
        if (!user || !user._id) return;

        const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');

        socket.on('connect', () => {
            console.log('Connected to socket server');
            socket.emit('join', user._id);
        });

        socket.on('new_notification', (notification) => {
            const formatted = {
                id: notification._id,
                text: notification.message,
                time: "Just now",
                read: notification.read,
                type: notification.type
            };
            setNotifications(prev => [formatted, ...prev]);
        });

        return () => {
            socket.disconnect();
        };
    }, [user?._id]);

    // Fetch notifications initially
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                if (user) {
                    const { default: api } = await import('../utils/api');
                    const response = await api.get('/notifications');
                    const formatted = response.data.map(n => ({
                        id: n._id,
                        text: n.message,
                        time: n.createdAt && !isNaN(new Date(n.createdAt).getTime())
                            ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : 'Recently',
                        read: n.read,
                        type: n.type
                    }));
                    setNotifications(formatted);
                }
            } catch (error) {
                console.error("Failed to fetch notifications:", error);
            }
        };

        fetchNotifications();
    }, [user?._id]);

    // Close notification dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const unreadCount = notifications.filter(n => !n.read).length;

    const markAsRead = async (id) => {
        try {
            const { default: api } = await import('../utils/api');
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
            const { default: api } = await import('../utils/api');
            await api.put('/notifications/read-all');
            setNotifications(notifications.map(n => ({ ...n, read: true })));
        } catch (error) {
            console.error("Failed to mark all as read", error);
        }
    };

    return (
        <header className="h-16 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 fixed top-0 right-0 lg:left-64 left-0 z-30 flex items-center justify-between px-4 lg:px-8 transition-all duration-300 shadow-sm shadow-gray-200/20">
            <div className="flex items-center gap-4">
                <button
                    onClick={toggleSidebar}
                    className="p-2 -ml-2 rounded-lg hover:bg-white dark:hover:bg-gray-700 lg:hidden text-gray-600 dark:text-gray-300 transition-colors shadow-sm active:scale-95"
                >
                    <Menu className="w-6 h-6" />
                </button>

                {/* Logo - visible ONLY on mobile navbar to replace the hidden sidebar */}
                <div className="lg:hidden flex items-center gap-2 group cursor-pointer" onClick={() => navigate('/')}>
                    <div className="p-1 bg-gradient-to-tr from-primary-500 to-info-400 rounded-lg shadow-lg shadow-primary-500/20 group-hover:scale-105 transition-transform duration-300">
                        <img src="/logo.png" alt="Nexus" className="h-6 w-6 rounded-md object-cover brightness-110" />
                    </div>
                </div>

                {/* Search bar - refined with better focus states */}
                <div className="hidden md:flex items-center bg-gray-100/50 dark:bg-gray-700/50 border border-gray-200/50 dark:border-gray-600/50 rounded-xl px-4 py-2 w-64 lg:w-72 transition-all duration-300 focus-within:w-80 focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500 focus-within:bg-white dark:focus-within:bg-gray-900 shadow-inner">
                    <Search className="w-4 h-4 text-gray-400 dark:text-gray-300 mr-2" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="bg-transparent !border-none !outline-none !shadow-none !ring-0 focus:!ring-0 text-sm w-full placeholder-gray-400 dark:placeholder-gray-500 text-gray-700 dark:text-gray-200 font-medium"
                    />
                </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
                {/* Theme Toggle - refined design */}
                <button
                    onClick={toggleTheme}
                    className="p-2.5 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700 transition-all duration-200 hover:shadow-md hover:scale-105 active:scale-95 border border-transparent hover:border-gray-100 dark:hover:border-gray-600"
                    title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                >
                    {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
                </button>
                {/* Notification Bell */}
                <div className="relative" ref={notificationRef}>
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className={`p-2 rounded-full relative transition-all ${showNotifications ? 'bg-primary-50 text-primary-600' : 'text-gray-500 hover:bg-gray-100'}`}
                    >
                        <Bell className="w-5 h-5" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                        )}
                    </button>

                    {/* Notification Dropdown */}
                    {showNotifications && (
                        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                            <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                                <div>
                                    <h3 className="font-bold text-gray-900">Notifications</h3>
                                    <p className="text-xs text-gray-500">You have {unreadCount} unread messages</p>
                                </div>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllAsRead}
                                        className="text-xs font-medium text-primary-600 hover:text-primary-700 hover:underline"
                                    >
                                        Mark all read
                                    </button>
                                )}
                            </div>

                            <div className="max-h-[320px] overflow-y-auto">
                                {notifications.length > 0 ? (
                                    <div className="divide-y divide-gray-50">
                                        {notifications.map((notification) => (
                                            <div
                                                key={notification.id}
                                                className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer group ${notification.read ? 'opacity-70' : 'bg-primary-50/30'}`}
                                                onClick={() => markAsRead(notification.id)}
                                            >
                                                <div className="flex gap-3">
                                                    <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${notification.read ? 'bg-gray-300' : 'bg-primary-500'}`}></div>
                                                    <div className="flex-1">
                                                        <p className={`text-sm ${notification.read ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                                                            {notification.text}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-1.5">
                                                            <Clock className="w-3 h-3 text-gray-400" />
                                                            <span className="text-xs text-gray-400">{notification.time}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center text-gray-500">
                                        <Bell className="w-8 h-8 mx-auto mb-3 text-gray-300" />
                                        <p className="text-sm">No notifications yet</p>
                                    </div>
                                )}
                            </div>

                            <div className="p-3 border-t border-gray-50 text-center bg-gray-50/30">
                                <button
                                    onClick={() => {
                                        setShowNotifications(false);
                                        window.location.href = '/notifications';
                                    }}
                                    className="text-xs font-medium text-gray-500 hover:text-primary-600 transition-colors"
                                >
                                    View All Notifications
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="h-8 w-px bg-gray-200 mx-1"></div>

                <div className="flex items-center gap-3 pl-2 border-l border-gray-100 dark:border-gray-700">
                    <div className="hidden sm:flex flex-col items-end mr-1">
                        <p className="text-xs font-black text-gray-900 dark:text-white leading-none mb-1 uppercase tracking-tighter">{user?.name}</p>
                        <div className="px-2 py-0.5 bg-primary-50 dark:bg-primary-900/20 rounded text-[8px] font-black text-primary-600 dark:text-primary-400 uppercase tracking-widest border border-primary-100 dark:border-primary-800/50">
                            {user?.role}
                        </div>
                    </div>

                    <button
                        className="flex items-center gap-2 focus:outline-none group"
                        onClick={() => navigate(`/${user?.role}/settings`)}
                        title="Go to Profile"
                    >
                        <div className="relative p-0.5 rounded-full bg-gradient-to-tr from-primary-500 to-info-400 shadow-sm group-hover:shadow-md transition-all group-hover:scale-105">
                            <img
                                src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}`}
                                alt={user?.name}
                                className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 object-cover"
                            />
                        </div>
                    </button>

                    <button
                        onClick={logout}
                        className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors ml-1"
                        title="Logout"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default TopNavbar;
