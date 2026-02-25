import React, { useState, useEffect, useCallback } from 'react';
import { Award, TrendingUp, BookOpen, Printer, Filter, Calendar, BarChart3, PieChart, Target } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart as RechartsPie, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import api from '../../utils/api';
import PerformanceAI from '../../components/PerformanceAI';
import PrintableMarksheet from '../../components/PrintableMarksheet';
import { getGrade, getGradeColor } from '../../utils/gradeUtils';
import { getCurrentUser } from '../../utils/auth';
import { io } from 'socket.io-client';

const MyResults = () => {
    const [marks, setMarks] = useState([]);
    const [filteredMarks, setFilteredMarks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [studentData, setStudentData] = useState(null);
    const [selectedExamType, setSelectedExamType] = useState('all');
    const [statistics, setStatistics] = useState(null);
    const user = getCurrentUser();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [marksRes, studentRes] = await Promise.all([
                    api.get('/marks/my'),
                    api.get('/students/dashboard')
                ]);
                setMarks(marksRes.data);
                setFilteredMarks(marksRes.data);
                setStudentData({
                    name: user.name,
                    rollNo: studentRes.data.profile?.rollNo,
                    course: studentRes.data.profile?.course, // Use course directly from profile
                    year: studentRes.data.profile?.year || new Date().getFullYear(),
                    parentName: studentRes.data.parentName, // New field from backend
                    serialNo: studentRes.data.profile?.serialNo // New sequential ID
                });
                calculateStatistics(marksRes.data);
            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        // Socket listener for real-time updates
        const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');

        socket.on('connect', () => {
            socket.emit('join', user._id);
        });

        socket.on('marks_updated', () => {
            console.log('Marks updated! Refetching data...');
            fetchData();
        });

        return () => {
            socket.disconnect();
        };
    }, [user?._id, user?.name, calculateStatistics]);

    // Filter marks when filters change
    useEffect(() => {
        let filtered = marks;

        if (selectedExamType !== 'all') {
            filtered = filtered.filter(m => m.type === selectedExamType);
        }

        setFilteredMarks(filtered);
        calculateStatistics(filtered);
    }, [selectedExamType, marks]);

    // Calculate real-time statistics
    const calculateStatistics = useCallback((marksData) => {
        if (!marksData || marksData.length === 0) {
            setStatistics({
                cgpa: 0,
                overallPercentage: 0,
                totalExams: 0,
                passCount: 0,
                failCount: 0,
                highestScore: null,
                lowestScore: null,
                averageMarks: 0
            });
            return;
        }

        const totalMarksObtained = marksData.reduce((sum, m) => sum + m.marks, 0);
        const totalMaxMarks = marksData.reduce((sum, m) => sum + m.total, 0);
        const overallPercentage = totalMaxMarks > 0 ? (totalMarksObtained / totalMaxMarks) * 100 : 0;

        // Calculate CGPA (assuming 10-point scale: percentage/10)
        const cgpa = overallPercentage / 10;

        // Count pass/fail (assuming 40% is passing)
        const passCount = marksData.filter(m => (m.marks / m.total) * 100 >= 40).length;
        const failCount = marksData.length - passCount;

        // Find highest and lowest scores
        const sortedByPercentage = [...marksData].sort((a, b) =>
            (b.marks / b.total) - (a.marks / a.total)
        );

        const highestScore = sortedByPercentage[0];
        const lowestScore = sortedByPercentage[sortedByPercentage.length - 1];

        const averageMarks = totalMarksObtained / marksData.length;

        setStatistics({
            cgpa: cgpa.toFixed(2),
            overallPercentage: overallPercentage.toFixed(2),
            totalExams: marksData.length,
            passCount,
            failCount,
            highestScore,
            lowestScore,
            averageMarks: averageMarks.toFixed(2)
        });
    }, []);

    // Helper to calculate grade and color are now imported from utils



    // Prepare chart data
    const prepareChartData = () => {
        // Subject-wise performance for bar chart
        const subjectData = filteredMarks.map(m => ({
            subject: m.course?.code || m.course?.name?.substring(0, 10),
            percentage: ((m.marks / m.total) * 100).toFixed(1),
            marks: m.marks,
            total: m.total
        }));

        // Exam type distribution for pie chart
        const examTypes = {};
        filteredMarks.forEach(m => {
            examTypes[m.type] = (examTypes[m.type] || 0) + 1;
        });
        const examTypeData = Object.entries(examTypes).map(([name, value]) => ({
            name,
            value
        }));

        // Grade distribution
        const gradeDistribution = {};
        filteredMarks.forEach(m => {
            const grade = getGrade(m.marks, m.total);
            gradeDistribution[grade] = (gradeDistribution[grade] || 0) + 1;
        });
        const gradeData = Object.entries(gradeDistribution).map(([name, value]) => ({
            name,
            value
        }));

        // Performance trend (by date)
        const trendData = [...filteredMarks]
            .filter(m => m.createdAt && !isNaN(new Date(m.createdAt).getTime()))
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
            .map(m => ({
                date: new Date(m.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                percentage: ((m.marks / m.total) * 100).toFixed(1),
                subject: m.course?.code
            }));

        return { subjectData, examTypeData, gradeData, trendData };
    };

    const chartData = prepareChartData();

    const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

    if (loading) return <div className="p-8 text-center text-gray-500">Loading results...</div>;

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="space-y-6 animate-in fade-in zoom-in duration-500 print:p-0 print:space-y-0">
            <div className="flex justify-between items-center print:hidden">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Academic Performance</h1>
                    <p className="text-gray-500 dark:text-gray-400">View your exam results and grades</p>
                </div>
                <button
                    onClick={handlePrint}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2 transition-all hover:shadow-lg"
                >
                    <Printer className="w-4 h-4" />
                    Print Marksheet
                </button>
            </div>

            {/* Printable Marksheet Component - Always shows ALL marks */}
            {studentData && marks.length > 0 && <PrintableMarksheet marks={marks} studentData={studentData} />}

            {/* Filters */}
            <div className="print:hidden bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
                <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filters:</span>
                    </div>

                    <select
                        value={selectedExamType}
                        onChange={(e) => setSelectedExamType(e.target.value)}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                    >
                        <option value="all">All Exam Types</option>
                        <option value="Mid-Term">Mid-Term</option>
                        <option value="End-Term">End-Term</option>
                        <option value="Assignment">Assignment</option>
                        <option value="Quiz">Quiz</option>
                    </select>

                    <div className="ml-auto text-sm text-gray-500 dark:text-gray-400">
                        Showing {filteredMarks.length} of {marks.length} results
                    </div>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 print:hidden">
                <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl p-6 text-white shadow-lg shadow-primary-500/20">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                            <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-primary-100 text-sm">CGPA</p>
                            <h3 className="text-3xl font-bold">{statistics?.cgpa || '0.00'}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-success-50 dark:bg-success-900/30 rounded-lg flex items-center justify-center">
                            <Award className="w-6 h-6 text-success-600 dark:text-success-400" />
                        </div>
                        <div>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Overall %</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{statistics?.overallPercentage || '0'}%</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-info-50 dark:bg-info-900/30 rounded-lg flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-info-600 dark:text-info-400" />
                        </div>
                        <div>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Total Exams</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{statistics?.totalExams || 0}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                            <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Pass Rate</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {statistics?.totalExams > 0 ? ((statistics.passCount / statistics.totalExams) * 100).toFixed(0) : 0}%
                            </h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance Charts */}
            {filteredMarks.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:hidden">
                    {/* Performance Trend Line Chart */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-primary-600" />
                            Performance Trend
                        </h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={chartData.trendData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                                <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
                                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(17, 24, 39, 0.9)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: '#fff'
                                    }}
                                />
                                <Legend />
                                <Line type="monotone" dataKey="percentage" stroke="#6366f1" strokeWidth={2} name="Percentage" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Subject-wise Bar Chart */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-primary-600" />
                            Subject-wise Performance
                        </h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={chartData.subjectData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                                <XAxis dataKey="subject" stroke="#6b7280" style={{ fontSize: '12px' }} />
                                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(17, 24, 39, 0.9)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: '#fff'
                                    }}
                                />
                                <Legend />
                                <Bar dataKey="percentage" fill="#6366f1" name="Percentage" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Exam Type Distribution Pie Chart */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <PieChart className="w-5 h-5 text-primary-600" />
                            Exam Type Distribution
                        </h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <RechartsPie>
                                <Pie
                                    data={chartData.examTypeData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {chartData.examTypeData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </RechartsPie>
                        </ResponsiveContainer>
                    </div>

                    {/* Grade Distribution Pie Chart */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Award className="w-5 h-5 text-primary-600" />
                            Grade Distribution
                        </h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <RechartsPie>
                                <Pie
                                    data={chartData.gradeData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {chartData.gradeData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </RechartsPie>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Performance Insights */}
            {statistics?.highestScore && statistics?.lowestScore && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:hidden">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="font-semibold text-green-900 dark:text-green-100">Best Performance</h3>
                        </div>
                        <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                            {statistics.highestScore.course?.name}
                        </p>
                        <p className="text-green-600 dark:text-green-400 mt-1">
                            {statistics.highestScore.marks}/{statistics.highestScore.total} ({((statistics.highestScore.marks / statistics.highestScore.total) * 100).toFixed(1)}%)
                        </p>
                        <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${getGradeColor(getGrade(statistics.highestScore.marks, statistics.highestScore.total))} text-white`}>
                            Grade: {getGrade(statistics.highestScore.marks, statistics.highestScore.total)}
                        </span>
                    </div>

                    <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                                <Target className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="font-semibold text-orange-900 dark:text-orange-100">Needs Improvement</h3>
                        </div>
                        <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                            {statistics.lowestScore.course?.name}
                        </p>
                        <p className="text-orange-600 dark:text-orange-400 mt-1">
                            {statistics.lowestScore.marks}/{statistics.lowestScore.total} ({((statistics.lowestScore.marks / statistics.lowestScore.total) * 100).toFixed(1)}%)
                        </p>
                        <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${getGradeColor(getGrade(statistics.lowestScore.marks, statistics.lowestScore.total))} text-white`}>
                            Grade: {getGrade(statistics.lowestScore.marks, statistics.lowestScore.total)}
                        </span>
                    </div>
                </div>
            )}

            <div className="print:hidden">
                <PerformanceAI />
            </div>

            {/* Detailed Results */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden print:hidden">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/30">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Detailed Marks</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 font-medium text-sm">
                            <tr>
                                <th className="px-6 py-3">Course</th>
                                <th className="px-6 py-3">Exam Type</th>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3">Marks Obtained</th>
                                <th className="px-6 py-3">Total Marks</th>
                                <th className="px-6 py-3">Percentage</th>
                                <th className="px-6 py-3">Grade</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {filteredMarks.map((mark) => {
                                const percentage = ((mark.marks / mark.total) * 100).toFixed(1);
                                const grade = getGrade(mark.marks, mark.total);
                                return (
                                    <tr key={mark._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">{mark.course?.name}</p>
                                                <p className="text-xs text-gray-500">{mark.course?.code}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${mark.type === 'Mid-Term' ? 'bg-info-50 text-info-700 dark:bg-info-900/30 dark:text-info-300' :
                                                mark.type === 'End-Term' ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300' :
                                                    mark.type === 'Assignment' ? 'bg-success-50 text-success-700 dark:bg-success-900/30 dark:text-success-300' :
                                                        'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                                                }`}>
                                                {mark.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                                            {mark.createdAt ? new Date(mark.createdAt).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                                            {mark.marks}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                                            {mark.total}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-semibold text-gray-900 dark:text-white">
                                                {percentage}%
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r ${getGradeColor(grade)} text-white shadow-sm`}>
                                                {grade}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filteredMarks.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                                        No results found for the selected filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default MyResults;
