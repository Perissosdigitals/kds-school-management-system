import React, { useState, useEffect, useCallback } from 'react';
import type { User, UserRole } from '../types';
import { getUsers } from '../services/api/users.service';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { ImportCSVModal } from './ui/ImportCSVModal';
import { exportToCSV, exportCSVTemplate } from '../utils/csvExport';

const getRoleClass = (role: UserRole) => {
    switch(role) {
        case 'Fondatrice': return 'bg-purple-100 text-purple-800 border-purple-300';
        case 'Directrice': return 'bg-blue-100 text-blue-800 border-blue-300';
        case 'Comptable': return 'bg-green-100 text-green-800 border-green-300';
        case 'Gestionnaire': return 'bg-amber-100 text-amber-800 border-amber-300';
        case 'Agent Administratif': return 'bg-indigo-100 text-indigo-800 border-indigo-300';
        case 'Enseignant': return 'bg-sky-100 text-sky-800 border-sky-300';
        default: return 'bg-gray-100 text-gray-800';
    }
}

const UserRow = React.memo(({ user }: { user: User }) => (
    <tr className="bg-white border-b hover:bg-gray-50">
        <td className="px-6 py-4">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold">
                    {user.avatar}
                </div>
                <div>
                    <div className="font-medium text-gray-900">{user.name}</div>
                    <div className="text-xs text-gray-500">ID: {user.id}</div>
                </div>
            </div>
        </td>
        <td className="px-6 py-4">
            <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getRoleClass(user.role)}`}>
                {user.role}
            </span>
        </td>
        <td className="px-6 py-4">
            <div className="flex items-center gap-2">
                <button className="text-blue-600 hover:text-blue-800" title="Modifier">
                    <i className='bx bxs-edit text-lg'></i>
                </button>
                <button className="text-red-600 hover:text-red-800" title="Supprimer">
                    <i className='bx bxs-trash text-lg'></i>
                </button>
            </div>
        </td>
    </tr>
));

export const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    useEffect(() => {
        const loadUsers = async () => {
            setIsLoading(true);
            const data = await getUsers();
            setUsers(data);
            setIsLoading(false);
        };
        loadUsers();
    }, []);
    
    const userHeaders = ['id', 'name', 'role', 'avatar'];

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


    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800">Gestion des Utilisateurs</h2>
                    <p className="text-gray-500">Ajoutez, modifiez et gérez les comptes utilisateurs et leurs permissions.</p>
                </div>
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    <button className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 w-full sm:w-auto">
                        <i className='bx bx-user-plus'></i>
                        <span>Ajouter un Utilisateur</span>
                    </button>
                    <button 
                        onClick={() => setIsImportModalOpen(true)}
                        className="flex items-center gap-2 bg-slate-600 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 w-full sm:w-auto"
                    >
                        <i className='bx bxs-file-import'></i>
                        <span>Importer CSV</span>
                    </button>
                    <button 
                        onClick={handleExportTemplate}
                        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 w-full sm:w-auto"
                        title="Télécharger un modèle CSV pour l'importation"
                    >
                        <i className='bx bxs-download'></i>
                        <span>Télécharger Modèle</span>
                    </button>
                    <button 
                        onClick={handleExport}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 w-full sm:w-auto"
                    >
                        <i className='bx bxs-file-export'></i>
                        <span>Exporter CSV</span>
                    </button>
                </div>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg">
                {isLoading ? <LoadingSpinner /> : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Nom de l'Utilisateur</th>
                                    <th scope="col" className="px-6 py-3">Rôle / Permissions</th>
                                    <th scope="col" className="px-6 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <UserRow key={user.id} user={user} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            <ImportCSVModal<User>
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onImport={handleImport}
                title="Importer des Utilisateurs depuis un CSV"
                expectedHeaders={userHeaders}
            />
        </div>
    );
};

export default UserManagement;