import type { IDataService, QueryOptions, PaginatedResult, DataServiceResult } from '@/application/ports/services/IDataService';

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  key?: string; // Custom cache key
}

export interface ICacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}

export interface ICachedDataService extends IDataService {
  clearCache(pattern?: string): Promise<void>;
  getCachedCount(table: string, filters?: QueryOptions['filters']): Promise<number>;
}

export class CachedDataService implements ICachedDataService {
  private cache = new Map<string, { data: any; expires: number }>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  constructor(private dataService: IDataService) {}

  private generateCacheKey(table: string, operation: string, params?: any): string {
    const paramsStr = params ? JSON.stringify(params) : '';
    return `${table}:${operation}:${paramsStr}`;
  }

  private isExpired(item: { data: any; expires: number }): boolean {
    return Date.now() > item.expires;
  }

  private setCache<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    this.cache.set(key, {
      data,
      expires: Date.now() + ttl
    });
  }

  private getCache<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item || this.isExpired(item)) {
      this.cache.delete(key);
      return null;
    }
    return item.data;
  }

  async getMany<T>(table: string, options?: QueryOptions): Promise<PaginatedResult<T>> {
    const cacheKey = this.generateCacheKey(table, 'getMany', options);
    const cached = this.getCache<PaginatedResult<T>>(cacheKey);

    if (cached) {
      return cached;
    }

    const result = await this.dataService.getMany<T>(table, options);
    this.setCache(cacheKey, result);
    return result;
  }

  async getById<T>(table: string, id: string, selectFields?: string): Promise<DataServiceResult<T>> {
    const cacheKey = this.generateCacheKey(table, 'getById', { id, selectFields });
    const cached = this.getCache<DataServiceResult<T>>(cacheKey);

    if (cached) {
      return cached;
    }

    const result = await this.dataService.getById<T>(table, id, selectFields);
    this.setCache(cacheKey, result);
    return result;
  }

  async getOne<T>(table: string, filters: QueryOptions['filters'], selectFields?: string): Promise<DataServiceResult<T>> {
    const cacheKey = this.generateCacheKey(table, 'getOne', { filters, selectFields });
    const cached = this.getCache<DataServiceResult<T>>(cacheKey);

    if (cached) {
      return cached;
    }

    const result = await this.dataService.getOne<T>(table, filters, selectFields);
    this.setCache(cacheKey, result);
    return result;
  }

  async create<T>(table: string, data: Partial<T>, selectFields?: string): Promise<DataServiceResult<T>> {
    const result = await this.dataService.create<T>(table, data, selectFields);
    // Invalidate related cache entries
    this.invalidateTableCache(table);
    return result;
  }

  async update<T>(table: string, id: string, data: Partial<T>, selectFields?: string): Promise<DataServiceResult<T>> {
    const result = await this.dataService.update<T>(table, id, data, selectFields);
    // Invalidate related cache entries
    this.invalidateTableCache(table);
    this.cache.delete(this.generateCacheKey(table, 'getById', { id }));
    return result;
  }

  async updateMany<T>(table: string, filters: QueryOptions['filters'], data: Partial<T>, selectFields?: string): Promise<DataServiceResult<T[]>> {
    const result = await this.dataService.updateMany<T>(table, filters, data, selectFields);
    // Invalidate related cache entries
    this.invalidateTableCache(table);
    return result;
  }

  async delete(table: string, id: string): Promise<boolean> {
    const result = await this.dataService.delete(table, id);
    // Invalidate related cache entries
    this.invalidateTableCache(table);
    this.cache.delete(this.generateCacheKey(table, 'getById', { id }));
    return result;
  }

  async deleteMany(table: string, filters: QueryOptions['filters']): Promise<number> {
    const result = await this.dataService.deleteMany(table, filters);
    // Invalidate related cache entries
    this.invalidateTableCache(table);
    return result;
  }

  async createMany<T>(table: string, data: Partial<T>[], selectFields?: string): Promise<DataServiceResult<T[]>> {
    const result = await this.dataService.createMany<T>(table, data, selectFields);
    // Invalidate related cache entries
    this.invalidateTableCache(table);
    return result;
  }

  async upsert<T>(table: string, data: Partial<T>, conflictColumns?: string[], selectFields?: string): Promise<DataServiceResult<T>> {
    const result = await this.dataService.upsert<T>(table, data, conflictColumns, selectFields);
    // Invalidate related cache entries
    this.invalidateTableCache(table);
    return result;
  }

  async count(table: string, filters?: QueryOptions['filters']): Promise<number> {
    return this.dataService.count(table, filters);
  }

  async getCachedCount(table: string, filters?: QueryOptions['filters']): Promise<number> {
    const cacheKey = this.generateCacheKey(table, 'count', filters);
    const cached = this.getCache<number>(cacheKey);

    if (cached !== null) {
      return cached;
    }

    const result = await this.dataService.count(table, filters);
    this.setCache(cacheKey, result, 2 * 60 * 1000); // 2 minutes for count queries
    return result;
  }

  async rpc<T>(functionName: string, parameters?: Record<string, any>): Promise<DataServiceResult<T>> {
    // RPC calls are not cached by default as they may have side effects
    return this.dataService.rpc<T>(functionName, parameters);
  }

  async executeQuery<T>(query: string, parameters?: Record<string, any>): Promise<DataServiceResult<T[]>> {
    // Raw queries are not cached by default
    return this.dataService.executeQuery<T>(query, parameters);
  }

  async clearCache(pattern?: string): Promise<void> {
    if (pattern) {
      const keys = Array.from(this.cache.keys());
      keys.forEach(key => {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      });
    } else {
      this.cache.clear();
    }
  }

  private invalidateTableCache(table: string): void {
    const keys = Array.from(this.cache.keys());
    keys.forEach(key => {
      if (key.startsWith(`${table}:`)) {
        this.cache.delete(key);
      }
    });
  }
}
