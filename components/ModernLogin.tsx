import React, { useState, useEffect } from 'react';
import { AuthService } from '../services/api/auth.service';
import './ModernLogin.css';

interface UserRole {
  id: string;
  email: string;
  password: string;
  name: string;
  role: string;
  description: string;
  icon: string;
}

const TEST_USERS: UserRole[] = [
  {
    id: 'fondatrice',
    email: 'admin@ksp-school.ci',
    password: 'admin123',
    name: '👑 Fondatrice',
    role: 'admin',
    description: 'Accès complet - Gestion stratégique',
    icon: 'bx bxs-crown'
  },
  {
    id: 'admin',
    email: 'admin@ksp-school.ci',
    password: 'admin123',
    name: '⚙️ Administrateur',
    role: 'admin',
    description: 'Gestion complète du système',
    icon: 'bx bxs-cog'
  },
  {
    id: 'directrice',
    email: 'admin@ksp-school.ci',
    password: 'admin123',
    name: '📋 Directrice (Admin)',
    role: 'admin',
    description: 'Gestion pédagogique et administrative',
    icon: 'bx bxs-clipboard'
  },
  {
    id: 'comptable',
    email: 'acoulibaly@ksp-school.ci',
    password: 'teacher123',
    name: '💰 Comptable',
    role: 'teacher',
    description: 'Gestion des finances',
    icon: 'bx bxs-dollar-circle'
  },
  {
    id: 'enseignant',
    email: 'mkone@ksp-school.ci',
    password: 'teacher123',
    name: '👨‍🏫 Enseignant',
    role: 'teacher',
    description: 'Gestion des classes et notes',
    icon: 'bx bxs-user-voice'
  },
  {
    id: 'agent',
    email: 'parent1@example.ci',
    password: 'parent123',
    name: '👤 Personnel Administratif',
    role: 'parent',
    description: 'Support administratif',
    icon: 'bx bxs-user-detail'
  },
];

export const ModernLogin: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showCredentials, setShowCredentials] = useState(false);

  // Auto-select first role on mount for demo
  useEffect(() => {
    setTimeout(() => {
      handleRoleSelect(TEST_USERS[0]);
    }, 500);
  }, []);

  const handleRoleSelect = (user: UserRole) => {
    // Clear previous selection
    document.querySelectorAll('.modern-role-card').forEach(card => {
      card.classList.remove('selected');
    });

    setSelectedRole(user);
    setEmail(user.email);
    setPassword(user.password);
    setShowCredentials(true);
    setError('');
  };

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Veuillez entrer email et mot de passe');
      return;
    }
    await performLogin(email, password);
  };

  const handleQuickLogin = async (user: UserRole) => {
    setSelectedRole(user);
    await performLogin(user.email, user.password);
  };

  const performLogin = async (loginEmail: string, loginPassword: string) => {
    setLoading(true);
    setError('');
    
    console.log('[ModernLogin] Attempting login...', { email: loginEmail });
    
    try {
      const response = await AuthService.login({
        email: loginEmail,
        password: loginPassword,
      });

      console.log('[ModernLogin] Login successful:', response);

      if (response.access_token) {
        localStorage.setItem('ksp_token', response.access_token);
        localStorage.setItem('ksp_user', JSON.stringify(response.user));
        
        console.log('[ModernLogin] Redirecting to dashboard...');
        
        // Force un rechargement complet pour que App.tsx détecte l'authentification
        window.location.href = '/dashboard';
      }
    } catch (err: any) {
      console.error('[ModernLogin] Login failed:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Erreur de connexion';
      setError(errorMessage);
      setSelectedRole(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modern-login-wrapper">
      <div className="modern-login-container">
        {/* Left Panel - Brand */}
        <div className="brand-panel">
          <div className="brand-logo">
            <i className='bx bxs-school'></i>
            <div className="logo-text">
              <h1>KSP School</h1>
              <span>Management System</span>
            </div>
          </div>
          
          <div className="welcome-message">
            <h2>🏫 Système de Gestion Scolaire</h2>
            <p>Plateforme complète de gestion pour institutions éducatives d'excellence</p>
          </div>
          
          <div className="brand-features">
            <div className="brand-feature">
              <i className='bx bxs-shield-check'></i>
              <span>Environnement sécurisé et conforme RGPD</span>
            </div>
            <div className="brand-feature">
              <i className='bx bxs-dashboard'></i>
              <span>Tableaux de bord temps réel</span>
            </div>
            <div className="brand-feature">
              <i className='bx bxs-graduation'></i>
              <span>Suivi pédagogique avancé</span>
            </div>
          </div>
        </div>
        
        {/* Right Panel - Login */}
        <div className="login-panel">
          <div className="modern-login-header">
            <h2>Connexion au Système</h2>
            <p>Sélectionnez votre rôle pour vous connecter</p>
            <div className="dev-mode-badge">
              <i className='bx bxs-flask'></i>
              Mode Développement - Test users disponibles
            </div>
          </div>
          
          {/* Role Selection */}
          <div className="modern-role-selection">
            <h3 className="modern-section-title">Accès Rapide par Rôle</h3>
            <div className="modern-roles-grid">
              {TEST_USERS.map((user) => (
                <div
                  key={user.id}
                  className={`modern-role-card ${selectedRole?.id === user.id ? 'selected' : ''} ${
                    loading && selectedRole?.id === user.id ? 'loading' : ''
                  }`}
                  onClick={() => !loading && handleRoleSelect(user)}
                  style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
                >
                  <div className={`modern-role-icon ${user.id}`}>
                    <i className={user.icon}></i>
                  </div>
                  <div className="modern-role-name">{user.first_name} {user.last_name}</div>
                  <div className="modern-role-desc">{user.description}</div>
                  
                  {loading && selectedRole?.id === user.id && (
                    <div className="modern-loading-spinner">
                      <i className='bx bx-loader-circle bx-spin'></i>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Manual Login */}
          <div className="modern-manual-login">
            <h3 className="modern-section-title">Connexion manuelle</h3>
            
            {error && (
              <div className="modern-error-message">
                <i className='bx bx-error-circle'></i>
                {error}
              </div>
            )}
            
            <form onSubmit={handleManualLogin}>
              <div className="modern-form-group">
                <label className="modern-form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  className="modern-form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="modern-form-group">
                <label className="modern-form-label">Mot de passe</label>
                <input
                  type="password"
                  name="password"
                  className="modern-form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Votre mot de passe"
                  required
                  disabled={loading}
                />
              </div>
              
              <button
                type="submit"
                className="modern-login-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <i className='bx bx-loader-circle bx-spin'></i>
                    Connexion en cours...
                  </>
                ) : (
                  <>
                    <i className='bx bx-log-in'></i>
                    Se connecter
                  </>
                )}
              </button>
            </form>
            
            {/* Test Credentials Display */}
            {showCredentials && selectedRole && (
              <div className="modern-test-credentials">
                <h4>Identifiants de test :</h4>
                <div className="modern-credentials">
                  <div><strong>Email:</strong> {selectedRole.email}</div>
                  <div><strong>Mot de passe:</strong> {selectedRole.password}</div>
                  <div><strong>Rôle:</strong> {selectedRole.name}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
