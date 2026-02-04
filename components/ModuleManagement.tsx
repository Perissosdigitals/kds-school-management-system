import React, { useState, useEffect, useCallback } from 'react';
import type { User, UserRole } from '../types';
import { getUsers } from '../services/api/users.service';
import { hasPermission } from '../utils/permissions';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { Modal } from './ui/Modal';
import { PrivilegeDashboard } from './PrivilegeDashboard';

// Reusing helper from PrivilegeDashboard or duplication?
// Since it's UI presentation logic, a little duplication in UI components is often cleaner than a shared utils file for just styles, 
// but consistency is key. I'll duplicate the simple helper for now to keep this component self-contained for "views".
const getRoleClass = (role: UserRole) => {
    switch (role) {
        case 'agent': return 'bg-purple-100 text-purple-800 border-purple-300';
        case 'agent_admin': return 'bg-orange-100 text-orange-800 border-orange-300';
        case 'teacher': return 'bg-sky-100 text-sky-800 border-sky-300';
        default: return 'bg-gray-100 text-gray-800';
    }
}

const getRoleLabel = (role: UserRole) => {
    const labels: Record<UserRole, string> = {
        agent: 'Agent',
        agent_admin: 'Agent Admin',
        teacher: 'Enseignant',
        fondatrice: 'Fondatrice',
        directrice: 'Directrice',
        director: 'Directeur',
        admin: 'Admin',
        accountant: 'Comptable',
        manager: 'Manager',
        student: 'Élève',
        parent: 'Parent'
    };
    return labels[role] || role;
}


export const ModuleManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const loadStaff = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getUsers({ isActive: true });
            // Filter to show primarily Agents and key staff who might need custom permissions
            // The user explicitly mentioned "assigned module to any agent".
            // Broadening to all staff is safer, but prioritizing Agents.
            const targetRoles: UserRole[] = ['agent', 'agent_admin', 'accountant', 'manager', 'teacher', 'admin', 'director'];
            const staff = data.filter(u => targetRoles.includes(u.role));
            setUsers(staff);
        } catch (error) {
            console.error('Error loading staff for module management:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadStaff();
    }, [loadStaff]);

    const handleUpdateUser = (updatedUser: User) => {
        setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    };

    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Gestion des Modules</h2>
                    <p className="text-gray-500 mt-1">
                        Assignez des accès spécifiques aux agents et au personnel.
                    </p>
                </div>
            </header>

            {isLoading ? (
                <div className="p-20"><LoadingSpinner /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {users.map(user => (
                        <div key={user.id} className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow p-6 flex flex-col gap-4">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-lg">
                                        {user.avatar_url ? (
                                            <img src={user.avatar_url} alt={user.first_name} className="w-full h-full rounded-full object-cover" />
                                        ) : (
                                            `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{user.first_name} {user.last_name}</h3>
                                        <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full border ${getRoleClass(user.role)}`}>
                                            {getRoleLabel(user.role)}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedUser(user)}
                                    className="text-white bg-indigo-600 hover:bg-indigo-700 p-2 rounded-lg transition-colors shadow-sm"
                                    title="Gérer les modules"
                                >
                                    <i className='bx bxs-cog text-xl'></i>
                                </button>
                            </div>

                            <div className="pt-4 border-t border-slate-100">
                                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Modules Actifs</div>
                                <div className="flex flex-wrap gap-2">
                                    {/* Show a few key active modules to give a quick overview */}
                                    {['dashboard', 'student-management', 'finances', 'inventory', 'class-management', 'documentation']
                                        .filter(id => hasPermission(user, id as any))
                                        .slice(0, 4)
                                        .map(id => (
                                            <span key={id} className="px-2 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded border border-emerald-100 uppercase">
                                                {id.replace('-', ' ')}
                                            </span>
                                        ))
                                    }
                                    {Object.values(user.custom_permissions || {}).filter(v => v).length > 0 && (
                                        <span className="px-2 py-1 bg-orange-50 text-orange-700 text-[10px] font-bold rounded border border-orange-100 uppercase">
                                            + Personnalisé
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {users.length === 0 && (
                        <div className="col-span-full text-center py-20 text-gray-500 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                            Aucun agent ou personnel trouvé.
                        </div>
                    )}
                </div>
            )}

            <Modal
                isOpen={!!selectedUser}
                onClose={() => setSelectedUser(null)}
                title={`Assignation des Modules - ${selectedUser?.first_name} ${selectedUser?.last_name}`}
                size="lg"
            >
                {selectedUser && (
                    <PrivilegeDashboard
                        user={selectedUser}
                        onClose={() => setSelectedUser(null)}
                        onUpdate={handleUpdateUser}
                    />
                )}
            </Modal>
        </div>
    );
};

export default ModuleManagement;
