import React from 'react';
import type { User } from '../types';

interface HeaderProps {
  currentUser: User;
  onLogout: () => void;
  onProfileClick: () => void;
  onMenuToggle?: () => void;
}

export const Header: React.FC<HeaderProps> = React.memo(({ currentUser, onLogout, onProfileClick, onMenuToggle }) => {
  return (
    <header className="glass-panel p-4 flex justify-between items-center sticky top-0 z-30">
      <div className="flex items-center gap-4">
        {/* Mobile Menu Button */}
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="md:hidden text-slate-700 hover:text-emerald-600 transition-colors p-2"
            aria-label="Toggle menu"
          >
            <i className='bx bx-menu text-3xl'></i>
          </button>
        )}

        {/* Mobile Logo */}
        <div className="flex items-center gap-2 text-emerald-700 md:hidden">
          <i className='bx bxs-school text-3xl'></i>
          <h1 className="text-lg font-bold">École KSP</h1>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* User Info */}
        <div className="flex items-center gap-2 sm:gap-3 group cursor-pointer" onClick={onProfileClick} title="Voir mon profil">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm overflow-hidden ring-2 ring-emerald-50 group-hover:ring-emerald-200 transition-all shadow-sm">
            {currentUser.avatar_url ? (
              <img src={currentUser.avatar_url} alt={currentUser.first_name} className="w-full h-full object-cover" />
            ) : (
              `${currentUser.first_name?.charAt(0) || ''}${currentUser.last_name?.charAt(0) || ''}`
            )}
          </div>
          <div className="hidden lg:block">
            <div className="font-bold text-slate-800 text-sm group-hover:text-emerald-700 transition-colors">{currentUser.first_name} {currentUser.last_name}</div>
            <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider leading-tight">{currentUser.role}</div>
          </div>
        </div>

        <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block"></div>

        {/* Profile Settings Button */}
        <button
          onClick={onProfileClick}
          title="Paramètres du compte"
          className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
        >
          <i className='bx bx-cog text-xl sm:text-2xl'></i>
        </button>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          title="Se déconnecter"
          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
        >
          <i className='bx bx-log-out text-xl sm:text-2xl'></i>
        </button>
      </div>
    </header>
  );
});