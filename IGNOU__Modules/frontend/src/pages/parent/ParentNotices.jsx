import React, { useState, useEffect } from 'react';
import { Bell, FileText, Download, Calendar } from 'lucide-react';
import api from '../../utils/api';

const ParentNotices = () => {
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotices = async () => {
            try {
                // Fetch notices meant for 'Parent' or 'All'
                const { data } = await api.get('/parent/notices');
                setNotices(data);
            } catch (error) {
                console.error("Failed to fetch notices", error);
            } finally {
                setLoading(false);
            }
        };

        fetchNotices();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notices & Circulars</h1>

            {notices.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 text-center">
                    <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Bell className="w-8 h-8 text-blue-500 dark:text-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No New Notices</h3>
                    <p className="text-gray-500 dark:text-gray-400">You're all caught up! Check back later for updates.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {notices.map((notice) => (
                        <div key={notice._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-transform hover:-translate-y-1">
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-lg ${notice.type === 'event' ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-300' :
                                        notice.type === 'holiday' ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-300' :
                                            notice.type === 'academic' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300' :
                                                'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-300'
                                        }`}>
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium uppercase tracking-wider ${notice.type === 'event' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' :
                                                notice.type === 'holiday' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' :
                                                    notice.type === 'academic' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' :
                                                        'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300'
                                                }`}>
                                                {notice.type}
                                            </span>
                                            <span className="text-xs text-gray-400 flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {notice.date && !isNaN(new Date(notice.date).getTime()) ? new Date(notice.date).toLocaleDateString() : 'Recently'}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{notice.title}</h3>
                                        <p className="text-gray-600 dark:text-gray-300 mb-4">{notice.content}</p>

                                        {notice.attachmentUrl && (
                                            <a
                                                href={notice.attachmentUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                            >
                                                <Download className="w-4 h-4" />
                                                Download Attachment
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ParentNotices;
