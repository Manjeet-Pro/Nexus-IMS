import React, { useState, useRef } from 'react';
import { Search, Printer, Download, Award } from 'lucide-react';
import api from '../../utils/api';
import { useReactToPrint } from 'react-to-print';

const StudentResult = () => {
    const [rollNo, setRollNo] = useState('');
    const [student, setStudent] = useState(null);
    const [marks, setMarks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const componentRef = useRef();
    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: `Result_${rollNo}`
    });

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setStudent(null);
        setMarks([]);

        try {
            // 1. Find Student by Roll No
            // Assuming we have an endpoint or we filter
            // Ideally: GET /api/students?rollNo=...
            // Let's try fetching all and filtering for now if no direct search
            // Better: Use the admin students endpoint which might support search
            const { data: students } = await api.get('/admin/students');
            const foundStudent = students.find(s => s.rollNo === rollNo);

            if (!foundStudent) {
                setError('Student not found with this Roll Number');
                setLoading(false);
                return;
            }

            setStudent(foundStudent);

            // 2. Fetch Marks using the found student's ID
            // We just added GET /api/marks/student/:id
            const { data: studentMarks } = await api.get(`/marks/student/${foundStudent._id}`);
            setMarks(studentMarks);

        } catch (err) {
            console.error("Search failed", err);
            setError('Failed to fetch data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Calculate Grades and SGPA (Mock)
    const getGrade = (mark, total) => {
        const percentage = (mark / total) * 100;
        if (percentage >= 90) return { grade: 'A+', points: 10 };
        if (percentage >= 80) return { grade: 'A', points: 9 };
        if (percentage >= 70) return { grade: 'B', points: 8 };
        if (percentage >= 60) return { grade: 'C', points: 7 };
        if (percentage >= 50) return { grade: 'D', points: 6 };
        return { grade: 'F', points: 0 };
    };

    const calculateSGPA = () => {
        if (marks.length === 0) return 0;
        let totalCredits = 0;
        let totalPoints = 0;

        marks.forEach(mark => {
            const credits = mark.course?.credits || 3; // Default 3 if missing
            const { points } = getGrade(mark.marks, mark.total);
            totalCredits += credits;
            totalPoints += (points * credits);
        });

        return totalCredits === 0 ? 0 : (totalPoints / totalCredits).toFixed(2);
    };

    return (
        <div className="space-y-6 animate-in fade-in zoom-in duration-500">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Student Results</h1>
                <p className="text-gray-500 dark:text-gray-400">View and print student marksheets</p>
            </div>

            {/* Search Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <form onSubmit={handleSearch} className="flex gap-4 max-w-lg">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Enter Roll Number"
                            value={rollNo}
                            onChange={(e) => setRollNo(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 outline-none"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading || !rollNo}
                        className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        <Search className="w-4 h-4" />
                        {loading ? 'Searching...' : 'Search'}
                    </button>
                </form>
                {error && <p className="mt-4 text-danger-500 text-sm">{error}</p>}
            </div>

            {/* Result Display */}
            {student && (
                <div className="space-y-6">
                    <div className="flex justify-end">
                        <button
                            onClick={handlePrint}
                            className="px-4 py-2 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-lg hover:opacity-90 flex items-center gap-2 shadow-lg"
                        >
                            <Printer className="w-4 h-4" />
                            Print Marksheet
                        </button>
                    </div>

                    <div ref={componentRef} className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 print:shadow-none print:border-none print:p-0">
                        {/* Header for Print */}
                        <div className="text-center mb-8 border-b pb-6">
                            <h1 className="text-3xl font-bold text-primary-700">Nexus Institute of Technology</h1>
                            <p className="text-gray-500 mt-2">Official Grade Card / Marksheet</p>
                        </div>

                        {/* Student Details */}
                        <div className="grid grid-cols-2 gap-6 mb-8 text-sm">
                            <div>
                                <p className="text-gray-500">Student Name</p>
                                <p className="font-bold text-lg">{student.name}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-gray-500">Roll Number</p>
                                <p className="font-bold text-lg">{student.rollNo}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Course</p>
                                <p className="font-medium">{student.course} - {student.year}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-gray-500">Session</p>
                                <p className="font-medium">2023-2024</p>
                            </div>
                        </div>

                        {/* Marks Table */}
                        <table className="w-full mb-8 border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-y border-gray-200 text-sm uppercase tracking-wider text-gray-600">
                                    <th className="py-3 text-left font-semibold">Course Code</th>
                                    <th className="py-3 text-left font-semibold">Course Title</th>
                                    <th className="py-3 text-center font-semibold">Credits</th>
                                    <th className="py-3 text-center font-semibold">Type</th>
                                    <th className="py-3 text-right font-semibold">Marks</th>
                                    <th className="py-3 text-right font-semibold">Grade</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {marks.length > 0 ? (
                                    marks.map((mark) => {
                                        const { grade } = getGrade(mark.marks, mark.total);
                                        return (
                                            <tr key={mark._id}>
                                                <td className="py-3 text-sm text-gray-900">{mark.course?.code}</td>
                                                <td className="py-3 text-sm text-gray-900 font-medium">{mark.course?.name}</td>
                                                <td className="py-3 text-sm text-center text-gray-500">{mark.course?.credits || 3}</td>
                                                <td className="py-3 text-sm text-center text-gray-500">{mark.type}</td>
                                                <td className="py-3 text-sm text-right text-gray-900">{mark.marks}/{mark.total}</td>
                                                <td className="py-3 text-sm text-right font-bold text-gray-900">{grade}</td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="py-8 text-center text-gray-500 italic">No marks recorded yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {/* Footer / Summary */}
                        <div className="flex justify-between items-end border-t pt-6">
                            <div className="text-sm text-gray-500">
                                <p>Date Generated: {new Date().toLocaleDateString()}</p>
                                <p className="mt-1">This is a computer-generated document.</p>
                            </div>
                            <div className="text-right">
                                <p className="text-gray-500 text-sm mb-1">Semester Grade Point Average (SGPA)</p>
                                <p className="text-4xl font-bold text-primary-600">{calculateSGPA()}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentResult;
