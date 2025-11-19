// This file centralizes application-level configuration.
// It allows for easy switching between mock data and real APIs during development.

export const config = {
  /**
   * Set this to `true` to use mock data from `data/mockData.ts`.
   * Set this to `false` to attempt to connect to a real backend API.
   * This is used because process.env variables are not available in this environment.
   */
  USE_MOCK_DATA: false,
};
