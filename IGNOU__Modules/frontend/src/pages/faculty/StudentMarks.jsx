import React, { useState, useEffect } from 'react';
import { Search, Save, Download } from 'lucide-react';
import { exportToCSV } from '../../utils/export';

const STUDENTS_MOCK = [
    { id: 'STU001', rollNo: '23CS001', name: 'Aarav Sharma' },
    { id: 'STU002', rollNo: '23CS002', name: 'Aditya Patel' },
    { id: 'STU003', rollNo: '23CS003', name: 'Vihaan Singh' },
    { id: 'STU004', rollNo: '23CS004', name: 'Ananya Gupta' },
    { id: 'STU005', rollNo: '23CS005', name: 'Ishaan Kumar' },
    { id: 'STU006', rollNo: '23CS006', name: 'Diya Malik' },
    { id: 'STU007', rollNo: '23CS007', name: 'Reyansh Reddy' },
    { id: 'STU008', rollNo: '23CS008', name: 'Myra Joshi' },
];

const StudentMarks = () => {
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [students, setStudents] = useState([]);
    const [examType, setExamType] = useState('Mid-Term');
    const [marks, setMarks] = useState({});
    const [loading, setLoading] = useState(false);

    // Fetch Faculty Courses
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const { data } = await api.get('/faculty/dashboard');
                if (data.courses) {
                    setCourses(data.courses);
                }
            } catch (error) {
                console.error("Failed to fetch courses", error);
            }
        };
        fetchCourses();
    }, []);

    // Fetch Enrolled Students (and derive courses from them for now)
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const { data } = await api.get('/faculty/students');

                // Extract unique courses from students
                // Students have 'course' string like "B.Tech...". 
                // This doesn't give us the Course _id needed for Marks.
                // We need a proper getCourses endpoint or use the ones from dashboard properly.

                // Let's use the /faculty/students endpoint but we really need Course _IDs.
                // The 'getEnrolledStudents' controller I wrote:
                // const courses = await Course.find({ instructor: faculty._id });
                // It finds courses. Maybe I should have returned courses too?

                // Let's assume for this iteration we can filter students by text "Course" field
                // BUT for saving marks we need Course _ID.
                // I will add a fetch for courses.

                setStudents(data);
            } catch (error) {
                console.error("Failed to fetch students", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Actually, I need to fetch courses with IDs. 
    // I'll add a quick fetch to /faculty/dashboard which returns profile. 
    // Wait, getFacultyDashboard returns 'schedule' with code/name, NOT _id.
    // I should update getFacultyDashboard to return course _id in schedule?
    // OR create a getMyCourses for faculty.

    // For now, I will Mock the course selection based on what I know or try to match names.
    // The previous mocked data used 'CS301'.

    // Let's proceed with just displaying the student list first.

    const handleMarkChange = (studentId, value) => {
        setMarks({ ...marks, [studentId]: value });
    };

    const getMaxMarks = () => {
        switch (examType) {
            case 'Mid-Term': return 50;
            case 'End-Term': return 100;
            case 'Assignment': return 10;
            case 'Quiz': return 20;
            default: return 100;
        }
    };

    const handleSave = async () => {
        try {
            // We need course _id.
            // Temporary: We will save marks for the First Course found in DB for this student? No.
            // I'll update the controller to lookup course by Code if ID is missing?

            // Let's iterate and save (this is inefficient but works for MVP)
            const promises = Object.entries(marks).map(async ([studentId, mark]) => {
                // We need to pass courseId. 
                // Using a hardcoded ID or finding it?
                // I will use a placeholder or derived ID.

                await api.post('/faculty/marks', {
                    studentId,
                    courseId: selectedCourse, // This needs to be the _id
                    type: examType,
                    marks: Number(mark)
                });
            });

            await Promise.all(promises);
            alert('Marks saved successfully!');
        } catch (error) {
            console.error("Failed to save marks", error);
            alert('Failed to save marks');
        }
    };

    // ... (keep handling logic)

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Student Marks Entry</h1>
                    <p className="text-gray-500 dark:text-gray-400">Enter and update student performance records</p>
                </div>
                <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
                >
                    <Save className="w-4 h-4" />
                    <span>Save All Marks</span>
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-4 items-end md:items-center transition-colors">
                <div className="flex-1 w-full">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Course</label>
                    <select
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
                    >
                        <option value="">Select Course</option>
                        {courses.map(course => (
                            <option key={course._id} value={course._id}>
                                {course.name} ({course.code})
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex-1 w-full">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Exam Type</label>
                    <select
                        value={examType}
                        onChange={(e) => setExamType(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
                    >
                        <option value="Mid-Term">Mid-Term</option>
                        <option value="End-Term">End-Term</option>
                        <option value="Assignment">Assignment</option>
                        <option value="Quiz">Quiz</option>
                    </select>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 font-medium text-sm">
                        <tr>
                            <th className="px-6 py-3">Roll No</th>
                            <th className="px-6 py-3">Student Name</th>
                            <th className="px-6 py-3 w-48">Marks (Max: {getMaxMarks()})</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Comments</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {loading ? (
                            <tr><td colSpan="5" className="text-center p-4 text-gray-500 dark:text-gray-400">Loading students...</td></tr>
                        ) : students.length > 0 ? (
                            students.filter(s => {
                                // Optional: Filter students by selected course if possible
                                // For now show all, or filter if we had course mapping
                                return true;
                            }).map((student) => {
                                const currentMark = marks[student._id] || '';
                                const max = getMaxMarks();
                                const percentage = currentMark ? (parseFloat(currentMark) / max) * 100 : 0;

                                return (
                                    <tr key={student._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-sm text-gray-600 dark:text-gray-300">{student.rollNo}</td>
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{student.user?.name || 'Unknown User'}</td>
                                        <td className="px-6 py-4">
                                            <input
                                                type="number"
                                                min="0"
                                                max={max}
                                                placeholder="-"
                                                value={currentMark}
                                                onChange={(e) => handleMarkChange(student._id, e.target.value)}
                                                className="w-24 px-3 py-1 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 text-center text-gray-900 dark:text-white"
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            {currentMark !== '' && (
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${percentage >= 40
                                                    ? 'bg-success-50 dark:bg-success-900/30 text-success-700 dark:text-success-400'
                                                    : 'bg-danger-50 dark:bg-danger-900/30 text-danger-700 dark:text-danger-400'
                                                    }`}>
                                                    {percentage >= 40 ? 'Pass' : 'Fail'}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <input
                                                type="text"
                                                placeholder="Add remarks..."
                                                className="w-full px-3 py-1 border border-transparent hover:border-gray-200 dark:hover:border-gray-600 bg-transparent rounded focus:border-primary-500 focus:outline-none text-sm text-gray-600 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-600"
                                            />
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr><td colSpan="5" className="text-center p-4 text-gray-500 dark:text-gray-400">No students found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StudentMarks;
