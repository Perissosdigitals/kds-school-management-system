import type { IDataSourceAdapter } from '../../types/data-source.types';

export interface ModuleConfiguration {
  moduleKey: string;
  adapters: IDataSourceAdapter[];
  activeAdapterId: string;
}

/**
 * Manages all available data source adapters for the application.
 * This class acts as a central registry, allowing other services
 * to request the currently active adapter for a specific data module (e.g., 'students').
 * It now supports multiple adapters per module and allows switching between them.
 */
export class DataSourceManager {
  private adapters: Map<string, IDataSourceAdapter[]> = new Map();
  private activeAdapters: Map<string, string> = new Map();

  /**
   * Registers a data source adapter for a specific application module.
   * @param moduleKey A unique key for the data module (e.g., 'students', 'grades').
   * @param adapter An instance of a class that implements IDataSourceAdapter.
   */
  registerAdapter(moduleKey: string, adapter: IDataSourceAdapter): void {
    console.log(`[DataSourceManager] Registering adapter '${adapter.id}' for module '${moduleKey}'.`);
    if (!this.adapters.has(moduleKey)) {
      this.adapters.set(moduleKey, []);
    }
    this.adapters.get(moduleKey)!.push(adapter);
  }

  /**
   * Sets the active adapter for a given module.
   * @param moduleKey The key for the data module.
   * @param adapterId The ID of the adapter to set as active.
   * @throws Will throw an error if the adapter ID is not found for the given module.
   */
  setActiveAdapter(moduleKey: string, adapterId: string): void {
    const moduleAdapters = this.adapters.get(moduleKey);
    const adapterExists = moduleAdapters?.some(a => a.id === adapterId);
    if (!adapterExists) {
      throw new Error(`[DataSourceManager] Adapter with id '${adapterId}' not found for module '${moduleKey}'.`);
    }
    this.activeAdapters.set(moduleKey, adapterId);
    console.log(`[DataSourceManager] Active adapter for module '${moduleKey}' set to '${adapterId}'.`);
  }
  
  /**
   * Retrieves the currently active data source adapter for a given module.
   * @param moduleKey The key for the data module.
   * @returns The active IDataSourceAdapter instance.
   * @throws Will throw an error if no adapter is found or active for the given key.
   */
  getAdapter<T>(moduleKey: string): IDataSourceAdapter<T> {
    const activeAdapterId = this.activeAdapters.get(moduleKey);
    if (!activeAdapterId) {
      throw new Error(`[DataSourceManager] No active adapter set for module '${moduleKey}'.`);
    }

    const moduleAdapters = this.adapters.get(moduleKey);
    const adapter = moduleAdapters?.find(a => a.id === activeAdapterId);
    
    if (!adapter) {
      throw new Error(`[DataSourceManager] Active adapter '${activeAdapterId}' not found for module '${moduleKey}'.`);
    }
    
    console.log(`[DataSourceManager] Providing adapter '${adapter.id}' for module '${moduleKey}'.`);
    return adapter as IDataSourceAdapter<T>;
  }

  /**
   * Gets the configuration for all registered modules.
   * Used by the UI to display and manage data sources.
   * @returns An array of ModuleConfiguration objects.
   */
  getModuleConfigurations(): ModuleConfiguration[] {
    const configs: ModuleConfiguration[] = [];
    for (const moduleKey of this.adapters.keys()) {
      configs.push({
        moduleKey,
        adapters: this.adapters.get(moduleKey)!,
        activeAdapterId: this.activeAdapters.get(moduleKey)!,
      });
    }
    return configs;
  }
}