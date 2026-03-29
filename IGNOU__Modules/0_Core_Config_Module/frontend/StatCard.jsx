
import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 transition-all hover:shadow-lg">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                    <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
                </div>
                <div className={`p-3 rounded-lg ${color}`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
            </div>

            {trend && (
                <div className="mt-4 flex items-center text-sm">
                    {trend === 'up' ? (
                        <ArrowUp className="w-4 h-4 text-emerald-500 mr-1" />
                    ) : (
                        <ArrowDown className="w-4 h-4 text-red-500 mr-1" />
                    )}
                    <span className={`font-medium ${trend === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>
                        {trendValue}
                    </span>
                    <span className="text-gray-400 ml-1">vs last month</span>
                </div>
            )}
        </div>
    );
};

export default StatCard;
