import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Plus, Trash2, Search, Filter } from 'lucide-react';
import api from '../../utils/api';

const ExamSchedule = () => {
    const [exams, setExams] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newExam, setNewExam] = useState({
        name: '',
        courseId: '',
        date: '',
        startTime: '',
        duration: '',
        room: '',
        type: 'Mid-Term'
    });

    useEffect(() => {
        fetchExams();
        fetchCourses();
    }, []);

    const fetchExams = async () => {
        try {
            const { data } = await api.get('/exams');
            setExams(data);
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch exams", error);
            setLoading(false);
        }
    };

    const fetchCourses = async () => {
        try {
            const { data } = await api.get('/courses');
            setCourses(data);
        } catch (error) {
            console.error("Failed to fetch courses", error);
        }
    };

    const handleCreateExam = async (e) => {
        e.preventDefault();
        try {
            await api.post('/exams', newExam);
            alert('Exam Scheduled Successfully');
            setIsModalOpen(false);
            setNewExam({
                name: '',
                courseId: '',
                date: '',
                startTime: '',
                duration: '',
                room: '',
                type: 'Mid-Term'
            });
            fetchExams();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to schedule exam');
        }
    };

    const handleDeleteExam = async (id) => {
        if (window.confirm('Are you sure you want to delete this exam?')) {
            try {
                await api.delete(`/exams/${id}`);
                setExams(exams.filter(exam => exam._id !== id));
            } catch (error) {
                alert('Failed to delete exam');
            }
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in zoom-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Exam Schedule</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage upcoming examinations</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2 shadow-lg shadow-primary-500/30"
                >
                    <Plus className="w-4 h-4" />
                    Schedule Exam
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {exams.map(exam => (
                    <div key={exam._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:shadow-md transition-shadow relative overflow-hidden group">
                        <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${exam.type === 'Mid-Term' ? 'from-info-500/10 to-info-500/5' :
                            exam.type === 'End-Term' ? 'from-primary-500/10 to-primary-500/5' :
                                'from-success-500/10 to-success-500/5'
                            } rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110`} />

                        <div className="relative">
                            <div className="flex justify-between items-start mb-4">
                                <span className={`px-3 py-1 text-xs font-medium rounded-full ${exam.type === 'Mid-Term' ? 'bg-info-50 text-info-700 dark:bg-info-900/30 dark:text-info-300' :
                                    exam.type === 'End-Term' ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300' :
                                        'bg-success-50 text-success-700 dark:bg-success-900/30 dark:text-success-300'
                                    }`}>
                                    {exam.type}
                                </span>
                                <button
                                    onClick={() => handleDeleteExam(exam._id)}
                                    className="text-gray-400 hover:text-danger-500 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{exam.name}</h3>
                            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 font-medium">{exam.course?.name} ({exam.course?.code})</p>

                            <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-primary-500" />
                                    <span>{exam.date && !isNaN(new Date(exam.date).getTime()) ? new Date(exam.date).toLocaleDateString() : 'TBD'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-primary-500" />
                                    <span>{exam.startTime} ({exam.duration} mins)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-primary-500" />
                                    <span>Room: {exam.room}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Schedule New Exam</h2>
                        <form onSubmit={handleCreateExam} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Exam Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Mid-Term 2024"
                                    value={newExam.name}
                                    onChange={(e) => setNewExam({ ...newExam, name: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-600"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Course</label>
                                <select
                                    required
                                    value={newExam.courseId}
                                    onChange={(e) => setNewExam({ ...newExam, courseId: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-600"
                                >
                                    <option value="">Select Course</option>
                                    {courses.map(course => (
                                        <option key={course._id} value={course._id}>{course.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={newExam.date}
                                        onChange={(e) => setNewExam({ ...newExam, date: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Time</label>
                                    <input
                                        type="time"
                                        required
                                        value={newExam.startTime}
                                        onChange={(e) => setNewExam({ ...newExam, startTime: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-600"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration (mins)</label>
                                    <input
                                        type="number"
                                        required
                                        value={newExam.duration}
                                        onChange={(e) => setNewExam({ ...newExam, duration: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Room</label>
                                    <input
                                        type="text"
                                        required
                                        value={newExam.room}
                                        onChange={(e) => setNewExam({ ...newExam, room: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-600"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                                <select
                                    value={newExam.type}
                                    onChange={(e) => setNewExam({ ...newExam, type: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-600"
                                >
                                    <option value="Mid-Term">Mid-Term</option>
                                    <option value="End-Term">End-Term</option>
                                    <option value="Quiz">Quiz</option>
                                    <option value="Assignment">Assignment</option>
                                </select>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                                >
                                    Schedule
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExamSchedule;
