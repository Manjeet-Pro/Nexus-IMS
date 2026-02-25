import React from 'react';
import { Hammer, ArrowLeft, RefreshCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Maintenance = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center space-y-6 animate-in fade-in zoom-in duration-500">
                <div className="relative inline-block">
                    <div className="w-24 h-24 bg-primary-100 dark:bg-primary-900/30 rounded-3xl flex items-center justify-center mx-auto rotate-12">
                        <Hammer className="w-12 h-12 text-primary-600 -rotate-12" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white dark:bg-gray-800 rounded-xl shadow-lg flex items-center justify-center">
                        <RefreshCcw className="w-5 h-5 text-warning-500 animate-spin-slow" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">System Maintenance</h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Our digital campus is currently undergoing some scheduled improvements to serve you better.
                    </p>
                </div>

                <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <p className="text-sm text-gray-700 dark:text-gray-200 font-medium italic">
                        "We're polishing the pixels and optimizing the databases. We'll be back shortly!"
                    </p>
                </div>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/25 active:scale-95 flex items-center justify-center gap-2"
                    >
                        <RefreshCcw className="w-4 h-4" /> Check Status
                    </button>
                    <button
                        onClick={() => navigate('/login')}
                        className="w-full py-3 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl font-semibold border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center justify-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Login
                    </button>
                </div>

                <p className="text-xs text-gray-400">
                    Expected downtime: ~15 minutes. Thank you for your patience.
                </p>
            </div>
        </div>
    );
};

export default Maintenance;
