import React, { useState, useEffect } from 'react';
import { Bell, Plus, Edit2, Trash2, Search, Filter } from 'lucide-react';
import api from '../../utils/api';

const ManageNotices = () => {
    const [notices, setNotices] = useState([]);
    const [filteredNotices, setFilteredNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingNotice, setEditingNotice] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterAudience, setFilterAudience] = useState('all');
    const [filterType, setFilterType] = useState('all');

    const [noticeForm, setNoticeForm] = useState({
        title: '',
        content: '',
        audience: 'All Students',
        type: 'info'
    });

    const audiences = ['All Students', 'All Faculty', 'Everyone', 'All Parents'];
    const types = [
        { value: 'info', label: 'Info', color: 'blue' },
        { value: 'warning', label: 'Warning', color: 'yellow' },
        { value: 'success', label: 'Success', color: 'green' },
        { value: 'error', label: 'Error', color: 'red' }
    ];

    useEffect(() => {
        fetchNotices();
    }, []);

    useEffect(() => {
        filterNotices();
    }, [notices, searchTerm, filterAudience, filterType]);

    const fetchNotices = async () => {
        try {
            const { data } = await api.get('/notices');
            setNotices(data);
        } catch (error) {
            console.error('Failed to fetch notices:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterNotices = () => {
        let filtered = [...notices];

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(notice =>
                notice.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                notice.content?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Audience filter
        if (filterAudience !== 'all') {
            filtered = filtered.filter(notice =>
                notice.audience?.toLowerCase().includes(filterAudience.toLowerCase())
            );
        }

        // Type filter
        if (filterType !== 'all') {
            filtered = filtered.filter(notice => notice.type === filterType);
        }

        setFilteredNotices(filtered);
    };

    const handleOpenModal = (notice = null) => {
        if (notice) {
            setEditingNotice(notice);
            setNoticeForm({
                title: notice.title,
                content: notice.content,
                audience: notice.audience,
                type: notice.type
            });
        } else {
            setEditingNotice(null);
            setNoticeForm({
                title: '',
                content: '',
                audience: 'All Students',
                type: 'info'
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingNotice(null);
        setNoticeForm({ title: '', content: '', audience: 'All Students', type: 'info' });
    };

    const handleSaveNotice = async () => {
        if (!noticeForm.title || !noticeForm.content) {
            alert('Please fill all fields');
            return;
        }

        try {
            if (editingNotice) {
                await api.put(`/notices/${editingNotice._id}`, noticeForm);
                alert('Notice updated successfully!');
            } else {
                await api.post('/notices', noticeForm);
                alert('Notice created successfully!');
            }
            handleCloseModal();
            fetchNotices();
        } catch (error) {
            console.error('Failed to save notice:', error);
            alert('Failed to save notice');
        }
    };

    const handleDeleteNotice = async (noticeId) => {
        if (!confirm('Are you sure you want to delete this notice?')) return;

        try {
            await api.delete(`/notices/${noticeId}`);
            alert('Notice deleted successfully!');
            fetchNotices();
        } catch (error) {
            console.error('Failed to delete notice:', error);
            alert('Failed to delete notice');
        }
    };

    const getTypeColor = (type) => {
        const typeObj = types.find(t => t.value === type);
        return typeObj ? typeObj.color : 'gray';
    };

    const getTypeBadgeClass = (type) => {
        const colors = {
            blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
            yellow: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
            green: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
            red: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
            gray: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
        };
        return colors[getTypeColor(type)] || colors.gray;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in zoom-in duration-500">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Notices</h1>
                    <p className="text-gray-500 dark:text-gray-400">Create and manage announcements</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-bold shadow-lg"
                >
                    <Plus className="w-5 h-5" />
                    New Notice
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search notices..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                        />
                    </div>

                    {/* Audience Filter */}
                    <select
                        value={filterAudience}
                        onChange={(e) => setFilterAudience(e.target.value)}
                        className="px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    >
                        <option value="all">All Audiences</option>
                        <option value="student">Students</option>
                        <option value="faculty">Faculty</option>
                        <option value="parent">Parents</option>
                    </select>

                    {/* Type Filter */}
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    >
                        <option value="all">All Types</option>
                        {types.map(type => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Notices List */}
            <div className="space-y-4">
                {filteredNotices.length > 0 ? (
                    filteredNotices.map((notice) => (
                        <div
                            key={notice._id}
                            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-primary-200 dark:hover:border-primary-700 transition-all"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                                            <Bell className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                                {notice.title}
                                            </h3>
                                        </div>
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-300 mb-3 leading-relaxed">
                                        {notice.content}
                                    </p>
                                    <div className="flex items-center gap-3 text-sm">
                                        <span className={`px-3 py-1 rounded-lg font-medium ${getTypeBadgeClass(notice.type)}`}>
                                            {types.find(t => t.value === notice.type)?.label || notice.type}
                                        </span>
                                        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium">
                                            {notice.audience}
                                        </span>
                                        <span className="text-gray-500 dark:text-gray-400">
                                            {(() => {
                                                const date = new Date(notice.createdAt || notice.date);
                                                if (isNaN(date.getTime())) return 'Just now';
                                                return date.toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                });
                                            })()}
                                        </span>
                                        {notice.postedBy && (
                                            <span className="text-gray-500 dark:text-gray-400">
                                                • {notice.postedBy.name}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleOpenModal(notice)}
                                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                    >
                                        <Edit2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteNotice(notice._id)}
                                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                        <Bell className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-gray-400 font-medium">No notices found</p>
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full p-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                            {editingNotice ? 'Edit Notice' : 'Create New Notice'}
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    value={noticeForm.title}
                                    onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                                    placeholder="Enter notice title"
                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    Content
                                </label>
                                <textarea
                                    value={noticeForm.content}
                                    onChange={(e) => setNoticeForm({ ...noticeForm, content: e.target.value })}
                                    placeholder="Enter notice content"
                                    rows="5"
                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
                                ></textarea>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                        Audience
                                    </label>
                                    <select
                                        value={noticeForm.audience}
                                        onChange={(e) => setNoticeForm({ ...noticeForm, audience: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                                    >
                                        {audiences.map(aud => (
                                            <option key={aud} value={aud}>{aud}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                        Type
                                    </label>
                                    <select
                                        value={noticeForm.type}
                                        onChange={(e) => setNoticeForm({ ...noticeForm, type: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                                    >
                                        {types.map(type => (
                                            <option key={type.value} value={type.value}>{type.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={handleCloseModal}
                                    className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveNotice}
                                    className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-bold shadow-lg"
                                >
                                    {editingNotice ? 'Update' : 'Create'} Notice
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageNotices;
