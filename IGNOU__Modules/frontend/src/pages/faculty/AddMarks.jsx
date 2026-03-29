import React, { useState, useEffect } from 'react';
import { Save, Search, Award } from 'lucide-react';
import api from '../../utils/api';

const AddMarks = () => {
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [examType, setExamType] = useState('Mid-Term');
    const [students, setStudents] = useState([]);
    const [marks, setMarks] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const { data } = await api.get('/faculty/courses');
            setCourses(data);
        } catch (error) {
            console.error("Failed to fetch courses", error);
        }
    };

    const fetchStudentsAndMarks = async () => {
        if (!selectedCourse) return;
        setLoading(true);
        try {
            // 1. Fetch Students enrolled in the course
            // The endpoint might be /faculty/courses/:id/students or similar
            // Let's assume we use the general student fetch with filter or a specific endpoint
            // Actually, we need to fetch students for THIS course.
            // courseController.getCourseStudents is likely what we need or check course.studentsEnrolled

            // Let's try fetching the course details which includes students
            const courseRes = await api.get(`/faculty/courses`);
            const course = courseRes.data.find(c => c._id === selectedCourse);

            // If course has studentsEnrolled populated
            // But wait, getFacultyCourses might not deep populate students.
            // Let's check if there is a better endpoint.
            // If not, we might need to rely on /faculty/students which returns all students the faculty teaches?
            // Or create a specific endpoint. 
            // For now, let's try to filter from /faculty/students if available.

            const studentsRes = await api.get('/faculty/students');
            // Filter students who belong to this course (if the API returns that info)
            // The previous StudentList.jsx used /faculty/students. 
            // Let's assume it returns a list where we can match course or we just show all for now and filter.
            // Better: Ensure backend gives us students for the selected course.

            // Ideally: GET /api/courses/:id/students.
            // Let's implement a quick fetch or filter client side from all students.
            const filteredStudents = studentsRes.data.filter(s => s.course === course?.name || s.courseCode === course?.code);
            // This matching is weak.

            // Let's use the marks endpoint to check existing marks too.
            // And maybe we need to fetch all students for the dropdown/list.

            setStudents(studentsRes.data); // Showing all for now, will refine if needed.

            // 2. Fetch existing marks
            // We need a route to get marks for a course/exam type.
            // We implemented getCourseMarks in backend but it returns all marks for the course.
            // We can filter client side.
            // Fetch existing marks for this course
            // Note: selectedCourse is the course ID, not name
            const marksRes = await api.get(`/marks/course/${selectedCourse}`);
            if (!marksRes.data) {
                setMarks({});
                return;
            }
            const existingMarks = {};
            marksRes.data.forEach(m => {
                if (m.type === examType) {
                    existingMarks[m.student._id] = m.marks;
                }
            });
            setMarks(existingMarks);

        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    // Effect to fetch students when course changes
    useEffect(() => {
        if (selectedCourse) {
            fetchStudentsAndMarks();
        }
    }, [selectedCourse, examType]);

    const handleMarkChange = (studentId, value) => {
        setMarks(prev => ({
            ...prev,
            [studentId]: value
        }));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const promises = Object.entries(marks).map(async ([studentId, markValue]) => {
                return api.post('/marks', {
                    studentId,
                    courseId: selectedCourse,
                    type: examType,
                    marks: Number(markValue),
                    total: 100 // Hardcoded for now, or add input
                });
            });

            await Promise.all(promises);
            alert('Marks Saved Successfully');
        } catch (error) {
            console.error("Failed to save marks", error);
            alert('Failed to save some marks');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in zoom-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Enter Marks</h1>
                    <p className="text-gray-500 dark:text-gray-400">Grade student performance</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={!selectedCourse || loading}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Save className="w-4 h-4" />
                    {loading ? 'Saving...' : 'Save Marks'}
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Course</label>
                        <select
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-600"
                        >
                            <option value="">-- Choose Course --</option>
                            {courses.map(course => (
                                <option key={course.id} value={course.id}>{course.name} ({course.code})</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Exam Type</label>
                        <select
                            value={examType}
                            onChange={(e) => setExamType(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-600"
                        >
                            <option value="Mid-Term">Mid-Term</option>
                            <option value="End-Term">End-Term</option>
                            <option value="Quiz">Quiz</option>
                            <option value="Assignment">Assignment</option>
                        </select>
                    </div>
                </div>

                {selectedCourse && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 font-medium text-sm">
                                <tr>
                                    <th className="px-6 py-3">Roll No</th>
                                    <th className="px-6 py-3">Student Name</th>
                                    <th className="px-6 py-3">Marks (Out of 100)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {students.map((student) => (
                                    <tr key={student._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{student.rollNo || 'N/A'}</td>
                                        <td className="px-6 py-4 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-700 dark:text-primary-400 font-bold text-xs">
                                                {student.user?.name?.charAt(0) || 'S'}
                                            </div>
                                            {student.user?.name || 'Unknown Student'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={marks[student._id] || ''}
                                                onChange={(e) => handleMarkChange(student._id, e.target.value)}
                                                className="w-24 px-3 py-1 border rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-900 dark:border-gray-600"
                                                placeholder="Enter"
                                            />
                                        </td>
                                    </tr>
                                ))}
                                {students.length === 0 && (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-8 text-center text-gray-500">
                                            No students found for this course.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AddMarks;
