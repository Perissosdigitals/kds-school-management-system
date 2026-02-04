import { DataSourceManager } from './data-sources/data-source-manager.service';
import { RestApiAdapter } from './data-sources/rest-api-adapter.service';

// 1. Create a single, shared instance of the DataSourceManager.
export const dataSourceManager = new DataSourceManager();

// 2. Instantiate and register the REST API adapter for the 'students' module.
const studentRestApiAdapter = new RestApiAdapter();

dataSourceManager.registerAdapter('students', studentRestApiAdapter);

// 3. Set the REST API adapter as the default active adapter for the 'students' module.
dataSourceManager.setActiveAdapter('students', studentRestApiAdapter.id);

console.log('✅ Data source manager initialized - Using REST API Backend');
console.log('🌐 Backend URL:', import.meta.env.VITE_API_URL || 'https://kds-backend-api.perissosdigitals.workers.dev/api/v1');
