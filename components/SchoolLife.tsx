import React, { useState, lazy, Suspense } from 'react';
import { LoadingSpinner } from './ui/LoadingSpinner';
import type { User } from '../types';

const AttendanceTracker = lazy(() => import('./AttendanceTracker'));
const Timetable = lazy(() => import('./Timetable'));


type ActiveTab = 'attendance' | 'timetable';

const TabButton = React.memo<{ active: boolean; onClick: () => void; icon: string; label: string }>(({ active, onClick, icon, label }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-t-lg border-b-2 transition-colors duration-300 ${
            active
                ? 'text-blue-700 border-blue-700'
                : 'text-gray-500 border-transparent hover:text-blue-600 hover:border-blue-300'
        }`}
    >
        <i className={`bx ${icon} text-lg`}></i>
        <span>{label}</span>
    </button>
));


export const SchoolLife: React.FC<{currentUser: User}> = ({ currentUser }) => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('attendance');

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold text-slate-800">Gestion de la Vie Scolaire</h2>
                <p className="text-gray-500">Suivi des présences, emplois du temps et activités quotidiennes.</p>
            </div>

            <div className="border-b border-gray-200">
                <nav className="flex gap-4" aria-label="Tabs">
                    <TabButton 
                        active={activeTab === 'attendance'}
                        onClick={() => setActiveTab('attendance')}
                        icon="bxs-calendar-check"
                        label="Feuille d'Appel"
                    />
                    <TabButton 
                        active={activeTab === 'timetable'}
                        onClick={() => setActiveTab('timetable')}
                        icon="bxs-time-five"
                        label="Emploi du Temps"
                    />
                </nav>
            </div>
            
            <Suspense fallback={<LoadingSpinner />}>
                {activeTab === 'attendance' && <AttendanceTracker currentUser={currentUser} />}
                {activeTab === 'timetable' && <Timetable currentUser={currentUser} />}
            </Suspense>

        </div>
    );
};

export default SchoolLife;
