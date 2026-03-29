import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const Timetable = () => {
    const [timetable, setTimetable] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTimetable = async () => {
            try {
                const { data } = await api.get('/faculty/timetable');
                setTimetable(data);
            } catch (error) {
                console.error("Failed to fetch timetable", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTimetable();
    }, []);

    if (loading) return <div className="p-8 text-center">Loading timetable...</div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Weekly Timetable</h1>
                <p className="text-gray-500 dark:text-gray-400">Your teaching schedule</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700 w-32">Day</th>
                                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Schedule</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {DAYS.map((day) => (
                                <tr key={day} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                    <td className="p-4 font-medium text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/20 align-top">
                                        {day}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-wrap gap-4">
                                            {timetable[day] && timetable[day].length > 0 ? (
                                                timetable[day].map((slot, index) => (
                                                    <div key={index} className="flex-shrink-0 w-64 p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900/50 shadow-sm hover:shadow-md transition-shadow">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <span className="text-xs font-semibold px-2 py-1 rounded bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                                                                {slot.time}
                                                            </span>
                                                            <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                                                {slot.room}
                                                            </span>
                                                        </div>
                                                        <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-1 line-clamp-1" title={slot.subject}>
                                                            {slot.subject}
                                                        </h4>
                                                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{slot.batch}</p>
                                                        <div className="text-xs font-medium inline-block px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                                                            {slot.type}
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-gray-400 dark:text-gray-500 text-sm italic p-2">No classes scheduled</div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Timetable;
