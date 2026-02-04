import React, { useState } from 'react';
import { AuthService } from '../services/api/auth.service';
import { ActivityService } from '../services/api/activity.service';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card } from './ui/Card';
import './SecurePortal.css';

export const SecurePortal: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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

                // Track login activity
                ActivityService.logActivity(response.user as any, 'Connexion au portail sécurisé', 'auth');

                window.location.href = '/dashboard';
            }
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Échec de la connexion. Vérifiez vos identifiants.');
        } finally {
            setLoading(false);
        }
    };

    const handleManualLogin = (e: React.FormEvent) => {
        e.preventDefault();
        performLogin(email, password);
    };

    return (
        <div className="portal-wrapper">
            <div className="portal-container">
                {/* Left Side: Brand Visuals & Mission */}
                <div className="portal-visual-panel">
                    <div className="panel-texture"></div>
                    <div className="visual-content">
                        <div className="main-logo-card">
                            <img
                                src="https://images.squarespace-cdn.com/content/v1/6876e6edb7ba03316ed1c3b3/5c57f1bd-ded6-40ff-9be9-466dc40f51f9/KSP+logo+Dream+Believe+Achieve.png?format=1500w"
                                alt="KSP Official Logo"
                                className="portal-main-logo"
                            />
                        </div>
                        <div className="brand-copy">
                            <h1>Karat School Project</h1>
                            <p className="motto">DREAM • BELIEVE • ACHIEVE</p>
                            <div className="accent-bar"></div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Login Form */}
                <div className="portal-form-panel">
                    <div className="form-inner">
                        <div className="form-header">
                            <h2>Portail Sécurisé</h2>
                            <p>Accédez à votre espace de gestion KSP.</p>
                        </div>

                        {error && (
                            <div className="portal-error">
                                <i className='bx bx-error-circle'></i>
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleManualLogin} className="portal-form">
                            <Input
                                label="Adresse Email"
                                type="email"
                                placeholder="nom@exemple.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                                icon="bx-envelope"
                            />

                            <div className="field-group">
                                <Input
                                    label="Mot de passe"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={loading}
                                    icon="bx-lock-alt"
                                />
                                <button
                                    type="button"
                                    className="password-toggle-btn-secure"
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex={-1}
                                >
                                    <i className={showPassword ? 'bx bx-hide' : 'bx bx-show'}></i>
                                </button>
                            </div>

                            <div className="form-actions">
                                <label className="remember-me">
                                    <input type="checkbox" className="accent-emerald-600" />
                                    <span>Se souvenir de moi</span>
                                </label>
                                <a href="#" className="forgot-link">Mot de passe oublié ?</a>
                            </div>

                            <Button
                                type="submit"
                                className="w-full mt-4"
                                isLoading={loading}
                                size="lg"
                            >
                                Se connecter
                            </Button>
                        </form>

                        <div className="form-footer">
                            <div className="copyright-mention">
                                <p>© {new Date().getFullYear()} Karat School Project. All rights reserved.</p>
                                <p className="powered-by">Powered by <span className="perissos">Perissos Digital</span></p>
                            </div>
                            <div className="legal-links">
                                <a href="#">Aide</a>
                                <span className="dot"></span>
                                <a href="#">Confidentialité</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
