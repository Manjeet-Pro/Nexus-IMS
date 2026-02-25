
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { getCurrentUser } from '../utils/auth';
import TopNavbar from '../components/TopNavbar';
import AdminSidebar from '../components/AdminSidebar';
import FacultySidebar from '../components/FacultySidebar';
import StudentSidebar from '../components/StudentSidebar';
import ParentSidebar from '../components/ParentSidebar';
import Chatbot from '../components/Chatbot';

const DashboardLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const user = getCurrentUser();

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
    const closeSidebar = () => setSidebarOpen(false);

    // Select Sidebar based on role
    const getSidebar = () => {
        switch (user?.role) {
            case 'admin':
                return <AdminSidebar onClose={closeSidebar} />;
            case 'faculty':
                console.log("Rendering Faculty Sidebar");
                return <FacultySidebar onClose={closeSidebar} />;
            case 'student':
                return <StudentSidebar onClose={closeSidebar} />;
            case 'parent':
                console.log("Rendering Parent Sidebar");
                return <ParentSidebar onClose={closeSidebar} />;
            default:
                return null;
        }
    };

    if (!user) return null; // Should be handled by ProtectedRoute, but safeguard

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            <TopNavbar toggleSidebar={toggleSidebar} />

            {/* Sidebar - Desktop */}
            <aside className="hidden lg:block fixed left-0 top-0 bottom-0 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-20 transition-colors duration-200">
                {getSidebar()}
            </aside>

            {/* Sidebar - Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-gray-800/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={closeSidebar}
                ></div>
            )}

            {/* Sidebar - Mobile Slide-in */}
            <aside className={`fixed top-0 bottom-0 left-0 w-64 bg-white dark:bg-gray-800 z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {getSidebar()}
            </aside>

            {/* Main Content */}
            <main className="pt-20 lg:pl-64 min-h-screen transition-all duration-300">
                <div className="p-6 max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>

            <Chatbot />
        </div>
    );
};

export default DashboardLayout;
