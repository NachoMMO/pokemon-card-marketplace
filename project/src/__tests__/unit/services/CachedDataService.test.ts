// Tests unitarios para CachedDataService
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { CachedDataService } from '../../../application/services/CachedDataService';
import type { IDataService, DataServiceResult, PaginatedResult } from '../../../application/ports/services/IDataService';
import { createSuccessResponse, createErrorResponse, createPaginatedResult } from '../../mocks/supabase.mock';

// Mock del DataService base
const createMockDataService = (): IDataService => ({
  getMany: vi.fn(),
  getById: vi.fn(),
  getOne: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  updateMany: vi.fn(),
  delete: vi.fn(),
  deleteMany: vi.fn(),
  createMany: vi.fn(),
  upsert: vi.fn(),
  count: vi.fn(),
  rpc: vi.fn(),
  executeQuery: vi.fn(),
});

describe('CachedDataService', () => {
  let mockDataService: IDataService;
  let cachedDataService: CachedDataService;

  beforeEach(() => {
    mockDataService = createMockDataService();
    cachedDataService = new CachedDataService(mockDataService);
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Limpiar cache después de cada test
    (cachedDataService as any).cache.clear();
  });

  describe('getMany', () => {
    it('should call underlying service and cache result', async () => {
      const mockData = [{ id: '1', name: 'Test' }];
      const mockResult = createPaginatedResult(mockData);

      (mockDataService.getMany as any).mockResolvedValue(mockResult);

      const result = await cachedDataService.getMany('test_table');

      expect(mockDataService.getMany).toHaveBeenCalledWith('test_table', undefined);
      expect(result).toEqual(mockResult);
    });

    it('should return cached result on second call', async () => {
      const mockData = [{ id: '1', name: 'Test' }];
      const mockResult = createPaginatedResult(mockData);

      (mockDataService.getMany as any).mockResolvedValue(mockResult);

      // Primera llamada
      await cachedDataService.getMany('test_table');

      // Segunda llamada
      const result = await cachedDataService.getMany('test_table');

      expect(mockDataService.getMany).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResult);
    });

    it('should respect different options in cache key', async () => {
      const mockData = [{ id: '1', name: 'Test' }];
      const mockResult = createPaginatedResult(mockData);

      (mockDataService.getMany as any).mockResolvedValue(mockResult);

      const options1 = { filters: [{ column: 'name', operator: 'eq' as const, value: 'test1' }] };
      const options2 = { filters: [{ column: 'name', operator: 'eq' as const, value: 'test2' }] };

      await cachedDataService.getMany('test_table', options1);
      await cachedDataService.getMany('test_table', options2);

      expect(mockDataService.getMany).toHaveBeenCalledTimes(2);
      expect(mockDataService.getMany).toHaveBeenNthCalledWith(1, 'test_table', options1);
      expect(mockDataService.getMany).toHaveBeenNthCalledWith(2, 'test_table', options2);
    });
  });

  describe('getById', () => {
    it('should cache individual record by id', async () => {
      const mockData = { id: '123', name: 'Test' };
      const mockResult = createSuccessResponse(mockData);

      (mockDataService.getById as any).mockResolvedValue(mockResult);

      const result = await cachedDataService.getById('test_table', '123');

      expect(mockDataService.getById).toHaveBeenCalledWith('test_table', '123', undefined);
      expect(result).toEqual(mockResult);

      // Segunda llamada debería usar cache
      const result2 = await cachedDataService.getById('test_table', '123');
      expect(mockDataService.getById).toHaveBeenCalledTimes(1);
      expect(result2).toEqual(mockResult);
    });
  });

  describe('create', () => {
    it('should invalidate cache when creating', async () => {
      const mockData = { id: '123', name: 'Test' };
      const mockResult = createSuccessResponse(mockData);

      (mockDataService.create as any).mockResolvedValue(mockResult);

      // Primero cachear algunos datos
      (mockDataService.getMany as any).mockResolvedValue(createPaginatedResult([mockData]));
      await cachedDataService.getMany('test_table');

      // Crear nuevo registro
      await cachedDataService.create('test_table', { name: 'New' });

      // Cache debería estar invalidado
      await cachedDataService.getMany('test_table');
      expect(mockDataService.getMany).toHaveBeenCalledTimes(2);
    });
  });

  describe('update', () => {
    it('should invalidate cache when updating', async () => {
      const mockData = { id: '123', name: 'Updated' };
      const mockResult = createSuccessResponse(mockData);

      (mockDataService.update as any).mockResolvedValue(mockResult);

      // Primero cachear el registro
      (mockDataService.getById as any).mockResolvedValue(createSuccessResponse({ id: '123', name: 'Original' }));
      await cachedDataService.getById('test_table', '123');

      // Actualizar registro
      await cachedDataService.update('test_table', '123', { name: 'Updated' });

      // Cache debería estar invalidado
      await cachedDataService.getById('test_table', '123');
      expect(mockDataService.getById).toHaveBeenCalledTimes(2);
    });
  });

  describe('delete', () => {
    it('should invalidate cache when deleting', async () => {
      (mockDataService.delete as any).mockResolvedValue(true);

      // Primero cachear algunos datos
      (mockDataService.getMany as any).mockResolvedValue(createPaginatedResult([{ id: '123' }]));
      await cachedDataService.getMany('test_table');

      // Eliminar registro
      await cachedDataService.delete('test_table', '123');

      // Cache debería estar invalidado
      await cachedDataService.getMany('test_table');
      expect(mockDataService.getMany).toHaveBeenCalledTimes(2);
    });
  });

  describe('count', () => {
    it('should not cache count results', async () => {
      (mockDataService.count as any).mockResolvedValue(5);

      await cachedDataService.count('test_table');
      await cachedDataService.count('test_table');

      // Count no debería usar cache
      expect(mockDataService.count).toHaveBeenCalledTimes(2);
    });
  });

  describe('rpc', () => {
    it('should not cache RPC results', async () => {
      const mockResult = createSuccessResponse({ result: 'test' });

      (mockDataService.rpc as any).mockResolvedValue(mockResult);

      await cachedDataService.rpc('test_function', { param: 'value' });
      await cachedDataService.rpc('test_function', { param: 'value' });

      // RPC no debería usar cache
      expect(mockDataService.rpc).toHaveBeenCalledTimes(2);
    });
  });

  describe('getOne', () => {
    it('should cache single record with filters', async () => {
      const mockData = { id: '123', name: 'Test' };
      const mockResult = createSuccessResponse(mockData);

      (mockDataService.getOne as any).mockResolvedValue(mockResult);

      const filters = [{ column: 'name', operator: 'eq' as const, value: 'Test' }];
      const result = await cachedDataService.getOne('test_table', filters);

      expect(mockDataService.getOne).toHaveBeenCalledWith('test_table', filters, undefined);
      expect(result).toEqual(mockResult);

      // Segunda llamada debería usar cache
      const result2 = await cachedDataService.getOne('test_table', filters);
      expect(mockDataService.getOne).toHaveBeenCalledTimes(1);
      expect(result2).toEqual(mockResult);
    });

    it('should cache with different select fields separately', async () => {
      const mockData = { id: '123', name: 'Test' };
      const mockResult = createSuccessResponse(mockData);

      (mockDataService.getOne as any).mockResolvedValue(mockResult);

      const filters = [{ column: 'name', operator: 'eq' as const, value: 'Test' }];

      await cachedDataService.getOne('test_table', filters, 'id');
      await cachedDataService.getOne('test_table', filters, 'name');

      expect(mockDataService.getOne).toHaveBeenCalledTimes(2);
      expect(mockDataService.getOne).toHaveBeenNthCalledWith(1, 'test_table', filters, 'id');
      expect(mockDataService.getOne).toHaveBeenNthCalledWith(2, 'test_table', filters, 'name');
    });
  });

  describe('updateMany', () => {
    it('should invalidate cache when updating many records', async () => {
      const mockData = [{ id: '123', name: 'Updated' }];
      const mockResult = createSuccessResponse(mockData);

      (mockDataService.updateMany as any).mockResolvedValue(mockResult);

      // Primero cachear algunos datos
      (mockDataService.getMany as any).mockResolvedValue(createPaginatedResult([{ id: '123', name: 'Original' }]));
      await cachedDataService.getMany('test_table');

      // Actualizar múltiples registros
      const filters = [{ column: 'name', operator: 'eq' as const, value: 'Original' }];
      await cachedDataService.updateMany('test_table', filters, { name: 'Updated' });

      // Cache debería estar invalidado
      await cachedDataService.getMany('test_table');
      expect(mockDataService.getMany).toHaveBeenCalledTimes(2);
      expect(mockDataService.updateMany).toHaveBeenCalledWith('test_table', filters, { name: 'Updated' }, undefined);
    });
  });

  describe('deleteMany', () => {
    it('should invalidate cache when deleting many records', async () => {
      (mockDataService.deleteMany as any).mockResolvedValue(3);

      // Primero cachear algunos datos
      (mockDataService.getMany as any).mockResolvedValue(createPaginatedResult([{ id: '123' }]));
      await cachedDataService.getMany('test_table');

      // Eliminar múltiples registros
      const filters = [{ column: 'status', operator: 'eq' as const, value: 'inactive' }];
      const result = await cachedDataService.deleteMany('test_table', filters);

      expect(result).toBe(3);
      expect(mockDataService.deleteMany).toHaveBeenCalledWith('test_table', filters);

      // Cache debería estar invalidado
      await cachedDataService.getMany('test_table');
      expect(mockDataService.getMany).toHaveBeenCalledTimes(2);
    });
  });

  describe('createMany', () => {
    it('should invalidate cache when creating many records', async () => {
      const mockData = [{ id: '123', name: 'Test1' }, { id: '124', name: 'Test2' }];
      const mockResult = createSuccessResponse(mockData);

      (mockDataService.createMany as any).mockResolvedValue(mockResult);

      // Primero cachear algunos datos
      (mockDataService.getMany as any).mockResolvedValue(createPaginatedResult([]));
      await cachedDataService.getMany('test_table');

      // Crear múltiples registros
      const newData = [{ name: 'Test1' }, { name: 'Test2' }];
      const result = await cachedDataService.createMany('test_table', newData);

      expect(result).toEqual(mockResult);
      expect(mockDataService.createMany).toHaveBeenCalledWith('test_table', newData, undefined);

      // Cache debería estar invalidado
      await cachedDataService.getMany('test_table');
      expect(mockDataService.getMany).toHaveBeenCalledTimes(2);
    });
  });

  describe('upsert', () => {
    it('should invalidate cache when upserting', async () => {
      const mockData = { id: '123', name: 'Upserted' };
      const mockResult = createSuccessResponse(mockData);

      (mockDataService.upsert as any).mockResolvedValue(mockResult);

      // Primero cachear algunos datos
      (mockDataService.getMany as any).mockResolvedValue(createPaginatedResult([{ id: '123', name: 'Original' }]));
      await cachedDataService.getMany('test_table');

      // Hacer upsert
      const data = { id: '123', name: 'Upserted' };
      const conflictColumns = ['id'];
      const result = await cachedDataService.upsert('test_table', data, conflictColumns);

      expect(result).toEqual(mockResult);
      expect(mockDataService.upsert).toHaveBeenCalledWith('test_table', data, conflictColumns, undefined);

      // Cache debería estar invalidado
      await cachedDataService.getMany('test_table');
      expect(mockDataService.getMany).toHaveBeenCalledTimes(2);
    });
  });

  describe('getCachedCount', () => {
    it('should cache count results with custom TTL', async () => {
      (mockDataService.count as any).mockResolvedValue(10);

      const filters = [{ column: 'status', operator: 'eq' as const, value: 'active' }];
      const result1 = await cachedDataService.getCachedCount('test_table', filters);
      const result2 = await cachedDataService.getCachedCount('test_table', filters);

      expect(result1).toBe(10);
      expect(result2).toBe(10);
      expect(mockDataService.count).toHaveBeenCalledTimes(1);
      expect(mockDataService.count).toHaveBeenCalledWith('test_table', filters);
    });

    it('should cache count without filters', async () => {
      (mockDataService.count as any).mockResolvedValue(15);

      const result1 = await cachedDataService.getCachedCount('test_table');
      const result2 = await cachedDataService.getCachedCount('test_table');

      expect(result1).toBe(15);
      expect(result2).toBe(15);
      expect(mockDataService.count).toHaveBeenCalledTimes(1);
      expect(mockDataService.count).toHaveBeenCalledWith('test_table', undefined);
    });
  });

  describe('executeQuery', () => {
    it('should not cache raw query results', async () => {
      const mockData = [{ id: '123', name: 'Test' }];
      const mockResult = createSuccessResponse(mockData);

      (mockDataService.executeQuery as any).mockResolvedValue(mockResult);

      const query = 'SELECT * FROM test_table WHERE name = $1';
      const parameters = { name: 'Test' };

      await cachedDataService.executeQuery(query, parameters);
      await cachedDataService.executeQuery(query, parameters);

      // executeQuery no debería usar cache
      expect(mockDataService.executeQuery).toHaveBeenCalledTimes(2);
      expect(mockDataService.executeQuery).toHaveBeenCalledWith(query, parameters);
    });
  });

  describe('clearCache', () => {
    it('should clear all cache when no pattern provided', async () => {
      // Cachear algunos datos en diferentes tablas
      (mockDataService.getMany as any).mockResolvedValue(createPaginatedResult([{ id: '1' }]));
      await cachedDataService.getMany('table1');
      await cachedDataService.getMany('table2');

      // Verificar que el cache tiene datos
      expect((cachedDataService as any).cache.size).toBeGreaterThan(0);

      // Limpiar todo el cache
      await cachedDataService.clearCache();

      // Cache debería estar vacío
      expect((cachedDataService as any).cache.size).toBe(0);
    });

    it('should clear cache entries matching pattern', async () => {
      // Cachear datos en diferentes tablas
      (mockDataService.getMany as any).mockResolvedValue(createPaginatedResult([{ id: '1' }]));
      await cachedDataService.getMany('users');
      await cachedDataService.getMany('cards');
      await cachedDataService.getMany('purchases');

      // Verificar que el cache tiene datos
      const initialSize = (cachedDataService as any).cache.size;
      expect(initialSize).toBe(3);

      // Limpiar solo las entradas que contienen 'user'
      await cachedDataService.clearCache('users');

      // Verificar que solo se eliminó la entrada de users
      const finalSize = (cachedDataService as any).cache.size;
      expect(finalSize).toBe(initialSize - 1);

      // Verificar que las otras entradas siguen ahí
      const result = await cachedDataService.getMany('cards');
      expect(mockDataService.getMany).toHaveBeenCalledTimes(3); // No debería llamar de nuevo
    });
  });

  describe('cache expiration', () => {
    it('should expire cached items after TTL', async () => {
      const mockData = [{ id: '1', name: 'Test' }];
      const mockResult = createPaginatedResult(mockData);

      (mockDataService.getMany as any).mockResolvedValue(mockResult);

      // Mock Date.now para controlar el tiempo
      const originalDateNow = Date.now;
      let currentTime = 1000000;

      vi.spyOn(Date, 'now').mockImplementation(() => currentTime);

      try {
        // Primera llamada
        await cachedDataService.getMany('test_table');

        // Avanzar el tiempo más allá del TTL (5 minutos = 300000ms)
        currentTime += 300001;

        // Segunda llamada debería ir al servicio porque el cache expiró
        await cachedDataService.getMany('test_table');

        expect(mockDataService.getMany).toHaveBeenCalledTimes(2);
      } finally {
        Date.now = originalDateNow;
      }
    });

    it('should not expire cached items before TTL', async () => {
      const mockData = [{ id: '1', name: 'Test' }];
      const mockResult = createPaginatedResult(mockData);

      (mockDataService.getMany as any).mockResolvedValue(mockResult);

      // Mock Date.now para controlar el tiempo
      const originalDateNow = Date.now;
      let currentTime = 1000000;

      vi.spyOn(Date, 'now').mockImplementation(() => currentTime);

      try {
        // Primera llamada
        await cachedDataService.getMany('test_table');

        // Avanzar el tiempo pero no más allá del TTL
        currentTime += 100000; // 100 segundos, menos que 5 minutos

        // Segunda llamada debería usar cache
        await cachedDataService.getMany('test_table');

        expect(mockDataService.getMany).toHaveBeenCalledTimes(1);
      } finally {
        Date.now = originalDateNow;
      }
    });
  });

  describe('cache key generation', () => {
    it('should generate different cache keys for different parameters', async () => {
      const mockResult = createPaginatedResult([{ id: '1' }]);
      (mockDataService.getMany as any).mockResolvedValue(mockResult);

      // Llamadas con diferentes parámetros
      await cachedDataService.getMany('test_table', { limit: 10 });
      await cachedDataService.getMany('test_table', { limit: 20 });
      await cachedDataService.getMany('test_table', {
        limit: 10,
        filters: [{ column: 'name', operator: 'eq' as const, value: 'test' }]
      });

      // Cada llamada debería ir al servicio porque tienen diferentes parámetros
      expect(mockDataService.getMany).toHaveBeenCalledTimes(3);
    });

    it('should generate same cache key for identical parameters', async () => {
      const mockResult = createPaginatedResult([{ id: '1' }]);
      (mockDataService.getMany as any).mockResolvedValue(mockResult);

      const options = {
        limit: 10,
        filters: [{ column: 'name', operator: 'eq' as const, value: 'test' }]
      };

      // Dos llamadas idénticas
      await cachedDataService.getMany('test_table', options);
      await cachedDataService.getMany('test_table', options);

      // Solo debería llamar al servicio una vez
      expect(mockDataService.getMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('private methods through public interface', () => {
    it('should handle getById with select fields', async () => {
      const mockData = { id: '123', name: 'Test' };
      const mockResult = createSuccessResponse(mockData);

      (mockDataService.getById as any).mockResolvedValue(mockResult);

      const result = await cachedDataService.getById('test_table', '123', 'id,name');

      expect(mockDataService.getById).toHaveBeenCalledWith('test_table', '123', 'id,name');
      expect(result).toEqual(mockResult);

      // Segunda llamada con mismos parámetros debería usar cache
      await cachedDataService.getById('test_table', '123', 'id,name');
      expect(mockDataService.getById).toHaveBeenCalledTimes(1);

      // Llamada con diferentes select fields debería ir al servicio
      await cachedDataService.getById('test_table', '123', 'id');
      expect(mockDataService.getById).toHaveBeenCalledTimes(2);
    });

    it('should handle create with select fields', async () => {
      const mockData = { id: '123', name: 'Test' };
      const mockResult = createSuccessResponse(mockData);

      (mockDataService.create as any).mockResolvedValue(mockResult);

      const result = await cachedDataService.create('test_table', { name: 'Test' }, 'id,name');

      expect(mockDataService.create).toHaveBeenCalledWith('test_table', { name: 'Test' }, 'id,name');
      expect(result).toEqual(mockResult);
    });

    it('should handle update with select fields', async () => {
      const mockData = { id: '123', name: 'Updated' };
      const mockResult = createSuccessResponse(mockData);

      (mockDataService.update as any).mockResolvedValue(mockResult);

      const result = await cachedDataService.update('test_table', '123', { name: 'Updated' }, 'id,name');

      expect(mockDataService.update).toHaveBeenCalledWith('test_table', '123', { name: 'Updated' }, 'id,name');
      expect(result).toEqual(mockResult);
    });

    it('should handle updateMany with select fields', async () => {
      const mockData = [{ id: '123', name: 'Updated' }];
      const mockResult = createSuccessResponse(mockData);

      (mockDataService.updateMany as any).mockResolvedValue(mockResult);

      const filters = [{ column: 'status', operator: 'eq' as const, value: 'active' }];
      const result = await cachedDataService.updateMany('test_table', filters, { name: 'Updated' }, 'id,name');

      expect(mockDataService.updateMany).toHaveBeenCalledWith('test_table', filters, { name: 'Updated' }, 'id,name');
      expect(result).toEqual(mockResult);
    });

    it('should handle createMany with select fields', async () => {
      const mockData = [{ id: '123', name: 'Test1' }, { id: '124', name: 'Test2' }];
      const mockResult = createSuccessResponse(mockData);

      (mockDataService.createMany as any).mockResolvedValue(mockResult);

      const data = [{ name: 'Test1' }, { name: 'Test2' }];
      const result = await cachedDataService.createMany('test_table', data, 'id,name');

      expect(mockDataService.createMany).toHaveBeenCalledWith('test_table', data, 'id,name');
      expect(result).toEqual(mockResult);
    });

    it('should handle upsert with select fields', async () => {
      const mockData = { id: '123', name: 'Upserted' };
      const mockResult = createSuccessResponse(mockData);

      (mockDataService.upsert as any).mockResolvedValue(mockResult);

      const data = { id: '123', name: 'Upserted' };
      const conflictColumns = ['id'];
      const result = await cachedDataService.upsert('test_table', data, conflictColumns, 'id,name');

      expect(mockDataService.upsert).toHaveBeenCalledWith('test_table', data, conflictColumns, 'id,name');
      expect(result).toEqual(mockResult);
    });
  });
});
