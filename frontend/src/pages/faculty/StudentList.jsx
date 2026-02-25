
import React, { useState, useEffect } from 'react';
import { Search, Mail, Download, RefreshCw, Eye, MoreHorizontal, GraduationCap, Calendar, BookOpen, X } from 'lucide-react';
import { exportToCSV } from '../../utils/export';
import api from '../../utils/api';

const FacultyStudentList = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStudent, setSelectedStudent] = useState(null);

    const fetchStudents = async () => {
        try {
            const response = await api.get('/faculty/students');
            const mappedStudents = response.data.map(student => ({
                id: student._id,
                rollNo: student.rollNo,
                name: student.user?.name || 'Unknown',
                course: student.course,
                year: student.year,
                email: student.user?.email || 'N/A',
                // Mock attendance data if not present in response, specific to this view
                attendance: student.attendance || { present: 0, total: 0 }
            }));
            setStudents(mappedStudents);
        } catch (error) {
            console.error("Failed to fetch students:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchStudents();
    };

    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.rollNo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleExport = () => {
        exportToCSV(filteredStudents, 'my_students_list');
    };

    const handleEmail = (email) => {
        window.location.href = `mailto:${email}`;
    };

    return (
        <div className="space-y-6 animate-in fade-in zoom-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        Student Directory
                        <span className="text-sm font-normal text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                            {students.length} Total
                        </span>
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">View and manage enrolled students with real-time updates</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleRefresh}
                        className={`p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm ${refreshing ? 'animate-spin' : ''}`}
                        title="Refresh Data"
                    >
                        <RefreshCw className="w-5 h-5" />
                    </button>
                    <button
                        onClick={handleExport}
                        className="px-5 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm hover:shadow-md flex items-center gap-2 font-medium"
                    >
                        <Download className="w-4 h-4" />
                        <span>Export CSV</span>
                    </button>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-all">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/30">
                    <div className="relative max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search by name or roll number..."
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
                                <th className="px-6 py-4">Roll No</th>
                                <th className="px-6 py-4">Student Name</th>
                                <th className="px-6 py-4">Course/Year</th>
                                <th className="px-6 py-4">Contact</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center">
                                        <div className="flex justify-center">
                                            <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredStudents.length > 0 ? (
                                filteredStudents.map((student, index) => (
                                    <tr
                                        key={student.id}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group cursor-pointer"
                                        onClick={() => setSelectedStudent(student)}
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        <td className="px-6 py-4 font-mono text-sm text-gray-500 dark:text-gray-400 font-medium">
                                            <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs">{student.rollNo}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center text-sm font-bold shadow-sm transition-transform group-hover:scale-105">
                                                    {student.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900 dark:text-white">{student.name}</div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">ID: {student.id.slice(-6)}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 w-fit">
                                                    {student.course}
                                                </span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" /> Year {student.year}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300 text-sm">
                                            {student.email}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleEmail(student.email); }}
                                                    className="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all"
                                                    title="Send Email"
                                                >
                                                    <Mail className="w-4.5 h-4.5" />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setSelectedStudent(student); }}
                                                    className="p-2 text-gray-400 dark:text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-all"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4.5 h-4.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <Search className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                                            <p>No students found matching "{searchTerm}"</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Student Details Modal */}
            {selectedStudent && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-sm w-full animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-700 overflow-hidden">

                        {/* Modal Header with Gradient */}
                        <div className="relative h-32 bg-gradient-to-br from-primary-600 to-primary-800">
                            <button
                                onClick={() => setSelectedStudent(null)}
                                className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/10 hover:bg-black/20 rounded-full p-1.5 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Profile Image & Name */}
                        <div className="px-8 pb-8 -mt-16 flex flex-col items-center">
                            <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 shadow-lg bg-white dark:bg-gray-800 p-1">
                                <div className="w-full h-full rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-5xl font-bold">
                                    {selectedStudent.name.charAt(0)}
                                </div>
                            </div>

                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-4 text-center">{selectedStudent.name}</h2>
                            <p className="text-primary-600 dark:text-primary-400 font-medium">{selectedStudent.rollNo}</p>

                            <div className="w-full mt-8 space-y-4">
                                <div className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                                        <GraduationCap className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Course</p>
                                        <p className="font-semibold text-gray-900 dark:text-white">{selectedStudent.course} - Year {selectedStudent.year}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700">
                                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Email Address</p>
                                        <p className="font-semibold text-gray-900 dark:text-white truncate">{selectedStudent.email}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 w-full mt-8">
                                <button
                                    onClick={() => handleEmail(selectedStudent.email)}
                                    className="flex-1 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-bold shadow-lg shadow-primary-500/30 hover:shadow-primary-500/40 transition-all flex items-center justify-center gap-2"
                                >
                                    <Mail className="w-4 h-4" />
                                    Send Email
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FacultyStudentList;
