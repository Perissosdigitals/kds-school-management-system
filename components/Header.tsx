import React from 'react';
import type { User } from '../types';

interface HeaderProps {
  currentUser: User;
  users: User[];
  onUserChange: (userId: string) => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = React.memo(({ currentUser, users, onUserChange, onLogout }) => {
  return (
    <header className="bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-10">
      <div>
        {/* Can be used for breadcrumbs or page title later */}
      </div>
      <div className="flex items-center gap-4">
         <div className="text-sm">
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
                        Simuler: {user.name} ({user.role})
                    </option>
                ))}
            </select>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold">
            {currentUser.avatar}
          </div>
          <div>
            <div className="font-semibold text-slate-800">{currentUser.name}</div>
            <div className="text-xs text-gray-500">{currentUser.role}</div>
          </div>
        </div>
        <button onClick={onLogout} title="Se déconnecter" className="text-slate-500 hover:text-red-600 transition-colors">
            <i className='bx bx-log-out text-2xl'></i>
        </button>
      </div>
    </header>
  );
});