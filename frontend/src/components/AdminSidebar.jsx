
import React from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, GraduationCap, Settings, Shield, IndianRupee, BookOpen, UserCircle, Calendar, Award, Bell } from 'lucide-react';

const AdminSidebar = ({ onClose }) => {
    const navigate = useNavigate();
    const links = [
        { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
        { to: '/admin/courses', icon: BookOpen, label: 'Manage Courses' },
        { to: '/admin/timetable', icon: Calendar, label: 'Manage Timetable' },
        { to: '/admin/notices', icon: Bell, label: 'Manage Notices' },
        { to: '/admin/students', icon: Users, label: 'Students' },
        { to: '/admin/parents', icon: UserCircle, label: 'Parents' },
        { to: '/admin/results', icon: Award, label: 'Student Results' },
        { to: '/admin/faculty', icon: GraduationCap, label: 'Faculty Members' },
        { to: '/admin/fees', icon: IndianRupee, label: 'Fees' },
        { to: '/admin/exams', icon: Calendar, label: 'Exam Schedule' },
        { to: '/admin/settings', icon: Settings, label: 'Settings' },
    ];

    return (
        <div className="h-full flex flex-col">
            <div className="h-20 flex items-center px-6 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/')}>
                    <div className="p-1.5 bg-gradient-to-tr from-primary-600 to-info-500 rounded-xl shadow-lg shadow-primary-500/20 group-hover:scale-110 transition-transform duration-300">
                        <img src="/logo.png" alt="Nexus" className="h-8 w-8 object-cover rounded-lg brightness-110" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-lg font-black tracking-tighter text-gray-900 dark:text-white leading-none">NEXUS</span>
                        <span className="text-[10px] font-bold tracking-widest text-primary-600 dark:text-primary-400 uppercase">Admin</span>
                    </div>
                </div>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                {links.map((link) => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        end={link.end}
                        onClick={onClose}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${isActive
                                ? 'bg-primary-50 text-primary-700 font-medium shadow-sm'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`
                        }
                    >
                        <link.icon className="w-5 h-5" />
                        <span>{link.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 m-4 bg-primary-50/50 rounded-xl border border-primary-100">
                <p className="text-xs text-primary-600/80 font-medium mb-1">Nexus IMS v1.0</p>
                <p className="text-[10px] text-gray-500">© 2026 Nexus Inc.</p>
            </div>
        </div>
    );
};

export default AdminSidebar;
