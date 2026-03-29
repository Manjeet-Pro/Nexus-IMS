import React, { useState, useEffect } from 'react';
import { Search, Download, Trash2, Eye, UserPlus, Mail, Phone, MapPin } from 'lucide-react';
import { exportToCSV } from '../../utils/export';
import api from '../../utils/api';

const Parents = () => {
    const [parents, setParents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewingParent, setViewingParent] = useState(null);
    const [editingParent, setEditingParent] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Form State (Shared for Edit and Add)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        children: []
    });
    const [studentSearch, setStudentSearch] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchingStudents, setSearchingStudents] = useState(false);

    // Fetch parents
    useEffect(() => {
        fetchParents();
    }, []);

    const fetchParents = async () => {
        try {
            const response = await api.get('/admin/parents');
            setParents(response.data);
        } catch (error) {
            console.error("Failed to fetch parents:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredParents = parents.filter(parent => {
        const name = (parent.name || "").toLowerCase();
        const email = (parent.email || "").toLowerCase();
        const children = (String(parent.children) || "").toLowerCase();
        const search = searchTerm.toLowerCase();

        return name.includes(search) || email.includes(search) || children.includes(search);
    });

    const handleExport = () => {
        exportToCSV(filteredParents, 'parents_list');
    };

    const handleDeleteClick = async (id) => {
        if (window.confirm('Are you sure you want to delete this parent account? This will unlink all associated students.')) {
            try {
                await api.delete(`/admin/parents/${id}`);
                setParents(parents.filter(p => p.id !== id));
                alert("Parent deleted successfully");
            } catch (error) {
                console.error("Delete failed:", error);
                alert("Failed to delete parent");
            }
        }
    };

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleEditClick = (parent) => {
        setEditingParent(parent);
        setFormData({
            name: parent.name,
            email: parent.email,
            phone: parent.phone || '',
            address: parent.address || '',
            children: parent.childrenData || [] // Store full objects initially, but we send IDs
        });
        setIsAddModalOpen(true);
    };

    const handleStudentSearch = async (val) => {
        setStudentSearch(val);
        if (val.length < 2) {
            setSearchResults([]);
            return;
        }
        setSearchingStudents(true);
        try {
            const { data } = await api.get(`/auth/search-students?query=${val}`);
            setSearchResults(data);
        } catch (error) {
            console.error("Student search failed:", error);
        } finally {
            setSearchingStudents(false);
        }
    };

    const addChild = (student) => {
        if (formData.children.some(c => c.id === student._id || c._id === student._id)) {
            alert("Student already linked");
            return;
        }
        setFormData({
            ...formData,
            children: [...formData.children, { id: student._id, name: student.name, rollNo: student.rollNo }]
        });
        setStudentSearch('');
        setSearchResults([]);
    };

    const removeChild = (id) => {
        setFormData({
            ...formData,
            children: formData.children.filter(c => (c.id || c._id) !== id)
        });
    };

    const handleAddClick = () => {
        setEditingParent(null);
        setFormData({ name: '', email: '', phone: '', address: '', children: [] });
        setIsAddModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const submissionData = {
                ...formData,
                children: formData.children.map(c => c.id || c._id)
            };
            if (editingParent) {
                await api.put(`/admin/parents/${editingParent.id}`, submissionData);
                alert('Parent details updated successfully!');
            } else {
                await api.post('/admin/parents', submissionData);
                alert('Parent added successfully! Default pass: Nexus@2024!');
            }
            setIsAddModalOpen(false);
            setEditingParent(null);
            fetchParents();
        } catch (error) {
            console.error("Operation failed:", error);
            alert(error.response?.data?.message || 'Operation failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 relative animate-in fade-in zoom-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Parents</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage registered parents and their children</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleExport}
                        className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        <span>Export</span>
                    </button>

                    <button
                        onClick={handleAddClick}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/30 flex items-center gap-2"
                    >
                        <UserPlus className="w-4 h-4" />
                        <span>Add Parent</span>
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex gap-4 bg-gray-50/50 dark:bg-gray-700/30">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search by name, email, or child..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full !pl-12 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 font-medium text-sm">
                            <tr>
                                <th className="px-6 py-3">Parent Name</th>
                                <th className="px-6 py-3">Contact</th>
                                <th className="px-6 py-3">Children Linked</th>
                                <th className="px-6 py-3">Joined</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">Loading parents...</td>
                                </tr>
                            ) : filteredParents.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No parents found matching your search.</td>
                                </tr>
                            ) : (
                                filteredParents.map((parent) => (
                                    <tr key={parent.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-700 dark:text-primary-400 font-bold text-xs">
                                                    {parent.name.charAt(0)}
                                                </div>
                                                <div className="font-medium text-gray-900 dark:text-white">{parent.name}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                                    <Mail className="w-3 h-3 text-gray-400" /> {parent.email}
                                                </div>
                                                {parent.phone && (
                                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                                        <Phone className="w-3 h-3 text-gray-400" /> {parent.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate" title={parent.children}>
                                                {parent.children}
                                            </div>
                                            <span className="text-xs text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-2 py-0.5 rounded-full mt-1 inline-block">
                                                {parent.childrenCount} Linked
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400 text-sm">
                                            {parent.joinedAt && !isNaN(new Date(parent.joinedAt).getTime()) ? new Date(parent.joinedAt).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => setViewingParent(parent)}
                                                    className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleEditClick(parent)}
                                                    className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-warning-600 dark:hover:text-warning-400 hover:bg-warning-50 dark:hover:bg-warning-900/30 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <UserPlus className="w-4 h-4" /> {/* Reusing UserPlus icon for Edit temporarily or import Edit icon */}
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(parent.id)}
                                                    className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-danger-600 dark:hover:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-900/30 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* View Parent Modal */}
            {
                viewingParent && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200 border border-gray-100 dark:border-gray-700">
                            <div className="flex justify-between items-start mb-6">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Parent Details</h2>
                                <button onClick={() => setViewingParent(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                    <Trash2 className="w-5 h-5 hidden" /> {/* Dummy hidden icon to alignment? No, just X */}
                                    <span className="text-2xl leading-none">&times;</span>
                                </button>
                            </div>

                            <div className="flex flex-col items-center mb-6">
                                <div className="w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-700 dark:text-primary-400 font-bold text-2xl mb-3">
                                    {viewingParent.name.charAt(0)}
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{viewingParent.name}</h3>
                                <p className="text-gray-500 dark:text-gray-400">Parent Account</p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold mb-2">Contact Info</h4>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-200">
                                            <Mail className="w-4 h-4 text-gray-400" />
                                            {viewingParent.email}
                                        </div>
                                        {viewingParent.phone && (
                                            <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-200">
                                                <Phone className="w-4 h-4 text-gray-400" />
                                                {viewingParent.phone}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold mb-2">Attached Students</h4>
                                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-sm text-gray-700 dark:text-gray-200">
                                        {viewingParent.children}
                                    </div>
                                </div>

                                {viewingParent.address && (
                                    <div>
                                        <h4 className="text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold mb-2">Address</h4>
                                        <div className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-200">
                                            <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                                            {viewingParent.address}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => setViewingParent(null)}
                                className="w-full mt-6 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )
            }

            {/* Add/Edit Parent Modal */}
            {
                isAddModalOpen && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200 border border-gray-100 dark:border-gray-700">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    {editingParent ? 'Edit Parent Details' : 'Add New Parent'}
                                </h2>
                                <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                    <span className="text-2xl leading-none">&times;</span>
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto pr-2 custom-scrollbar">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Parent Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-gray-900 dark:text-white"
                                        placeholder="+91..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                                    <textarea
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-gray-900 dark:text-white"
                                        rows="2"
                                        placeholder="Full Address..."
                                    />
                                </div>

                                <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl space-y-3">
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <Search className="w-4 h-4" /> Link Students
                                    </h3>

                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Search name or roll no..."
                                            value={studentSearch}
                                            onChange={(e) => handleStudentSearch(e.target.value)}
                                            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                        {searchingStudents && (
                                            <div className="absolute right-3 top-2.5">
                                                <div className="w-4 h-4 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                                            </div>
                                        )}

                                        {searchResults.length > 0 && (
                                            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl overflow-hidden max-h-48 overflow-y-auto">
                                                {searchResults.map(s => (
                                                    <button
                                                        key={s._id}
                                                        type="button"
                                                        onClick={() => addChild(s)}
                                                        className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex justify-between items-center group"
                                                    >
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900 dark:text-white">{s.name}</div>
                                                            <div className="text-xs text-gray-500">{s.rollNo} • {s.course}</div>
                                                        </div>
                                                        <UserPlus className="w-4 h-4 text-primary-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2 max-h-32 overflow-y-auto scrollbar-thin">
                                        {formData.children.length === 0 ? (
                                            <p className="text-xs text-gray-400 text-center py-2 italic">No students linked yet</p>
                                        ) : (
                                            formData.children.map(child => (
                                                <div key={child.id || child._id} className="flex items-center justify-between bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-100 dark:border-gray-600">
                                                    <div>
                                                        <div className="text-xs font-bold text-gray-900 dark:text-white">{child.name}</div>
                                                        <div className="text-[10px] text-gray-500">{child.rollNo}</div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeChild(child.id || child._id)}
                                                        className="text-danger-500 hover:bg-danger-50 p-1 rounded"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setIsAddModalOpen(false)}
                                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium disabled:opacity-70"
                                    >
                                        {isSubmitting ? 'Saving...' : (editingParent ? 'Update Details' : 'Add Parent')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
        </div>
    );
};

export default Parents;
