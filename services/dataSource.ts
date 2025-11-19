import { DataSourceManager } from './data-sources/data-source-manager.service';
import { MockCsvAdapter } from './data-sources/mock-csv-adapter.service';
import { MockJsonAdapter } from './data-sources/mock-json-adapter.service';
import { RestApiAdapter } from './data-sources/rest-api-adapter.service';

// 1. Create a single, shared instance of the DataSourceManager.
export const dataSourceManager = new DataSourceManager();

// 2. Instantiate and register all available data source adapters for the 'students' module.
const studentCsvAdapter = new MockCsvAdapter();
const studentJsonAdapter = new MockJsonAdapter();
const studentRestApiAdapter = new RestApiAdapter();

dataSourceManager.registerAdapter('students', studentCsvAdapter);
dataSourceManager.registerAdapter('students', studentJsonAdapter);
dataSourceManager.registerAdapter('students', studentRestApiAdapter);

// 3. Set the REST API adapter as the default active adapter for the 'students' module.
dataSourceManager.setActiveAdapter('students', studentRestApiAdapter.id);

console.log('✅ Data source manager initialized - Using REST API Backend');
console.log('🌐 Backend URL:', import.meta.env.VITE_API_URL || 'https://kds-backend-api.perissosdigitals.workers.dev/api/v1');
