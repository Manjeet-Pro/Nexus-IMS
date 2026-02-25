import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Edit2, Trash2, Clock, AlertCircle } from 'lucide-react';
import api from '../../utils/api';

const ManageTimetable = () => {
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSlot, setEditingSlot] = useState(null);
    const [loading, setLoading] = useState(true);

    const [scheduleForm, setScheduleForm] = useState({
        day: '',
        startTime: '',
        endTime: '',
        room: ''
    });

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const timeSlots = [
        '08:00', '09:00', '10:00', '11:00', '12:00',
        '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
    ];

    // Course colors for visual distinction
    const courseColors = [
        'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300',
        'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300',
        'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-300',
        'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-300',
        'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 border-pink-300',
        'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-300',
    ];

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const { data } = await api.get('/courses');
            setCourses(data);
        } catch (error) {
            console.error('Failed to fetch courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const getCourseColor = (courseId) => {
        const index = courses.findIndex(c => c._id === courseId);
        return courseColors[index % courseColors.length];
    };

    const getScheduleForSlot = (day, time) => {
        const allSchedules = [];
        courses.forEach(course => {
            if (course.schedule) {
                course.schedule.forEach(slot => {
                    if (slot.day === day && slot.startTime === time) {
                        allSchedules.push({ ...slot, course });
                    }
                });
            }
        });
        return allSchedules;
    };

    const handleAddSchedule = (day, time) => {
        setScheduleForm({
            day,
            startTime: time,
            endTime: '',
            room: ''
        });
        setEditingSlot(null);
        setIsModalOpen(true);
    };

    const handleEditSchedule = (slot, course) => {
        setSelectedCourse(course);
        setScheduleForm({
            day: slot.day,
            startTime: slot.startTime,
            endTime: slot.endTime || '',
            room: slot.room || ''
        });
        setEditingSlot(slot);
        setIsModalOpen(true);
    };

    const handleSaveSchedule = async () => {
        if (!selectedCourse) {
            alert('Please select a course');
            return;
        }

        if (!scheduleForm.day || !scheduleForm.startTime || !scheduleForm.room) {
            alert('Please fill all fields');
            return;
        }

        try {
            const course = courses.find(c => c._id === selectedCourse._id);
            let updatedSchedule = course.schedule || [];

            if (editingSlot) {
                // Update existing slot
                updatedSchedule = updatedSchedule.map(slot =>
                    slot.day === editingSlot.day && slot.startTime === editingSlot.startTime
                        ? { ...scheduleForm }
                        : slot
                );
            } else {
                // Add new slot
                updatedSchedule.push(scheduleForm);
            }

            await api.put(`/courses/${selectedCourse._id}`, {
                schedule: updatedSchedule
            });

            alert('Schedule updated successfully!');
            setIsModalOpen(false);
            setScheduleForm({ day: '', startTime: '', endTime: '', room: '' });
            setSelectedCourse(null);
            fetchCourses();
        } catch (error) {
            console.error('Failed to save schedule:', error);
            alert('Failed to save schedule');
        }
    };

    const handleDeleteSchedule = async (slot, course) => {
        if (!confirm('Are you sure you want to delete this schedule?')) return;

        try {
            const updatedSchedule = course.schedule.filter(
                s => !(s.day === slot.day && s.startTime === slot.startTime)
            );

            await api.put(`/courses/${course._id}`, {
                schedule: updatedSchedule
            });

            alert('Schedule deleted successfully!');
            fetchCourses();
        } catch (error) {
            console.error('Failed to delete schedule:', error);
            alert('Failed to delete schedule');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in zoom-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Timetable</h1>
                    <p className="text-gray-500 dark:text-gray-400">Create and manage course schedules</p>
                </div>
                <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary-600" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {courses.length} Courses
                    </span>
                </div>
            </div>

            {/* Legend */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Course Legend</h3>
                <div className="flex flex-wrap gap-3">
                    {courses.map((course, index) => (
                        <div
                            key={course._id}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${getCourseColor(course._id)}`}
                        >
                            {course.code} - {course.name}
                        </div>
                    ))}
                </div>
            </div>

            {/* Timetable Grid */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-700/50">
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 border-r border-gray-200 dark:border-gray-600 sticky left-0 bg-gray-50 dark:bg-gray-700/50 min-w-[100px]">
                                    <Clock className="w-4 h-4 inline mr-1" />
                                    Time
                                </th>
                                {days.map(day => (
                                    <th
                                        key={day}
                                        className="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 border-r border-gray-200 dark:border-gray-600 min-w-[140px]"
                                    >
                                        {day}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {timeSlots.map((time, timeIndex) => (
                                <tr key={time} className="border-t border-gray-200 dark:border-gray-700">
                                    <td className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/30 sticky left-0">
                                        {time}
                                    </td>
                                    {days.map(day => {
                                        const schedules = getScheduleForSlot(day, time);
                                        return (
                                            <td
                                                key={`${day}-${time}`}
                                                className="px-2 py-2 border-r border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors relative group"
                                            >
                                                {schedules.length > 0 ? (
                                                    <div className="space-y-1">
                                                        {schedules.map((schedule, idx) => (
                                                            <div
                                                                key={idx}
                                                                className={`p-2 rounded-lg border text-xs ${getCourseColor(schedule.course._id)} relative group/card`}
                                                            >
                                                                <div className="font-bold">{schedule.course.code}</div>
                                                                <div className="text-xs opacity-75">{schedule.room}</div>
                                                                <div className="absolute top-1 right-1 opacity-0 group-hover/card:opacity-100 flex gap-1 transition-opacity">
                                                                    <button
                                                                        onClick={() => handleEditSchedule(schedule, schedule.course)}
                                                                        className="p-1 bg-white dark:bg-gray-800 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                                                                    >
                                                                        <Edit2 className="w-3 h-3" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteSchedule(schedule, schedule.course)}
                                                                        className="p-1 bg-white dark:bg-gray-800 rounded hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600"
                                                                    >
                                                                        <Trash2 className="w-3 h-3" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => handleAddSchedule(day, time)}
                                                        className="w-full h-full min-h-[60px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <Plus className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                                    </button>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Schedule Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                            {editingSlot ? 'Edit Schedule' : 'Add Schedule'}
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    Select Course
                                </label>
                                <select
                                    value={selectedCourse?._id || ''}
                                    onChange={(e) => setSelectedCourse(courses.find(c => c._id === e.target.value))}
                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                                    disabled={!!editingSlot}
                                >
                                    <option value="">-- Select Course --</option>
                                    {courses.map(course => (
                                        <option key={course._id} value={course._id}>
                                            {course.code} - {course.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                        Day
                                    </label>
                                    <select
                                        value={scheduleForm.day}
                                        onChange={(e) => setScheduleForm({ ...scheduleForm, day: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                                        disabled={!!editingSlot}
                                    >
                                        <option value="">Day</option>
                                        {days.map(day => (
                                            <option key={day} value={day}>{day}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                        Room
                                    </label>
                                    <input
                                        type="text"
                                        value={scheduleForm.room}
                                        onChange={(e) => setScheduleForm({ ...scheduleForm, room: e.target.value })}
                                        placeholder="e.g. Room 101"
                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                        Start Time
                                    </label>
                                    <input
                                        type="time"
                                        value={scheduleForm.startTime}
                                        onChange={(e) => setScheduleForm({ ...scheduleForm, startTime: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                                        disabled={!!editingSlot}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                        End Time
                                    </label>
                                    <input
                                        type="time"
                                        value={scheduleForm.endTime}
                                        onChange={(e) => setScheduleForm({ ...scheduleForm, endTime: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        setScheduleForm({ day: '', startTime: '', endTime: '', room: '' });
                                        setSelectedCourse(null);
                                    }}
                                    className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveSchedule}
                                    className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-bold shadow-lg"
                                >
                                    {editingSlot ? 'Update' : 'Add'} Schedule
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageTimetable;
