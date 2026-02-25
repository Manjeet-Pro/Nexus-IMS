import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';
import api from '../../utils/api';

const MyExams = () => {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchExams = async () => {
            try {
                // Ideally, backend should filter exams for courses the student is enrolled in.
                // For now, fetching all and filtering works if enrollment logic is not strict.
                const { data } = await api.get('/exams');
                // In a real app, GET /api/exams should return only relevant exams for student role
                setExams(data);
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch exams", error);
                setLoading(false);
            }
        };

        fetchExams();
    }, []);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading exams...</div>;

    return (
        <div className="space-y-6 animate-in fade-in zoom-in duration-500">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Exam Schedule</h1>
                <p className="text-gray-500 dark:text-gray-400">Your upcoming examinations</p>
            </div>

            {exams.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center border border-gray-100 dark:border-gray-700">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No exams scheduled yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {exams.map(exam => (
                        <div key={exam._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 relative overflow-hidden group hover:shadow-md transition-all">
                            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${exam.type === 'Mid-Term' ? 'from-blue-500/10 to-blue-500/5' :
                                exam.type === 'End-Term' ? 'from-purple-500/10 to-purple-500/5' :
                                    'from-emerald-500/10 to-emerald-500/5'
                                } rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110`} />

                            <div className="relative">
                                <span className={`px-3 py-1 text-xs font-medium rounded-full mb-3 inline-block ${exam.type === 'Mid-Term' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                                    exam.type === 'End-Term' ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' :
                                        'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                                    }`}>
                                    {exam.type}
                                </span>

                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{exam.course?.name}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{exam.course?.code}</p>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                                        <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-700/50 flex items-center justify-center text-primary-600">
                                            <Calendar className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400">Date</p>
                                            <p className="font-medium">{exam.date ? new Date(exam.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : 'TBD'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                                        <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-700/50 flex items-center justify-center text-primary-600">
                                            <Clock className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400">Time</p>
                                            <p className="font-medium">{exam.startTime} ({exam.duration} mins)</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                                        <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-700/50 flex items-center justify-center text-primary-600">
                                            <MapPin className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400">Room</p>
                                            <p className="font-medium">{exam.room}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyExams;
