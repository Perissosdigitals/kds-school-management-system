import React, { useMemo } from 'react';
import type { TimetableSession } from '../../types';
import { getSubjectColor } from '../../utils/colorUtils';

interface TimetableSummaryProps {
  sessions: TimetableSession[];
}

interface SubjectSummary {
  subject: string;
  count: number;
  hours: number;
}

const SummaryItem: React.FC<{ item: SubjectSummary, maxHours: number }> = ({ item, maxHours }) => {
    const color = getSubjectColor(item.subject);
    const widthPercentage = maxHours > 0 ? (item.hours / maxHours) * 100 : 0;
    
    return (
        <div className="py-2">
            <div className="flex justify-between items-center mb-1 text-sm">
                <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${color.bg} border ${color.border}`}></span>
                    <span className="font-semibold text-slate-700">{item.subject}</span>
                </div>
                <div className="text-slate-500">
                    {item.count} session{item.count > 1 ? 's' : ''} | <span className="font-medium text-slate-600">{item.hours}h</span> / sem
                </div>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5">
                <div 
                    className={`h-1.5 rounded-full ${color.bg}`} 
                    style={{ width: `${widthPercentage}%` }}
                ></div>
            </div>
        </div>
    );
};


export const TimetableSummary: React.FC<TimetableSummaryProps> = ({ sessions }) => {
    const summaryData = useMemo(() => {
        if (!sessions || sessions.length === 0) return [];

        const summaryMap: { [subject: string]: { count: number; hours: number } } = {};

        const calculateHours = (start: string, end: string): number => {
            const [startH] = start.split(':').map(Number);
            const [endH] = end.split(':').map(Number);
            return endH - startH;
        };

        sessions.forEach(session => {
            if (!summaryMap[session.subject]) {
                summaryMap[session.subject] = { count: 0, hours: 0 };
            }
            summaryMap[session.subject].count++;
            summaryMap[session.subject].hours += calculateHours(session.startTime, session.endTime);
        });

        return Object.entries(summaryMap)
            .map(([subject, data]) => ({ subject, ...data }))
            .sort((a, b) => b.hours - a.hours);
    }, [sessions]);

    const maxHours = useMemo(() => {
        return Math.max(...summaryData.map(item => item.hours), 0);
    }, [summaryData]);

    return (
        <div className="p-4 bg-slate-50 rounded-lg border">
            <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                <i className='bx bx-bar-chart-alt-2'></i>
                Résumé Hebdomadaire
            </h4>
            <div className="divide-y divide-slate-200">
                {summaryData.map(item => (
                    <SummaryItem key={item.subject} item={item} maxHours={maxHours} />
                ))}
            </div>
        </div>
    );
};