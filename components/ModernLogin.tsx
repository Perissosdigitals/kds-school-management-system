import React, { useState, useEffect } from 'react';
import { AuthService } from '../services/api/auth.service';
import { ActivityService } from '../services/api/activity.service';
import './ModernLogin.css';

// Production-ready Login with only manual entry
export const ModernLogin: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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

        ActivityService.logActivity(response.user as any, 'Connexion au système', 'auth');
        window.location.href = '/dashboard';
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur de connexion';
      setError(errorMessage);
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
            <p>Entrez vos identifiants pour accéder au portail</p>
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

          </div>
        </div>
      </div>
    </div>
  );
};
