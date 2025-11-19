import axios from 'axios';

const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://kds-backend-api.perissosdigitals.workers.dev/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Intercepteur pour l'authentification
httpClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('kds_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur pour la gestion globale des erreurs
httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('[httpClient] Request failed:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    if (error.response?.status === 401) {
      // Only show alert if we have a token (actual session expired)
      // Don't show for initial failed requests without auth
      const hasToken = localStorage.getItem('kds_token');
      if (hasToken) {
        console.warn('[httpClient] 401 with token - session expired');
        localStorage.removeItem('kds_token');
        localStorage.removeItem('kds_user');
        alert("Session expirée. Veuillez vous reconnecter.");
        window.location.href = '/login';
      } else {
        console.log('[httpClient] 401 without token - not authenticated');
      }
    }
    return Promise.reject(error);
  }
);

export { httpClient };
