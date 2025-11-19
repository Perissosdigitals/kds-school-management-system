import React from 'react';

export const StatCard: React.FC<{ title: string; value: string | number; icon: string; color: string }> = React.memo(({ title, value, icon, color }) => (
    <div className={`bg-white p-6 rounded-xl shadow-md border-l-4 ${color}`}>
        <div className="flex justify-between items-start">
            <div>
                <div className="text-gray-500 text-sm">{title}</div>
                <div className="text-3xl font-bold text-slate-800">{value}</div>
            </div>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white text-2xl ${color.replace('border', 'bg')}`}>
                <i className={`bx ${icon}`}></i>
            </div>
        </div>
    </div>
));