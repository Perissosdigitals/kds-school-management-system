import { httpClient } from '../httpClient';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
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
      const response = await httpClient.post<LoginResponse>('/auth/login', credentials);
      
      if (response.data.access_token) {
        localStorage.setItem('ksp_token', response.data.access_token);
        localStorage.setItem('ksp_user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  /**
   * Déconnecte l'utilisateur
   */
  logout(): void {
    localStorage.removeItem('ksp_token');
    localStorage.removeItem('ksp_user');
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
      const response = await httpClient.post<{ access_token: string }>('/auth/refresh');
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
