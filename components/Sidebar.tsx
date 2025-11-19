import React from 'react';
import type { Page, UserRole } from '../types';
import { hasPermission } from '../utils/permissions';

interface SidebarProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
  userRole: UserRole;
}

const mainNavLinks: { id: Page; icon: string; label: string }[] = [
  { id: 'dashboard', icon: 'bxs-dashboard', label: 'Tableau de Bord' },
  { id: 'student-registration', icon: 'bxs-user-plus', label: 'Inscription Élève' },
  { id: 'student-management', icon: 'bxs-graduation', label: 'Gestion Élèves' },
  { id: 'teacher-management', icon: 'bxs-user-detail', label: 'Gestion Professeurs' },
  { id: 'school-life', icon: 'bxs-calendar-check', label: 'Vie Scolaire' },
  { id: 'grades-management', icon: 'bxs-pen', label: 'Gestion des Notes' },
  { id: 'class-management', icon: 'bxs-chalkboard', label: 'Gestion des Classes' },
];

const adminNavLinks: { id: Page; icon: string; label: string }[] = [
  { id: 'finances', icon: 'bxs-dollar-circle', label: 'Finances' },
  { id: 'inventory', icon: 'bxs-package', label: 'Inventaire' },
  { id: 'user-management', icon: 'bxs-user-account', label: 'Gestion Utilisateurs' },
  { id: 'data-management', icon: 'bxs-data', label: 'Gestion des Données' },
  { id: 'reports', icon: 'bxs-report', label: 'Rapports' },
  { id: 'documentation', icon: 'bxs-file-doc', label: 'Documentation' },
];

const NavLink = React.memo<{
  id: Page;
  icon: string;
  label: string;
  isActive: boolean;
  onClick: () => void;
}>(({ icon, label, isActive, onClick }) => (
  <a
    href="#"
    onClick={(e) => {
      e.preventDefault();
      onClick();
    }}
    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
      isActive ? 'bg-blue-700 text-white shadow-md' : 'text-slate-800 hover:bg-blue-100'
    }`}
  >
    <i className={`bx ${icon} text-xl`}></i>
    <span>{label}</span>
  </a>
));

export const Sidebar: React.FC<SidebarProps> = React.memo(({ activePage, setActivePage, userRole }) => {

  const filteredMainNavs = mainNavLinks.filter(link => hasPermission(userRole, link.id));
  const filteredAdminNavs = adminNavLinks.filter(link => hasPermission(userRole, link.id));

  return (
    <nav className="w-64 bg-white shadow-lg p-6 hidden md:flex flex-col flex-shrink-0">
      <div className="flex items-center gap-3 mb-12 text-blue-700">
        <i className='bx bxs-school text-5xl'></i>
        <div>
          <h1 className="text-xl font-bold">École KDS</h1>
          <span className="text-sm text-gray-500">Système de Gestion</span>
        </div>
      </div>
      
      {filteredMainNavs.length > 0 && (
        <div className="mb-8">
          <div className="text-xs uppercase text-gray-500 mb-4 font-semibold tracking-wider">Navigation Principale</div>
          <div className="flex flex-col gap-2">
            {filteredMainNavs.map(link => (
              <NavLink 
                key={link.id}
                {...link}
                isActive={activePage === link.id}
                onClick={() => setActivePage(link.id)}
              />
            ))}
          </div>
        </div>
      )}
      
      {filteredAdminNavs.length > 0 && (
        <div>
          <div className="text-xs uppercase text-gray-500 mb-4 font-semibold tracking-wider">Administration</div>
          <div className="flex flex-col gap-2">
            {filteredAdminNavs.map(link => (
              <NavLink 
                key={link.id}
                {...link}
                isActive={activePage === link.id}
                onClick={() => setActivePage(link.id)}
              />
            ))}
          </div>
        </div>
      )}
    </nav>
  );
});