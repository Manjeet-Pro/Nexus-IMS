
import React, { useState, useEffect } from 'react';
import { Search, Plus, BookOpen, Clock, Calendar, Edit2, Trash2, Save, X } from 'lucide-react';
import api from '../../utils/api';

const ManageCourses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form State
    const [currentCourse, setCurrentCourse] = useState(null); // If null, adding new. If set, editing.
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        department: '',
        credits: 3,
        semester: '',
        schedule: [],
        syllabus: []
    });

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const { data } = await api.get('/courses');
            setCourses(data);
        } catch (error) {
            console.error("Failed to fetch courses", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (course = null) => {
        if (course) {
            setCurrentCourse(course);
            setFormData({
                name: course.name,
                code: course.code,
                department: course.department,
                credits: course.credits,
                semester: course.semester,
                schedule: course.schedule || [],
                syllabus: course.syllabus || []
            });
        } else {
            setCurrentCourse(null);
            setFormData({
                name: '',
                code: '',
                department: '',
                credits: 3,
                semester: '',
                schedule: [],
                syllabus: []
            });
        }
        setIsModalOpen(true);
    };

    const handleSaveCourse = async (e) => {
        e.preventDefault();
        try {
            if (currentCourse) {
                // Update
                await api.put(`/courses/${currentCourse._id}`, formData);
                alert('Course updated successfully!');
            } else {
                // Create
                await api.post('/courses', formData);
                alert('Course created successfully!');
            }
            setIsModalOpen(false);
            fetchCourses();
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Failed to save course');
        }
    };

    const toggleDisplay = () => setIsModalOpen(!isModalOpen);

    // Schedule Management Helper
    const [newSlot, setNewSlot] = useState({ day: 'Monday', startTime: '', room: '' });

    const addScheduleSlot = () => {
        if (!newSlot.startTime || !newSlot.room) return alert("Time and Room are required");

        setFormData({
            ...formData,
            schedule: [...formData.schedule, { ...newSlot }]
        });
        setNewSlot({ ...newSlot, startTime: '', room: '' }); // Reset but keep day
    };

    const removeScheduleSlot = (index) => {
        const updatedSchedule = [...formData.schedule];
        updatedSchedule.splice(index, 1);
        setFormData({ ...formData, schedule: updatedSchedule });
    };

    // Syllabus Management Helper
    const [newTopic, setNewTopic] = useState('');

    const addSyllabusTopic = () => {
        if (!newTopic.trim()) return alert("Topic name is required");

        setFormData({
            ...formData,
            syllabus: [...(formData.syllabus || []), { topic: newTopic, completed: false }]
        });
        setNewTopic('');
    };

    const removeSyllabusTopic = (index) => {
        const updatedSyllabus = [...(formData.syllabus || [])];
        updatedSyllabus.splice(index, 1);
        setFormData({ ...formData, syllabus: updatedSyllabus });
    };

    const filteredCourses = courses.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-10 text-center">Loading Courses...</div>;

    return (
        <div className="space-y-6 animate-in fade-in zoom-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Courses</h1>
                    <p className="text-gray-500 dark:text-gray-400">Create courses and assign timetables</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:shadow-lg hover:shadow-primary-500/30 transition-all flex items-center gap-2 font-bold"
                >
                    <Plus className="w-5 h-5" />
                    Add Course
                </button>
            </div>

            {/* Search */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
                <div className="relative max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search courses..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full !pl-12 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                </div>
            </div>

            {/* Course List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map(course => (
                    <div key={course._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:shadow-md transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">
                                    {course.name}
                                </h3>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    <span className="px-2 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-xs font-bold rounded-md border border-primary-100 dark:border-primary-800">
                                        {course.code}
                                    </span>
                                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-medium rounded-md">
                                        {course.department}
                                    </span>
                                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-medium rounded-md">
                                        Sem: {course.semester}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => handleOpenModal(course)}
                                className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                            >
                                <Edit2 className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                <Calendar className="w-3 h-3" />
                                Schedule ({course.schedule.length})
                            </h4>
                            <div className="space-y-1.5 max-h-32 overflow-y-auto">
                                {course.schedule.length > 0 ? (
                                    course.schedule.map((slot, idx) => (
                                        <div key={idx} className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                                            <span>{slot.day.slice(0, 3)} {slot.startTime}</span>
                                            <span className="font-medium">{slot.room}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-400 italic">No classes scheduled</p>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 animate-in zoom-in-95">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {currentCourse ? 'Edit Course & Schedule' : 'Add New Course'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveCourse} className="space-y-6">
                            {/* Course Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Course Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Course Code</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.department}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Semester</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.semester}
                                        onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                            </div>

                            {/* Syllabus Manager */}
                            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider flex items-center gap-2">
                                    <BookOpen className="w-4 h-4" />
                                    Syllabus Configuration
                                </h3>

                                <div className="flex gap-2 mb-4 items-end">
                                    <div className="flex-1">
                                        <label className="text-xs font-medium text-gray-500 mb-1 block">Topic</label>
                                        <input
                                            type="text"
                                            value={newTopic}
                                            onChange={(e) => setNewTopic(e.target.value)}
                                            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border rounded-lg text-sm"
                                            placeholder="Enter topic name"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={addSyllabusTopic}
                                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-bold"
                                    >
                                        Add
                                    </button>
                                </div>

                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {formData.syllabus?.map((topic, idx) => (
                                        <div key={idx} className="flex justify-between items-center bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{topic.topic}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeSyllabusTopic(idx)}
                                                className="text-danger-500 hover:text-danger-700 p-1"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                    {(!formData.syllabus || formData.syllabus.length === 0) && (
                                        <p className="text-center text-sm text-gray-400 py-2">No topics added yet.</p>
                                    )}
                                </div>
                            </div>

                            {/* Schedule Manager */}
                            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    Timetable Configuration
                                </h3>

                                <div className="flex gap-2 mb-4 items-end">
                                    <div className="flex-1">
                                        <label className="text-xs font-medium text-gray-500 mb-1 block">Day</label>
                                        <select
                                            value={newSlot.day}
                                            onChange={(e) => setNewSlot({ ...newSlot, day: e.target.value })}
                                            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border rounded-lg text-sm"
                                        >
                                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(d => (
                                                <option key={d} value={d}>{d}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-xs font-medium text-gray-500 mb-1 block">Time (e.g. 10:00 AM)</label>
                                        <input
                                            type="text"
                                            value={newSlot.startTime}
                                            onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                                            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border rounded-lg text-sm"
                                            placeholder="HH:MM"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-xs font-medium text-gray-500 mb-1 block">Room</label>
                                        <input
                                            type="text"
                                            value={newSlot.room}
                                            onChange={(e) => setNewSlot({ ...newSlot, room: e.target.value })}
                                            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border rounded-lg text-sm"
                                            placeholder="Room No"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={addScheduleSlot}
                                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-bold"
                                    >
                                        Add
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    {formData.schedule.map((slot, idx) => (
                                        <div key={idx} className="flex justify-between items-center bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                                            <div className="flex gap-4 text-sm">
                                                <span className="font-bold w-24">{slot.day}</span>
                                                <span className="w-24">{slot.startTime}</span>
                                                <span className="text-gray-500">Room: {slot.room}</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeScheduleSlot(idx)}
                                                className="text-danger-500 hover:text-danger-700 p-1"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                    {formData.schedule.length === 0 && (
                                        <p className="text-center text-sm text-gray-400 py-2">No slots added yet.</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:shadow-lg font-bold"
                                >
                                    {currentCourse ? 'Update Course' : 'Create Course'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageCourses;
