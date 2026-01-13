import { httpClient } from '../httpClient';
import { allUsers } from '../../data/mockData';

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
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Fallback logic for offline/network errors
      const shouldFallback = 
        !error.response || 
        error.code === 'ECONNABORTED' || 
        error.response?.status >= 500 || 
        error.message?.toLowerCase().includes('network');

      if (shouldFallback) {
        console.warn('⚠️ AuthService: API non disponible, connexion locale (mode fallback)');
        
        // Find user in mock data
        const mockUser = allUsers.find(u => u.email === credentials.email);
        
        // For simulation, we accept any password if user exists, or a default admin if not found
        // Also check for the hardcoded users in ModernLogin.tsx
        const isKnownTestUser = ['admin@ksp-school.ci', 'acoulibaly@ksp-school.ci'].includes(credentials.email);
        
        if (mockUser || isKnownTestUser) {
           const userToReturn = mockUser || allUsers.find(u => u.role === 'admin') || {
             id: 'admin-fallback',
             email: credentials.email,
             first_name: 'Admin',
             last_name: 'System',
             role: 'admin'
           };

           const mockResponse: LoginResponse = {
             access_token: 'mock-token-' + Date.now(),
             user: {
               id: userToReturn.id,
               email: userToReturn.email,
               firstName: userToReturn.first_name || 'User',
               lastName: userToReturn.last_name || 'Mock',
               role: userToReturn.role
             }
           };

           localStorage.setItem('ksp_token', mockResponse.access_token);
           localStorage.setItem('ksp_user', JSON.stringify(mockResponse.user));
           return mockResponse;
        }
      }
      
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
