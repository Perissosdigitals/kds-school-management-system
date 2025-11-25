import React, { useState, useEffect, Suspense, lazy, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { ModernLogin } from './components/ModernLogin';
import type { Page, User } from './types';
import { hasPermission } from './utils/permissions';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { allUsers as mockUsers } from './data/mockData';
import ErrorBoundary from './components/ErrorBoundary';

const StudentRegistration = lazy(() => import('./components/StudentRegistration'));
const StudentManagement = lazy(() => import('./components/StudentManagement'));
const StudentPedagogicalFile = lazy(() => import('./components/StudentPedagogicalFile'));
const TeacherManagement = lazy(() => import('./components/TeacherManagement'));
const SchoolLife = lazy(() => import('./components/SchoolLife'));
const GradesManagement = lazy(() => import('./components/GradesManagement'));
const ClassManagement = lazy(() => import('./components/ClassManagement'));
const Finances = lazy(() => import('./components/Finances'));
const Inventory = lazy(() => import('./components/Inventory'));
const Reports = lazy(() => import('./components/Reports').then(m => ({ default: m.Reports })));
const Documentation = lazy(() => import('./components/Documentation').then(m => ({ default: m.Documentation })));
const UserManagement = lazy(() => import('./components/UserManagement'));
const DataManagement = lazy(() => import('./components/DataManagement'));

// ProtectedRoute Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; isAuthenticated: boolean }> = ({
  children,
  isAuthenticated,
}) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const AppContent: React.FC<{
  currentUser: User;
  activePage: Page;
  handleSetPage: (page: Page) => void;
  handleUserChange: (userId: string) => void;
}> = ({ currentUser, activePage, handleSetPage, handleUserChange }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const renderContent = () => {
    if (!hasPermission(currentUser.role, activePage)) {
      return (
        <div className="text-center p-10">
          <i className='bx bxs-lock-alt text-6xl text-red-400 mb-4'></i>
          <h2 className="text-3xl font-bold text-slate-800">Accès Refusé</h2>
          <p className="text-gray-500 mt-2">Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
        </div>
      );
    }

    switch (activePage) {
      case 'dashboard':
        return <Dashboard setActivePage={handleSetPage} currentUser={currentUser} />;
      case 'student-registration':
        return <StudentRegistration />;
      case 'student-management':
        return <StudentManagement currentUser={currentUser} />;
      case 'teacher-management':
        return <TeacherManagement />;
      case 'school-life':
        return <SchoolLife currentUser={currentUser} />;
      case 'grades-management':
        return <GradesManagement currentUser={currentUser} />;
      case 'class-management':
        return <ClassManagement currentUser={currentUser} setActivePage={handleSetPage} />;
      case 'finances':
        return <Finances />;
      case 'inventory':
        return <Inventory />;
      case 'reports':
        return <Reports />;
      case 'documentation':
        return <Documentation />;
      case 'user-management':
        return <UserManagement />;
      case 'data-management':
        return <DataManagement currentUser={currentUser} />;
      default:
        return <Dashboard setActivePage={handleSetPage} currentUser={currentUser} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <Sidebar 
        activePage={activePage} 
        setActivePage={handleSetPage} 
        userRole={currentUser.role}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
            currentUser={currentUser}
            users={mockUsers}
            onUserChange={handleUserChange}
            onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            onLogout={() => {
              localStorage.removeItem('ksp_token');
              localStorage.removeItem('ksp_user');
              window.location.href = '/login';
            }}
        />
        <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 overflow-y-auto">
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              {renderContent()}
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is logged in (from localStorage or API)
  useEffect(() => {
    const storedUser = localStorage.getItem('ksp_user');
    const storedToken = localStorage.getItem('ksp_token');
    
    console.log('[App] Checking authentication...', { hasUser: !!storedUser, hasToken: !!storedToken });
    
    if (storedUser && storedToken) {
      try {
        const backendUser = JSON.parse(storedUser);
        console.log('[App] Backend user:', backendUser);
        
        // Map backend user to app user format
        const roleMap: { [key: string]: UserRole } = {
          'founder': 'Fondatrice',
          'fondatrice': 'Fondatrice',
          'admin': 'Fondatrice', // Admin has full access like Fondatrice
          'director': 'Directrice',
          'directrice': 'Directrice',
          'comptable': 'Comptable',
          'accountant': 'Comptable',
          'gestionnaire': 'Gestionnaire',
          'manager': 'Gestionnaire',
          'agent': 'Agent Administratif',
          'teacher': 'Enseignant',
          'enseignant': 'Enseignant'
        };
        
        const mappedRole = roleMap[backendUser.role.toLowerCase()] || 'Agent Administratif';
        const mappedUser: User = {
          id: backendUser.id,
          name: `${backendUser.firstName} ${backendUser.lastName}`,
          role: mappedRole,
          avatar: `${backendUser.firstName?.charAt(0) || ''}${backendUser.lastName?.charAt(0) || ''}`
        };
        
        setCurrentUser(mappedUser);
        console.log('[App] User authenticated:', mappedUser);
      } catch (err) {
        console.error('[App] Error parsing stored user:', err);
        localStorage.removeItem('ksp_user');
        localStorage.removeItem('ksp_token');
      }
    } else {
      console.log('[App] No stored credentials found');
    }
    setIsLoading(false);
    console.log('[App] Loading complete');
  }, []);

  useEffect(() => {
    // When user changes, check if they can access the current page.
    // If not, redirect to their default page (dashboard).
    if (currentUser && !hasPermission(currentUser.role, activePage)) {
      setActivePage('dashboard');
    }
  }, [currentUser, activePage]);

  const handleSetPage = useCallback((page: Page) => {
    if (currentUser && hasPermission(currentUser.role, page)) {
      setActivePage(page);
    } else {
      alert("Accès non autorisé.");
    }
  }, [currentUser]);

  const handleUserChange = useCallback((userId: string) => {
    const user = mockUsers.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Vérification de l'authentification basée sur le localStorage ET currentUser
  const hasToken = !!localStorage.getItem('ksp_token');
  const hasStoredUser = !!localStorage.getItem('ksp_user');
  const isAuthenticated = !!currentUser && hasToken;
  
  console.log('[App] Render state:', { 
    hasToken, 
    hasStoredUser, 
    hasCurrentUser: !!currentUser, 
    isAuthenticated,
    currentUser: currentUser?.name 
  });

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={
          // Redirige si on a un token valide (même si currentUser n'est pas encore chargé)
          (hasToken && hasStoredUser) ? <Navigate to="/dashboard" replace /> : <ModernLogin />
        } />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              {currentUser && (
                <AppContent
                  currentUser={currentUser}
                  activePage={activePage}
                  handleSetPage={handleSetPage}
                  handleUserChange={handleUserChange}
                />
              )}
            </ProtectedRoute>
          }
        />
        <Route
          path="/*"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              {currentUser && (
                <AppContent
                  currentUser={currentUser}
                  activePage={activePage}
                  handleSetPage={handleSetPage}
                  handleUserChange={handleUserChange}
                />
              )}
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;