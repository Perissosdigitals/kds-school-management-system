// This file centralizes application-level configuration.
// It allows for easy switching between mock data and real APIs during development.

export const config = {
  /**
   * Set this to `true` to use mock data from `data/mockData.ts`.
   * Set this to `false` to attempt to connect to a real backend API.
   */
  USE_MOCK_DATA: false, // Now using live Cloudflare Workers backend

  /**
   * Backend API URL - Cloudflare Workers deployment
   */
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3002/api/v1',
};
