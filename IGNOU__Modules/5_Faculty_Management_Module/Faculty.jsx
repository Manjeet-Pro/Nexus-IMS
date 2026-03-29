
import React, { useState, useEffect } from 'react';
import { Search, Mail, Phone, MoreHorizontal, Download, BookOpen } from 'lucide-react';
import { exportToCSV } from '../../utils/export';
import api from '../../utils/api';

const Faculty = () => {
    const [facultyList, setFacultyList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewingFaculty, setViewingFaculty] = useState(null);
    const [newFaculty, setNewFaculty] = useState({
        name: '',
        email: '',
        dept: '',
        designation: ''
    });

    // Assign Course State & Handlers
    const [courses, setCourses] = useState([]);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [assignData, setAssignData] = useState({ facultyId: '', courseId: '' });

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await api.get('/courses');
                setCourses(response.data);
            } catch (error) {
                console.error("Failed to fetch courses:", error);
            }
        };
        fetchCourses();
    }, []);

    const handleAssignCourse = async (e) => {
        e.preventDefault();
        try {
            await api.post('/courses/assign', assignData);
            alert('Course assigned successfully!');
            setIsAssignModalOpen(false);
            setAssignData({ facultyId: '', courseId: '' });
            // Refresh list
            const response = await api.get('/faculty');
            const mappedFaculty = response.data.map((fac, index) => ({
                id: fac._id,
                facultyId: `FAC${String(index + 1).padStart(2, '0')}`,
                name: fac.user?.name || 'Unknown',
                email: fac.user?.email || 'N/A',
                dept: fac.department || '',
                designation: fac.designation || '',
                courses: fac.courses || [],
                originalId: fac._id
            }));
            setFacultyList(mappedFaculty.filter(f => f.name !== 'Unknown'));
        } catch (error) {
            console.error("Failed to assign course:", error);
            alert(error.response?.data?.message || 'Failed to assign course');
        }
    };

    const openAssignModal = (faculty) => {
        setAssignData({ ...assignData, facultyId: faculty.originalId });
        setIsAssignModalOpen(true);
    };


    const [error, setError] = useState(null);

    // ... (rest of code) ...

    useEffect(() => {
        const fetchFaculty = async () => {
            try {
                const response = await api.get('/faculty');
                const mappedFaculty = response.data.map((fac, index) => ({
                    id: fac._id,
                    facultyId: `FAC${String(index + 1).padStart(2, '0')}`,
                    name: fac.user?.name || 'Unknown',
                    email: fac.user?.email || 'N/A',
                    dept: fac.department || '',
                    designation: fac.designation || '',
                    courses: fac.courses || [],
                    originalId: fac._id
                }));
                setFacultyList(mappedFaculty.filter(f => f.name !== 'Unknown'));
            } catch (error) {
                console.error("Failed to fetch faculty:", error);
                setError("Failed to load faculty members. Please try logging in again.");
            } finally {
                setLoading(false);
            }
        };

        fetchFaculty();
    }, []);

    const filteredFaculty = facultyList.filter(faculty =>
        faculty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faculty.dept.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleExport = () => {
        exportToCSV(filteredFaculty, 'faculty_list');
    };

    const handleAddFaculty = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/faculty', newFaculty);
            // Refresh list
            const response = await api.get('/faculty');
            const mappedFaculty = response.data.map((fac, index) => ({
                id: fac._id,
                facultyId: `FAC${String(index + 1).padStart(2, '0')}`,
                name: fac.user?.name || 'Unknown',
                email: fac.user?.email || 'N/A',
                dept: fac.department || '',
                designation: fac.designation || '',
                courses: fac.courses || [],
                originalId: fac._id
            }));
            setFacultyList(mappedFaculty);
            setIsModalOpen(false);
            setNewFaculty({ name: '', dept: '', designation: '', email: '' });
            alert('Faculty added successfully! Default password is "password123"');
        } catch (error) {
            console.error("Failed to add faculty:", error);
            alert(error.response?.data?.message || 'Failed to add faculty');
        }
    };

    const handleMessage = (email) => {
        window.location.href = `mailto:${email}`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-full mb-4">
                    <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Something went wrong</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-6">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in zoom-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Faculty Members</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage teaching staff and course assignments</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleExport}
                        className="px-5 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm hover:shadow-md flex items-center gap-2 font-medium"
                    >
                        <Download className="w-4 h-4" />
                        <span>Export CSV</span>
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:shadow-lg hover:shadow-primary-500/30 transition-all flex items-center gap-2 font-bold transform hover:-translate-y-0.5"
                    >
                        <span className="text-xl leading-none">+</span>
                        <span>Add Faculty</span>
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-all">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/30 flex gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search by name, department..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full !pl-12 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all shadow-sm"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 font-semibold text-sm">
                            <tr>
                                <th className="px-6 py-4">ID</th>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Department</th>
                                <th className="px-6 py-4">Designation</th>
                                <th className="px-6 py-4">Contact</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {filteredFaculty.length > 0 ? (
                                filteredFaculty.map((faculty, index) => (
                                    <tr
                                        key={faculty.id}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-sm font-semibold text-primary-600 dark:text-primary-400">
                                                {faculty.facultyId}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div
                                                className="flex items-center gap-3 cursor-pointer"
                                                onClick={() => setViewingFaculty(faculty)}
                                            >
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center text-sm font-bold shadow-sm group-hover:shadow-md transition-all">
                                                    {faculty.name.charAt(0)}
                                                </div>
                                                <div className="font-medium text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                                    {faculty.name}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                            <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg text-xs font-medium border border-gray-200 dark:border-gray-600">
                                                {faculty.dept}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                            <div className="flex flex-col gap-1">
                                                <span className="font-medium text-sm">{faculty.designation}</span>
                                                <span className="text-xs text-gray-400 dark:text-gray-500">
                                                    {faculty.courses && faculty.courses.length > 0
                                                        ? `${faculty.courses.length} Courses Assigned`
                                                        : 'No courses assigned'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                            <div className="flex flex-col">
                                                <span>{faculty.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => setViewingFaculty(faculty)}
                                                    className="p-2 text-gray-400 dark:text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-all"
                                                    title="View Profile"
                                                >
                                                    <MoreHorizontal className="w-4.5 h-4.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleMessage(faculty.email)}
                                                    className="p-2 text-gray-400 dark:text-gray-500 hover:text-info-600 dark:hover:text-info-400 hover:bg-info-50 dark:hover:bg-info-900/30 rounded-lg transition-all"
                                                    title="Message"
                                                >
                                                    <Mail className="w-4.5 h-4.5" />
                                                </button>
                                                <button
                                                    onClick={() => openAssignModal(faculty)}
                                                    className="p-2 text-gray-400 dark:text-gray-500 hover:text-success-600 dark:hover:text-success-400 hover:bg-success-50 dark:hover:bg-success-900/30 rounded-lg transition-all"
                                                    title="Assign Course"
                                                >
                                                    <BookOpen className="w-4.5 h-4.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <Search className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                                            <p>No faculty members found matching "{searchTerm}"</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Faculty Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-8 animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-700">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Add New Faculty</h2>
                        <form onSubmit={handleAddFaculty} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={newFaculty.name}
                                    onChange={(e) => setNewFaculty({ ...newFaculty, name: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                                    placeholder="e.g. Dr. Amit Sharma"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={newFaculty.email}
                                    onChange={(e) => setNewFaculty({ ...newFaculty, email: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                                    placeholder="faculty@nexus.com"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Department</label>
                                    <input
                                        type="text"
                                        required
                                        value={newFaculty.dept}
                                        onChange={(e) => setNewFaculty({ ...newFaculty, dept: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                                        placeholder="Dept"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Designation</label>
                                    <input
                                        type="text"
                                        required
                                        value={newFaculty.designation}
                                        onChange={(e) => setNewFaculty({ ...newFaculty, designation: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                                        placeholder="Title"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 mt-8 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-bold shadow-lg shadow-primary-500/30 hover:shadow-primary-500/40 transition-all"
                                >
                                    Add Faculty
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Assign Course Modal */}
            {isAssignModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-8 animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-700">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Assign Course</h2>
                        <form onSubmit={handleAssignCourse} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Select Course</label>
                                <select
                                    required
                                    value={assignData.courseId}
                                    onChange={(e) => setAssignData({ ...assignData, courseId: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                                >
                                    <option value="">-- Select a Course --</option>
                                    {courses.map(course => (
                                        <option key={course._id} value={course._id}>
                                            {course.name} ({course.code}) - {course.department}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-3 mt-8 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsAssignModalOpen(false)}
                                    className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2.5 bg-success-600 text-white rounded-xl hover:bg-success-700 font-bold shadow-lg shadow-success-500/30 hover:shadow-success-500/40 transition-all"
                                >
                                    Assign Course
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Faculty Modal */}
            {viewingFaculty && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-sm w-full p-8 animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-primary-500 to-primary-700"></div>

                        <button
                            onClick={() => setViewingFaculty(null)}
                            className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/10 hover:bg-black/20 rounded-full p-1 transition-colors"
                        >
                            <span className="sr-only">Close</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>

                        <div className="flex flex-col items-center mb-6 relative z-10 pt-8">
                            <div className="w-24 h-24 rounded-full bg-white p-1 shadow-xl mb-4">
                                <div className="w-full h-full rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-3xl">
                                    {viewingFaculty.name.charAt(0)}
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center">{viewingFaculty.name}</h3>
                            <p className="text-primary-600 dark:text-primary-400 font-medium text-center">{viewingFaculty.designation}</p>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                                <span className="text-gray-500 dark:text-gray-400 text-sm">Faculty ID</span>
                                <span className="text-primary-600 dark:text-primary-400 font-mono font-bold">{viewingFaculty.facultyId}</span>
                            </div>
                            <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                                <span className="text-gray-500 dark:text-gray-400 text-sm">Department</span>
                                <span className="text-gray-900 dark:text-white font-medium">{viewingFaculty.dept}</span>
                            </div>
                            <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                                <span className="text-gray-500 dark:text-gray-400 text-sm">Email</span>
                                <span className="text-gray-900 dark:text-white font-medium text-sm">{viewingFaculty.email}</span>
                            </div>
                            <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                                <span className="text-gray-500 dark:text-gray-400 text-sm">Course Count</span>
                                <span className="text-gray-900 dark:text-white font-medium">{viewingFaculty.courses ? viewingFaculty.courses.length : 0}</span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => handleMessage(viewingFaculty.email)}
                                className="flex-1 px-4 py-2.5 bg-info-50 dark:bg-info-900/20 text-info-700 dark:text-info-300 rounded-xl hover:bg-info-100 dark:hover:bg-info-900/40 flex items-center justify-center gap-2 font-medium transition-colors"
                            >
                                <Mail className="w-4 h-4" />
                                Message
                            </button>
                            <button
                                onClick={() => setViewingFaculty(null)}
                                className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 font-medium transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Faculty;
