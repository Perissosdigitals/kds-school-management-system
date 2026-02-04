import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { SystemActivity, User } from '../types';
import { ActivityService } from '../services/api/activity.service';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { FilterInput } from './ui/FilterControls';

export const ActivityLog: React.FC = () => {
    const [activities, setActivities] = useState<SystemActivity[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');

    const loadActivities = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await ActivityService.getActivities();
            // Sort by latest first
            setActivities(data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
        } catch (error) {
            console.error('Erreur lors du chargement des activités:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadActivities();
    }, [loadActivities]);

    const filteredActivities = useMemo(() => {
        return activities.filter(activity => {
            const matchesSearch =
                activity.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                activity.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (activity.details && activity.details.toLowerCase().includes(searchTerm.toLowerCase()));

            const matchesCategory = categoryFilter === 'all' || activity.category === categoryFilter;

            return matchesSearch && matchesCategory;
        });
    }, [activities, searchTerm, categoryFilter]);

    const stats = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        const todayActivities = activities.filter(a => a.timestamp.startsWith(today));

        const byCategory = activities.reduce((acc, a) => {
            acc[a.category] = (acc[a.category] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return {
            total: activities.length,
            today: todayActivities.length,
            attendance: byCategory['attendance'] || 0,
            grades: byCategory['grades'] || 0
        };
    }, [activities]);

    const getCategoryIcon = (category: SystemActivity['category']) => {
        switch (category) {
            case 'attendance': return { icon: 'bx-calendar-check', color: 'text-orange-600', bg: 'bg-orange-100' };
            case 'grades': return { icon: 'bx-trophy', color: 'text-purple-600', bg: 'bg-purple-100' };
            case 'documents': return { icon: 'bx-file', color: 'text-blue-600', bg: 'bg-blue-100' };
            case 'auth': return { icon: 'bx-log-in-circle', color: 'text-green-600', bg: 'bg-green-100' };
            case 'pedagogical': return { icon: 'bx-user-detail', color: 'text-indigo-600', bg: 'bg-indigo-100' };
            default: return { icon: 'bx-info-circle', color: 'text-slate-600', bg: 'bg-slate-100' };
        }
    };

    if (isLoading) return <LoadingSpinner />;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center text-slate-800">
                <div>
                    <h2 className="text-3xl font-bold">Journal d'Activités</h2>
                    <p className="text-gray-500">Suivi en temps réel des actions des utilisateurs (Board Overview).</p>
                </div>
                <button
                    onClick={loadActivities}
                    className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl transition-all font-bold"
                >
                    <i className='bx bx-refresh text-xl'></i>
                    Actualiser
                </button>
            </div>

            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                        <i className='bx bx-history text-2xl'></i>
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Total Actions</p>
                        <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                        <i className='bx bx-time-five text-2xl'></i>
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Aujourd'hui</p>
                        <p className="text-2xl font-bold text-slate-800">{stats.today}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
                        <i className='bx bx-calendar-check text-2xl'></i>
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Présences</p>
                        <p className="text-2xl font-bold text-slate-800">{stats.attendance}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
                        <i className='bx bx-trophy text-2xl'></i>
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Notes Saisies</p>
                        <p className="text-2xl font-bold text-slate-800">{stats.grades}</p>
                    </div>
                </div>
            </div>

            {/* Activities List */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                    <h3 className="text-xl font-bold text-slate-800 uppercase tracking-wider">Détails des Activités</h3>
                    <div className="flex gap-4 w-full md:w-auto">
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="all">Toutes catégories</option>
                            <option value="attendance">Présences</option>
                            <option value="grades">Notes</option>
                            <option value="documents">Documents</option>
                            <option value="auth">Connexions</option>
                            <option value="pedagogical">Pédagogique</option>
                        </select>
                        <div className="flex-1 md:w-64">
                            <FilterInput
                                placeholder="Rechercher utilisateur ou action..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 text-slate-600 text-sm uppercase tracking-wider">
                                <th className="px-6 py-4 font-bold">Date & Heure</th>
                                <th className="px-6 py-4 font-bold">Utilisateur</th>
                                <th className="px-6 py-4 font-bold">Action</th>
                                <th className="px-6 py-4 font-bold">Catégorie</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredActivities.map(activity => {
                                const catStyle = getCategoryIcon(activity.category);
                                const date = new Date(activity.timestamp);
                                return (
                                    <tr key={activity.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <p className="text-sm font-bold text-slate-800">
                                                {date.toLocaleDateString('fr-FR')}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-bold border border-blue-100 text-xs">
                                                    {activity.userName.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800 text-sm">{activity.userName}</p>
                                                    <p className="text-[10px] text-slate-500 uppercase tracking-tighter">{activity.userRole}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-medium text-slate-700">{activity.action}</p>
                                            {activity.details && (
                                                <p className="text-xs text-slate-500 mt-1 italic">{activity.details}</p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${catStyle.bg} ${catStyle.color}`}>
                                                <i className={`bx ${catStyle.icon}`}></i>
                                                {activity.category.charAt(0).toUpperCase() + activity.category.slice(1)}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filteredActivities.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500 font-medium">
                                        <i className='bx bx-ghost text-4xl mb-2'></i>
                                        <p>Aucune activité trouvée</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {activities.length > 0 && (
                    <div className="p-4 bg-slate-50 text-center border-t border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Fin du journal • Système KDS Logs</p>
                    </div>
                )}
            </div>
        </div>
    );
};
