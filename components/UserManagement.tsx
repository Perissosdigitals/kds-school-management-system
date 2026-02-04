import React, { useState, useEffect, useCallback } from 'react';
import type { User, UserRole, Page } from '../types';
import { getUsers, createUser, updateUser, deleteUser, updatePermissions } from '../services/api/users.service';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { ImportCSVModal } from './ui/ImportCSVModal';
import { Modal } from './ui/Modal';
import { UserFormModal } from './UserFormModal';
import { exportToCSV, exportCSVTemplate } from '../utils/csvExport';

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
    { id: 'reports', label: 'Rapports', icon: 'bx-bar-chart-alt-2', category: 'admin' },
    { id: 'activity-log', label: 'Journal d\'Activités', icon: 'bx-history', category: 'admin' },
];

import { PrivilegeDashboard } from './PrivilegeDashboard';

interface UserRowProps {
    user: User;
    onManagePrivileges: (user: User) => void;
    onEdit: () => void;
    onDelete: () => void;
}

const UserRow = React.memo(({ user, onManagePrivileges, onEdit, onDelete }: UserRowProps) => {
    const initials = `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    const fullName = `${user.first_name} ${user.last_name}`;
    const formattedCreatedAt = new Date(user.created_at).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    const lastLogin = user.last_login_at
        ? new Date(user.last_login_at).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
        : 'Jamais';

    return (
        <tr className="bg-white border-b hover:bg-gray-50 transition-colors group">
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-white">
                        {user.avatar_url ? (
                            <img src={user.avatar_url} alt={user.first_name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                            initials
                        )}
                    </div>
                    <div>
                        <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{fullName}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4">
                <span className={`px-3 py-1 text-xs font-semibold rounded-full border shadow-sm ${getRoleClass(user.role)}`}>
                    {getRoleLabel(user.role)}
                </span>
            </td>
            <td className="px-6 py-4 text-sm font-medium text-gray-600">
                {user.phone || 'N/A'}
            </td>
            <td className="px-6 py-4">
                <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${user.is_active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <span className={`text-xs font-bold uppercase ${user.is_active ? 'text-green-700' : 'text-red-700'}`}>
                        {user.is_active ? 'Actif' : 'Inactif'}
                    </span>
                </div>
            </td>
            <td className="px-6 py-4 text-sm text-gray-600">
                {lastLogin}
            </td>
            <td className="px-6 py-4 text-sm text-gray-600">
                {formattedCreatedAt}
            </td>
            <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onManagePrivileges(user)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Configurer les modules et accès"
                    >
                        <i className='bx bxs-shield-lock text-xl'></i>
                    </button>
                    <button
                        onClick={onEdit}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Modifier le profil"
                    >
                        <i className='bx bxs-edit text-xl'></i>
                    </button>
                    <button
                        onClick={onDelete}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer le compte"
                    >
                        <i className='bx bxs-trash text-xl'></i>
                    </button>
                </div>
            </td>
        </tr>
    );
});

export const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    // CRUD State
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const loadUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getUsers({ isActive: true });
            const staffRoles: UserRole[] = ['directrice', 'fondatrice', 'agent_admin', 'director', 'admin', 'teacher', 'accountant', 'manager', 'agent'];
            const staffUsers = data.filter(user => staffRoles.includes(user.role));
            setUsers(staffUsers);
        } catch (error) {
            console.error('Error loading users:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    const userHeaders = ['id', 'email', 'role', 'first_name', 'last_name', 'phone', 'is_active', 'last_login_at', 'created_at'];

    const handleExport = useCallback(() => {
        exportToCSV(users, 'liste_utilisateurs', userHeaders);
    }, [users]);

    const handleExportTemplate = useCallback(() => {
        exportCSVTemplate(userHeaders, 'modele_import_utilisateurs');
    }, [userHeaders]);

    const handleImport = useCallback((importedData: User[]) => {
        const newUsers = importedData.map((u, index) => ({
            ...u,
            id: u.id || `USER-IMPORT-${Date.now()}-${index}`
        }));
        setUsers(prev => [...prev, ...newUsers]);
        alert(`${newUsers.length} utilisateur(s) importé(s) avec succès !`);
    }, []);

    const handleUpdateUser = (updatedUser: User) => {
        setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    };

    const handleCreateClick = () => {
        setEditingUser(null);
        setIsUserModalOpen(true);
    };

    const handleEditClick = (user: User) => {
        setEditingUser(user);
        setIsUserModalOpen(true);
    };

    const handleDeleteClick = async (user: User) => {
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.first_name} ${user.last_name} ?`)) {
            try {
                await deleteUser(user.id);
                setUsers(prev => prev.filter(u => u.id !== user.id));
            } catch (error) {
                console.error('Error deleting user:', error);
                alert('Erreur lors de la suppression de l\'utilisateur.');
            }
        }
    };

    const handleSaveUser = async (data: Partial<User> & { password?: string }) => {
        try {
            if (editingUser) {
                const updated = await updateUser(editingUser.id, data);
                handleUpdateUser(updated);
            } else {
                // Ensure required fields for create exist
                if (!data.email || !data.first_name || !data.last_name || !data.role || !data.password) {
                    throw new Error("Missing required fields");
                }
                // Cast to Omit<User, 'id'> and include password in the service call if needed,
                // but currently createUser in service takes Omit<User, 'id'>.
                // The service maps it. But password needs to be passed.
                // Wait, createUser in service takes Omit<User, 'id'>. It does NOT explicitly include password in type.
                // But the 'data' object has it.
                // I should verify if the service passes extra fields.
                // Yes, `const payload = { ...userData, ... }` spreads everything.
                // So password will be passed.

                // We need to cast data to Omit<User, 'id'>
                const userData = data as Omit<User, 'id'>;
                const created = await createUser(userData);
                setUsers(prev => [created, ...prev]);
            }
        } catch (error) {
            console.error('Error saving user:', error);
            alert('Erreur lors de l\'enregistrement de l\'utilisateur.');
            throw error; // Re-throw to let modal handle error state if needed
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Tableau de Bord des Privilèges</h2>
                    <p className="text-gray-500 mt-1">Gérez les accès aux modules et les comptes du personnel administratif.</p>
                </div>
                <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                    <button
                        onClick={handleCreateClick}
                        className="flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-bold py-2.5 px-5 rounded-xl shadow-lg hover:shadow-blue-200 transition-all duration-300 w-full sm:w-auto"
                    >
                        <i className='bx bx-user-plus text-lg'></i>
                        <span>Nouvel Utilisateur</span>
                    </button>
                    <button
                        onClick={() => setIsImportModalOpen(true)}
                        className="flex items-center justify-center gap-2 bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-bold py-2.5 px-5 rounded-xl transition-all duration-300 w-full sm:w-auto"
                    >
                        <i className='bx bxs-file-import text-lg'></i>
                        <span>Importer</span>
                    </button>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <button
                            onClick={handleExportTemplate}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold py-2.5 px-4 rounded-xl transition-all"
                            title="Modèle CSV"
                        >
                            <i className='bx bxs-download'></i>
                        </button>
                        <button
                            onClick={handleExport}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-green-50 border border-green-200 hover:bg-green-100 text-green-700 font-bold py-2.5 px-4 rounded-xl transition-all"
                            title="Exporter la liste"
                        >
                            <i className='bx bxs-file-export'></i>
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
                {isLoading ? (
                    <div className="p-20"><LoadingSpinner /></div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead>
                                <tr className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b border-slate-100">
                                    <th className="px-6 py-4 font-bold">Utilisateur / Profil</th>
                                    <th className="px-6 py-4 font-bold">Rôle Principal</th>
                                    <th className="px-6 py-4 font-bold">Téléphone</th>
                                    <th className="px-6 py-4 font-bold">État de Compte</th>
                                    <th className="px-6 py-4 font-bold">Connexion</th>
                                    <th className="px-6 py-4 font-bold">Création</th>
                                    <th className="px-6 py-4 font-bold text-center">Actions & Modules</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center gap-2 text-slate-400">
                                                <i className='bx bx-user-x text-6xl opacity-20'></i>
                                                <p className="text-lg font-medium">Aucun utilisateur administratif trouvé</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((user) => (
                                        <UserRow
                                            key={user.id}
                                            user={user}
                                            onManagePrivileges={setSelectedUser}
                                            onEdit={() => handleEditClick(user)}
                                            onDelete={() => handleDeleteClick(user)}
                                        />
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Privilege Management Modal */}
            <Modal
                isOpen={!!selectedUser}
                onClose={() => setSelectedUser(null)}
                title="Gestion des Modules et Accès"
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

            {/* User Create/Edit Modal */}
            <UserFormModal
                isOpen={isUserModalOpen}
                onClose={() => setIsUserModalOpen(false)}
                onSave={handleSaveUser}
                initialData={editingUser}
            />

            <ImportCSVModal<User>
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onImport={handleImport}
                title="Importer des Utilisateurs"
                expectedHeaders={userHeaders}
            />
        </div>
    );
};

export default UserManagement;