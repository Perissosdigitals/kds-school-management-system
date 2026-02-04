import { httpClient } from '../httpClient';
import { ActivityService } from './activity.service';
import type { User } from '../../types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

export const AuthService = {
  /**
   * Authentifie l'utilisateur avec ses identifiants
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await httpClient.post<LoginResponse>('auth/login', credentials);

      if (response.data.access_token) {
        localStorage.setItem('ksp_token', response.data.access_token);
        localStorage.setItem('ksp_user', JSON.stringify(response.data.user));
        if (response.data.refresh_token) {
          localStorage.setItem('ksp_refresh_token', response.data.refresh_token);
        }

        // Log successful login
        try {
          await ActivityService.logActivity(
            response.data.user as unknown as User,
            'Connexion au système',
            'auth',
            `Utilisateur ${response.data.user.email} s'est connecté`
          );
        } catch (logError) {
          console.warn('Failed to log login activity:', logError);
        }
      }

      return response.data;
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  },

  /**
   * Déconnecte l'utilisateur
   */
  async logout(): Promise<void> {
    const user = this.getCurrentUser();
    const refreshToken = localStorage.getItem('ksp_refresh_token');

    // Attempt to log activity on frontend before clearing
    if (user) {
      try {
        await ActivityService.logActivity(
          user as User,
          'Déconnexion du système',
          'auth',
          `Utilisateur ${user.email} s'est déconnecté`
        );
      } catch (e) {
        console.warn('Failed to log logout activity on frontend:', e);
      }
    }

    // Attempt to call backend logout
    if (refreshToken) {
      try {
        await httpClient.post('auth/logout', { refreshToken });
      } catch (error) {
        console.warn('Backend logout failed:', error);
      }
    }

    localStorage.removeItem('ksp_token');
    localStorage.removeItem('ksp_user');
    localStorage.removeItem('ksp_refresh_token');
    window.location.href = '/login';
  },

  /**
   * Récupère l'utilisateur actuellement connecté
   */
  getCurrentUser() {
    const user = localStorage.getItem('ksp_user');
    return user ? JSON.parse(user) : null;
  },

  /**
   * Vérifie si l'utilisateur est authentifié
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('ksp_token');
  },

  /**
   * Récupère le token JWT
   */
  getToken(): string | null {
    return localStorage.getItem('ksp_token');
  },

  /**
   * Rafraîchit le token (si disponible)
   */
  async refreshToken(): Promise<string> {
    try {
      const response = await httpClient.post<{ access_token: string }>('auth/refresh');
      const newToken = response.data.access_token;
      localStorage.setItem('ksp_token', newToken);
      return newToken;
    } catch (error) {
      console.error('Token refresh error:', error);
      this.logout();
      throw error;
    }
  }
};
