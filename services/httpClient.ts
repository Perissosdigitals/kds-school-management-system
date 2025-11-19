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
    if (error.response?.status === 401) {
      // Redirection vers la page de login
      localStorage.removeItem('kds_token');
      localStorage.removeItem('kds_user');
      alert("Session expirée. Veuillez vous reconnecter.");
      window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);

export { httpClient };
