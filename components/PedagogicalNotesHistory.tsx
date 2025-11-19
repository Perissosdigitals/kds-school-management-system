import React, { useMemo } from 'react';
import type { PedagogicalNote } from '../types';

interface PedagogicalNotesHistoryProps {
    notes: PedagogicalNote[];
}

const getInitials = (name: string): string => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
};

export const PedagogicalNotesHistory: React.FC<PedagogicalNotesHistoryProps> = ({ notes }) => {
    
    const sortedNotes = useMemo(() => 
        [...notes].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
        [notes]
    );

    if (sortedNotes.length === 0) {
        return (
            <div className="text-center py-6 text-gray-500 h-full flex flex-col justify-center items-center bg-slate-50 rounded-lg">
                <i className='bx bx-message-square-x text-4xl mb-2'></i>
                <p className="font-medium">Aucune note pédagogique</p>
                <p className="text-sm">Ajoutez une note pour commencer le suivi.</p>
            </div>
        );
    }
    
    return (
        <div className="max-h-96 overflow-y-auto space-y-4 pr-2 -mr-2">
            {sortedNotes.map(note => (
                <div key={note.id} className="bg-white border border-slate-200 rounded-lg shadow-sm transition-shadow hover:shadow-md">
                    <div className="flex items-center gap-3 p-3 border-b border-slate-100">
                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex-shrink-0 flex items-center justify-center font-bold text-sm">
                            {getInitials(note.teacherName)}
                        </div>
                        <div>
                            <p className="font-semibold text-sm text-slate-800">{note.teacherName}</p>
                            <p className="text-xs text-gray-500">
                                {new Date(note.timestamp).toLocaleString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                            </p>
                        </div>
                    </div>
                    <div className="p-3">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.note}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};
