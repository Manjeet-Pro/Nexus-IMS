import React, { useState, useEffect } from 'react';
import { BookOpen, Users, Clock, ArrowRight, X, CheckCircle, Circle } from 'lucide-react';
import api from '../../utils/api';

const MyCourses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [isSyllabusModalOpen, setIsSyllabusModalOpen] = useState(false);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const { data } = await api.get('/faculty/courses');
            setCourses(data);
        } catch (error) {
            console.error("Failed to fetch courses", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSyllabusClick = (course) => {
        setSelectedCourse(course);
        setIsSyllabusModalOpen(true);
    };

    const handleTopicToggle = async (courseId, topicIndex) => {
        // Find the course
        const course = courses.find(c => c.id === courseId);
        if (!course) return;

        // Create a copy of syllabus
        const updatedSyllabus = [...(course.syllabus || [])];
        const topic = { ...updatedSyllabus[topicIndex] };

        // Toggle status
        topic.completed = !topic.completed;
        updatedSyllabus[topicIndex] = topic;

        // Optimistic UI Update
        const updatedCourses = courses.map(c => {
            if (c.id === courseId) {
                const newProgress = updatedSyllabus.length > 0
                    ? Math.round((updatedSyllabus.filter(t => t.completed).length / updatedSyllabus.length) * 100)
                    : 0;
                return { ...c, syllabus: updatedSyllabus, progress: newProgress };
            }
            return c;
        });
        setCourses(updatedCourses);

        // Update selected course if open
        if (selectedCourse && selectedCourse.id === courseId) {
            const newProgress = updatedSyllabus.length > 0
                ? Math.round((updatedSyllabus.filter(t => t.completed).length / updatedSyllabus.length) * 100)
                : 0;
            setSelectedCourse({ ...selectedCourse, syllabus: updatedSyllabus, progress: newProgress });
        }

        try {
            await api.put(`/courses/${courseId}/syllabus`, { syllabus: updatedSyllabus });
        } catch (error) {
            console.error("Failed to update syllabus", error);
            // Revert on error (could fetch courses again)
            fetchCourses();
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in zoom-in duration-500">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Courses</h1>
                <p className="text-gray-500 dark:text-gray-400">Manage your assigned subjects and batches</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {courses.length > 0 ? (
                    courses.map((course, index) => (
                        <div
                            key={course.id}
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className="h-3 bg-gradient-to-r from-primary-500 to-primary-700"></div>
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <span className="inline-block px-3 py-1 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-xs font-bold mb-2 tracking-wide">
                                            {course.code}
                                        </span>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-1" title={course.name}>
                                            {course.name}
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 font-medium">{course.batch}</p>
                                    </div>
                                    <div className="w-10 h-10 bg-gray-50 dark:bg-gray-700 rounded-xl flex items-center justify-center group-hover:bg-primary-50 dark:group-hover:bg-primary-900/30 transition-colors">
                                        <BookOpen className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-6 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-100 dark:border-gray-700">
                                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                        <Users className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                                        <span className="font-medium">{course.students} Students</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                        <Clock className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                                        <span className="font-medium truncate" title={course.nextClass}>{course.nextClass}</span>
                                    </div>
                                </div>

                                <div className="space-y-2 mb-6">
                                    <div className="flex justify-between text-xs font-medium">
                                        <span className="text-gray-500 dark:text-gray-400">Completion</span>
                                        <span className="text-primary-600 dark:text-primary-400">{course.progress}%</span>
                                    </div>
                                    <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-primary-500 to-primary-700 rounded-full"
                                            style={{ width: `${course.progress}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => handleSyllabusClick(course)}
                                        className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
                                    >
                                        Syllabus
                                    </button>
                                    <button
                                        onClick={() => window.location.href = '/faculty/attendance'}
                                        className="flex-1 px-4 py-2.5 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-xl hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors text-sm font-bold flex items-center justify-center gap-1 group/btn"
                                    >
                                        Attendance
                                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full flex flex-col items-center justify-center py-16 text-center bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                        <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">No Assigned Courses</h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">You haven't been assigned any subjects yet.</p>
                    </div>
                )}
            </div>

            {/* Syllabus Modal */}
            {isSyllabusModalOpen && selectedCourse && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] overflow-hidden animate-in zoom-in-95 flex flex-col">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-start">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                                    {selectedCourse.name}
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {selectedCourse.code} • Syllabus Tracker
                                </p>
                            </div>
                            <button
                                onClick={() => setIsSyllabusModalOpen(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            {selectedCourse.syllabus && selectedCourse.syllabus.length > 0 ? (
                                <div className="space-y-3">
                                    {selectedCourse.syllabus.map((topic, idx) => (
                                        <div
                                            key={idx}
                                            onClick={() => handleTopicToggle(selectedCourse.id, idx)}
                                            className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center gap-4 group ${topic.completed
                                                    ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800'
                                                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600'
                                                }`}
                                        >
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center border transition-colors ${topic.completed
                                                    ? 'bg-primary-600 border-primary-600 text-white'
                                                    : 'border-gray-300 dark:border-gray-600 group-hover:border-primary-500'
                                                }`}>
                                                {topic.completed && <CheckCircle className="w-4 h-4" />}
                                            </div>
                                            <span className={`font-medium transition-colors ${topic.completed
                                                    ? 'text-primary-800 dark:text-primary-200 line-through decoration-primary-300'
                                                    : 'text-gray-700 dark:text-gray-300'
                                                }`}>
                                                {topic.topic}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10">
                                    <BookOpen className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                                    <p className="text-gray-500 dark:text-gray-400">No syllabus topics added yet.</p>
                                    <p className="text-xs text-gray-400 mt-1">Contact admin to add syllabus.</p>
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                            <div className="flex justify-between text-sm font-medium mb-2">
                                <span className="text-gray-600 dark:text-gray-400">Overall Progress</span>
                                <span className="text-primary-600 dark:text-primary-400">
                                    {selectedCourse.progress}%
                                </span>
                            </div>
                            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary-600 rounded-full transition-all duration-500"
                                    style={{ width: `${selectedCourse.progress}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyCourses;
