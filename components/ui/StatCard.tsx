import React from 'react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: string;
    color: string;
}

export const StatCard: React.FC<StatCardProps> = React.memo(({ title, value, icon, color }) => {
    // Map border colors to their respective icon backgrounds and text colors for robustness
    const colorMap: Record<string, { bg: string, text: string, decoration: string }> = {
        'border-emerald-500': { bg: 'bg-emerald-50', text: 'text-emerald-600', decoration: 'bg-emerald-400/10' },
        'border-purple-600': { bg: 'bg-purple-50', text: 'text-purple-600', decoration: 'bg-purple-500/10' },
        'border-sky-500': { bg: 'bg-sky-50', text: 'text-sky-600', decoration: 'bg-sky-400/10' },
        'border-amber-500': { bg: 'bg-amber-50', text: 'text-amber-600', decoration: 'bg-amber-500/10' },
        'border-blue-600': { bg: 'bg-blue-50', text: 'text-blue-600', decoration: 'bg-blue-500/10' },
    };

    const styles = colorMap[color] || { bg: 'bg-slate-50', text: 'text-slate-600', decoration: 'bg-slate-400/10' };

    return (
        <div className={`relative overflow-hidden bg-white p-6 rounded-2xl shadow-lg border-l-4 ${color} transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group`}>
            {/* Background Illustration Element */}
            <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full ${styles.decoration} group-hover:scale-150 transition-transform duration-500`}></div>

            <div className="flex justify-between items-start relative z-10">
                <div>
                    <div className="text-slate-500 text-sm font-semibold tracking-wide uppercase mb-1">{title}</div>
                    <div className="text-3xl font-extrabold text-slate-800 tracking-tight">{value}</div>
                </div>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${styles.bg} shadow-inner transition-transform group-hover:rotate-12`}>
                    <i className={`bx ${icon} text-3xl ${styles.text}`}></i>
                </div>
            </div>
        </div>
    );
});