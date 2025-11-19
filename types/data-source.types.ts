// 📁 types/data-source.types.ts

export interface DataQuery {
  where?: Record<string, any>;
  limit?: number;
  offset?: number;
  orderBy?: string;
  select?: string[];
}

export interface DataSourceCapabilities {
  realtime: boolean;
  transactions: boolean;
  relations: boolean;
  fileAttachments: boolean;
  offlineSupport: boolean;
}

export interface IDataSourceAdapter<T = any> {
  readonly id: string;
  readonly name: string;
  readonly type: 'sheets' | 'rest' | 'csv' | 'sql' | 'firebase';
  
  // Opérations CRUD standardisées
  find(query?: DataQuery): Promise<T[]>;
  findOne(id: string): Promise<T | null>;
  create(data: Omit<T, 'id'>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<boolean>;
  
  // Métadonnées et capacités
  getCapabilities(): DataSourceCapabilities;
  testConnection(): Promise<boolean>;
}
