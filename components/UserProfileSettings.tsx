import React, { useState, useRef } from 'react';
import type { User } from '../types';
import { updateAvatar } from '../services/api/users.service';
import { httpClient } from '../services/httpClient';

interface UserProfileSettingsProps {
    user: User;
    onUpdate: (updatedUser: User) => void;
}

export const UserProfileSettings: React.FC<UserProfileSettingsProps> = ({ user, onUpdate }) => {
    const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUpdatingAvatar(true);
        try {
            const updatedUser = await updateAvatar(user.id, file);
            onUpdate(updatedUser);
            alert('Photo de profil mise à jour avec succès !');
        } catch (error) {
            console.error('Error updating avatar:', error);
            alert('Erreur lors de la mise à jour de la photo.');
        } finally {
            setIsUpdatingAvatar(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert('Les nouveaux mots de passe ne correspondent pas.');
            return;
        }

        setIsChangingPassword(true);
        try {
            await httpClient.put('/auth/password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            alert('Mot de passe modifié avec succès !');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error: any) {
            console.error('Error changing password:', error);
            alert(error.response?.data?.message || 'Erreur lors du changement de mot de passe.');
        } finally {
            setIsChangingPassword(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <header>
                <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Paramètres du Compte</h2>
                <p className="text-gray-500 mt-1">Gérez vos informations personnelles et la sécurité de votre compte.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Column 1: Avatar */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center space-y-4">
                    <h3 className="text-lg font-bold text-gray-800 self-start">Photo de Profil</h3>
                    <div
                        onClick={handleAvatarClick}
                        className="relative group cursor-pointer"
                    >
                        <div className="w-32 h-32 rounded-full ring-4 ring-blue-50 bg-slate-100 flex items-center justify-center text-3xl font-bold text-slate-400 overflow-hidden shadow-inner transition-all group-hover:ring-blue-100">
                            {user.avatar_url ? (
                                <img src={user.avatar_url} alt={user.first_name} className="w-full h-full object-cover" />
                            ) : (
                                `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
                            )}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                                <i className='bx bx-camera text-white text-3xl'></i>
                            </div>
                        </div>
                        {isUpdatingAvatar && (
                            <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-full">
                                <i className='bx bx-loader-alt animate-spin text-blue-600 text-2xl'></i>
                            </div>
                        )}
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*"
                    />
                    <p className="text-xs text-center text-gray-500">
                        Cliquez sur l'image pour charger une nouvelle photo.<br />
                        Formats: JPG, PNG, WEBP (Max 2MB)
                    </p>
                </div>

                {/* Column 2 & 3: Info and Password */}
                <div className="md:col-span-2 space-y-6">
                    {/* Basic Info */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                        <h3 className="text-lg font-bold text-gray-800">Informations de Profil</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Prénom</label>
                                <div className="p-3 bg-gray-50 rounded-lg text-gray-700 font-medium">{user.first_name}</div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Nom</label>
                                <div className="p-3 bg-gray-50 rounded-lg text-gray-700 font-medium">{user.last_name}</div>
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Email</label>
                                <div className="p-3 bg-gray-50 rounded-lg text-gray-700 font-medium">{user.email}</div>
                            </div>
                        </div>
                    </div>

                    {/* Change Password */}
                    <form onSubmit={handlePasswordChange} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-800">Sécurité - Mot de Passe</h3>
                            <i className='bx bxs-lock text-slate-300 text-xl'></i>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe actuel</label>
                                <input
                                    type="password"
                                    required
                                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
                                    <input
                                        type="password"
                                        required
                                        className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe</label>
                                    <input
                                        type="password"
                                        required
                                        className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isChangingPassword}
                                className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-slate-200 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isChangingPassword ? <i className='bx bx-loader-alt animate-spin'></i> : <i className='bx bx-check-shield'></i>}
                                <span>Mettre à jour le mot de passe</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
