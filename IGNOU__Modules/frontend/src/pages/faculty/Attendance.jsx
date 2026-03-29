import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle, XCircle, AlertCircle, Save, Search, Filter } from 'lucide-react';
import api from '../../utils/api';

const Attendance = () => {
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [students, setStudents] = useState([]);
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendanceData, setAttendanceData] = useState({}); // { studentId: 'Present' | 'Absent' | 'Excused' }
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);

    // Fetch Faculty Courses
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const { data } = await api.get('/faculty/courses');
                setCourses(data);
                if (data.length > 0) {
                    setSelectedCourse(data[0].id);
                }
            } catch (error) {
                console.error("Failed to fetch courses", error);
            }
        };
        fetchCourses();
    }, []);

    // Fetch Students for selected course
    useEffect(() => {
        if (!selectedCourse) return;

        const fetchStudents = async () => {
            setLoading(true);
            try {
                // In a real app, we'd fetch students SPECIFIC to the course.
                // Our current endpoint /faculty/students returns ALL students for the faculty.
                // We'll filter client-side if needed, or assume the endpoint is smart enough (it's not fully yet).
                // ideally: api.get(\`/courses/\${selectedCourse}/students\`)

                const { data } = await api.get('/faculty/students');
                // Filter if possible, for now we show all or try to match course name if available in student data
                // The student list has 'course' string, e.g. "B.Tech CSE"

                const currentCourse = courses.find(c => c.id === selectedCourse);
                const filtered = data.filter(s => {
                    // Loose matching for now as data model is simple
                    return currentCourse && s.course && (currentCourse.batch.includes(s.course) || s.course.includes(currentCourse.name));
                });

                // Fallback: show all if filter is too strict/broken due to data mismatch
                const finalStudents = filtered.length > 0 ? filtered : data;

                setStudents(finalStudents);

                // Initialize attendance data as Present by default
                const initialData = {};
                finalStudents.forEach(s => {
                    initialData[s._id] = 'Present';
                });
                setAttendanceData(initialData);

            } catch (error) {
                console.error("Failed to fetch students", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStudents();
    }, [selectedCourse, courses]);

    const handleStatusChange = (studentId, status) => {
        setAttendanceData(prev => ({
            ...prev,
            [studentId]: status
        }));
    };

    const markAll = (status) => {
        const newData = {};
        students.forEach(s => {
            newData[s._id] = status;
        });
        setAttendanceData(newData);
    };

    const handleSubmit = async () => {
        setSaving(true);
        setMessage(null);
        try {
            const payload = {
                courseId: selectedCourse,
                date: attendanceDate,
                attendanceData: Object.entries(attendanceData).map(([studentId, status]) => ({
                    studentId,
                    status
                }))
            };

            await api.post('/faculty/attendance', payload);
            setMessage({ type: 'success', text: 'Attendance saved successfully!' });

            // Clear message after 3 seconds
            setTimeout(() => setMessage(null), 3000);

        } catch (error) {
            console.error("Failed to save attendance", error);
            setMessage({ type: 'error', text: 'Failed to save attendance. Please try again.' });
        } finally {
            setSaving(false);
        }
    };

    const getStatusColor = (status, current) => {
        if (status === current) {
            switch (status) {
                case 'Present': return 'bg-success-100 text-success-700 border-success-500 ring-2 ring-success-500 focus:outline-none';
                case 'Absent': return 'bg-danger-100 text-danger-700 border-danger-500 ring-2 ring-danger-500 focus:outline-none';
                case 'Excused': return 'bg-warning-100 text-warning-700 border-warning-500 ring-2 ring-warning-500 focus:outline-none';
                default: return '';
            }
        }
        return 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50';
    };

    return (
        <div className="space-y-6 animate-in fade-in zoom-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mark Attendance</h1>
                    <p className="text-gray-500 dark:text-gray-400">Record daily attendance for your classes</p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handleSubmit}
                        disabled={saving || students.length === 0}
                        className={`px-6 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-medium rounded-xl shadow-lg shadow-primary-500/30 hover:shadow-primary-500/40 hover:-translate-y-0.5 transition-all flex items-center gap-2 ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {saving ? (
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        ) : (
                            <Save className="w-5 h-5" />
                        )}
                        <span>Save Attendance</span>
                    </button>
                </div>
            </div>

            {message && (
                <div className={`p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-success-50 text-success-700 border border-success-100' : 'bg-danger-50 text-danger-700 border border-danger-100'} animate-in slide-in-from-top-2`}>
                    {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    <p className="font-medium">{message.text}</p>
                </div>
            )}

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-6 items-end">
                <div className="flex-1 w-full space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Select Course</label>
                    <div className="relative">
                        <select
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                            className="w-full pl-4 pr-10 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all appearance-none"
                        >
                            {courses.map(course => (
                                <option key={course.id} value={course.id}>
                                    {course.name} ({course.code})
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                            <Filter className="w-4 h-4" />
                        </div>
                    </div>
                </div>

                <div className="flex-1 w-full space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Date</label>
                    <div className="relative">
                        <input
                            type="date"
                            value={attendanceDate}
                            onChange={(e) => setAttendanceDate(e.target.value)}
                            className="w-full pl-4 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50 dark:bg-gray-700/30">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Quick Actions:</span>
                        <button onClick={() => markAll('Present')} className="text-xs px-3 py-1.5 bg-success-100 text-success-700 rounded-lg hover:bg-success-200 transition-colors font-medium">Mark All Present</button>
                        <button onClick={() => markAll('Absent')} className="text-xs px-3 py-1.5 bg-danger-100 text-danger-700 rounded-lg hover:bg-danger-200 transition-colors font-medium">Mark All Absent</button>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        Total Students: <span className="font-bold text-gray-900 dark:text-white">{students.length}</span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 font-medium text-sm">
                            <tr>
                                <th className="px-6 py-4">Roll No</th>
                                <th className="px-6 py-4">Student Name</th>
                                <th className="px-6 py-4 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {loading ? (
                                <tr><td colSpan="3" className="text-center p-8 text-gray-500">Loading students...</td></tr>
                            ) : students.length > 0 ? (
                                students.map((student) => (
                                    <tr key={student._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-sm text-gray-600 dark:text-gray-300">{student.rollNo}</td>
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{student.user?.name}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center gap-2">
                                                {['Present', 'Absent', 'Excused'].map((status) => (
                                                    <button
                                                        key={status}
                                                        onClick={() => handleStatusChange(student._id, status)}
                                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${getStatusColor(status, attendanceData[student._id])}`}
                                                    >
                                                        {status}
                                                    </button>
                                                ))}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="3" className="text-center p-8 text-gray-500">No students found for this course.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Attendance;
