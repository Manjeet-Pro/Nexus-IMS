import React, { useState, useEffect } from 'react';
import { Book, User, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../../utils/api';

const MyCourses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const { data } = await api.get('/courses/my');
                setCourses(data);
            } catch (err) {
                console.error("Failed to fetch courses:", err);
                setError('Failed to load courses. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                {error}
            </div>
        );
    }

    if (courses.length === 0) {
        return (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
                <div className="bg-gray-50 dark:bg-gray-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Book className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">No Courses Enrolled</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-1">You haven't been enrolled in any courses yet.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in zoom-in duration-500">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Courses</h1>
                <p className="text-gray-500 dark:text-gray-400">Enrolled subjects for current semester</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course, index) => (
                    <div
                        key={course._id}
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        <div className="h-3 bg-gradient-to-r from-primary-500 to-primary-600 width-full"></div>
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-3">
                                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-bold rounded-full uppercase tracking-wide">
                                    {course.code}
                                </span>
                                <span className="flex items-center gap-1 text-xs font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-2.5 py-1 rounded-full">
                                    <CheckCircle className="w-3 h-3" />
                                    Ongoing
                                </span>
                            </div>

                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-1">
                                {course.name}
                            </h3>

                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                                <User className="w-4 h-4 text-gray-400" />
                                <span className="font-medium">{course.instructor?.user?.name || 'Faculty Assigned'}</span>
                            </div>

                            <div className="space-y-3 pt-4 border-t border-gray-50 dark:border-gray-700">
                                {course.attendance ? (
                                    <div className="mb-4">
                                        <div className="flex justify-between text-xs mb-1 font-medium">
                                            <span className="text-gray-500 dark:text-gray-400">Attendance</span>
                                            <span className={`font-bold ${course.attendance.percentage >= 75 ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400'
                                                }`}>
                                                {course.attendance.percentage}%
                                            </span>
                                        </div>
                                        <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${course.attendance.percentage >= 75 ? 'bg-success-500' : 'bg-danger-500'
                                                    }`}
                                                style={{ width: `${course.attendance.percentage}%` }}
                                            ></div>
                                        </div>
                                        {course.attendance.percentage < 75 && (
                                            <p className="text-[10px] text-danger-500 dark:text-danger-400 mt-1 font-medium flex items-center gap-1">
                                                <AlertCircle className="w-3 h-3" /> Low attendance warning!
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="p-2 mb-4 bg-gray-50 dark:bg-gray-700 rounded text-xs text-center text-gray-500 dark:text-gray-400 font-medium">
                                        No attendance data available
                                    </div>
                                )}

                                {/* Syllabus Completion */}
                                <div className="mb-4">
                                    <div className="flex justify-between text-xs mb-1 font-medium">
                                        <span className="text-gray-500 dark:text-gray-400">Syllabus Completion</span>
                                        <span className="text-primary-600 dark:text-primary-400 font-bold">
                                            {course.progress || 0}%
                                        </span>
                                    </div>
                                    <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary-600 rounded-full transition-all duration-500"
                                            style={{ width: `${course.progress || 0}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 font-medium pt-3 border-t border-gray-50 dark:border-gray-700">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>Next: Refer Timetable</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyCourses;
