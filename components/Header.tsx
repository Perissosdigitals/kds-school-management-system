import React from 'react';
import type { User } from '../types';

interface HeaderProps {
  currentUser: User;
  users: User[];
  onUserChange: (userId: string) => void;
  onLogout: () => void;
  onMenuToggle?: () => void;
}

export const Header: React.FC<HeaderProps> = React.memo(({ currentUser, users, onUserChange, onLogout, onMenuToggle }) => {
  return (
    <header className="bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-30">
      <div className="flex items-center gap-4">
        {/* Mobile Menu Button */}
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="md:hidden text-slate-700 hover:text-blue-600 transition-colors p-2"
            aria-label="Toggle menu"
          >
            <i className='bx bx-menu text-3xl'></i>
          </button>
        )}
        
        {/* Mobile Logo */}
        <div className="flex items-center gap-2 text-blue-700 md:hidden">
          <i className='bx bxs-school text-3xl'></i>
          <h1 className="text-lg font-bold">École KSP</h1>
        </div>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-4">
         {/* User Switcher - Hidden on small mobile */}
         <div className="text-sm hidden sm:block">
            <label htmlFor="user-switcher" className="sr-only">Changer d'utilisateur</label>
             <select 
                id="user-switcher"
                value={currentUser.id} 
                onChange={(e) => onUserChange(e.target.value)}
                className="bg-slate-100 border-slate-200 border rounded-md p-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Simulate user login"
            >
                {users.map(user => (
                    <option key={user.id} value={user.id}>
                        Simuler: {user.first_name} {user.last_name} ({user.role})
                    </option>
                ))}
            </select>
        </div>
        
        {/* User Info */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold text-sm">
            {currentUser.avatar}
          </div>
          <div className="hidden lg:block">
            <div className="font-semibold text-slate-800 text-sm">{currentUser.first_name} {currentUser.last_name}</div>
            <div className="text-xs text-gray-500">{currentUser.role}</div>
          </div>
        </div>
        
        {/* Logout Button */}
        <button 
          onClick={onLogout} 
          title="Se déconnecter" 
          className="text-slate-500 hover:text-red-600 transition-colors p-1"
        >
            <i className='bx bx-log-out text-xl sm:text-2xl'></i>
        </button>
      </div>
    </header>
  );
});