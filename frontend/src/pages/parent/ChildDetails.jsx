import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, FileText, BookOpen, Camera } from 'lucide-react';
import api from '../../utils/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ChildDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [child, setChild] = useState(null);
    const [attendance, setAttendance] = useState([]);
    const [results, setResults] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChildDetails = async () => {
            try {
                // Fetch basic child info (re-using dashboard endpoint or new one)
                // For now, let's assume we fetch everything or have specific endpoints
                // In a real app, we'd probably have /api/parent/child/:id

                // Simulating fetch for now as we build backend
                const { data } = await api.get(`/parent/child/${id}`);
                setChild(data.child);
                setAttendance(data.attendance);
                setResults(data.results);
                setCourses(data.courses || []);
            } catch (error) {
                console.error("Failed to fetch child details", error);
            } finally {
                setLoading(false);
            }
        };
        fetchChildDetails();
    }, [id]);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Simple validation
        if (file.size > 5 * 1024 * 1024) {
            alert("File size too large. Max 5MB.");
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = async () => {
            try {
                const base64Image = reader.result;
                // Optimistic update
                setChild(prev => ({ ...prev, user: { ...prev.user, avatar: base64Image } }));

                await api.put(`/parent/child/${id}/avatar`, { avatar: base64Image });
                // alert("Profile picture updated successfully!"); 
            } catch (error) {
                console.error("Failed to update profile picture", error);
                alert("Failed to update profile picture. Please try again.");
                // Revert on failure (optional, but good practice)
                // location.reload(); 
            }
        };
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;
    if (!child) return <div className="p-8 text-center">Child not found</div>;

    return (
        <div className="space-y-6">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-900">
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </button>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-6">
                <div className="w-24 h-24 bg-gray-200 rounded-full overflow-hidden relative group">
                    <img
                        src={
                            child.user.avatar
                                ? (child.user.avatar.startsWith('http') || child.user.avatar.startsWith('data:')
                                    ? child.user.avatar
                                    : `${import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'}${child.user.avatar.startsWith('/') ? '' : '/'}${child.user.avatar}`)
                                : `https://ui-avatars.com/api/?name=${child.user.name}&background=random`
                        }
                        alt={child.user.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://ui-avatars.com/api/?name=${child.user.name}&background=random`;
                        }}
                    />

                    {/* Overlay for upload */}
                    <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                        <Camera className="w-6 h-6" />
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageUpload}
                        />
                    </label>
                </div>
                <div>
                    <h1 className="text-2xl font-bold">{child.user.name}</h1>
                    <p className="text-gray-500">{child.rollNo} • {child.course} • {child.year}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Attendance Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-blue-500" /> Attendance Trends
                    </h3>
                    <div className="h-64">
                        {attendance && attendance.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={attendance}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="percentage" stroke="#3b82f6" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400">
                                No attendance records found
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Results */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-green-500" /> Recent Results
                    </h3>
                    <div className="space-y-3">
                        {results.map((res, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-semibold">{res.subject}</p>
                                    <p className="text-xs text-gray-500">{res.date}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-gray-900">{res.marks}/{res.total}</p>
                                    <p className="text-xs text-gray-500">{res.type}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Course Progress */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-purple-500" /> Course Progress
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {courses.length > 0 ? (
                            courses.map((course) => (
                                <div key={course.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700">
                                    <div className="flex justify-between items-center mb-2">
                                        <div>
                                            <h4 className="font-bold text-gray-900 dark:text-white line-clamp-1" title={course.name}>{course.name}</h4>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{course.code}</p>
                                        </div>
                                        <span className="text-xs font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 px-2 py-1 rounded">
                                            {course.progress}%
                                        </span>
                                    </div>
                                    <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary-600 rounded-full transition-all duration-500"
                                            style={{ width: `${course.progress}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                                        Instructor: {course.instructor}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-4 text-gray-500 italic">No courses enrolled yet.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChildDetails;
