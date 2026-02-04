import React, { useState, useEffect } from 'react';
import { Modal } from './ui/Modal';
import type { User, UserRole } from '../types';

interface UserFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Partial<User> & { password?: string }) => Promise<void>;
    initialData?: User | null;
}

const roleOptions: { value: UserRole; label: string }[] = [
    { value: 'director', label: 'Directeur/Directrice' },
    { value: 'admin', label: 'Administrateur' },
    { value: 'teacher', label: 'Enseignant' },
    { value: 'accountant', label: 'Comptable' },
    { value: 'manager', label: 'Gestionnaire' },
    { value: 'agent', label: 'Agent' },
];

export const UserFormModal: React.FC<UserFormModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        role: 'agent' as UserRole,
        is_active: true,
        password: '',
    });
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    first_name: initialData.first_name,
                    last_name: initialData.last_name,
                    email: initialData.email,
                    phone: initialData.phone || '',
                    role: initialData.role,
                    is_active: initialData.is_active,
                    password: '', // Password not editable directly here usually, but keeping empty
                });
            } else {
                setFormData({
                    first_name: '',
                    last_name: '',
                    email: '',
                    phone: '',
                    role: 'agent',
                    is_active: true,
                    password: '',
                });
            }
            setConfirmPassword('');
            setError(null);
        }
    }, [isOpen, initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (!formData.first_name || !formData.last_name || !formData.email || !formData.role) {
            setError('Veuillez remplir tous les champs obligatoires.');
            return;
        }

        if (!initialData && !formData.password) {
            setError('Le mot de passe est obligatoire pour un nouvel utilisateur.');
            return;
        }

        if (formData.password && formData.password !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas.');
            return;
        }

        if (formData.password && formData.password.length < 6) {
            setError('Le mot de passe doit contenir au moins 6 caractères.');
            return;
        }

        setIsSubmitting(true);
        try {
            // Prepare data
            const submitData: Partial<User> & { password?: string } = {
                first_name: formData.first_name,
                last_name: formData.last_name,
                email: formData.email,
                phone: formData.phone || null,
                role: formData.role,
                is_active: formData.is_active,
            };

            if (formData.password) {
                submitData.password = formData.password;
            }

            await onSave(submitData);
            onClose();
        } catch (err) {
            console.error(err);
            setError('Une erreur est survenue lors de l\'enregistrement.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={initialData ? "Modifier l'Utilisateur" : "Nouvel Utilisateur"}
            size="lg"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Personal Info */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Informations Personnelles</h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                value={formData.first_name}
                                onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                value={formData.last_name}
                                onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                            <input
                                type="email"
                                required
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                disabled={!!initialData} // Usually email is immutable or requires specific flow
                            />
                            {initialData && <p className="text-xs text-gray-500 mt-1">L'email ne peut pas être modifié.</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                            <input
                                type="tel"
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Account Settings */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Paramètres du Compte</h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Rôle *</label>
                            <select
                                required
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                                value={formData.role}
                                onChange={e => setFormData({ ...formData, role: e.target.value as UserRole })}
                            >
                                {roleOptions.map(option => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center gap-3 py-2">
                            <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                                <input
                                    type="checkbox"
                                    name="is_active"
                                    id="is_active"
                                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                                    checked={formData.is_active}
                                    onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                                    style={{ right: formData.is_active ? '0' : 'auto', left: formData.is_active ? 'auto' : '0', borderColor: formData.is_active ? '#3B82F6' : '#E5E7EB' }}
                                />
                                <label htmlFor="is_active" className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${formData.is_active ? 'bg-blue-500' : 'bg-gray-300'}`}></label>
                            </div>
                            <span className="text-sm font-medium text-gray-700">Compte Actif</span>
                        </div>

                        {(!initialData) && (
                            <>
                                <hr className="border-gray-100 my-4" />
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe *</label>
                                    <input
                                        type="password"
                                        required={!initialData}
                                        minLength={6}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        placeholder={initialData ? "Laisser vide pour ne pas changer" : "Minimum 6 caractères"}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe *</label>
                                    <input
                                        type="password"
                                        required={!initialData}
                                        minLength={6}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        placeholder="Répétez le mot de passe"
                                    />
                                </div>
                            </>
                        )}

                        {(initialData) && (
                            <div className="bg-yellow-50 p-3 rounded-lg text-xs text-yellow-800 border border-yellow-200 mt-4">
                                <i className='bx bx-info-circle mr-1'></i>
                                Le mot de passe ne peut pas être modifié ici. L'utilisateur doit utiliser la fonction "Mot de passe oublié" ou vous devez réinitialiser son mot de passe séparément.
                            </div>
                        )}
                    </div>
                </div>

                <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                        disabled={isSubmitting}
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isSubmitting ? <i className='bx bx-loader-alt animate-spin'></i> : <i className='bx bx-save'></i>}
                        <span>{initialData ? 'Mettre à jour' : 'Créer l\'utilisateur'}</span>
                    </button>
                </div>
            </form>
        </Modal>
    );
};
