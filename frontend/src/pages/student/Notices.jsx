import React, { useState, useEffect } from 'react';
import { FileText, Download, Calendar, Pin, AlertCircle } from 'lucide-react';
import api from '../../utils/api';

const Notices = () => {
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchNotices = async () => {
            try {
                const { data } = await api.get('/notices');
                setNotices(data);
            } catch (err) {
                console.error("Failed to fetch notices:", err);
                setError("Failed to load notices. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchNotices();
    }, []);

    const getCategoryStyles = (type) => {
        switch (type) {
            case 'academic':
                return 'bg-blue-100 text-blue-700';
            case 'holiday':
                return 'bg-red-100 text-red-700';
            case 'event':
                return 'bg-purple-100 text-purple-700';
            default:
                return 'bg-gray-100 text-gray-600';
        }
    };

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
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notices & Circulars</h1>
                <p className="text-gray-500 dark:text-gray-400">Stay updated with latest announcements</p>
            </div>

            <div className="space-y-4">
                {notices.length > 0 ? (
                    notices.map((notice) => (
                        <div key={notice._id} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow relative overflow-hidden">
                            {/* Pin high priority notices if applicable - assuming based on type or new field */}
                            {notice.type === 'academic' && (
                                <div className="absolute top-0 right-0 p-2">
                                    <Pin className="w-5 h-5 text-gray-300 dark:text-gray-600 fill-current rotate-45" />
                                </div>
                            )}

                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="flex-shrink-0 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-700/50 rounded-lg w-20 h-20 p-2 text-center border border-gray-200 dark:border-gray-600">
                                    {/* Handle various date formats safely */}
                                    {(() => {
                                        const d = new Date(notice.date);
                                        const isValid = notice.date && !isNaN(d.getTime());
                                        return (
                                            <>
                                                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase">
                                                    {isValid ? d.toLocaleString('default', { month: 'short' }) : '---'}
                                                </span>
                                                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                                    {isValid ? d.getDate() : '--'}
                                                </span>
                                                <span className="text-xs text-gray-400 dark:text-gray-500">
                                                    {isValid ? d.getFullYear() : '----'}
                                                </span>
                                            </>
                                        );
                                    })()}
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getCategoryStyles(notice.type)}`}>
                                            {notice.audience}
                                        </span>
                                        <span className="text-xs text-gray-400 dark:text-gray-500 border-l dark:border-gray-700 pl-3">
                                            Posted by: {notice.postedBy?.name || 'Admin'}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{notice.title}</h3>
                                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 leading-relaxed">
                                        {notice.content}
                                    </p>
                                    {notice.attachmentUrl && (
                                        <button
                                            onClick={() => window.open(notice.attachmentUrl, '_blank')}
                                            className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                                        >
                                            <FileText className="w-4 h-4" />
                                            Download Attachment
                                            <Download className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
                        <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-gray-400">No notices found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notices;
