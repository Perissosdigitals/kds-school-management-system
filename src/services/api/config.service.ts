/**
 * 🔧 API Configuration Service
 * Centralized configuration and environment management
 * Provides visibility into active data sources and environments
 */

export interface DataSource {
  id: string;
  name: string;
  type: 'cloudflare-d1' | 'postgresql' | 'local' | 'mock';
  url: string;
  status: 'active' | 'inactive' | 'unknown';
  description: string;
  environment: 'development' | 'production' | 'test';
}

export interface APIConfiguration {
  currentEnvironment: string;
  apiBaseUrl: string;
  useMockData: boolean;
  activeDataSource: DataSource;
  availableDataSources: DataSource[];
}

class APIConfigServiceClass {
  private static instance: APIConfigServiceClass;
  
  private constructor() {}

  static getInstance(): APIConfigServiceClass {
    if (!APIConfigServiceClass.instance) {
      APIConfigServiceClass.instance = new APIConfigServiceClass();
    }
    return APIConfigServiceClass.instance;
  }

  /**
   * Get current API configuration
   */
  getConfiguration(): APIConfiguration {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002/api/v1';
    const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true';
    const mode = import.meta.env.MODE || 'development';

    return {
      currentEnvironment: mode,
      apiBaseUrl: apiUrl,
      useMockData,
      activeDataSource: this.determineActiveDataSource(apiUrl, mode),
      availableDataSources: this.getAvailableDataSources(),
    };
  }

  /**
   * Determine which data source is currently active
   */
  private determineActiveDataSource(apiUrl: string, mode: string): DataSource {
    // Check if using Cloudflare Workers (production)
    if (apiUrl.includes('workers.dev') || apiUrl.includes('perissosdigitals')) {
      return {
        id: 'cloudflare-d1-prod',
        name: 'Cloudflare D1 (Production)',
        type: 'cloudflare-d1',
        url: apiUrl,
        status: 'inactive',
        description: 'Legacy Cloudflare D1 database (migrated to PostgreSQL)',
        environment: 'production',
      };
    }

    // Check if using local NestJS backend (development/functional data)
    if (apiUrl.includes('localhost:3002')) {
      return {
        id: 'postgresql-local',
        name: 'PostgreSQL Local (Development)',
        type: 'postgresql',
        url: apiUrl,
        status: 'active',
        description: 'Base de données locale pour développement - Migration vers D1 disponible',
        environment: 'development',
      };
    }

    // Fallback
    return {
      id: 'unknown',
      name: 'Unknown Source',
      type: 'local',
      url: apiUrl,
      status: 'unknown',
      description: 'Data source not identified',
      environment: mode as any,
    };
  }

  /**
   * Get all available data sources in the system
   * 3-Tier Architecture: Local PostgreSQL → Cloudflare D1 → CSV Export/Import
   */
  getAvailableDataSources(): DataSource[] {
    return [
      {
        id: 'postgresql-local',
        name: 'PostgreSQL Local (Development)',
        type: 'postgresql',
        url: 'http://localhost:3002/api/v1',
        status: 'active',
        description: 'Base de données locale pour développement et données fonctionnelles (Active)',
        environment: 'development',
      },
      {
        id: 'cloudflare-d1-prod',
        name: 'Cloudflare D1 (Production Cloud)',
        type: 'cloudflare-d1',
        url: 'https://kds-backend-api.perissosdigitals.workers.dev/api/v1',
        status: 'active',
        description: 'Base de données cloud D1 - Migration depuis PostgreSQL avec scripts (kds-school-db)',
        environment: 'production',
      },
      {
        id: 'csv-export-import',
        name: 'CSV Export/Import',
        type: 'local',
        url: 'file://exports',
        status: 'active',
        description: 'Format CSV pour export/import de toutes tables ou version complète de la DB',
        environment: 'development',
      },
    ];
  }

  /**
   * Check connection status to a data source
   */
  async checkDataSourceStatus(dataSource: DataSource): Promise<boolean> {
    try {
      const response = await fetch(`${dataSource.url}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });
      return response.ok;
    } catch (error) {
      console.error(`Failed to connect to ${dataSource.name}:`, error);
      return false;
    }
  }

  /**
   * Get database information
   */
  async getDatabaseInfo(): Promise<{
    name: string;
    type: string;
    tables: string[];
    recordCounts?: Record<string, number>;
  }> {
    const config = this.getConfiguration();
    
    try {
      // This would call a backend endpoint that provides database metadata
      const response = await fetch(`${config.apiBaseUrl}/system/database-info`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Failed to get database info:', error);
    }

    // Fallback
    return {
      name: 'kds-school-db',
      type: 'Cloudflare D1',
      tables: ['students', 'classes', 'teachers', 'grades', 'attendance', 'users'],
    };
  }

  /**
   * Get environment variables (safe subset for display)
   */
  getEnvironmentInfo(): Record<string, string> {
    return {
      MODE: import.meta.env.MODE,
      VITE_API_URL: import.meta.env.VITE_API_URL || 'Not set',
      VITE_USE_MOCK_DATA: import.meta.env.VITE_USE_MOCK_DATA || 'false',
      NODE_ENV: import.meta.env.NODE_ENV || 'development',
    };
  }

  /**
   * List all CSV/data files available for import
   */
  async getAvailableDataFiles(): Promise<{
    filename: string;
    type: 'csv' | 'json' | 'sql';
    size: number;
    lastModified: string;
    status: 'ready' | 'imported' | 'error';
  }[]> {
    // This would be implemented to scan the data/ directory or call a backend endpoint
    return [
      {
        filename: 'students.csv',
        type: 'csv',
        size: 0,
        lastModified: new Date().toISOString(),
        status: 'ready',
      },
      {
        filename: 'classes.csv',
        type: 'csv',
        size: 0,
        lastModified: new Date().toISOString(),
        status: 'ready',
      },
    ];
  }
}

export const APIConfigService = APIConfigServiceClass.getInstance();
export default APIConfigService;
