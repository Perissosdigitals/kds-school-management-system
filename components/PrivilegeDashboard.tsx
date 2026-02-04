import React, { useState, useEffect } from 'react';
import { UserRole, Page, User } from '../types';
import { updatePermissions } from '../services/api/users.service';
import { hasPermission } from '../utils/permissions';

const getRoleClass = (role: UserRole) => {
    switch (role) {
        case 'fondatrice': return 'bg-purple-100 text-purple-800 border-purple-300';
        case 'directrice': return 'bg-pink-100 text-pink-800 border-pink-300';
        case 'admin': return 'bg-blue-100 text-blue-800 border-blue-300';
        case 'director': return 'bg-indigo-100 text-indigo-800 border-indigo-300';
        case 'accountant': return 'bg-green-100 text-green-800 border-green-300';
        case 'manager': return 'bg-amber-100 text-amber-800 border-amber-300';
        case 'agent_admin': return 'bg-orange-100 text-orange-800 border-orange-300';
        case 'agent': return 'bg-slate-100 text-slate-800 border-slate-300';
        case 'teacher': return 'bg-sky-100 text-sky-800 border-sky-300';
        default: return 'bg-gray-100 text-gray-800';
    }
}

const getRoleLabel = (role: UserRole) => {
    const labels: Record<UserRole, string> = {
        fondatrice: 'Fondatrice',
        directrice: 'Directrice',
        agent_admin: 'Agent Administratif',
        director: 'Directeur/Directrice',
        admin: 'Administrateur',
        teacher: 'Enseignant',
        accountant: 'Comptable',
        manager: 'Gestionnaire',
        agent: 'Agent',
        student: 'Élève',
        parent: 'Parent'
    };
    return labels[role] || role;
}

const modules: { id: Page; label: string; icon: string; category: 'main' | 'admin' }[] = [
    { id: 'dashboard', label: 'Tableau de Bord', icon: 'bx-grid-alt', category: 'main' },
    { id: 'student-registration', label: 'Inscription Élève', icon: 'bx-user-plus', category: 'main' },
    { id: 'student-management', label: 'Gestion Élèves', icon: 'bx-group', category: 'main' },
    { id: 'teacher-management', label: 'Gestion Professeurs', icon: 'bx-id-card', category: 'main' },
    { id: 'class-management', label: 'Gestion des Classes', icon: 'bx-chalkboard', category: 'main' },
    { id: 'school-life', label: 'Vie Scolaire', icon: 'bx-calendar', category: 'main' },
    { id: 'grades-management', label: 'Gestion des Notes', icon: 'bx-edit', category: 'main' },
    { id: 'documentation', label: 'Gestion des Documents', icon: 'bx-file', category: 'main' },
    { id: 'finances', label: 'Finances', icon: 'bx-dollar', category: 'admin' },
    { id: 'inventory', label: 'Inventaire', icon: 'bx-package', category: 'admin' },
    { id: 'user-management', label: 'Gestion Utilisateurs', icon: 'bx-user-circle', category: 'admin' },
    { id: 'data-management', label: 'Gestion des Données', icon: 'bx-data', category: 'admin' },
    { id: 'module-management', label: 'Gestion des Modules', icon: 'bx-check-shield', category: 'admin' },
    { id: 'reports', label: 'Rapports', icon: 'bx-bar-chart-alt-2', category: 'admin' },
    { id: 'activity-log', label: 'Journal d\'Activités', icon: 'bx-history', category: 'admin' },
];

export interface PrivilegeDashboardProps {
    user: User;
    onClose: () => void;
    onUpdate: (updatedUser: User) => void;
}

export const PrivilegeDashboard: React.FC<PrivilegeDashboardProps> = ({ user, onClose, onUpdate }) => {
    // We maintain the custom_permissions state as it will be sent to the backend
    const [permissions, setPermissions] = useState<Record<string, boolean>>(user.custom_permissions || {});
    const [isSaving, setIsSaving] = useState(false);

    const togglePermission = (moduleId: Page) => {
        // To toggle properly, we need to know the CURRENT effective state
        const isCurrentlyEnabled = hasPermission(user, moduleId);
        // If we are overriding, we set the opposite of CURRENT effective state
        setPermissions(prev => ({
            ...prev,
            [moduleId]: !isCurrentlyEnabled
        }));
    };

    const handleReset = () => {
        if (window.confirm('Voulez-vous réinitialiser toutes les permissions aux valeurs par défaut du rôle ?')) {
            setPermissions({});
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const updatedUser = await updatePermissions(user.id, permissions);
            onUpdate(updatedUser);
            onClose();
        } catch (error: any) {
            console.error('Error updating permissions details:', error);
            if (error.response?.status === 401) {
                alert('Votre session a expiré ou est invalide. Veuillez vous reconnecter.');
            } else {
                const message = error.response?.data?.message || error.message || 'Erreur inconnue';
                alert(`Erreur lors de la mise à jour des privilèges: ${message}`);
            }
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-2xl font-bold shadow-inner border-2 border-white">
                    {user.avatar_url ? (
                        <img src={user.avatar_url} alt={user.first_name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                        `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
                    )}
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-900">{user.first_name} {user.last_name}</h3>
                    <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${getRoleClass(user.role)}`}>
                            {getRoleLabel(user.role)}
                        </span>
                        <span className="text-sm text-gray-500">{user.email}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Modules Principaux</h4>
                    </div>
                    <div className="space-y-3">
                        {modules.filter(m => m.category === 'main').map(module => {
                            const isEnabled = permissions[module.id] !== undefined
                                ? permissions[module.id]
                                : hasPermission(user.role, module.id);
                            const isCustom = permissions[module.id] !== undefined;

                            return (
                                <label key={module.id} className={`flex items-center justify-between p-4 rounded-xl cursor-pointer border-2 transition-all ${isEnabled ? 'bg-blue-50/30 border-blue-100 hover:border-blue-200' : 'bg-gray-50/50 border-transparent hover:bg-gray-50'}`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${isEnabled ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-400'}`}>
                                            <i className={`bx ${module.icon} text-xl`}></i>
                                        </div>
                                        <div>
                                            <span className={`font-semibold ${isEnabled ? 'text-gray-900' : 'text-gray-400'}`}>{module.label}</span>
                                            {isCustom && <span className="block text-[10px] text-orange-500 font-bold uppercase mt-0.5">Personnalisé</span>}
                                        </div>
                                    </div>
                                    <div className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={isEnabled}
                                            onChange={() => togglePermission(module.id)}
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </div>
                                </label>
                            );
                        })}
                    </div>
                </section>

                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Administration & Outils</h4>
                    </div>
                    <div className="space-y-3">
                        {modules.filter(m => m.category === 'admin').map(module => {
                            const isEnabled = permissions[module.id] !== undefined
                                ? permissions[module.id]
                                : hasPermission(user.role, module.id);
                            const isCustom = permissions[module.id] !== undefined;

                            return (
                                <label key={module.id} className={`flex items-center justify-between p-4 rounded-xl cursor-pointer border-2 transition-all ${isEnabled ? 'bg-purple-50/30 border-purple-100 hover:border-purple-200' : 'bg-gray-50/50 border-transparent hover:bg-gray-50'}`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${isEnabled ? 'bg-purple-100 text-purple-600' : 'bg-gray-200 text-gray-400'}`}>
                                            <i className={`bx ${module.icon} text-xl`}></i>
                                        </div>
                                        <div>
                                            <span className={`font-semibold ${isEnabled ? 'text-gray-900' : 'text-gray-400'}`}>{module.label}</span>
                                            {isCustom && <span className="block text-[10px] text-orange-500 font-bold uppercase mt-0.5">Personnalisé</span>}
                                        </div>
                                    </div>
                                    <div className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={isEnabled}
                                            onChange={() => togglePermission(module.id)}
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                    </div>
                                </label>
                            );
                        })}
                    </div>
                </section>
            </div>

            <div className="pt-8 border-t border-gray-100 flex items-center justify-between">
                <button
                    onClick={handleReset}
                    className="text-gray-500 hover:text-orange-600 text-sm font-bold flex items-center gap-2 transition-colors uppercase tracking-wider"
                >
                    <i className='bx bx-refresh text-xl'></i>
                    Réinitialiser par défaut
                </button>
                <div className="flex gap-4">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition-all uppercase tracking-wider text-sm"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 uppercase tracking-wider text-sm"
                    >
                        {isSaving ? <i className='bx bx-loader-alt animate-spin'></i> : <i className='bx bx-check-shield'></i>}
                        <span>Enregistrer les Privilèges</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
