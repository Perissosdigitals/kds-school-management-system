import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../services/api/auth.service';
import './EnhancedLogin.css';

interface UserRole {
  email: string;
  password: string;
  role: string;
  label: string;
  description: string;
  icon: string;
}

const TEST_USERS: UserRole[] = [
  {
    email: 'ekeomian@theksp.org',
    password: 'Fondatrice',
    role: 'fondatrice',
    label: 'Fondatrice',
    description: 'Evelyne Keomian - Accès Stratégique',
    icon: '👑',
  },
  {
    email: 'mtieoulou@theksp.org',
    password: 'Fondatrice',
    role: 'directrice',
    label: 'Directrice',
    description: 'Marie Yvette Tieoulou - Gestion Pédagogique',
    icon: '📋',
  },
  {
    email: 'hynterprince@gmail.com',
    password: 'Fondatrice',
    role: 'agent_admin',
    label: 'Agent Administratif',
    description: 'Prince Cedrick Hunter - Support Système',
    icon: '👤',
  },
  {
    email: 'perissosdigitals@gmail.com',
    password: 'Fondatrice',
    role: 'admin',
    label: 'Super Admin',
    description: 'Support Technique Perissos',
    icon: '⚙️',
  },
  {
    email: 'teacher1@kds.ci',
    password: 'password',
    role: 'teacher',
    label: 'Ensignant',
    description: 'Gestion des classes et notes',
    icon: '👨‍🏫',
  },
  {
    email: 'parent1@famille.ci',
    password: 'password',
    role: 'parent',
    label: 'Compte Parent',
    description: 'Suivi des élèves',
    icon: '👪',
  },
];

export const EnhancedLogin: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showManualLogin, setShowManualLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRoleSelect = async (user: UserRole) => {
    setSelectedRole(user);
    await performLogin(user.email, user.password);
  };

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Veuillez entrer email et mot de passe');
      return;
    }
    await performLogin(email, password);
  };

  const performLogin = async (loginEmail: string, loginPassword: string) => {
    setLoading(true);
    setError('');
    try {
      const response = await AuthService.login({
        email: loginEmail,
        password: loginPassword,
      });

      if (response.access_token) {
        localStorage.setItem('ksp_token', response.access_token);
        localStorage.setItem('ksp_user', JSON.stringify(response.user));

        // Force un rechargement complet pour que App.tsx détecte l'authentification
        window.location.href = '/dashboard';
      }
    } catch (err: any) {
      setError(err.message || 'Erreur de connexion');
      setSelectedRole(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="enhanced-login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>🏫 Système de Gestion Scolaire</h1>
          <p className="login-subtitle">KSP School Management System</p>
        </div>

        {!showManualLogin ? (
          <>
            <div className="login-mode-description">
              <p>Sélectionnez votre rôle pour vous connecter</p>
              <p className="small-text">(Mode développement - Test users)</p>
            </div>

            {error && <div className="error-message">❌ {error}</div>}

            <div className="roles-grid">
              {TEST_USERS.map((user) => (
                <button
                  key={user.role}
                  className={`role-card ${selectedRole?.role === user.role ? 'selected' : ''} ${loading && selectedRole?.role === user.role ? 'loading' : ''
                    }`}
                  onClick={() => handleRoleSelect(user)}
                  disabled={loading}
                >
                  <div className="role-icon">{user.icon}</div>
                  <div className="role-label">{user.label}</div>
                  <div className="role-description">{user.description}</div>
                  {selectedRole?.role === user.role && loading && (
                    <div className="spinner"></div>
                  )}
                </button>
              ))}
            </div>

            <div className="login-divider">ou</div>

            <button
              className="manual-login-btn"
              onClick={() => setShowManualLogin(true)}
              disabled={loading}
            >
              Connexion manuelle
            </button>
          </>
        ) : (
          <>
            <form onSubmit={handleManualLogin} className="manual-login-form">
              {error && <div className="error-message">❌ {error}</div>}

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Entrez votre email"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Mot de passe</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Entrez votre mot de passe"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                className="submit-btn"
                disabled={loading}
              >
                {loading ? '⏳ Connexion...' : '🔓 Se connecter'}
              </button>
            </form>

            <button
              className="back-to-roles-btn"
              onClick={() => setShowManualLogin(false)}
              disabled={loading}
            >
              ← Retour aux rôles
            </button>
          </>
        )}

        <div className="login-footer">
          <p className="footer-info">
            💡 <strong>Mode Développement</strong>
            <br />
            Utilisateurs de test disponibles pour tous les rôles
          </p>
        </div>
      </div>
    </div>
  );
};
