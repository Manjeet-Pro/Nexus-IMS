import React from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Bell, CreditCard } from 'lucide-react';

const ParentSidebar = ({ onClose }) => {
    const navigate = useNavigate();
    const links = [
        { to: '/parent', icon: LayoutDashboard, label: 'Dashboard', end: true },
        // { to: '/parent/children', icon: Users, label: 'My Children' }, 
        { to: '/parent/notices', icon: Bell, label: 'Notices' },
        { to: '/parent/fees', icon: CreditCard, label: 'Fee Payment' },
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
                        <span className="text-[10px] font-bold tracking-widest text-primary-600 dark:text-primary-400 uppercase">Parent</span>
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
                                ? 'bg-primary-50 text-primary-700 font-medium shadow-sm dark:bg-primary-900/10 dark:text-primary-300'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700/50 dark:hover:text-gray-200'
                            }`
                        }
                    >
                        <link.icon className="w-5 h-5" />
                        <span>{link.label}</span>
                    </NavLink>
                ))}
            </nav>
        </div>
    );
};

export default ParentSidebar;
