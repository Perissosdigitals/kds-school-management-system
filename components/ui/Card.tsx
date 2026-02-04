import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    variant?: 'white' | 'glass' | 'blue' | 'gradient';
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
    children,
    className = '',
    variant = 'white',
    padding = 'md',
}) => {
    const baseStyles = 'rounded-2xl shadow-lg transition-all duration-300';

    const variants = {
        white: 'bg-white border border-slate-100',
        glass: 'bg-white/70 backdrop-blur-md border border-white/40',
        blue: 'bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100',
        gradient: 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white',
    };

    const paddings = {
        none: 'p-0',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
    };

    return (
        <div className={`${baseStyles} ${variants[variant]} ${paddings[padding]} ${className}`}>
            {children}
        </div>
    );
};

export const CardHeader: React.FC<{ title: string; subtitle?: string; icon?: string; className?: string }> = ({
    title, subtitle, icon, className = ''
}) => (
    <div className={`mb-4 flex items-center justify-between ${className}`}>
        <div>
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                {icon && <i className={`bx ${icon} text-emerald-600`}></i>}
                {title}
            </h3>
            {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
    </div>
);
