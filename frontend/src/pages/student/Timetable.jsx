import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../utils/api';

const Timetable = () => {
    const [timetable, setTimetable] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDay, setSelectedDay] = useState(new Date().toLocaleDateString('en-US', { weekday: 'long' }));

    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    useEffect(() => {
        const fetchTimetable = async () => {
            try {
                const { data } = await api.get('/students/timetable');
                setTimetable(data);

                // If today is Sunday, default to Monday
                const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
                if (today === 'Sunday') setSelectedDay('Monday');
            } catch (err) {
                console.error("Failed to fetch timetable:", err);
                setError("Failed to load timetable.");
            } finally {
                setLoading(false);
            }
        };

        fetchTimetable();
    }, []);

    const handleDayChange = (direction) => {
        const currentIndex = daysOfWeek.indexOf(selectedDay);
        let newIndex;
        if (direction === 'next') {
            newIndex = (currentIndex + 1) % daysOfWeek.length;
        } else {
            newIndex = (currentIndex - 1 + daysOfWeek.length) % daysOfWeek.length;
        }
        setSelectedDay(daysOfWeek[newIndex]);
    };

    if (loading) return <div className="p-6 text-center">Loading timetable...</div>;
    if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Timetable</h1>
                    <p className="text-gray-500 dark:text-gray-400">Weekly Class Schedule</p>
                </div>

                {/* Day Navigation */}
                <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-1 transition-colors">
                    <button
                        onClick={() => handleDayChange('prev')}
                        className="p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md text-gray-500 dark:text-gray-400"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="w-32 text-center font-bold text-gray-700 dark:text-gray-200">{selectedDay}</span>
                    <button
                        onClick={() => handleDayChange('next')}
                        className="p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md text-gray-500 dark:text-gray-400"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                {timetable && timetable[selectedDay] && timetable[selectedDay].length > 0 ? (
                    timetable[selectedDay].map((slot, index) => (
                        <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all flex flex-col md:flex-row gap-6 relative overflow-hidden group">
                            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500 group-hover:bg-emerald-600 transition-colors"></div>

                            <div className="flex flex-col justify-center min-w-[120px] border-r border-gray-100 dark:border-gray-700 pr-6">
                                <div className="flex items-center gap-2 text-gray-900 dark:text-white font-bold text-lg">
                                    <Clock className="w-5 h-5 text-emerald-500" />
                                    {slot.startTime}
                                </div>
                                <div className="text-gray-400 dark:text-gray-500 text-sm pl-7">
                                    to {slot.endTime}
                                </div>
                            </div>

                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{slot.courseName}</h3>
                                    <span className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-bold border border-emerald-100 dark:border-emerald-800/30">
                                        {slot.courseCode}
                                    </span>
                                </div>

                                <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-300 mt-3">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                        Room {slot.room}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <User className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                        {slot.instructor}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 border-dashed transition-colors">
                        <Calendar className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">No classes scheduled</h3>
                        <p className="text-gray-500 dark:text-gray-400">Enjoy your free time!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Timetable;
