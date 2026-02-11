import React from 'react';
import type { TeacherRole } from '../../types';

interface TeacherRoleBadgeProps {
    role: TeacherRole;
    className?: string;
}

const roleConfig: Record<TeacherRole, { label: string; color: string; icon: string }> = {
    main: { label: 'Principal', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: 'bxs-user-badge' },
    sports: { label: 'Sport', color: 'bg-green-100 text-green-700 border-green-200', icon: 'bx-football' },
    art: { label: 'Art', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: 'bx-palette' },
    music: { label: 'Musique', color: 'bg-pink-100 text-pink-700 border-pink-200', icon: 'bx-music' },
    science: { label: 'Science', color: 'bg-teal-100 text-teal-700 border-teal-200', icon: 'bx-test-tube' },
    language: { label: 'Langue', color: 'bg-orange-100 text-orange-700 border-orange-200', icon: 'bx-book-open' },
    computer: { label: 'Informatique', color: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: 'bx-laptop' },
    other: { label: 'Autre', color: 'bg-gray-100 text-gray-700 border-gray-200', icon: 'bx-user' },
};

export const TeacherRoleBadge: React.FC<TeacherRoleBadgeProps> = ({ role, className = '' }) => {
    const config = roleConfig[role] || roleConfig.other;

    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border ${config.color} ${className}`}>
            <i className={`bx ${config.icon}`}></i>
            {config.label}
        </span>
    );
};
