
import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, MoreVertical, Eye, Edit, Trash2, Download, CheckSquare, X } from 'lucide-react';
import { exportToCSV } from '../../utils/export';
import api from '../../utils/api';

const Students = () => {
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modals State
    const [isIdModalOpen, setIsIdModalOpen] = useState(false);
    const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);

    // Data State
    const [editingId, setEditingId] = useState(null);
    const [viewingStudent, setViewingStudent] = useState(null);
    const [enrollData, setEnrollData] = useState({ studentId: '', studentName: '', courseId: '' });

    const [newStudent, setNewStudent] = useState({
        name: '',
        rollNo: '',
        course: '',
        year: '',
        email: '',
        status: 'Active'
    });

    // Fetch students and courses
    const fetchStudents = useCallback(async () => {
        try {
            const response = await api.get('/students');
            const mappedStudents = response.data.map(student => ({
                id: student.rollNo || student._id.substring(0, 6).toUpperCase(),
                name: student.user?.name || '',
                email: student.user?.email || '',
                course: student.course || '',
                year: student.year || '',
                status: student.status || '',
                rollNo: student.rollNo || '',
                rollNoChanges: student.rollNoChanges || 0,
                originalId: student._id
            }));
            setStudents(mappedStudents);
        } catch (error) {
            console.error("Failed to fetch students:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchCourses = useCallback(async () => {
        try {
            const { data } = await api.get('/courses');
            setCourses(data);
        } catch (error) {
            console.error("Failed to fetch courses:", error);
        }
    }, []);

    useEffect(() => {
        fetchStudents();
        fetchCourses();
    }, [fetchStudents, fetchCourses]);

    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleExport = () => {
        exportToCSV(filteredStudents, 'students_list');
    };

    // --- Student CRUD Handlers ---

    const handleEditClick = (student) => {
        setEditingId(student.id);
        setNewStudent({ ...student });
        setIsIdModalOpen(true);
    };

    const handleDeleteClick = async (id) => {
        if (window.confirm('Are you sure you want to delete this student?')) {
            try {
                const studentToDelete = students.find(s => s.id === id);
                await api.delete(`/admin/students/${studentToDelete.originalId}`);
                alert('Student deleted successfully');
                fetchStudents();
            } catch (error) {
                console.error("Failed to delete student:", error);
                alert(error.response?.data?.message || 'Failed to delete student');
            }
        }
    };

    const handleSaveStudent = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                const studentToUpdate = students.find(s => s.id === editingId);
                await api.put(`/admin/students/${studentToUpdate.originalId}`, newStudent);
                alert('Student updated successfully!');
                fetchStudents();
            } else {
                await api.post('/admin/students', newStudent);
                alert('Student added successfully!');
                fetchStudents();
            }
            setIsIdModalOpen(false);
            setNewStudent({ name: '', rollNo: '', course: '', year: '', email: '', status: 'Active' });
        } catch (error) {
            console.error("Failed to save student:", error);
            alert(error.response?.data?.message || 'Failed to save student');
        }
    };

    const openAddModal = () => {
        setEditingId(null);
        setNewStudent({ name: '', rollNo: '', course: '', year: '', email: '', status: 'Active' });
        setIsIdModalOpen(true);
    };

    // --- Enrollment Handlers ---

    const openEnrollModal = (student) => {
        setEnrollData({ studentId: student.originalId, studentName: student.name, courseId: '' });
        setIsEnrollModalOpen(true);
    };

    const handleEnrollStudent = async (e) => {
        e.preventDefault();
        try {
            await api.post('/students/enroll', {
                studentId: enrollData.studentId,
                courseId: enrollData.courseId
            });
            alert(`Student ${enrollData.studentName} enrolled successfully!`);
            setIsEnrollModalOpen(false);
            fetchStudents(); // Refresh to potentially show updated course info if we map it differently later
        } catch (error) {
            console.error("Enrollment failed:", error);
            alert(error.response?.data?.message || 'Enrollment failed');
        }
    };

    return (
        <div className="space-y-6 relative animate-in fade-in zoom-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Students</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage and view student records</p>
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
                        onClick={openAddModal}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/30"
                    >
                        + Add New Student
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex gap-4 bg-gray-50/50 dark:bg-gray-700/30">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search students..."
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
                                <th className="px-6 py-3">ID</th>
                                <th className="px-6 py-3">Name</th>
                                <th className="px-6 py-3">Course</th>
                                <th className="px-6 py-3">Year</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {filteredStudents.map((student) => (
                                <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{student.id}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-700 dark:text-primary-400 font-bold text-xs">
                                                {student.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-white">{student.name}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">{student.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{student.course}</td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{student.year}</td>
                                    <td className="px-6 py-4">
                                        {student.status && (
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${student.status === 'Active' ? 'bg-success-50 dark:bg-success-900/30 text-success-700 dark:text-success-400' :
                                                student.status === 'Inactive' ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300' :
                                                    'bg-warning-50 dark:bg-warning-900/30 text-warning-700 dark:text-warning-400'
                                                }`}>
                                                {student.status}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => openEnrollModal(student)}
                                                className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-success-600 dark:hover:text-success-400 hover:bg-success-50 dark:hover:bg-success-900/30 rounded-lg transition-colors"
                                                title="Enroll in Course"
                                            >
                                                <CheckSquare className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => setViewingStudent(student)}
                                                className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-colors"
                                                title="View Details"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleEditClick(student)}
                                                className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-warning-600 dark:hover:text-warning-400 hover:bg-warning-50 dark:hover:bg-warning-900/30 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(student.id)}
                                                className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-danger-600 dark:hover:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-900/30 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Student Modal */}
            {isIdModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200 border border-gray-100 dark:border-gray-700">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{editingId ? 'Edit Student' : 'Add New Student'}</h2>
                            <button onClick={() => setIsIdModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSaveStudent} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={newStudent.name}
                                    onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-gray-900 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Roll Number / ID</label>
                                <input
                                    type="text"
                                    required={!!editingId}
                                    value={newStudent.rollNo}
                                    onChange={(e) => setNewStudent({ ...newStudent, rollNo: e.target.value })}
                                    disabled={!editingId || (editingId && newStudent.rollNoChanges >= 2)}
                                    placeholder={editingId ? "" : "Auto-generated"}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all ${(!editingId || (editingId && newStudent.rollNoChanges >= 2))
                                        ? "bg-gray-50 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600 text-gray-400 cursor-not-allowed"
                                        : "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                                        }`}
                                />
                                <div className="flex justify-between items-center mt-1">
                                    <p className="text-[10px] text-gray-400">Sequential STUXX format.</p>
                                    {editingId && (
                                        <p className={`text-[10px] font-medium ${newStudent.rollNoChanges >= 2 ? 'text-red-500' : 'text-primary-500'}`}>
                                            Changes: {newStudent.rollNoChanges}/2
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                                <input
                                    type="email"
                                    required
                                    value={newStudent.email}
                                    onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-gray-900 dark:text-white"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Course</label>
                                    <select
                                        value={newStudent.course}
                                        onChange={(e) => setNewStudent({ ...newStudent, course: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-gray-900 dark:text-white"
                                    >
                                        <option value="">Select Course</option>
                                        <option value="B.Tech CS">B.Tech CS</option>
                                        <option value="B.Tech IT">B.Tech IT</option>
                                        <option value="MBA">MBA</option>
                                        <option value="BBA">BBA</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Year</label>
                                    <select
                                        value={newStudent.year}
                                        onChange={(e) => setNewStudent({ ...newStudent, year: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-gray-900 dark:text-white"
                                    >
                                        <option value="">Select Year</option>
                                        <option value="1st">1st</option>
                                        <option value="2nd">2nd</option>
                                        <option value="3rd">3rd</option>
                                        <option value="4th">4th</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsIdModalOpen(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                                >
                                    {editingId ? 'Save Changes' : 'Add Student'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Enroll Course Modal */}
            {isEnrollModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200 border border-gray-100 dark:border-gray-700">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Enroll Student</h2>
                            <button onClick={() => setIsEnrollModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            Enroll <span className="font-bold text-gray-900 dark:text-white">{enrollData.studentName}</span> in a course.
                        </p>

                        <form onSubmit={handleEnrollStudent} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Course</label>
                                <select
                                    required
                                    value={enrollData.courseId}
                                    onChange={(e) => setEnrollData({ ...enrollData, courseId: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-gray-900 dark:text-white"
                                >
                                    <option value="">-- Choose a Course --</option>
                                    {courses.map(course => (
                                        <option key={course._id} value={course._id}>
                                            {course.name} ({course.code})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsEnrollModalOpen(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-gradient-to-r from-success-600 to-success-600 text-white rounded-lg hover:shadow-lg font-bold"
                                >
                                    Enroll Now
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Student Modal */}
            {viewingStudent && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200 border border-gray-100 dark:border-gray-700">
                        <div className="flex justify-between items-start mb-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Student Details</h2>
                            <button onClick={() => setViewingStudent(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex flex-col items-center mb-6">
                            <div className="w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-700 dark:text-primary-400 font-bold text-2xl mb-3">
                                {viewingStudent.name.charAt(0)}
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{viewingStudent.name}</h3>
                            <p className="text-gray-500 dark:text-gray-400">{viewingStudent.id}</p>
                            {viewingStudent.status && (
                                <span className={`mt-2 px-3 py-1 rounded-full text-xs font-medium ${viewingStudent.status === 'Active' ? 'bg-success-50 dark:bg-success-900/30 text-success-700 dark:text-success-400' :
                                    viewingStudent.status === 'Inactive' ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300' :
                                        'bg-warning-50 dark:bg-warning-900/30 text-warning-700 dark:text-warning-400'
                                    }`}>
                                    {viewingStudent.status}
                                </span>
                            )}
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                                <span className="text-gray-500 dark:text-gray-400">Email</span>
                                <span className="text-gray-900 dark:text-white font-medium text-sm">{viewingStudent.email}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                                <span className="text-gray-500 dark:text-gray-400">Course</span>
                                <span className="text-gray-900 dark:text-white font-medium">{viewingStudent.course}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                                <span className="text-gray-500 dark:text-gray-400">Year</span>
                                <span className="text-gray-900 dark:text-white font-medium">{viewingStudent.year}</span>
                            </div>
                        </div>

                        <button
                            onClick={() => setViewingStudent(null)}
                            className="w-full mt-6 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Students;
